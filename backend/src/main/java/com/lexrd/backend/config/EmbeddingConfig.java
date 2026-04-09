package com.lexrd.backend.config;

import org.springframework.ai.transformers.TransformersEmbeddingModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.UrlResource;

import java.io.File;
import java.net.MalformedURLException;

@Configuration
public class EmbeddingConfig {

    @Bean
    @Primary
    public TransformersEmbeddingModel transformersEmbeddingModel() throws MalformedURLException {
        TransformersEmbeddingModel embeddingModel = new TransformersEmbeddingModel();

        // Archivos locales que estarán dentro del contenedor Docker
        File localModel = new File("/app/models/jina-embeddings-v2-base-es/model.onnx");
        File localTokenizer = new File("/app/models/jina-embeddings-v2-base-es/tokenizer.json");

        if (localModel.exists() && localTokenizer.exists()) {
            System.out.println("Cargando modelo de Embeddings desde el almacenamiento local (Docker)...");
            embeddingModel.setModelResource(new FileSystemResource(localModel));
            embeddingModel.setTokenizerResource(new FileSystemResource(localTokenizer));
        } else {
            System.out.println("Cargando modelo de Embeddings desde la URL remota (Desarrollo local)...");
            // Jina Embeddings V2 Base ES (Bilingüe Español, 768 dimensiones)
            embeddingModel.setModelResource(new UrlResource("https://huggingface.co/jinaai/jina-embeddings-v2-base-es/resolve/main/onnx/model.onnx"));
            embeddingModel.setTokenizerResource(new UrlResource("https://huggingface.co/jinaai/jina-embeddings-v2-base-es/resolve/main/tokenizer.json"));
        }

        try {
            embeddingModel.afterPropertiesSet();
        } catch (Exception e) {
            throw new RuntimeException("Error initializing TransformersEmbeddingModel", e);
        }

        return embeddingModel;
    }
}
