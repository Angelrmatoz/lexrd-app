"use client";

import {useState, useRef, useEffect} from "react";
import dynamic from "next/dynamic";
import {NavBar} from "@/components/NavBar";
import {Footer} from "@/components/Footer";
import {ChatInput} from "@/components/ChatInput";
import {AppSidebar} from "@/components/AppSidebar";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Message} from "@/types/chat";
import {
    CHAT_RESET_COUNTDOWN_SECONDS,
    MAX_CONVERSATION_TURNS,
    useChatStore,
} from "@/store/useChatStore";
import {AlertCircle, Bot, Gavel, Timer} from "lucide-react";

const MarkdownRenderer = dynamic(
    () => import("@/components/MarkdownRenderer").then((mod) => mod.MarkdownRenderer),
    {ssr: false}
);

export default function Page() {
    const {messages, isLoading, isThinking, isTyping, sendMessage, clearMessages, limitReached} = useChatStore();
    const [input, setInput] = useState("");
    const [countdown, setCountdown] = useState<number | null>(null);
    const [autoScroll, setAutoScroll] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const streamingAnchorRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollFrameRef = useRef<number | null>(null);

    const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
        messagesEndRef.current?.scrollIntoView({behavior, block: "end"});
    };

    const scrollToStreamingAnchor = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        if (scrollFrameRef.current !== null) return;

        scrollFrameRef.current = window.requestAnimationFrame(() => {
            container.scrollTo({top: container.scrollHeight, behavior: "auto"});
            scrollFrameRef.current = null;
        });
    };

    // Detectar si el usuario está cerca del fondo del scroll
    const isNearBottom = () => {
        const container = scrollContainerRef.current;
        if (!container) return true;
        const threshold = 120; // píxeles de margen
        return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    };

    // Al enviar un nuevo mensaje (usuario), forzar scroll al fondo y reactivar autoScroll
    useEffect(() => {
        setAutoScroll(true);
        scrollToBottom(messages.length > 1 ? "smooth" : "auto");
    }, [messages.length]);

    // Solo hacer auto-scroll mientras la IA está escribiendo (typewriter activo)
    // Seguimos el streamingAnchorRef que está antes de las fuentes
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    const lastMessageContent = lastMessage ? lastMessage.content : "";
    useEffect(() => {
        if (isTyping && autoScroll && isNearBottom()) {
            scrollToStreamingAnchor();
        }
    }, [lastMessageContent, isTyping, autoScroll]);

    useEffect(() => {
        return () => {
            if (scrollFrameRef.current !== null) {
                window.cancelAnimationFrame(scrollFrameRef.current);
            }
        };
    }, []);

    // Detectar scroll manual del usuario
    const handleScroll = () => {
        setAutoScroll(isNearBottom());
    };

    // Countdown cuando se alcanza el límite
    useEffect(() => {
        if (limitReached && countdown === null) {
            setCountdown(CHAT_RESET_COUNTDOWN_SECONDS);
        }

        if (countdown !== null && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }

        if (countdown === 0) {
            clearMessages();
            setCountdown(null);
        }
    }, [limitReached, countdown, clearMessages]);

    const handleSend = async () => {
        const message = input;
        setInput(""); // Limpiamos el input local inmediatamente para mejor UX
        await sendMessage(message);
    };

    return (
        <div className="flex flex-col h-[100dvh] text-on-surface bg-surface overflow-hidden">
            <AppSidebar onNewChat={clearMessages}/>

            <div className="flex flex-col flex-1 relative bg-surface overflow-hidden min-h-0">
                <NavBar onNewChat={clearMessages}/>

                {/* Área de mensajes: ocupa espacio restante, scrolleable */}
                <main ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pt-24 pb-32">
                    <div className="w-full max-w-3xl mx-auto px-6 py-12">
                        {messages.length === 0 ? (
                            /* Welcome State */
                            <div
                                className="flex flex-col items-center justify-center text-center space-y-8 mt-20 opacity-90 md:animate-in md:fade-in md:slide-in-from-bottom-4 md:duration-1000">
                                <div
                                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-lg md:shadow-2xl transform-gpu">
                                    <Gavel className="size-8" strokeWidth={2.2} />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface">
                                        Tu Asistente Legal Digital
                                    </h1>
                                    <p className="text-on-surface-variant text-lg max-w-md mx-auto">
                                        Análisis legal dominicano experto, inteligencia regulatoria y
                                        jurisprudencia al alcance de tu mano.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Message Feed */
                            <div className="space-y-12">
                                {messages.filter(msg => msg && msg.role).map((msg, index) => (
                                    <div
                                        key={`${index}-${msg.role}`}
                                        className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start gap-4"} w-full group animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                    >
                                        {msg.role === "user" ? (
                                            <>
                                                <div
                                                    className="max-w-[85%] bg-surface-container-highest text-on-surface px-6 py-4 rounded-xl rounded-tr-none shadow-sm">
                                                    <p className="text-[15px] leading-relaxed">
                                                        {msg.content}
                                                    </p>
                                                </div>
                                                <span
                                                    className="text-[10px] uppercase tracking-widest text-on-surface-variant/50 mt-2 mr-1">
                          Tú • {msg.time}
                        </span>
                                            </>
                                        ) : (
                                            <div className="flex items-start gap-4 w-full">
                                                <div
                                                    className="mt-1 flex-shrink-0 w-8 h-8 rounded-lg bg-surface-container-high border border-outline-variant/10 flex items-center justify-center text-dominican-red">
                                                    <Bot className="size-5" strokeWidth={2.2} />
                                                </div>
                                                <div className="flex-grow space-y-6 overflow-hidden">
                                                    <div
                                                        className="text-[16px] leading-[1.7] text-on-surface space-y-4 font-light [&>p]:mb-4 [&>ul]:list-disc [&>ul]:ml-6 [&>ol]:list-decimal [&>ol]:ml-6 [&>li]:mb-1 [&>strong]:font-bold [&>em]:italic break-words overflow-x-hidden max-w-full">
                                                        {isTyping && index === messages.length - 1 ? (
                                                            <p className="whitespace-pre-wrap break-words">
                                                                {msg.content}
                                                            </p>
                                                        ) : (
                                                            <MarkdownRenderer content={msg.content} />
                                                        )}
                                                    </div>

                                                    {/* Anclaje de scroll durante el streaming, antes de las fuentes */}
                                                    {isTyping && index === messages.length - 1 && (
                                                        <div ref={streamingAnchorRef} className="h-0 w-0" />
                                                    )}

                                                    {/* Citations / Sources */}
                                                    {msg.sources && msg.sources.length > 0 && (
                                                        <div
                                                            className="pt-4 border-l-2 border-dominican-red/20 pl-6 space-y-3">
                                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                                                                <Gavel className="size-3.5" strokeWidth={2.2} />
                                                                Fuentes Jurídicas
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {msg.sources.map((source, sIdx) => (
                                                                    <div
                                                                        key={sIdx}
                                                                        className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/5 hover:border-tertiary/30 transition-all cursor-pointer group"
                                                                    >
                                                                        <p className="text-xs font-semibold text-tertiary mb-1 group-hover:text-on-surface transition-colors">
                                                                            {source}
                                                                        </p>
                                                                        <p className="text-[10px] text-on-surface-variant leading-tight opacity-70">
                                                                            Referencia oficial del sistema legal
                                                                            dominicano.
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <span
                                                        className="text-[10px] uppercase tracking-widest text-on-surface-variant/50 block">
                            LexRD • {msg.time}
                          </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Indicador "Pensando..." */}
                                {isThinking && (
                                    <div className="flex items-start gap-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-lg bg-surface-container-high border border-outline-variant/10 flex items-center justify-center text-dominican-red">
                                            <Bot className="size-5 animate-pulse" strokeWidth={2.2} />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 py-3">
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 bg-dominican-red rounded-full animate-bounce" style={{animationDelay: "0ms"}}></div>
                                                    <div className="w-2 h-2 bg-dominican-red rounded-full animate-bounce" style={{animationDelay: "150ms"}}></div>
                                                    <div className="w-2 h-2 bg-dominican-red rounded-full animate-bounce" style={{animationDelay: "300ms"}}></div>
                                                </div>
                                                <span className="text-sm text-on-surface-variant font-medium">
                                                    Pensando...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef}/>
                            </div>
                        )}
                    </div>

                    {/* Alerta de límite de mensajes */}
                    {limitReached && countdown !== null && (
                        <div className="w-full max-w-3xl mx-auto px-6 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Límite de conversación alcanzado</AlertTitle>
                                <AlertDescription className="flex items-center gap-1.5">
                                    <Timer className="h-3.5 w-3.5" />
                                    Se ha excedido el límite de {MAX_CONVERSATION_TURNS} mensajes. El chat se borrará automáticamente en <span className="font-bold">{countdown}s</span>.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                </main>

                <ChatInput
                    input={input}
                    setInput={setInput}
                    onSend={handleSend}
                    isLoading={isLoading}
                    isDisabled={limitReached}
                />
            </div>

            {/* Decorative Elements (Ambient Shadows) */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div
                    className="ambient-orb absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-dominican-red rounded-full"></div>
                <div
                    className="ambient-orb absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-dominican-blue rounded-full"></div>
            </div>
        </div>

    );
}
