import React from "react";
import { View, Text, ScrollView, TextInput, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Paperclip, ArrowUp, MessageSquare, Gavel, FileText } from "lucide-react-native";

export default function Native() {
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
        <Pressable className="bg-[#2a2a2a] p-2 rounded-xl active:opacity-80">
          <Plus size={24} color="#c6c6c7" />
        </Pressable>
      </View>

      {/* Main Chat Canvas */}
      <ScrollView 
        className="flex-1 px-5"
        contentContainerStyle={{ paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-y-8">
          {/* User Message */}
          <View className="items-end w-full">
            <View className="bg-[#353534] px-4 py-3 rounded-xl max-w-[85%]">
              <Text className="text-[#e5e2e1] text-[15px] leading-relaxed">
                ¿Cuáles son los requisitos para la deducción de gastos educativos en el impuesto sobre la renta?
              </Text>
            </View>
            <Text className="text-[10px] text-[#c4c7c780] mt-2 tracking-widest uppercase px-1">
              Enviado • 10:42 AM
            </Text>
          </View>

          {/* AI Response */}
          <View className="w-full">
            <View className="flex-row items-center mb-4 gap-x-2">
              <View className="w-1.5 h-6 bg-[#EF3340] rounded-full" />
              <Text className="text-[11px] font-bold tracking-[0.2em] text-[#c4c7c7] uppercase">
                Sovereign Intelligence
              </Text>
            </View>
            
            <View className="gap-y-4">
              <Text className="text-[#e5e2e1] text-[16px] leading-[1.6]">
                Para la deducción de gastos educativos en la República Dominicana, de acuerdo con la normativa vigente, se deben cumplir los siguientes criterios fundamentales:
              </Text>
              
              <View className="pl-1 gap-y-3">
                <View className="flex-row gap-x-3">
                  <Text className="text-[#abc7ff] font-bold">01.</Text>
                  <Text className="text-[#e5e2e1] flex-1">Estar registrado como contribuyente y estar al día con sus obligaciones fiscales.</Text>
                </View>
                <View className="flex-row gap-x-3">
                  <Text className="text-[#abc7ff] font-bold">02.</Text>
                  <Text className="text-[#e5e2e1] flex-1">Los gastos deben corresponder a la educación propia o de dependientes directos no asalariados.</Text>
                </View>
                <View className="flex-row gap-x-3">
                  <Text className="text-[#abc7ff] font-bold">03.</Text>
                  <Text className="text-[#e5e2e1] flex-1">Contar con comprobantes fiscales válidos (NCF) emitidos por entidades educativas reconocidas.</Text>
                </View>
              </View>

              <Text className="text-[#e5e2e1] text-[16px] leading-[1.6]">
                El límite de la deducción es el 10% del ingreso gravado o el 25% del exento, lo que resulte menor.
              </Text>
            </View>

            {/* Citations */}
            <View className="flex-row flex-wrap mt-6 gap-2">
              <View className="bg-[#0e0e0e] border border-[#44474826] px-3 py-2 rounded-lg flex-row items-center gap-x-2">
                <FileText size={14} color="#abc7ff" />
                <Text className="text-[11px] font-medium text-[#abc7ff] tracking-tight">Ley 179-09</Text>
              </View>
              <View className="bg-[#0e0e0e] border border-[#44474826] px-3 py-2 rounded-lg flex-row items-center gap-x-2">
                <Gavel size={14} color="#abc7ff" />
                <Text className="text-[11px] font-medium text-[#abc7ff] tracking-tight">Art. 42 Cód. Tributario</Text>
              </View>
            </View>
          </View>

          {/* User Message 2 */}
          <View className="items-end w-full">
            <View className="bg-[#353534] px-4 py-3 rounded-xl max-w-[85%]">
              <Text className="text-[#e5e2e1] text-[15px] leading-relaxed">
                ¿Cuál es la fecha límite para reportar estos gastos este año?
              </Text>
            </View>
          </View>

          {/* AI Response 2 (Generating State) */}
          <View className="w-full">
            <View className="flex-row items-center mb-4 gap-x-2">
              <View className="w-1.5 h-6 bg-[#EF3340] rounded-full" />
              <Text className="text-[11px] font-bold tracking-[0.2em] text-[#c4c7c7] uppercase">
                Sovereign Intelligence
              </Text>
            </View>
            <View className="flex-row py-2 gap-x-1.5">
              <View className="w-1.5 h-1.5 bg-[#c6c6c74d] rounded-full" />
              <View className="w-1.5 h-1.5 bg-[#c6c6c780] rounded-full" />
              <View className="w-1.5 h-1.5 bg-[#c6c6c7b3] rounded-full" />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Area */}
      <View className="bg-[#131313] pb-4">
        {/* Floating Input */}
        <View className="px-5 mb-4">
          <View className="flex-row items-center bg-[#0e0e0e] rounded-full border border-[#4447481a] px-2 py-2">
            <TextInput 
              className="flex-1 text-[#e5e2e1] px-2 text-[15px]"
              placeholder="Consultar a la inteligencia..."
              placeholderTextColor="#c4c7c766"
            />
            <Pressable className="bg-[#c6c6c7] w-10 h-10 rounded-full items-center justify-center active:scale-95">
              <ArrowUp size={20} color="#2f3131" />
            </Pressable>
          </View>
        </View>

        {/* BottomNavBar */}
        <View className="bg-[#131313] border-t border-[#44474826] flex-row justify-around items-center px-4 pb-8 pt-2">
          <Pressable className="items-center justify-center bg-[#353534] rounded-xl p-3 scale-90 active:scale-100">
            <MessageSquare size={24} color="#e5e2e1" fill="#e5e2e1" />
            <Text className="text-[10px] uppercase tracking-widest font-medium mt-1 text-[#e5e2e1]">Chat</Text>
          </Pressable>
          <Pressable className="items-center justify-center p-3 scale-90 active:scale-100 opacity-50">
            <Gavel size={24} color="#c4c7c7" />
            <Text className="text-[10px] uppercase tracking-widest font-medium mt-1 text-[#c4c7c7]">Librería</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
