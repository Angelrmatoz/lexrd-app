package com.lexrd.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

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

    // Se ha eliminado el @Bean public VectorStore vectorStore(...) 
    // porque ahora estamos usando PgVector a través de la autoconfiguración de Spring Boot.
}
