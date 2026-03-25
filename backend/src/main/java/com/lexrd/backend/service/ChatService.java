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

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatModel chatModel;
    private final VectorStore vectorStore;

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

        // 1. Retrieve relevant legal context from the vector store
        // Using withTopK(5) to get enough legal context but keeping it within model
        // limits
        List<Document> similarDocuments = vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(request.getMessage())
                        .topK(5)
                        .similarityThreshold(0.5) // Adjust based on precision needs
                        .build());

        String context = similarDocuments.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n---\n\n"));

        // 2. Prepare sources list (filenames stored in metadata)
        List<String> sources = similarDocuments.stream()
                .map(doc -> (String) doc.getMetadata().getOrDefault("file_name", "Documento Legal"))
                .distinct()
                .collect(Collectors.toList());

        // 3. Create the prompt with the retrieved context
        SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(SYSTEM_PROMPT);
        var systemMessage = systemPromptTemplate.createMessage(Map.of("context", context));
        var userMessage = new UserMessage(request.getMessage());

        log.info("Generating response using AI models...");

        // 4. Generate the response through the ChatModel (handled with fallbacks in
        // AiConfig)
        String aiResponse = chatModel.call(new Prompt(List.of(systemMessage, userMessage)))
                .getResult().getOutput().getText();

        return ChatResponse.builder()
                .response(aiResponse)
                .sources(sources)
                .build();
    }
}
