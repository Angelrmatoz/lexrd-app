import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, MessageSquare, Gavel, BookOpen } from "lucide-react-native";
import { Link, router } from "expo-router";
import { LEGAL_CATEGORIES } from "@/constants/categories";
import { useChatStore } from "../store/useChatStore";

export default function OfficialDocuments() {
  const { clearMessages } = useChatStore();

  const handleNewChat = () => {
    clearMessages();
    router.push("/");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#131313]">
      <StatusBar style="light" />

      {/* TopAppBar */}
      <View className="bg-[#131313] border-b border-[#4447481a] px-6 py-4 flex-row justify-between items-center z-50">
        <View className="flex-row items-center">
          <View className="flex-row">
            <Text className="text-xl font-black tracking-tighter uppercase text-[#e5e2e1]">Lex</Text>
            <Text className="text-xl font-black tracking-tighter uppercase text-[#EF3340]">R</Text>
            <Text className="text-xl font-black tracking-tighter uppercase text-[#002D62]">D</Text>
          </View>
        </View>
        <Pressable onPress={handleNewChat} className="bg-[#2a2a2a] p-2 rounded-xl active:opacity-80">
          <Plus size={24} color="#c6c6c7" />
        </Pressable>
      </View>

      {/* Main Content */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="space-y-8 gap-y-8">
          {/* Header */}
          <View className="items-center">
            <View className="flex-row items-center bg-[#2a2a2a] px-3 py-1 rounded-full mb-4">
              <BookOpen size={12} color="#abc7ff" />
              <Text className="text-[#abc7ff] text-[10px] font-bold uppercase tracking-widest ml-2">
                Knowledge Base
              </Text>
            </View>
            <Text className="text-3xl font-black tracking-tighter uppercase text-center text-[#e5e2e1] mb-2">
              Biblioteca <Text className="text-[#EF3340]">Digital</Text>
            </Text>
            <Text className="text-3xl font-black tracking-tighter uppercase text-center text-[#002D62] mb-4">
              de Jurisprudencia
            </Text>
            <Text className="text-[#c4c7c7] text-sm text-center leading-relaxed font-light">
              LexRD es un sistema de inteligencia soberana diseñado para democratizar el acceso
              al conocimiento legal dominicano.
            </Text>
          </View>

          {/* Categories Grid */}
          <View className="gap-y-6">
            {LEGAL_CATEGORIES.map((category, idx) => (
              <View
                key={idx}
                className="bg-[#1a1a1a] border border-[#4447481a] p-6 rounded-2xl"
              >
                <View className="w-12 h-12 rounded-xl bg-[#2a2a2a] items-center justify-center mb-4">
                  {category.icon}
                </View>
                <Text className="text-xl font-bold tracking-tight text-[#e5e2e1] mb-1">
                  {category.title}
                </Text>
                <Text className="text-sm text-[#c4c7c7] font-medium mb-4 opacity-70">
                  {category.description}
                </Text>
                <View className="gap-y-2">
                  {category.documents.map((doc, dIdx) => (
                    <View key={dIdx} className="flex-row items-center gap-x-2">
                      <View className="w-1 h-1 rounded-full bg-[#EF3340]" />
                      <Text className="text-xs font-semibold text-[#e5e2e1] opacity-80 flex-1">
                        {doc}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>

          {/* Disclaimer */}
          <View className="bg-[#2a2a2a] border border-[#4447481a] p-6 rounded-2xl mt-4">
            <Text className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-[#c4c7c7]">
              Nota sobre la fuente
            </Text>
            <Text className="text-sm text-[#c4c7c7] leading-relaxed opacity-80">
              Todos los documentos integrados en el cerebro de LexRD son versiones oficiales
              obtenidas de repositorios gubernamentales y legislativos de la República Dominicana.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Area */}
      <View className="bg-[#131313] pb-4">
        {/* BottomNavBar */}
        <View className="bg-[#131313] border-t border-[#44474826] flex-row justify-around items-center px-4 pb-8 pt-2">
          <Link href="/" asChild>
            <Pressable className="items-center justify-center p-3 scale-90 active:scale-100 opacity-50">
              <MessageSquare size={24} color="#c4c7c7" />
              <Text className="text-[10px] uppercase tracking-widest font-medium mt-1 text-[#c4c7c7]">
                Chat
              </Text>
            </Pressable>
          </Link>
          <Pressable className="items-center justify-center bg-[#353534] rounded-xl p-3 scale-90 active:scale-100">
            <Gavel size={24} color="#e5e2e1" fill="#e5e2e1" />
            <Text className="text-[10px] uppercase tracking-widest font-medium mt-1 text-[#e5e2e1]">
              Librería
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
