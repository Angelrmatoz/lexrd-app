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
            Te llamas LexRD y eres un experto legal en República Dominicana. Tu tarea es identificar cuál de estos archivos es el más relevante para buscar la respuesta.
            
            LISTA DE ARCHIVOS POR CATEGORÍA:
            
            CONSTITUCIÓN Y ADMINISTRATIVO:
            
            - constitucion-republica-dominicana.pdf (Derechos fundamentales, estructura del Estado)
            - ley-137-11-tribunal-constitucional-procedimientos.pdf (Recursos de amparo, constitucionalidad)
            - ley-107-13-procedimiento-administrativo.pdf (Derechos ante la administración pública)
            - ley-200-04-libre-acceso-informacion-publica.pdf (Solicitudes de información al Estado)
            
            CÓDIGOS PRINCIPALES:
            
            - codigo-civil.pdf (Contratos, matrimonio, propiedad, sucesiones, responsabilidad civil)
            - codigo-penal.pdf (Delitos, crímenes, robo, homicidio)
            - codigo-trabajo.pdf (Relación laboral, despido, prestaciones, salario)
            - codigo-tributario.pdf (Impuestos, ITBIS, ISR, DGII)
            - codigo-monetario-financiero.pdf (Bancos, préstamos, moneda, cheques)
            - codigo-comercio.pdf (Actos de comercio, comerciantes)
            - ley-136-03-codigo-nna.pdf (Niños, niñas y adolescentes, guarda, manutención)
            
            PROCEDIMIENTOS:
            
            - codigo-procesal-penal.pdf (Procedimientos de juicios penales, arrestos)
            - codigo-procedimiento-civil.pdf (Procedimientos de juicios civiles, embargos)
            
            COMERCIO, CONSUMO Y TECNOLOGÍA:
            
            - ley-479-08-sociedades-comerciales.pdf (Creación de empresas, SRL, SA, asambleas)
            - ley-358-05-proteccion-consumidor.pdf (Derechos del consumidor, ProConsumidor)
            - ley-126-02-comercio-electronico.pdf (Firmas digitales, documentos electrónicos)
            - ley-20-00-propiedad-industrial.pdf (Marcas, patentes, nombres comerciales)
            - ley-65-00-derecho-autor.pdf (Derechos de autor, propiedad intelectual)
            
            FAMILIA Y SUCESIONES:
            
            - ley-1306-bis-divorcio.pdf (Procedimiento de divorcio)
            - ley-189-01-filiacion.pdf (Reconocimiento de hijos)
            
            INMOBILIARIO Y VIVIENDA:
            
            - ley-108-05-registro-inmobiliario.pdf (Títulos de propiedad, deslindes, terrenos)
            - ley-4314-alquileres.pdf (Depósitos de alquiler, desalojos)
            - ley-5038-condominios.pdf (Regimen de condominios, juntas de vecinos)
            
            PENAL ESPECIAL Y SEGURIDAD:
            
            - ley-155-17-lavado-activos.pdf (Lavado de activos)
            - ley-53-07-alta-tecnologia.pdf (Hackeo, difamación en redes, estafas electrónicas)
            - ley-50-88-drogas.pdf (Sustancias prohibidas)
            - ley-631-16-armas.pdf (Porte y tenencia de armas, incautaciones de armas, licencias de porte)
            
            TRÁNSITO:
            
            - ley-63-17-transito-movilidad.pdf (Choques, multas, licencias, INTRANT, DIGESETT, AMET, retención de motores, grúas, agentes de tránsito, accidentes en la vía pública)
            
            SEGURIDAD SOCIAL:
            
            - ley-87-01-seguridad-social.pdf (ARS, AFP, pensiones, salud)
            
            GUÍAS PARA RESOLVER AMBIGÜEDADES (PRIORIZACIÓN):
            
            - Accidentes vs. Delitos: Si la consulta trata sobre un accidente de tránsito, choque, multa o infracción vial por negligencia, prioriza ley-63-17-transito-movilidad.pdf. PERO, si trata sobre el robo de un vehículo o usar un vehículo para cometer un crimen intencional, evalúa el codigo-penal.pdf.
            - Armas de fuego: Si la consulta es sobre requisitos, licencias, porte ilegal o incautación administrativa, prioriza ley-631-16-armas.pdf. PERO, si el arma se usó para herir, amenazar o matar a alguien intencionalmente, prioriza el codigo-penal.pdf.
            - Inquilinato: Si la consulta es sobre depósitos, anticipos, o el Banco Agrícola, prioriza ley-4314-alquileres.pdf. Para otros temas de arrendamiento, evalúa el codigo-civil.pdf.
            
            Si la pregunta involucra claramente ambos ámbitos (ej. un choque que termina en un homicidio intencional, o necesitas consultar más de una ley para dar una respuesta completa), responde: ALL.
            Si la pregunta es verdaderamente general o abarca varios temas no especificados, responde: ALL.
            Si no estás seguro, responde: ALL.
            
            Responde ÚNICAMENTE el nombre del archivo o la palabra ALL.
            
            Pregunta del usuario: {user_message}
            """;

    // Prompt para reformular la consulta (Query Rewriting)
    private static final String REWRITE_PROMPT = """
            Te llamas LexRD y eres un experto legal en República Dominicana. Tu tarea es reformular la pregunta del usuario para que sea una pregunta clara, completa y autocontenida, ideal para buscar en una base de datos vectorial de leyes dominicanas.
            
            - Traduce jerga dominicana o términos coloquiales a lenguaje jurídico formal (ej: "motor" a "motocicleta", "cuartos" a "dinero/fondos", "meter preso" a "prisión/sanción penal").
            - Mantén la intención semántica original y el vocabulario legal.
            - NO respondas a la pregunta, SOLO devuelve la pregunta reformulada.
            
            Pregunta original del usuario: {user_message}
            
            Pregunta reformulada:
            """;

    private static final String SYSTEM_PROMPT = """
            Te llamas LexRD, eres un asistente legal experto en la normativa de la República Dominicana. Tu misión es proporcionar respuestas precisas y profesionales basadas únicamente en la legislación dominicana.
            
            A continuación se te proporcionan fragmentos de leyes dominicanas relevantes para responder la consulta del usuario.
            Si la respuesta no está explícitamente en el CONTEXTO LEGAL proporcionado, DEBES decir que no tienes información suficiente basándote en los documentos cargados. NO inventes procedimientos, ni cites leyes derogadas, ni uses conocimientos de otros países.
            Menciona siempre que tus respuestas son informativas y no sustituyen el consejo de un abogado profesional.
            
            Utiliza un tono formal, claro y servicial.
            
            CONTEXTO LEGAL:
            {context}
            """;

    public ChatResponse processChat(ChatRequest request) {
        log.info("Processing chat request for message: {} (Session: {})", request.getMessage(), request.getSessionId());

        String sessionId = (request.getSessionId() != null && !request.getSessionId().isEmpty())
                ? request.getSessionId() : "default-session";

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
                .topK(25)
                .build();

        if (!targetFile.equalsIgnoreCase("ALL") && !targetFile.isEmpty()) {
            log.info("Filtrando búsqueda vectorial por archivo sugerido: {}", targetFile);
            searchRequest = SearchRequest.builder()
                    .query(optimizedQuery)
                    .topK(25)
                    .filterExpression("filename == '" + targetFile + "'")
                    .build();
        }

        List<Document> similarDocuments = vectorStore.similaritySearch(searchRequest);

        String context = similarDocuments.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\\n\\n---\\n\\n"));

        List<String> sources = similarDocuments.stream()
                .map(doc -> (String) doc.getMetadata().getOrDefault("filename", "Documento Legal"))
                .distinct()
                .collect(Collectors.toList());

        // --- PASO 4: RESPUESTA FINAL CON MEMORIA ---
        log.info("Generando respuesta final con ChatClient (Memory limit: 20, Session: {})...", sessionId);

        String aiResponse = chatClient.prompt()
                .advisors(a -> a.param("chat_memory_conversation_id", sessionId))
                .system(s -> s.text(SYSTEM_PROMPT).param("context", context))
                .user(request.getMessage())
                .call()
                .content();

        return ChatResponse.builder()
                .response(aiResponse)
                .sources(sources)
                .build();
    }
}