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

    // Prompt para reformular la consulta (Query Rewriting / Standalone Question)
    private static final String REWRITE_PROMPT = """
        Eres un experto legal en República Dominicana.
        Tu tarea es reformular la pregunta del usuario para que sea una pregunta clara, completa y autocontenida, ideal para buscar en una base de datos vectorial de leyes dominicanas.
        - Si la pregunta es vaga pero menciona temas como vehículos, choques o tránsito, asegúrate de incluir "Ley 63-17 de Movilidad, Transporte Terrestre, Tránsito y Seguridad Vial".
        - Si menciona despidos, salario, o trabajo, incluye "Código de Trabajo".
        - NO respondas a la pregunta, SOLO devuelve la pregunta reformulada.
        - Mantén la intención semántica original y el vocabulario legal.
        
        Pregunta original del usuario: {user_message}
        
        Pregunta reformulada para búsqueda:
        """;

    private static final String SYSTEM_PROMPT = """
        Eres un asistente legal experto en la normativa de la República Dominicana.
        Tu misión es proporcionar respuestas precisas y profesionales basadas únicamente en la legislación dominicana.
        
        A continuación se te proporcionan fragmentos de leyes dominicanas relevantes para responder la consulta del usuario.
        Si la respuesta no está explícitamente en el CONTEXTO LEGAL proporcionado, DEBES decir que no tienes información suficiente basándote en los documentos cargados. NO inventes procedimientos, ni cites leyes derogadas, ni uses conocimientos de otros países.
        Menciona siempre que tus respuestas son informativas y no sustituyen el consejo de un abogado profesional.
        
        Utiliza un tono formal, claro y servicial.
        
        CONTEXTO LEGAL:
        {context}
        """;

    private static final String ROUTER_PROMPT = """
        El usuario hizo la siguiente pregunta legal en República Dominicana:
        "{user_message}"
        
        ¿En cuál de estos códigos o leyes dominicanas es más probable encontrar la respuesta?
        Opciones disponibles:
        - codigo-trabajo.pdf
        - Ley-No.-63-17-de-Movilidad-Transporte-Terrestre-Transito-y-Seguridad-Vial-en-Republica-Dominicana-Deroga-la-ley-241-1.pdf
        - codigo-procesal-penal.pdf
        - codigo-penal.pdf
        - codigo-procedimiento-civil.pdf
        - codigo-civil.pdf
        - constitucion.pdf
        - codigo-tributario.pdf
        - codigo-nna.pdf
        - codigo-comercio.pdf
        - codigo-monetario-financiero.pdf
        
        Responde SOLO con el nombre exacto del archivo de la opción correspondiente. Si no estás seguro o la pregunta abarca múltiples leyes, responde exactamente con la palabra "ALL". No agregues ninguna otra palabra, puntuación o explicación a tu respuesta.
        """;

    private String determineTargetFile(String message) {
        if (message == null || message.isBlank()) return null;
        
        log.info("Determinando el archivo objetivo mediante LLM para la pregunta...");
        SystemPromptTemplate routerTemplate = new SystemPromptTemplate(ROUTER_PROMPT);
        var routerMessage = routerTemplate.createMessage(Map.of("user_message", message));
        
        String result = chatModel.call(new Prompt(List.of(routerMessage)))
                .getResult().getOutput().getText().trim();
                
        if (result.equalsIgnoreCase("ALL") || result.isBlank()) {
            return null;
        }
        
        return result;
    }

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
        SearchRequest searchRequest = SearchRequest.builder()
                .query(optimizedQuery)
                .topK(10) // Reducido para evitar diluir el contexto
                .build();
                
        String targetFile = determineTargetFile(request.getMessage());
        if (targetFile != null) {
            log.info("Filtrando búsqueda vectorial por archivo: {}", targetFile);
            searchRequest = SearchRequest.builder()
                .query(optimizedQuery)
                .topK(10)
                .filterExpression("file_name == '" + targetFile + "'")
                .build();
        }

        List<Document> similarDocuments = vectorStore.similaritySearch(searchRequest);

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
        SearchRequest searchRequest = SearchRequest.builder()
                .query(optimizedQuery)
                .topK(10)
                .build();
                
        String targetFile = determineTargetFile(request.getMessage());
        if (targetFile != null) {
            log.info("Filtrando búsqueda vectorial en streaming por archivo: {}", targetFile);
            searchRequest = SearchRequest.builder()
                .query(optimizedQuery)
                .topK(10)
                .filterExpression("file_name == '" + targetFile + "'")
                .build();
        }

        List<Document> similarDocuments = vectorStore.similaritySearch(searchRequest);

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
