package com.lexrd.backend.config;

import com.google.genai.Client;
import com.google.genai.types.HttpOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.google.genai.GoogleGenAiEmbeddingConnectionDetails;
import org.springframework.ai.google.genai.text.GoogleGenAiTextEmbeddingModel;
import org.springframework.ai.google.genai.text.GoogleGenAiTextEmbeddingOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Configures the Google GenAI Embedding Model explicitly to use the stable v1 API.
 *
 * Problem: The google-genai SDK defaults to v1beta, where text-embedding-004 is NOT available.
 * text-embedding-004 is only supported under the stable v1 API.
 *
 * Solution: Build a Client with HttpOptions.apiVersion("v1"), pass it through
 * GoogleGenAiEmbeddingConnectionDetails, and wire it into GoogleGenAiTextEmbeddingModel,
 * overriding the autoconfigured bean.
 */
@Configuration
@Slf4j
public class EmbeddingConfig {

    @Value("${spring.ai.google.genai.embedding.api-key}")
    private String apiKey;

    @Value("${spring.ai.google.genai.embedding.text.options.model:text-embedding-004}")
    private String embeddingModel;

    @Bean
    @Primary
    public GoogleGenAiTextEmbeddingModel googleGenAiTextEmbeddingModel() {
        log.info("Initializing GoogleGenAiTextEmbeddingModel: model={}, apiVersion=v1", embeddingModel);

        // Force the stable v1 API so that text-embedding-004 is available.
        // The SDK default (v1beta) does NOT expose text-embedding-004.
        Client client = Client.builder()
                .apiKey(apiKey)
                .httpOptions(HttpOptions.builder().apiVersion("v1").build())
                .build();

        GoogleGenAiEmbeddingConnectionDetails connectionDetails =
                GoogleGenAiEmbeddingConnectionDetails.builder()
                        .apiKey(apiKey)
                        .genAiClient(client)
                        .build();

        GoogleGenAiTextEmbeddingOptions options = GoogleGenAiTextEmbeddingOptions.builder()
                .model(embeddingModel)
                .taskType(GoogleGenAiTextEmbeddingOptions.TaskType.RETRIEVAL_DOCUMENT)
                .build();

        return new GoogleGenAiTextEmbeddingModel(connectionDetails, options);
    }
}
