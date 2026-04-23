import React, {useState, useRef} from "react";
import {View, Text, ScrollView, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform} from "react-native";
import {StatusBar} from "expo-status-bar";
import {SafeAreaView} from "react-native-safe-area-context";
import {Plus, ArrowUp, MessageSquare, Gavel, FileText} from "lucide-react-native";
import {Link, router} from "expo-router";
import {useChatStore} from "@/store/useChatStore";
import {LinearGradient} from "expo-linear-gradient";

export default function Native() {
    const {messages, isLoading, isThinking, sendMessage, clearMessages} = useChatStore();
    const [input, setInput] = useState("");
    const scrollViewRef = useRef<ScrollView>(null);

    const handleSend = () => {
        if (input.trim() && !isLoading) {
            sendMessage(input);
            setInput("");
        }
    };

    const handleNewChat = () => {
        clearMessages();
    };

    return (
        <SafeAreaView className="flex-1 bg-[#131313]">
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <StatusBar style="light"/>

                {/* TopAppBar */}
                <View
                    className="bg-[#131313] border-b border-[#4447481a] px-6 py-4 flex-row justify-between items-center z-50">
                    <View className="flex-row items-center">
                        <View className="flex-row">
                            <Text className="text-xl font-black tracking-tighter uppercase text-[#e5e2e1]">Lex</Text>
                            <Text className="text-xl font-black tracking-tighter uppercase text-[#EF3340]">R</Text>
                            <Text className="text-xl font-black tracking-tighter uppercase text-[#0034BB]">D</Text>
                        </View>
                    </View>
                    <Pressable onPress={handleNewChat} className="bg-[#2a2a2a] p-2 rounded-xl active:opacity-80">
                        <Plus size={24} color="#c6c6c7"/>
                    </Pressable>
                </View>

                {/* Main Chat Canvas */}
                <ScrollView
                    ref={scrollViewRef}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({animated: true})}
                    className="flex-1 px-5"
                    contentContainerStyle={{paddingVertical: 24, flexGrow: 1}}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="gap-y-8 flex-1">
                        {messages.length === 0 && !isLoading ? (
                            <View className="flex-1 justify-center items-center space-y-6 -mt-10">
                                <View className="rounded-[20px] overflow-hidden w-20 h-20 shadow-lg">
                                    <LinearGradient
                                        colors={['#EF3340', '#002D62']}
                                        start={{x: 0, y: 0}}
                                        end={{x: 1, y: 1}}
                                        className="flex-1 items-center justify-center"
                                    >
                                        <Gavel size={40} color="#e5e2e1" strokeWidth={2.2}/>
                                    </LinearGradient>
                                </View>
                                <View className="items-center px-4 pt-4">
                                    <Text
                                        className="text-[28px] font-extrabold text-[#e5e2e1] text-center mb-3 leading-tight">
                                        Tu Asistente Legal Digital
                                    </Text>
                                    <Text className="text-[#c4c7c7] text-[15px] text-center max-w-[90%] leading-relaxed">
                                        Análisis legal dominicano experto, inteligencia regulatoria y jurisprudencia al
                                        alcance de tu mano.
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            messages.map((msg, index) => (
                                <View key={index} className={msg.role === "user" ? "items-end w-full" : "w-full"}>
                                    {msg.role === "user" ? (
                                        <>
                                            <View className="bg-[#353534] px-4 py-3 rounded-xl max-w-[85%]">
                                                <Text className="text-[#e5e2e1] text-[15px] leading-relaxed">
                                                    {msg.content}
                                                </Text>
                                            </View>
                                            {msg.time && (
                                                <Text
                                                    className="text-[10px] text-[#c4c7c780] mt-2 tracking-widest uppercase px-1">
                                                    Enviado • {msg.time}
                                                </Text>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <View className="flex-row items-center mb-4 gap-x-2">
                                                <View className="w-1.5 h-6 bg-[#EF3340] rounded-full"/>
                                                <Text
                                                    className="text-[11px] font-bold tracking-[0.2em] text-[#c4c7c7] uppercase">
                                                    LexRD | IA Jurídica
                                                </Text>
                                            </View>

                                            <View className="gap-y-4">
                                                <Text className="text-[#e5e2e1] text-[16px] leading-[1.6]">
                                                    {msg.content}
                                                </Text>
                                            </View>

                                            {msg.sources && msg.sources.length > 0 && (
                                                <View className="flex-row flex-wrap mt-6 gap-2">
                                                    {msg.sources.map((source, sIndex) => (
                                                        <View
                                                            key={sIndex}
                                                            className="bg-[#0e0e0e] border border-[#44474826] px-3 py-2 rounded-lg flex-row items-center gap-x-2">
                                                            <FileText size={14} color="#abc7ff"/>
                                                            <Text
                                                                className="text-[11px] font-medium text-[#abc7ff] tracking-tight">
                                                                {source}
                                                            </Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                        </>
                                    )}
                                </View>
                            ))
                        )}

                        {isThinking && (
                            <View className="w-full mt-4">
                                <View className="flex-row items-center mb-4 gap-x-2">
                                    <View className="w-1.5 h-6 bg-[#EF3340] rounded-full"/>
                                    <Text className="text-[11px] font-bold tracking-[0.2em] text-[#c4c7c7] uppercase">
                                        LexRD | IA Jurídica
                                    </Text>
                                </View>
                                <View className="flex-row py-2 gap-x-1.5 items-center">
                                    <ActivityIndicator size="small" color="#EF3340"/>
                                    <Text className="text-[#c4c7c7] text-xs ml-2">Pensando...</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* Bottom Area */}
                <View className="bg-[#131313] pb-4">
                    {/* Floating Input */}
                    <View className="px-5 mb-4">
                        <View
                            className="flex-row items-end bg-[#0e0e0e] rounded-[24px] border border-[#4447481a] px-2 py-2">
                            <TextInput
                                className="flex-1 text-[#e5e2e1] px-2 text-[15px]"
                                placeholder="Consultar a la inteligencia..."
                                placeholderTextColor="#c4c7c766"
                                value={input}
                                onChangeText={setInput}
                                editable={!isLoading}
                                multiline={true}
                                style={{
                                    minHeight: 40,
                                    maxHeight: 150,
                                    paddingTop: Platform.OS === 'ios' ? 10 : 8,
                                    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
                                    textAlignVertical: 'center'
                                }}
                            />
                            <Pressable
                                onPress={handleSend}
                                disabled={!input.trim() || isLoading}
                                className={`w-10 h-10 rounded-full items-center justify-center active:scale-95 mb-[1px] ${
                                    input.trim() && !isLoading ? "bg-[#c6c6c7]" : "bg-[#c6c6c74d]"
                                }`}
                            >
                                <ArrowUp size={20} color="#2f3131"/>
                            </Pressable>
                        </View>
                    </View>

                    {/* BottomNavBar */}
                    <View
                        className="bg-[#131313] border-t border-[#44474826] flex-row justify-around items-center px-4 pb-8 pt-2">
                        <Pressable
                            className="items-center justify-center bg-[#353534] rounded-xl p-3 scale-90 active:scale-100">
                            <MessageSquare size={24} color="#e5e2e1" fill="#e5e2e1"/>
                            <Text
                                className="text-[10px] uppercase tracking-widest font-medium mt-1 text-[#e5e2e1]">Chat</Text>
                        </Pressable>
                        <Link href="/official-documents" asChild>
                            <Pressable className="items-center justify-center p-3 scale-90 active:scale-100 opacity-50">
                                <Gavel size={24} color="#c4c7c7"/>
                                <Text
                                    className="text-[10px] uppercase tracking-widest font-medium mt-1 text-[#c4c7c7]">Librería</Text>
                            </Pressable>
                        </Link>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
