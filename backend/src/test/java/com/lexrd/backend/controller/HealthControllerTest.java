package com.lexrd.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas de integracion para HealthController con MockMvc.
 *
 * Usamos @WebMvcTest que solo carga la capa web (controllers, filtros, converters)
 * sin intentar crear la base de datos. Probamos el controller real sin mocks.
 */
@WebMvcTest(HealthController.class)
@AutoConfigureMockMvc(addFilters = false)
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void cuandoGetHealth_debeRetornar200ConStatusUP() throws Exception {
        mockMvc.perform(get("/api/health")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.version").value("1.0.0"))
                .andExpect(jsonPath("$.description").value("LexRD Backend is running"));
    }

    @Test
    void cuandoGetHealth_noRequiereApiKey() throws Exception {
        // El health endpoint debe ser accesible sin API key
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk());
    }
}
