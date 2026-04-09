package com.lexrd.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para ApiKeyFilter.
 *
 * Mockeamos HttpServletRequest y HttpServletResponse como si fuera
 * jest.mock() de objetos HTTP en tests de Express.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ApiKeyFilterTest {

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private ApiKeyFilter apiKeyFilter;

    private StringWriter responseWriter;

    @BeforeEach
    void setUp() {
        responseWriter = new StringWriter();
    }

    // ──────────────────────────────────────────────
    // shouldNotFilter: endpoints excluidos
    // ──────────────────────────────────────────────

    @Test
    void cuandoPathEsApiHealth_noDebeFiltrar() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/api/health");

        apiKeyFilter.doFilterInternal(request, response, filterChain);

        // No debe verificar la API key, pasa directo al filterChain
        verify(filterChain).doFilter(request, response);
        verify(response, never()).setStatus(anyInt());
    }

    @Test
    void cuandoPathEsSwaggerUI_noDebeFiltrar() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/swagger-ui/index.html");

        apiKeyFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(response, never()).setStatus(anyInt());
    }

    @Test
    void cuandoPathEsV3ApiDocs_noDebeFiltrar() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/v3/api-docs/swagger-config");

        apiKeyFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(response, never()).setStatus(anyInt());
    }

    @Test
    void cuandoPathEsApiDocs_noDebeFiltrar() throws ServletException, IOException {
        when(request.getRequestURI()).thenReturn("/api-docs/openapi.json");

        apiKeyFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(response, never()).setStatus(anyInt());
    }

    // ──────────────────────────────────────────────
    // Modo desarrollo: API key vacia
    // ──────────────────────────────────────────────

    @Test
    void cuandoApiKeyEstaVacia_debePermitirTodo() throws ServletException, IOException {
        ReflectionTestUtils.setField(apiKeyFilter, "expectedApiKey", "");
        when(request.getRequestURI()).thenReturn("/api/chat");

        apiKeyFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(response, never()).setStatus(anyInt());
    }

    @Test
    void cuandoApiKeyEsNull_debePermitirTodo() throws ServletException, IOException {
        ReflectionTestUtils.setField(apiKeyFilter, "expectedApiKey", null);
        when(request.getRequestURI()).thenReturn("/api/chat");

        apiKeyFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(response, never()).setStatus(anyInt());
    }

    // ──────────────────────────────────────────────
    // Modo produccion: API key configurada
    // ──────────────────────────────────────────────

    @Test
    void cuandoApiKeyEsCorrecta_debePermitirAcceso() throws ServletException, IOException {
        ReflectionTestUtils.setField(apiKeyFilter, "expectedApiKey", "mi-api-key-secreta");
        when(request.getRequestURI()).thenReturn("/api/chat");
        when(request.getHeader("x-api-key")).thenReturn("mi-api-key-secreta");

        apiKeyFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(response, never()).setStatus(anyInt());
    }

    @Test
    void cuandoApiKeyEsIncorrecta_debeRetornar401() throws ServletException, IOException {
        ReflectionTestUtils.setField(apiKeyFilter, "expectedApiKey", "mi-api-key-secreta");
        when(request.getRequestURI()).thenReturn("/api/chat");
        when(request.getHeader("x-api-key")).thenReturn("key-incorrecta");
        when(response.getWriter()).thenReturn(new PrintWriter(responseWriter));

        apiKeyFilter.doFilterInternal(request, response, filterChain);

        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(response).setContentType("application/json");
        assertThat(responseWriter.toString()).contains("Invalid or missing API key");
        verify(filterChain, never()).doFilter(any(), any());
    }

    @Test
    void cuandoNoSeEnviaApiKey_debeRetornar401() throws ServletException, IOException {
        ReflectionTestUtils.setField(apiKeyFilter, "expectedApiKey", "mi-api-key-secreta");
        when(request.getRequestURI()).thenReturn("/api/chat");
        when(request.getHeader("x-api-key")).thenReturn(null);
        when(response.getWriter()).thenReturn(new PrintWriter(responseWriter));

        apiKeyFilter.doFilterInternal(request, response, filterChain);

        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(response).setContentType("application/json");
        assertThat(responseWriter.toString()).contains("Invalid or missing API key");
        verify(filterChain, never()).doFilter(any(), any());
    }

    // ──────────────────────────────────────────────
    // Otros paths protegidos
    // ──────────────────────────────────────────────

    @Test
    void cuandoPathEsApiDocuments_debeValidarApiKey() throws ServletException, IOException {
        ReflectionTestUtils.setField(apiKeyFilter, "expectedApiKey", "secreta");
        when(request.getRequestURI()).thenReturn("/api/documents");
        when(request.getHeader("x-api-key")).thenReturn(null);
        when(response.getWriter()).thenReturn(new PrintWriter(responseWriter));

        apiKeyFilter.doFilterInternal(request, response, filterChain);

        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(filterChain, never()).doFilter(any(), any());
    }

    @Test
    void cuandoPathEsRaiz_debeValidarApiKey() throws ServletException, IOException {
        ReflectionTestUtils.setField(apiKeyFilter, "expectedApiKey", "secreta");
        when(request.getRequestURI()).thenReturn("/");
        when(request.getHeader("x-api-key")).thenReturn("secreta");

        apiKeyFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }
}
