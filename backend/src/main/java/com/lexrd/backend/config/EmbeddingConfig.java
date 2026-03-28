package com.lexrd.backend.config;

import org.springframework.ai.transformers.TransformersEmbeddingModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.UrlResource;

import java.net.MalformedURLException;

@Configuration
public class EmbeddingConfig {

    @Bean
    public TransformersEmbeddingModel transformersEmbeddingModel() throws MalformedURLException {
        TransformersEmbeddingModel embeddingModel = new TransformersEmbeddingModel();
        
        // Forzando explícitamente el modelo MPNet de 768 dimensiones
        // para evitar el bug de Spring AI 2.0.0-M3 que usa MiniLM (384D) por defecto.
        embeddingModel.setModelResource(new UrlResource("https://huggingface.co/sentence-transformers/all-mpnet-base-v2/resolve/main/onnx/model.onnx"));
        embeddingModel.setTokenizerResource(new UrlResource("https://huggingface.co/sentence-transformers/all-mpnet-base-v2/resolve/main/tokenizer.json"));
        
        try {
            embeddingModel.afterPropertiesSet();
        } catch (Exception e) {
            throw new RuntimeException("Error initializing TransformersEmbeddingModel", e);
        }
        
        return embeddingModel;
    }
}
