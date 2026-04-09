package com.lexrd.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class BackendApplication {

    public static void main(String[] args) {
        // Fix for Error 3: "Comparison method violates its general contract!" in PDF stripping
        System.setProperty("java.util.Arrays.useLegacyMergeSort", "true");

        // Asegurar que exista el directorio temporal antes de que arranque Tomcat.
        // Esto previene errores si haces "mvn clean" (que borra la carpeta target/temp).
        new java.io.File(System.getProperty("java.io.tmpdir")).mkdirs();
        
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner printDatabaseConfig(
            @Value("${spring.datasource.url}") String dbUrl,
            @Value("${server.port:8080}") String serverPort,
            @Value("${spring.profiles.active:dev}") String activeProfile) {
        return args -> {
            String displayUrl = dbUrl;
            if ("prod".equalsIgnoreCase(activeProfile)) {
                // En producción oculta específicamente la contraseña en la URL
                displayUrl = displayUrl.replaceAll("(?i)(password|passwd|pwd)=[^&]*", "$1=***");
            }

            System.out.println("=========================================================");
            System.out.println("🚀 LexRD Backend is up and running!");
            System.out.println("🔌 Server Port: " + serverPort);
            System.out.println("🗄️  Database Connection: " + displayUrl);
            System.out.println("📖 Swagger UI: http://localhost:" + serverPort + "/swagger-ui.html");
            System.out.println("=========================================================");
        };
    }
}
