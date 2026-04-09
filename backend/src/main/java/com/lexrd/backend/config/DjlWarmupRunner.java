package com.lexrd.backend.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

/**
 * DJL PyTorch Warmup Runner
 * Descarga bibliotecas nativas de PyTorch durante el arranque de Spring Boot
 * para evitar latencia en la primera consulta de la IA.
 * 
 * Se activa en TODOS los perfiles para garantizar que el embedding model funcione.
 */
@Configuration
@Order(-1)
public class DjlWarmupRunner implements ApplicationRunner {

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("🔥 DJL PyTorch Warmup - Iniciando descarga de bibliotecas...");
        System.out.println("⏳ Esto puede tardar ~30 segundos en la primera ejecución...");
        
        try {
            // Forzar la inicialización de DJL PyTorch para descargar bibliotecas nativas
            Class<?> ptEngineClass = Class.forName("ai.djl.pytorch.engine.PtEngine");
            java.lang.reflect.Method getInstance = ptEngineClass.getMethod("getInstance");
            getInstance.invoke(null);
            
            System.out.println("✅ DJL PyTorch Warmup completado - Bibliotecas listas.");
        } catch (Exception e) {
            System.err.println("⚠️ DJL Warmup falló: " + e.getMessage());
            System.err.println("   Las bibliotecas se descargarán en la primera consulta.");
        }
    }
}
