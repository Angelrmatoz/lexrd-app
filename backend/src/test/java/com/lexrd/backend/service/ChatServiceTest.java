package com.lexrd.backend.service;

import com.lexrd.backend.dto.ChatRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.mockito.ArgumentCaptor;

/**
 * Pruebas unitarias para ChatService.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ChatServiceTest {

    @Mock
    private ChatModel chatModel;

    @Mock
    private VectorStore vectorStore;

    @Mock
    private ChatClient mockChatClient;

    private ChatService chatService;

    @BeforeEach
    void setUp() {
        chatService = new ChatService(chatModel, vectorStore);
        ReflectionTestUtils.setField(chatService, "chatClient", mockChatClient);
    }

    private void mockRouterResponse(String routingResponse) {
        AssistantMessage aiMsg = new AssistantMessage(routingResponse);
        Generation gen = mock(Generation.class);
        ChatResponse resp = mock(ChatResponse.class);
        lenient().when(gen.getOutput()).thenReturn(aiMsg);
        lenient().when(resp.getResult()).thenReturn(gen);
        lenient().when(chatModel.call(any(Prompt.class))).thenReturn(resp);
    }

    private void mockChatClientResponse(String responseText) {
        @SuppressWarnings("unchecked")
        ChatClient.ChatClientRequestSpec spec = mock(ChatClient.ChatClientRequestSpec.class);
        var callSpec = mock(ChatClient.CallResponseSpec.class);

        lenient().when(mockChatClient.prompt()).thenReturn(spec);
        lenient().when(spec.advisors(any(Consumer.class))).thenReturn(spec);
        lenient().when(spec.advisors(anyList())).thenReturn(spec);
        lenient().when(spec.system(any(Consumer.class))).thenReturn(spec);
        lenient().when(spec.system(anyString())).thenReturn(spec);
        lenient().when(spec.user(anyString())).thenReturn(spec);
        lenient().when(spec.call()).thenReturn(callSpec);
        lenient().when(callSpec.content()).thenReturn(responseText);
    }

    private void mockVectorStoreResponse(List<Document> docs) {
        doReturn(docs).when(vectorStore).similaritySearch(isA(SearchRequest.class));
    }

    private Document doc(String text, String filename) {
        Map<String, Object> meta = new HashMap<>();
        meta.put("filename", filename);
        return new Document(text, meta);
    }

    // ──────────────────────────────────────────────
    // Tests
    // ──────────────────────────────────────────────

    @Test
    void cuandoConsultaGeneral_debeBuscarSinFiltro() {
        mockRouterResponse("ALL");
        mockVectorStoreResponse(List.of(
                doc("Articulo 1", "constitucion.pdf"),
                doc("Articulo 2", "codigo-civil.pdf")
        ));
        mockChatClientResponse("Respuesta legal.");

        com.lexrd.backend.dto.ChatResponse resp = chatService.processChat(
                new ChatRequest("¿Cuales son mis derechos?", null));

        assertThat(resp.getResponse()).isEqualTo("Respuesta legal.");
        assertThat(resp.getSources()).containsExactly("constitucion.pdf", "codigo-civil.pdf");

        ArgumentCaptor<SearchRequest> captor = ArgumentCaptor.forClass(SearchRequest.class);
        verify(vectorStore).similaritySearch(captor.capture());
        assertThat(captor.getValue().getFilterExpression()).isNull();
    }

    @Test
    void cuandoConsultaEspecifica_debeFiltrarPorArchivo() {
        mockRouterResponse("codigo-trabajo.pdf");
        mockVectorStoreResponse(List.of(doc("Articulo despido", "codigo-trabajo.pdf")));
        mockChatClientResponse("Segun el codigo de trabajo...");

        com.lexrd.backend.dto.ChatResponse resp = chatService.processChat(
                new ChatRequest("¿Cuanto por despido?", "s1"));

        assertThat(resp.getResponse()).isEqualTo("Segun el codigo de trabajo...");
        assertThat(resp.getSources()).containsExactly("codigo-trabajo.pdf");

        ArgumentCaptor<SearchRequest> captor = ArgumentCaptor.forClass(SearchRequest.class);
        verify(vectorStore).similaritySearch(captor.capture());
        assertThat(captor.getValue().getFilterExpression()).isNotNull();
    }

    @Test
    void cuandoNoEncuentraDocumentos_debeResponderVacio() {
        mockRouterResponse("ALL");
        mockVectorStoreResponse(List.of());
        mockChatClientResponse("No tengo informacion.");

        com.lexrd.backend.dto.ChatResponse resp = chatService.processChat(
                new ChatRequest("¿Algo inexistente?", null));

        assertThat(resp.getResponse()).isEqualTo("No tengo informacion.");
        assertThat(resp.getSources()).isEmpty();
    }

    @Test
    void cuandoDocumentosDuplicados_debeDeduplicarFuentes() {
        mockRouterResponse("ALL");
        mockVectorStoreResponse(List.of(
                doc("Art 1", "constitucion.pdf"),
                doc("Art 2", "constitucion.pdf"),
                doc("Art 3", "codigo-civil.pdf")
        ));
        mockChatClientResponse("Respuesta");

        com.lexrd.backend.dto.ChatResponse resp = chatService.processChat(
                new ChatRequest("Test", null));

        assertThat(resp.getSources()).hasSize(2);
        assertThat(resp.getSources()).containsExactly("constitucion.pdf", "codigo-civil.pdf");
    }

    @Test
    void cuandoRouterIdentificaCodigoPenal_debeFiltrar() {
        mockRouterResponse("codigo-penal.pdf");
        mockVectorStoreResponse(List.of(doc("Homicidio", "codigo-penal.pdf")));
        mockChatClientResponse("Segun el codigo penal...");

        com.lexrd.backend.dto.ChatResponse resp = chatService.processChat(
                new ChatRequest("¿Pena del homicidio?", null));

        assertThat(resp.getSources()).containsExactly("codigo-penal.pdf");
    }

    @Test
    void cuandoRouterRespondeAllMinusculas_debeFuncionar() {
        mockRouterResponse("all");
        mockVectorStoreResponse(List.of(doc("General", "constitucion.pdf")));
        mockChatClientResponse("Respuesta general.");

        com.lexrd.backend.dto.ChatResponse resp = chatService.processChat(
                new ChatRequest("Pregunta general", null));

        assertThat(resp.getResponse()).isEqualTo("Respuesta general.");
        ArgumentCaptor<SearchRequest> captor = ArgumentCaptor.forClass(SearchRequest.class);
        verify(vectorStore).similaritySearch(captor.capture());
        assertThat(captor.getValue().getFilterExpression()).isNull();
    }

    @Test
    void debeBuscarConTopK25() {
        mockRouterResponse("ALL");
        mockVectorStoreResponse(List.of());
        mockChatClientResponse("R");

        chatService.processChat(new ChatRequest("Test", null));

        ArgumentCaptor<SearchRequest> captor = ArgumentCaptor.forClass(SearchRequest.class);
        verify(vectorStore).similaritySearch(captor.capture());
        assertThat(captor.getValue().getTopK()).isEqualTo(25);
    }
}
