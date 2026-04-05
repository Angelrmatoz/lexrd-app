package com.lexrd.backend.config;

import org.springframework.ai.transformers.TransformersEmbeddingModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.UrlResource;

import java.net.MalformedURLException;

@Configuration
public class EmbeddingConfig {

    @Bean
    @Primary
    public TransformersEmbeddingModel transformersEmbeddingModel() throws MalformedURLException {
        TransformersEmbeddingModel embeddingModel = new TransformersEmbeddingModel();
        
        // Jina Embeddings V2 Base ES (Bilingüe Español, 768 dimensiones)
        embeddingModel.setModelResource(new UrlResource("https://huggingface.co/jinaai/jina-embeddings-v2-base-es/resolve/main/onnx/model.onnx"));
        embeddingModel.setTokenizerResource(new UrlResource("https://huggingface.co/jinaai/jina-embeddings-v2-base-es/resolve/main/tokenizer.json"));
        
        try {
            embeddingModel.afterPropertiesSet();
        } catch (Exception e) {
            throw new RuntimeException("Error initializing TransformersEmbeddingModel", e);
        }
        
        return embeddingModel;
    }
}
