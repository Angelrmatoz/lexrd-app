package com.lexrd.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
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
import java.util.concurrent.TimeUnit;

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
                "SELECT COUNT(*) FROM vector_store WHERE metadata->>'file_name' = ?", 
                Integer.class, 
                filename
            );
            return count != null && count > 0;
        } catch (org.springframework.dao.DataAccessException e) {
            log.warn("Error verificando archivo en DB (probablemente la tabla aún no se ha creado): {}", e.getMessage());
            return false;
        }
    }

    /**
     * Ingests a PDF file from a MultipartFile (HTTP request).
     */
    @Async
    public void ingestPdfAsync(MultipartFile file) {
        log.info("Starting async ingestion for file: {}", file.getOriginalFilename());
        ingestResource(file.getResource());
        log.info("Finished async ingestion for file: {}", file.getOriginalFilename());
    }

    /**
     * Ingests a PDF file from a Spring Resource (Local file).
     */
    public void ingestPdf(Resource resource) {
        log.info("Ingesting file from resource: {}", resource.getFilename());
        if (isFileIngested(resource.getFilename())) {
            log.info("Ignorando: {} ya está en la base de datos.", resource.getFilename());
            return;
        }
        ingestResource(resource);
        log.info("Successfully ingested: {}", resource.getFilename());
    }

    private void ingestResource(Resource resource) {
        try {
            // 1. Read PDF content
            PagePdfDocumentReader pdfReader = new PagePdfDocumentReader(resource);
            List<Document> documents = pdfReader.get();

            // Insertar el metadata del filename manualmente para asegurarnos que exista
            String fileName = resource.getFilename();
            documents.forEach(doc -> doc.getMetadata().put("file_name", fileName));

            // 2. Split into chunks semantically respecting Dominican Law Structure
            StructuralLawSplitter structuralSplitter = new StructuralLawSplitter();
            List<Document> structuralDocuments = structuralSplitter.apply(documents);

            TokenTextSplitter splitter = TokenTextSplitter.builder()
                    .withKeepSeparator(true)
                    .build();
            List<Document> splitDocuments = splitter.apply(structuralDocuments);

            // 3. Rate-limited ingestion para la cuota de Gemini (Batches)
            int batchSize = 25;
            for (int i = 0; i < splitDocuments.size(); i += batchSize) {
                int end = Math.min(splitDocuments.size(), i + batchSize);
                List<Document> batch = new ArrayList<>(splitDocuments.subList(i, end));

                log.info("Ingesting batch {} to {} of {}", i, end, splitDocuments.size());
                vectorStore.add(batch);

                // Esperamos 4 segundos entre batches para no sobrecargar Gemini API
                TimeUnit.SECONDS.sleep(4);
            }

            // 4. Local persistence (solo si usaran SimpleVectorStore)
            if (vectorStore instanceof SimpleVectorStore simpleStore) {
                simpleStore.save(new File("vectorstore.json"));
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("PDF ingestion interrupted for: {}", resource.getFilename(), e);
            throw new RuntimeException("PDF ingestion was interrupted", e);
        } catch (Exception e) {
            log.error("Failed to ingest PDF: {}", resource.getFilename(), e);
            throw new RuntimeException("Error during PDF ingestion", e);
        }
    }
}
