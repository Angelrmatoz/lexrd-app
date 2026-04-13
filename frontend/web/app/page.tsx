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
import { ScrollToBottomButton } from "@/components/ScrollToBottomButton";

const MarkdownRenderer = dynamic(
    () => import("@/components/MarkdownRenderer").then((mod) => mod.MarkdownRenderer),
    {ssr: false}
);

export default function Page() {
    const {messages, isLoading, isThinking, isTyping, sendMessage, clearMessages, limitReached} = useChatStore();
    const [input, setInput] = useState("");
    const [countdown, setCountdown] = useState<number | null>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
        } else {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    };

    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        // Mostrar botón si estamos a más de 150px del fondo
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
        setShowScrollButton(!isNearBottom);
    };

    // Control del scroll al enviar o recibir mensajes
    useEffect(() => {
        if (messages.length > 0) {
            const lastMsgIndex = messages.length - 1;
            const lastMsg = messages[lastMsgIndex];
            
            setTimeout(() => {
                if (lastMsg.role === "user") {
                    // Cuando el usuario envía, bajamos para ver el indicador "Pensando..."
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
                } else if (lastMsg.role === "assistant") {
                    // Cuando la IA empieza a responder, enfocamos exactamente el inicio de su respuesta
                    const element = document.getElementById(`message-${lastMsgIndex}`);
                    if (element) {
                        // block: "start" lo alinea arriba, scroll-mt-24 lo separa del NavBar
                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                }
            }, 100);
        }
    }, [messages.length]);

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
                                        id={`message-${index}`}
                                        className={`flex flex-col scroll-mt-24 ${msg.role === "user" ? "items-end" : "items-start gap-4"} w-full group animate-in fade-in slide-in-from-bottom-2 duration-300`}
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

                                                    {/* Citations / Sources - Solo se muestran cuando la IA ha terminado de escribir */}
                                                    {msg.sources && msg.sources.length > 0 && (!isTyping || index !== messages.length - 1) && (
                                                        <div
                                                            className="pt-4 border-l-2 border-dominican-red/20 pl-6 space-y-3 animate-in fade-in duration-500">
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

                {/* Botón flotante para ir al final */}
                <ScrollToBottomButton 
                    isVisible={showScrollButton && messages.length > 0} 
                    onClick={scrollToBottom} 
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
