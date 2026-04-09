package com.lexrd.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.retry.TransientAiException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import reactor.core.publisher.Flux;

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
            log.info("🎯 Intentando modelo primario: {}", primaryModel);
            return callWithModel(prompt, primaryModel);
        } catch (Exception e) {
            log.warn("⚠️ Modelo primario {} falló: {}", primaryModel, e.getMessage());

            // Check if error is recoverable (transient) or not (config/auth)
            if (!isRecoverableError(e)) {
                log.error("❌ Error no recuperable (configuración/autenticación). No se intentarán fallbacks.");
                throw new RuntimeException("Error no recuperable en modelo de IA: " + e.getMessage(), e);
            }

            log.info("🔄 Error recuperable. Intentando {} modelos fallback...", fallbackModels.size());

            // Try fallback models
            for (String fallback : fallbackModels) {
                try {
                    log.info("🔄 Intentando fallback: {}", fallback);
                    return callWithModel(prompt, fallback);
                } catch (Exception ex) {
                    log.warn("⚠️ Fallback {} falló: {}", fallback, ex.getMessage());

                    // If this fallback failed with non-recoverable error, stop trying
                    if (!isRecoverableError(ex)) {
                        log.error("❌ Error no recuperable en fallback {}. Deteniendo intentos.", fallback);
                        throw new RuntimeException("Error no recuperable en modelo fallback: " + ex.getMessage(), ex);
                    }
                }
            }

            log.error("❌ Todos los modelos fallaron para la consulta");
            throw new RuntimeException("Todos los modelos de IA fallaron. Último error: " + e.getMessage(), e);
        }
    }

    @Override
    public Flux<ChatResponse> stream(Prompt prompt) {
        // Try primary model
        try {
            log.info("🎯 [STREAM] Intentando modelo primario: {}", primaryModel);
            return streamWithModel(prompt, primaryModel);
        } catch (Exception e) {
            log.warn("⚠️ [STREAM] Modelo primario {} falló: {}", primaryModel, e.getMessage());

            if (!isRecoverableError(e)) {
                log.error("❌ [STREAM] Error no recuperable. No se intentarán fallbacks.");
                return Flux.error(new RuntimeException("Error no recuperable en modelo de IA: " + e.getMessage(), e));
            }

            log.info("🔄 [STREAM] Error recuperable. Intentando fallbacks...");

            // Try fallback models sequentially
            Flux<ChatResponse> result = Flux.error(new RuntimeException("No models succeeded"));
            
            for (String fallback : fallbackModels) {
                final Flux<ChatResponse> currentResult = result;
                result = currentResult.onErrorResume(err -> {
                    log.info("🔄 [STREAM] Intentando fallback: {}", fallback);
                    try {
                        return streamWithModel(prompt, fallback);
                    } catch (Exception ex) {
                        log.warn("⚠️ [STREAM] Fallback {} falló: {}", fallback, ex.getMessage());
                        if (!isRecoverableError(ex)) {
                            return Flux.error(new RuntimeException("Error no recuperable en fallback: " + ex.getMessage(), ex));
                        }
                        return Flux.error(ex);
                    }
                });
            }
            
            return result;
        }
    }

    private Flux<ChatResponse> streamWithModel(Prompt prompt, String modelName) {
        log.info("🔄 [STREAM] Iniciando streaming con modelo: {}", modelName);
        
        ChatOptions newOptions = OpenAiChatOptions.builder()
                .model(modelName)
                .temperature(0.0)
                .build();

        Prompt updatedPrompt = new Prompt(prompt.getInstructions(), newOptions);
        
        return baseChatModel.stream(updatedPrompt)
                .doOnNext(response -> log.debug("[STREAM] {} recibió chunk", modelName))
                .doOnComplete(() -> log.info("✅ [STREAM] Modelo {} completó streaming", modelName))
                .doOnError(e -> log.error("❌ [STREAM] Modelo {} falló: {}", modelName, e.getMessage()));
    }

    /**
     * Determines if an error is transient/recoverable (worth trying another model)
     * or permanent/non-recoverable (all models will fail with same error).
     */
    private boolean isRecoverableError(Exception e) {
        // HTTP 5xx errors (server errors) - recoverable
        if (e instanceof HttpServerErrorException httpError) {
            int statusCode = httpError.getStatusCode().value();
            boolean recoverable = statusCode == 500 || statusCode == 502 || statusCode == 503 || statusCode == 504;
            log.debug("HTTP Server Error {}: {}", statusCode, recoverable ? "RECUPERABLE" : "NO RECUPERABLE");
            return recoverable;
        }

        // Network timeouts - recoverable
        if (e instanceof ResourceAccessException) {
            log.debug("ResourceAccessException (timeout/network): RECUPERABLE");
            return true;
        }

        // Spring AI retry transient errors - recoverable
        if (e instanceof TransientAiException) {
            log.debug("TransientAiException: RECUPERABLE");
            return true;
        }

        // Check message for common transient errors
        String message = e.getMessage();
        if (message != null) {
            boolean isTransient = message.contains("503") ||
                                  message.contains("UNAVAILABLE") ||
                                  message.contains("high demand") ||
                                  message.contains("timeout") ||
                                  message.contains("rate limit") ||
                                  message.contains("429");
            if (isTransient) {
                log.debug("Mensaje indica error transitorio: RECUPERABLE");
                return true;
            }

            // Common non-recoverable errors
            boolean isPermanent = message.contains("401") ||
                                  message.contains("Unauthorized") ||
                                  message.contains("403") ||
                                  message.contains("Forbidden") ||
                                  message.contains("invalid_api_key") ||
                                  message.contains("invalid model");
            if (isPermanent) {
                log.debug("Mensaje indica error permanente: NO RECUPERABLE");
                return false;
            }
        }

        // Unknown error - assume recoverable to be safe
        log.debug("Error desconocido, asumiendo recuperable: {}", e.getClass().getSimpleName());
        return true;
    }

    private ChatResponse callWithModel(Prompt prompt, String modelName) {
        log.info("🔄 Iniciando llamada con modelo: {}", modelName);
        
        // Crear opciones con el nuevo modelo
        ChatOptions newOptions = OpenAiChatOptions.builder()
                .model(modelName)
                .temperature(0.0)
                .build();

        // Crear un nuevo prompt con las opciones del modelo
        Prompt updatedPrompt = new Prompt(prompt.getInstructions(), newOptions);
        
        ChatResponse response = baseChatModel.call(updatedPrompt);
        log.info("✅ Modelo {} respondió exitosamente", modelName);
        return response;
    }

    @Override
    public ChatOptions getDefaultOptions() {
        return baseChatModel.getDefaultOptions();
    }
}
