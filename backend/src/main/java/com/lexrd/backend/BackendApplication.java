package com.lexrd.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.Arrays;

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
            Environment env) {
        return args -> {
            String[] activeProfiles = env.getActiveProfiles();
            String activeProfile = activeProfiles.length > 0 ? activeProfiles[0] : "dev";
            
            String displayUrl = dbUrl;
            if (Arrays.asList(activeProfiles).contains("prod")) {
                // En producción oculta específicamente la contraseña en la URL
                displayUrl = displayUrl.replaceAll("(?i)(password|passwd|pwd)=[^&]*", "$1=***");
            }

            System.out.println("=========================================================");
            System.out.println("🚀 LexRD Backend is up and running!");
            System.out.println("🌍 Active Profile: " + activeProfile);
            System.out.println("🔌 Server Port: " + serverPort);
            System.out.println("🗄️  Database Connection: " + displayUrl);
            System.out.println("📖 Swagger UI: http://localhost:" + serverPort + "/swagger-ui.html");
            System.out.println("=========================================================");
        };
    }
}
