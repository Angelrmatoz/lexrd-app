package com.lexrd.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatOptions;

import java.util.List;

@Slf4j
public class FallbackChatModel implements ChatModel {

    private final ChatModel baseChatModel;
    private final String primaryModel;
    private final List<String> fallbackModels;

    public FallbackChatModel(ChatModel baseChatModel, String primaryModel, List<String> fallbackModels) {
        this.baseChatModel = baseChatModel;
        this.primaryModel = primaryModel;
        this.fallbackModels = fallbackModels;
    }

    @Override
    public ChatResponse call(Prompt prompt) {
        // Try primary model
        try {
            log.info("Attempting call with primary model: {}", primaryModel);
            return callWithModel(prompt, primaryModel);
        } catch (Exception e) {
            log.warn("Primary model {} failed: {}. Trying fallbacks...", primaryModel, e.getMessage());
            
            // Try fallback models
            for (String fallback : fallbackModels) {
                try {
                    log.info("Attempting call with fallback model: {}", fallback);
                    return callWithModel(prompt, fallback);
                } catch (Exception ex) {
                    log.warn("Fallback model {} failed: {}", fallback, ex.getMessage());
                }
            }
            
            log.error("All models failed for prompt");
            throw new RuntimeException("All AI models failed", e);
        }
    }

    private ChatResponse callWithModel(Prompt prompt, String modelName) {
        ChatOptions newOptions = OpenAiChatOptions.builder()
                .model(modelName)
                .build();
        
        Prompt updatedPrompt = new Prompt(prompt.getInstructions(), newOptions);
        return baseChatModel.call(updatedPrompt);
    }

    @Override
    public ChatOptions getDefaultOptions() {
        return baseChatModel.getDefaultOptions();
    }
}
