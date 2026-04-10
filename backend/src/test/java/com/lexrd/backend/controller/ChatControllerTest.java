package com.lexrd.backend.controller;

import com.lexrd.backend.dto.ChatRequest;
import com.lexrd.backend.dto.ChatResponse;
import com.lexrd.backend.service.ChatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas de integracion para ChatController con MockMvc.
 *
 * Usamos @WebMvcTest que solo carga la capa web (controllers, filtros, converters)
 * sin intentar crear la base de datos. El ChatService es mockeado con @MockBean.
 */
@WebMvcTest(ChatController.class)
@AutoConfigureMockMvc(addFilters = false)
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ChatService chatService;

    // ──────────────────────────────────────────────
    // POST /api/chat - Respuesta sincrona
    // ──────────────────────────────────────────────

    @Test
    void cuandoMensajeVacio_debeRetornar400() throws Exception {
        String body = """
            {
                "message": "",
                "sessionId": "test-session"
            }
            """;

        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(chatService);
    }

    @Test
    void cuandoMensajeNull_debeRetornar400() throws Exception {
        String body = """
            {
                "message": null,
                "sessionId": "test-session"
            }
            """;

        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(chatService);
    }

    @Test
    void cuandoMensajeSoloEspacios_debeRetornar400() throws Exception {
        String body = """
            {
                "message": "   ",
                "sessionId": "test-session"
            }
            """;

        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void cuandoMensajeValido_debeRetornar200ConRespuesta() throws Exception {
        ChatResponse mockResponse = ChatResponse.builder()
                .response("Segun el codigo de trabajo...")
                .sources(List.of("codigo-trabajo.pdf"))
                .build();

        when(chatService.processChat(any(ChatRequest.class))).thenReturn(mockResponse);

        String body = """
            {
                "message": "¿Cuanto me corresponde por despido?",
                "sessionId": "session-1"
            }
            """;

        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.response").value("Segun el codigo de trabajo..."))
                .andExpect(jsonPath("$.sources[0]").value("codigo-trabajo.pdf"));

        verify(chatService).processChat(any(ChatRequest.class));
    }

    @Test
    void cuandoMensajeValidoSinSessionId_debeRetornar200() throws Exception {
        ChatResponse mockResponse = ChatResponse.builder()
                .response("Respuesta general.")
                .sources(List.of("constitucion-republica-dominicana.pdf"))
                .build();

        when(chatService.processChat(any(ChatRequest.class))).thenReturn(mockResponse);

        String body = """
            {
                "message": "¿Cuales son mis derechos fundamentales?"
            }
            """;

        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.response").value("Respuesta general."));
    }

    @Test
    void cuandoChatServiceLanzaExcepcion_debeRetornar500() throws Exception {
        when(chatService.processChat(any(ChatRequest.class)))
                .thenThrow(new RuntimeException("Error del servidor de IA"));

        String body = """
            {
                "message": "Pregunta que causara error",
                "sessionId": "session-1"
            }
            """;

        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isInternalServerError());
    }

}
