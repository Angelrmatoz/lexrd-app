package com.lexrd.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(value = "app.seeder.enabled", havingValue = "true")
public class DatabaseSeeder implements CommandLineRunner {

    private final IngestionService ingestionService;

    @Override
    public void run(String... args) throws Exception {
        log.info("🚀 Iniciando proceso de siembra de base de conocimiento (Seeder)...");

        // Scan for all PDF files in the knowledge-base directory
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources;
        
        try {
            resources = resolver.getResources("classpath:knowledge-base/**/*.pdf");
            
            if (resources.length == 0) {
                // INFO: Importante saber si no hay nada que hacer
                log.info("⚠️ No se encontraron archivos PDF en la carpeta 'knowledge-base'. Omitiendo siembra.");
                return;
            }

            log.info("📚 Encontrados {} archivos PDF para procesar.", resources.length);

            for (Resource resource : resources) {
                // DEBUG: Como IngestionService ya imprime INFO para cada archivo (éxito o omitido), 
                // imprimir esto en INFO sería redundante y ensuciaría la consola.
                log.debug("Enviando {} al IngestionService...", resource.getFilename());
                try {
                    ingestionService.ingestPdf(resource);
                } catch (Exception e) {
                    // ERROR: Siempre hay que verlos
                    log.error("❌ Error al sembrar {}: {}", resource.getFilename(), e.getMessage());
                }
            }

            log.info("✅ Proceso de siembra (Seeder) completado exitosamente.");
            
        } catch (IOException e) {
            // ERROR: Fallo catastrófico al leer la carpeta
            log.error("💥 Fallo crítico al leer el directorio 'knowledge-base': {}", e.getMessage());
        }
    }
}
