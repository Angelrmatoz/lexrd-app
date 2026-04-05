package com.lexrd.backend.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemoryRepository;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import com.lexrd.backend.dto.ChatRequest;
import com.lexrd.backend.dto.ChatResponse;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;

@Service
@Slf4j
public class ChatService {

    private final ChatModel chatModel;
    private final VectorStore vectorStore;
    private final ChatClient chatClient;
    private final ChatMemory chatMemory = MessageWindowChatMemory.builder()
            .chatMemoryRepository(new InMemoryChatMemoryRepository())
            .maxMessages(20)
            .build();

    public ChatService(ChatModel chatModel, VectorStore vectorStore) {
        this.chatModel = chatModel;
        this.vectorStore = vectorStore;
        this.chatClient = ChatClient.builder(chatModel)
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory)
                        .conversationId("default-session")
                        .build())
                .build();
    }

    // Prompt para decidir qué archivo es el más relevante (Query Router)
    private static final String ROUTER_PROMPT = """
        Eres un experto legal en República Dominicana. Tu tarea es identificar cuál de estos archivos es el más relevante para buscar la respuesta.
        
        LISTA DE ARCHIVOS:
        - constitucion.pdf (Derechos fundamentales, estructura del Estado)
        - codigo-civil.pdf (Contratos, matrimonio, propiedad, sucesiones)
        - codigo-penal.pdf (Delitos, crímenes, robo, homicidio)
        - codigo-trabajo.pdf (Relación laboral, despido, prestaciones, salario)
        - codigo-procesal-penal.pdf (Procedimientos de juicios penales)
        - codigo-procedimiento-civil.pdf (Procedimientos de juicios civiles)
        - codigo-tributario.pdf (Impuestos, DGII)
        - codigo-monetario-financiero.pdf (Bancos, préstamos, moneda)
        - codigo-nna.pdf (Niños, niñas y adolescentes)
        - codigo-comercio.pdf (Empresas, actos de comercio)
        - Ley-No.-63-17-de-Movilidad-Transporte-Terrestre-Transito-y-Seguridad-Vial-en-Republica-Dominicana-Deroga-la-ley-241-1.pdf (Tránsito, choques, multas)
        
        Si la pregunta es general o abarca varios temas, responde: ALL.
        Si no estás seguro, responde: ALL.
        
        Responde ÚNICAMENTE el nombre del archivo o la palabra ALL.
        
        Pregunta del usuario: {user_message}
        """;

    // Prompt para reformular la consulta (Query Rewriting)
    private static final String REWRITE_PROMPT = """
        Eres un experto legal en República Dominicana.
        Tu tarea es reformular la pregunta del usuario para que sea una pregunta clara, completa y autocontenida, ideal para buscar en una base de datos vectorial de leyes dominicanas.
        - Mantén la intención semántica original y el vocabulario legal.
        - NO respondas a la pregunta, SOLO devuelve la pregunta reformulada.
        
        Pregunta original del usuario: {user_message}
        
        Pregunta reformulada:
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

    public ChatResponse processChat(ChatRequest request) {
        log.info("Processing chat request for message: {}", request.getMessage());

        // --- PASO 1: IA ENRUTA LA CONSULTA AL ARCHIVO CORRECTO ---
        PromptTemplate routerTemplate = new PromptTemplate(ROUTER_PROMPT);
        var routerMessage = routerTemplate.createMessage(Map.of("user_message", request.getMessage()));
        String targetFile = chatModel.call(new Prompt(List.of(routerMessage)))
                .getResult().getOutput().getText().trim();
        
        // --- PASO 2: REESCRIBIR LA CONSULTA ---
        PromptTemplate rewriteTemplate = new PromptTemplate(REWRITE_PROMPT);
        var rewriteMessage = rewriteTemplate.createMessage(Map.of("user_message", request.getMessage()));
        String optimizedQuery = chatModel.call(new Prompt(List.of(rewriteMessage)))
                .getResult().getOutput().getText().trim();
        
        log.info("Análisis de IA -> Archivo: {}, Consulta: {}", targetFile, optimizedQuery);

        // --- PASO 3: BÚSQUEDA VECTORIAL ---
        SearchRequest searchRequest = SearchRequest.builder()
                .query(optimizedQuery)
                .topK(15) 
                .build();
                
        if (!targetFile.equalsIgnoreCase("ALL") && !targetFile.isEmpty()) {
            log.info("Filtrando búsqueda vectorial por archivo sugerido: {}", targetFile);
            searchRequest = SearchRequest.builder()
                .query(optimizedQuery)
                .topK(15)
                .filterExpression("filename == '" + targetFile + "'")
                .build();
        }

        List<Document> similarDocuments = vectorStore.similaritySearch(searchRequest);

        String context = similarDocuments.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n---\n\n"));

        List<String> sources = similarDocuments.stream()
                .map(doc -> (String) doc.getMetadata().getOrDefault("filename", "Documento Legal"))
                .distinct()
                .collect(Collectors.toList());

        // --- PASO 4: RESPUESTA FINAL CON MEMORIA ---
        log.info("Generando respuesta final con ChatClient (Memory limit: 20)...");

        String aiResponse = chatClient.prompt()
                .system(s -> s.text(SYSTEM_PROMPT).param("context", context))
                .user(request.getMessage())
                .call()
                .content();

        return ChatResponse.builder()
                .response(aiResponse)
                .sources(sources)
                .build();
    }

    public Flux<ChatResponse> streamChat(ChatRequest request) {
        log.info("Streaming chat request for message: {}", request.getMessage());

        // --- PASO 1: IA ENRUTA LA CONSULTA ---
        PromptTemplate routerTemplate = new PromptTemplate(ROUTER_PROMPT);
        var routerMessage = routerTemplate.createMessage(Map.of("user_message", request.getMessage()));
        String targetFile = chatModel.call(new Prompt(List.of(routerMessage)))
                .getResult().getOutput().getText().trim();

        // --- PASO 2: REESCRIBIR LA CONSULTA ---
        PromptTemplate rewriteTemplate = new PromptTemplate(REWRITE_PROMPT);
        var rewriteMessage = rewriteTemplate.createMessage(Map.of("user_message", request.getMessage()));
        String optimizedQuery = chatModel.call(new Prompt(List.of(rewriteMessage)))
                .getResult().getOutput().getText().trim();

        // --- PASO 3: BÚSQUEDA VECTORIAL ---
        SearchRequest searchRequest = SearchRequest.builder()
                .query(optimizedQuery)
                .topK(15)
                .build();
                
        if (!targetFile.equalsIgnoreCase("ALL") && !targetFile.isEmpty()) {
            searchRequest = SearchRequest.builder()
                .query(optimizedQuery)
                .topK(15)
                .filterExpression("filename == '" + targetFile + "'")
                .build();
        }

        List<Document> similarDocuments = vectorStore.similaritySearch(searchRequest);

        String context = similarDocuments.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n---\n\n"));

        List<String> sources = similarDocuments.stream()
                .map(doc -> (String) doc.getMetadata().getOrDefault("filename", "Documento Legal"))
                .distinct()
                .collect(Collectors.toList());

        // --- PASO 4: RESPUESTA EN STREAMING CON MEMORIA ---
        return chatClient.prompt()
                .system(s -> s.text(SYSTEM_PROMPT).param("context", context))
                .user(request.getMessage())
                .stream()
                .content()
                .map(text -> ChatResponse.builder()
                        .response(text)
                        .sources(sources)
                        .build());
    }
}
