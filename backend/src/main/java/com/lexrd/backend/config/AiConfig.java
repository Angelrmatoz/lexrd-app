package com.lexrd.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
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

    @Value("${ai.model.fallback3}")
    private String fallback3;

    @Value("${ai.model.fallback4}")
    private String fallback4;

    @Value("${ai.model.fallback5}")
    private String fallback5;

    @Value("${ai.model.fallback6}")
    private String fallback6;

    @Value("${ai.model.fallback7}")
    private String fallback7;

    @Value("${ai.model.fallback8}")
    private String fallback8;

    /**
     * Fallback configuration for AI chat models.
     * This will try the primary dto and then fall back to others if it fails.
     */
    @Bean
    @Primary
    public ChatModel fallbackChatModel(ChatModel defaultChatModel) {
        log.info("Inicializando FallbackChatModel con primario: {} y respaldos: {}, {}, {}, {}, {}, {}, {}, {}",
                 primaryModel, fallback1, fallback2, fallback3, fallback4, fallback5, fallback6, fallback7, fallback8);
        return new FallbackChatModel(defaultChatModel, primaryModel,
                                     List.of(fallback1, fallback2, fallback3, fallback4, fallback5, fallback6, fallback7, fallback8));
    }

    // Se ha eliminado el @Bean public VectorStore vectorStore(...) 
    // porque ahora estamos usando PgVector a través de la autoconfiguración de Spring Boot.
}
