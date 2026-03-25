package com.lexrd.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final IngestionService ingestionService;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting knowledge-base seeding process...");

        // Scan for all PDF files in the knowledge-base directory
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources;
        
        try {
            resources = resolver.getResources("classpath:knowledge-base/**/*.pdf");
            
            if (resources.length == 0) {
                log.info("No PDF files found in knowledge-base folder. Skipping seeding.");
                return;
            }

            log.info("Found {} PDF files to ingest.", resources.length);

            for (Resource resource : resources) {
                log.info("Seeding knowledge from: {}", resource.getFilename());
                try {
                    ingestionService.ingestPdf(resource);
                } catch (Exception e) {
                    log.error("Error seeding {}: {}", resource.getFilename(), e.getMessage());
                }
            }

            log.info("Knowledge-base seeding completed successfully.");
            
        } catch (IOException e) {
            log.error("Failed to read knowledge-base directory: {}", e.getMessage());
        }
    }
}
