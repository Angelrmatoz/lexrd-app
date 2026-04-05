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

        // Usamos el modelo Multilingüe de 768 dimensiones (ONNX)
        // Esto permite entender el español sin cambiar la configuración de pgvector.
        embeddingModel.setModelResource(new UrlResource("https://huggingface.co/Xenova/paraphrase-multilingual-mpnet-base-v2/resolve/main/onnx/model.onnx"));
        embeddingModel.setTokenizerResource(new UrlResource("https://huggingface.co/Xenova/paraphrase-multilingual-mpnet-base-v2/resolve/main/tokenizer.json"));

        try {
            embeddingModel.afterPropertiesSet();
        } catch (Exception e) {
            throw new RuntimeException("Error initializing TransformersEmbeddingModel", e);
        }

        return embeddingModel;
    }
}