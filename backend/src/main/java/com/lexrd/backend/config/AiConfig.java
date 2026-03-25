package com.lexrd.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.io.File;
import java.util.List;

@Configuration
@Slf4j
public class AiConfig {

    @Value("${ai.model.primary}")
    private String primaryModel;

    @Value("${ai.model.fallback1}")
    private String fallback1;

    @Value("${ai.model.fallback2}")
    private String fallback2;

    /**
     * Fallback configuration for AI chat models.
     * This will try the primary model and then fall back to others if it fails.
     */
    @Bean
    @Primary
    public ChatModel chatModel(OpenAiChatModel openAiChatModel) {
        log.info("Initializing FallbackChatModel with primary: {} and fallbacks: {}, {}", primaryModel, fallback1, fallback2);
        return new FallbackChatModel(openAiChatModel, primaryModel, List.of(fallback1, fallback2));
    }

    /**
     * This Bean overrides the PGVector database store for now.
     * It uses a local JSON file (vectorstore.json) to store processed law documents.
     * This is perfect for local development before connecting to Supabase.
     */
    @Bean
    public VectorStore vectorStore(EmbeddingModel embeddingModel) {
        log.info("Initializing VectorStore with EmbeddingModel: {}", embeddingModel.getClass().getSimpleName());
        SimpleVectorStore vectorStore = SimpleVectorStore.builder(embeddingModel).build();
        File vectorStoreFile = new File("vectorstore.json");

        if (vectorStoreFile.exists()) {
            log.info("Loading existing vector store from: {}", vectorStoreFile.getAbsolutePath());
            vectorStore.load(vectorStoreFile);
        } else {
            log.info("No local vector store found. A new one will be created.");
        }

        return vectorStore;
    }
}
