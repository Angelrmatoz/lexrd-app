package com.lexrd.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.Resource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class IngestionService {

    private final VectorStore vectorStore;

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
        ingestResource(resource);
        log.info("Successfully ingested: {}", resource.getFilename());
    }

    private void ingestResource(Resource resource) {
        try {
            // 1. Read PDF content
            PagePdfDocumentReader pdfReader = new PagePdfDocumentReader(resource);
            List<Document> documents = pdfReader.get();

            // 2. Split into chunks (semantical segments)
            // Using the non-deprecated builder with compatible method names
            TokenTextSplitter splitter = TokenTextSplitter.builder()
                    .withKeepSeparator(true)
                    .build();
            List<Document> splitDocuments = splitter.apply(documents);

            // 3. Store in Vector Store (Supabase pgvector or SimpleVectorStore)
            // Spring AI handles the embedding generation via OpenRouter automatically
            vectorStore.add(splitDocuments);

            // 4. Local persistence: save the store to file if using SimpleVectorStore
            if (vectorStore instanceof SimpleVectorStore simpleStore) {
                simpleStore.save(new File("vectorstore.json"));
                log.info("Saved local vector store to disk after ingesting: {}", resource.getFilename());
            }

        } catch (Exception e) {
            log.error("Failed to ingest PDF: {}", resource.getFilename(), e);
            throw new RuntimeException("Error during PDF ingestion", e);
        }
    }
}
