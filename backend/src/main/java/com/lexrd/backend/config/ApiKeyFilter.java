package com.lexrd.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro que valida la API Key en cada petición a /api/**.
 * Excluye endpoints de health, Swagger y documentación OpenAPI.
 */
@Component
public class ApiKeyFilter extends OncePerRequestFilter {

    @Value("${app.api.key}")
    private String expectedApiKey;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Excluir health, swagger y docs
        return path.startsWith("/api/health")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/api-docs");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // Si la API Key está vacía, el filtro no se aplica (modo desarrollo)
        if (expectedApiKey == null || expectedApiKey.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        String apiKey = request.getHeader("x-api-key");

        if (apiKey == null || !apiKey.equals(expectedApiKey)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Invalid or missing API key\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
