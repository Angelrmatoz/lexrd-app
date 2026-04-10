package com.lexrd.backend.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.retry.TransientAiException;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para FallbackChatModel.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class FallbackChatModelTest {

    @Mock
    private ChatModel baseChatModel;

    private final String primaryModel = "gemini-2.5-flash";
    private final List<String> fallbackModels = List.of(
            "gemini-2.5-flash-lite",
            "gemini-2.0-flash",
            "gemini-2.0-flash-lite",
            "gemma-4-31b-it"
    );

    private FallbackChatModel fallbackChatModel;
    private Prompt testPrompt;

    @BeforeEach
    void setUp() {
        AssistantMessage msg = new AssistantMessage("test");
        Generation gen = mock(Generation.class);
        org.springframework.ai.chat.model.ChatResponse resp = mock(org.springframework.ai.chat.model.ChatResponse.class);
        when(gen.getOutput()).thenReturn(msg);
        when(resp.getResult()).thenReturn(gen);
        when(baseChatModel.call(any(Prompt.class))).thenReturn(resp);

        fallbackChatModel = new FallbackChatModel(baseChatModel, primaryModel, fallbackModels);
        testPrompt = new Prompt(List.of(msg));
    }

    @Test
    void cuandoPrimarioFunciona_debeRetornarSinFallback() {
        org.springframework.ai.chat.model.ChatResponse resp = mock(org.springframework.ai.chat.model.ChatResponse.class);
        when(baseChatModel.call(any(Prompt.class))).thenReturn(resp);

        var result = fallbackChatModel.call(testPrompt);
        assertThat(result).isEqualTo(resp);
        verify(baseChatModel, times(1)).call(any(Prompt.class));
    }

    @Test
    void cuandoPrimarioFallaCon503_debeIntentarFallback() {
        when(baseChatModel.call(any(Prompt.class)))
                .thenThrow(new HttpServerErrorException(HttpStatusCode.valueOf(503), "503"))
                .thenAnswer(inv -> {
                    var r = mock(org.springframework.ai.chat.model.ChatResponse.class);
                    return r;
                });

        var result = fallbackChatModel.call(testPrompt);
        assertThat(result).isNotNull();
        verify(baseChatModel, times(2)).call(any(Prompt.class));
    }

    @Test
    void cuandoPrimarioFallaConTimeout_debeIntentarFallback() {
        when(baseChatModel.call(any(Prompt.class)))
                .thenThrow(new ResourceAccessException("timeout"))
                .thenAnswer(inv -> mock(org.springframework.ai.chat.model.ChatResponse.class));

        var result = fallbackChatModel.call(testPrompt);
        assertThat(result).isNotNull();
        verify(baseChatModel, times(2)).call(any(Prompt.class));
    }

    @Test
    void cuandoPrimarioFallaConTransientException_debeIntentarFallback() {
        when(baseChatModel.call(any(Prompt.class)))
                .thenThrow(new TransientAiException("transient"))
                .thenAnswer(inv -> mock(org.springframework.ai.chat.model.ChatResponse.class));

        var result = fallbackChatModel.call(testPrompt);
        assertThat(result).isNotNull();
        verify(baseChatModel, times(2)).call(any(Prompt.class));
    }

    @Test
    void cuandoTodosFallan_debeLanzarExcepcion() {
        when(baseChatModel.call(any(Prompt.class)))
                .thenThrow(new HttpServerErrorException(HttpStatusCode.valueOf(500), "500"));

        assertThatThrownBy(() -> fallbackChatModel.call(testPrompt))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Todos los modelos");

        verify(baseChatModel, times(5)).call(any(Prompt.class));
    }

    @Test
    void cuandoError401_noDebeIntentarFallbacks() {
        when(baseChatModel.call(any(Prompt.class)))
                .thenThrow(new HttpClientErrorException(HttpStatusCode.valueOf(401), "401"));

        assertThatThrownBy(() -> fallbackChatModel.call(testPrompt))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("no recuperable");

        verify(baseChatModel, times(1)).call(any(Prompt.class));
    }

    @Test
    void cuandoError403_noDebeIntentarFallbacks() {
        when(baseChatModel.call(any(Prompt.class)))
                .thenThrow(new HttpClientErrorException(HttpStatusCode.valueOf(403), "403"));

        assertThatThrownBy(() -> fallbackChatModel.call(testPrompt))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("no recuperable");

        verify(baseChatModel, times(1)).call(any(Prompt.class));
    }

    @Test
    void cuandoInvalidApiKey_noDebeIntentarFallbacks() {
        when(baseChatModel.call(any(Prompt.class)))
                .thenThrow(new RuntimeException("invalid_api_key"));

        assertThatThrownBy(() -> fallbackChatModel.call(testPrompt))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("no recuperable");

        verify(baseChatModel, times(1)).call(any(Prompt.class));
    }

    @Test
    void cuandoInvalidModel_noDebeIntentarFallbacks() {
        when(baseChatModel.call(any(Prompt.class)))
                .thenThrow(new RuntimeException("invalid model"));

        assertThatThrownBy(() -> fallbackChatModel.call(testPrompt))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("no recuperable");

        verify(baseChatModel, times(1)).call(any(Prompt.class));
    }

    @Test
    void cuando429_debeSerRecuperable() {
        when(baseChatModel.call(any(Prompt.class)))
                .thenThrow(new RuntimeException("rate limit 429"))
                .thenAnswer(inv -> mock(org.springframework.ai.chat.model.ChatResponse.class));

        var result = fallbackChatModel.call(testPrompt);
        assertThat(result).isNotNull();
    }

    @Test
    void cuandoUNAVAILABLE_debeSerRecuperable() {
        when(baseChatModel.call(any(Prompt.class)))
                .thenThrow(new RuntimeException("UNAVAILABLE"))
                .thenAnswer(inv -> mock(org.springframework.ai.chat.model.ChatResponse.class));

        var result = fallbackChatModel.call(testPrompt);
        assertThat(result).isNotNull();
    }

    @Test
    void cuandoHighDemand_debeSerRecuperable() {
        when(baseChatModel.call(any(Prompt.class)))
                .thenThrow(new RuntimeException("high demand"))
                .thenAnswer(inv -> mock(org.springframework.ai.chat.model.ChatResponse.class));

        var result = fallbackChatModel.call(testPrompt);
        assertThat(result).isNotNull();
    }

    @Test
    void getDefaultOptions_debeDelegar() {
        fallbackChatModel.getDefaultOptions();
        verify(baseChatModel).getDefaultOptions();
    }
}
