package com.lexrd.backend.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import com.lexrd.backend.model.ChatRequest;
import com.lexrd.backend.model.ChatResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatModel chatModel;
    private final VectorStore vectorStore;

    // Prompt para extraer palabras clave de búsqueda
    private static final String REWRITE_PROMPT = """
        Eres un experto extrayendo palabras clave legales en República Dominicana.
        Lee el mensaje del usuario y conviértelo en una lista de palabras clave para buscar en una base de datos vectorial.
        - Si el usuario habla de vehículos, choques, licencias o tránsito, INCLUYE obligatoriamente las palabras "Ley 63-17 Tránsito Movilidad".
        - Si habla de despidos o trabajo, INCLUYE obligatoriamente "Código de Trabajo".
        - Usa solo conceptos legales, máximo 15 palabras.
        NO respondas la pregunta. SOLO devuelve las palabras clave para buscar.
        
        Mensaje del usuario: {user_message}
        
        Palabras clave de búsqueda:
        """;

    private static final String SYSTEM_PROMPT = """
        Eres un asistente legal experto en la normativa de la República Dominicana.
        Tu misión es proporcionar respuestas precisas y profesionales basadas únicamente en la legislación dominicana.
        
        A continuación se te proporcionan fragmentos de leyes dominicanas relevantes para responder la consulta del usuario.
        Si el contexto no contiene información suficiente para dar una respuesta definitiva, admítelo, pero intenta orientar al usuario con lo que tengas disponible.
        Menciona siempre que tus respuestas son informativas y no sustituyen el consejo de un abogado profesional.
        
        Utiliza un tono formal, claro y servicial.
        
        CONTEXTO LEGAL:
        {context}
        """;

    public ChatResponse processChat(ChatRequest request) {
        log.info("Processing chat request for message: {}", request.getMessage());

        // --- PASO 1: REESCRITURA DE CONSULTA (QUERY REWRITING) ---
        log.info("Optimizando la consulta del usuario para búsqueda vectorial...");
        SystemPromptTemplate rewriteTemplate = new SystemPromptTemplate(REWRITE_PROMPT);
        var rewriteMessage = rewriteTemplate.createMessage(Map.of("user_message", request.getMessage()));
        
        String optimizedQuery = chatModel.call(new Prompt(List.of(rewriteMessage)))
                .getResult().getOutput().getText();
        
        log.info("Consulta original: {}", request.getMessage());
        log.info("Consulta optimizada para pgvector: {}", optimizedQuery);

        // --- PASO 2: BÚSQUEDA VECTORIAL CON LA CONSULTA OPTIMIZADA ---
        // Buscamos usando las palabras clave, NO la historia original
        List<Document> similarDocuments = vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(optimizedQuery) // <--- Usamos el query optimizado aquí
                        .topK(20)
                        // .similarityThreshold(0.5) // Eliminado para evitar falsos negativos en pgvector
                        .build());

        String context = similarDocuments.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n---\n\n"));

        // Prepare sources list (filenames stored in metadata)
        List<String> sources = similarDocuments.stream()
                .map(doc -> (String) doc.getMetadata().getOrDefault("file_name", "Documento Legal"))
                .distinct()
                .collect(Collectors.toList());

        // --- PASO 3: RESPUESTA FINAL ---
        // Le pasamos el contexto recuperado y la historia ORIGINAL del usuario
        SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(SYSTEM_PROMPT);
        var systemMessage = systemPromptTemplate.createMessage(Map.of("context", context));
        var userMessage = new UserMessage(request.getMessage()); // <--- El LLM sí lee la historia original

        log.info("Generating final response using AI models...");

        String aiResponse = chatModel.call(new Prompt(List.of(systemMessage, userMessage)))
                .getResult().getOutput().getText();

        return ChatResponse.builder()
                .response(aiResponse)
                .sources(sources)
                .build();
    }

    public Flux<ChatResponse> streamChat(ChatRequest request) {
        log.info("Streaming chat request for message: {}", request.getMessage());

        // --- PASO 1: REESCRITURA DE CONSULTA ---
        SystemPromptTemplate rewriteTemplate = new SystemPromptTemplate(REWRITE_PROMPT);
        var rewriteMessage = rewriteTemplate.createMessage(Map.of("user_message", request.getMessage()));
        
        String optimizedQuery = chatModel.call(new Prompt(List.of(rewriteMessage)))
                .getResult().getOutput().getText();

        // --- PASO 2: BÚSQUEDA VECTORIAL ---
        List<Document> similarDocuments = vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(optimizedQuery)
                        .topK(20)
                        .build());

        String context = similarDocuments.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n---\n\n"));

        List<String> sources = similarDocuments.stream()
                .map(doc -> (String) doc.getMetadata().getOrDefault("file_name", "Documento Legal"))
                .distinct()
                .collect(Collectors.toList());

        // --- PASO 3: RESPUESTA EN STREAMING ---
        SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(SYSTEM_PROMPT);
        var systemMessage = systemPromptTemplate.createMessage(Map.of("context", context));
        var userMessage = new UserMessage(request.getMessage());

        return chatModel.stream(new Prompt(List.of(systemMessage, userMessage)))
                .map(chunk -> ChatResponse.builder()
                        .response(chunk.getResult().getOutput().getText())
                        .sources(sources)
                        .build());
    }
}
