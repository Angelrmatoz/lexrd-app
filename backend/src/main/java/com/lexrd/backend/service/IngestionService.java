package com.lexrd.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class IngestionService {

    private final VectorStore vectorStore;
    private final JdbcTemplate jdbcTemplate;

    /**
     * Revisa si el documento ya ha sido insertado en pgvector.
     */
    public boolean isFileIngested(String filename) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM vector_store WHERE metadata->>'filename' = ?", 
                Integer.class, 
                filename
            );
            return count != null && count > 0;
        } catch (org.springframework.dao.DataAccessException e) {
            // Mantenemos como DEBUG para no asustar si la tabla no existe aún.
            log.debug("Error verificando archivo en DB (probablemente la tabla aún no se ha creado): {}", e.getMessage());
            return false;
        }
    }

    /**
     * Ingests a PDF file from a MultipartFile (HTTP request).
     */
    @Async
    public void ingestPdfAsync(MultipartFile file) {
        // INFO: Útil para ver que se está iniciando la ingesta
        log.info("Iniciando ingesta asíncrona: {}", file.getOriginalFilename());
        ingestResource(file.getResource());
        log.info("Ingesta asíncrona completada: {}", file.getOriginalFilename());
    }

    /**
     * Ingests a PDF file from a Spring Resource (Local file).
     */
    public void ingestPdf(Resource resource) {
        // DEBUG: Detalles internos antes de validar
        log.debug("Iniciando verificación de recurso local: {}", resource.getFilename());
        
        if (isFileIngested(resource.getFilename())) {
            // INFO: Importante saber qué documentos se están omitiendo
            log.info("Omitido (ya existe): {}", resource.getFilename());
            return;
        }
        ingestResource(resource);
        // INFO: Útil para saber qué documentos se procesaron exitosamente
        log.info("Ingesta completada: {}", resource.getFilename());
    }

    private void ingestResource(Resource resource) {
        try {
            // 1. Read PDF content
            TikaDocumentReader tikaReader = new TikaDocumentReader(resource);
            List<Document> rawDocuments = tikaReader.get();

            // Limpiar el texto extraído por Tika (Guiones de fin de línea y saltos extra)
            String fileName = resource.getFilename();
            List<Document> documents = new ArrayList<>();
            
            for (Document doc : rawDocuments) {
                if (doc.getText() == null || doc.getText().isBlank()) {
                    log.warn("Documento extraído vacío: {}", fileName);
                    continue;
                }
                
                String cleanText = doc.getText()
                        .replaceAll("(?<=[a-zA-ZáéíóúÁÉÍÓÚñÑ])-\r?\n(?=[a-zA-ZáéíóúÁÉÍÓÚñÑ])", "")
                        // Eliminamos el reemplazo de saltos de línea para no romper el Splitter
                        .replaceAll("[ \\t]{2,}", " "); // Limpia espacios múltiples horizontales, pero deja los saltos (\n)
                
                Document cleanDoc = new Document(doc.getId(), cleanText, doc.getMetadata());
                cleanDoc.getMetadata().put("filename", fileName);
                documents.add(cleanDoc);
            }

            // 2. Split into chunks semantically respecting Dominican Law Structure
            StructuralLawSplitter structuralSplitter = new StructuralLawSplitter();
            List<Document> structuralDocuments = structuralSplitter.apply(documents);

            TokenTextSplitter splitter = TokenTextSplitter.builder()
                    .withChunkSize(400) // Límite seguro para embeddings de 512 tokens
                    .withMinChunkSizeChars(100)
                    .withKeepSeparator(true)
                    .build();
            List<Document> splitDocuments = splitter.apply(structuralDocuments);

            // 3. Batch ingestion (Optimized for Local Transformers)
            int batchSize = 200; 
            for (int i = 0; i < splitDocuments.size(); i += batchSize) {
                int end = Math.min(splitDocuments.size(), i + batchSize);
                List<Document> batch = new ArrayList<>(splitDocuments.subList(i, end));

                log.debug("Ingestando lote {} a {} de {} (Local Embedding)", i, end, splitDocuments.size());
                vectorStore.add(batch);
            }

            // 4. Local persistence (solo si usaran SimpleVectorStore)
            if (vectorStore instanceof SimpleVectorStore simpleStore) {
                simpleStore.save(new File("vectorstore.json"));
            }

        } catch (Exception e) {
            log.error("Error al ingestar el PDF: {}", resource.getFilename(), e);
            throw new RuntimeException("Error during PDF ingestion", e);
        }
    }
}