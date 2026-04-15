import React from "react";
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Paperclip, ArrowUp, MessageSquare, Gavel, FileText } from "lucide-react-native";

export default function Native() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* TopAppBar */}
      <View style={styles.header}>
        <View style={styles.flexRow}>
          <Text style={[styles.headerText, { color: "#e5e2e1" }]}>Lex</Text>
          <Text style={[styles.headerText, { color: "#EF3340" }]}>R</Text>
          <Text style={[styles.headerText, { color: "#002D62" }]}>D</Text>
        </View>
        <Pressable style={styles.plusButton}>
          <Plus size={24} color="#c6c6c7" />
        </Pressable>
      </View>

      {/* Main Chat Canvas */}
      <ScrollView 
        style={styles.flex1}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 32 }}>
          {/* User Message */}
          <View style={styles.userMessageContainer}>
            <View style={styles.userBubble}>
              <Text style={styles.messageText}>
                ¿Cuáles son los requisitos para la deducción de gastos educativos en el impuesto sobre la renta?
              </Text>
            </View>
            <Text style={styles.sentLabel}>Enviado • 10:42 AM</Text>
          </View>

          {/* AI Response */}
          <View style={styles.aiMessageContainer}>
            <View style={styles.aiHeader}>
              <View style={styles.aiAccent} />
              <Text style={styles.aiTitle}>Sovereign Intelligence</Text>
            </View>
            
            <View style={{ gap: 16 }}>
              <Text style={styles.aiText}>
                Para la deducción de gastos educativos en la República Dominicana, de acuerdo con la normativa vigente, se deben cumplir los siguientes criterios fundamentales:
              </Text>
              
              <View style={styles.listContainer}>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>01.</Text>
                  <Text style={styles.listText}>Estar registrado como contribuyente y estar al día con sus obligaciones fiscales.</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>02.</Text>
                  <Text style={styles.listText}>Los gastos deben corresponder a la educación propia o de dependientes directos no asalariados.</Text>
                </View>
                <View style={styles.listItem}>
                  <Text style={styles.listNumber}>03.</Text>
                  <Text style={styles.listText}>Contar con comprobantes fiscales válidos (NCF) emitidos por entidades educativas reconocidas.</Text>
                </View>
              </View>

              <Text style={styles.aiText}>
                El límite de la deducción es el 10% del ingreso gravado o el 25% del exento, lo que resulte menor.
              </Text>
            </View>

            {/* Citations */}
            <View style={styles.citationsContainer}>
              <View style={styles.citationBadge}>
                <FileText size={14} color="#abc7ff" />
                <Text style={styles.citationText}>Ley 179-09</Text>
              </View>
              <View style={styles.citationBadge}>
                <Gavel size={14} color="#abc7ff" />
                <Text style={styles.citationText}>Art. 42 Cód. Tributario</Text>
              </View>
            </View>
          </View>

          {/* User Message 2 */}
          <View style={styles.userMessageContainer}>
            <View style={styles.userBubble}>
              <Text style={styles.messageText}>
                ¿Cuál es la fecha límite para reportar estos gastos este año?
              </Text>
            </View>
          </View>

          {/* AI Response 2 (Generating State) */}
          <View style={styles.aiMessageContainer}>
            <View style={styles.aiHeader}>
              <View style={styles.aiAccent} />
              <Text style={styles.aiTitle}>Sovereign Intelligence</Text>
            </View>
            <View style={styles.loadingDots}>
              <View style={[styles.dot, { opacity: 0.3 }]} />
              <View style={[styles.dot, { opacity: 0.5 }]} />
              <View style={[styles.dot, { opacity: 0.7 }]} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Area */}
      <View style={styles.bottomArea}>
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <Pressable style={styles.iconButton}>
              <Paperclip size={20} color="#c4c7c7" />
            </Pressable>
            <TextInput 
              style={styles.textInput}
              placeholder="Consultar a la inteligencia..."
              placeholderTextColor="rgba(196, 199, 199, 0.4)"
            />
            <Pressable style={styles.sendButton}>
              <ArrowUp size={20} color="#2f3131" />
            </Pressable>
          </View>
        </View>

        {/* BottomNavBar */}
        <View style={styles.navBar}>
          <Pressable style={styles.navItemActive}>
            <MessageSquare size={24} color="#e5e2e1" fill="#e5e2e1" />
            <Text style={styles.navTextActive}>Chat</Text>
          </Pressable>
          <Pressable style={[styles.navItem, { opacity: 0.5 }]}>
            <Gavel size={24} color="#c4c7c7" />
            <Text style={styles.navText}>Librería</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#131313" },
  header: {
    backgroundColor: "rgba(19, 19, 19, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(68, 71, 72, 0.1)",
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  flexRow: { flexDirection: "row", alignItems: "center" },
  headerText: { fontSize: 20, fontWeight: "900", letterSpacing: -1, textTransform: "uppercase" },
  plusButton: { backgroundColor: "#2a2a2a", padding: 8, borderRadius: 12 },
  flex1: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 24 },
  userMessageContainer: { alignItems: "flex-end", width: "100%" },
  userBubble: { backgroundColor: "#353534", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, maxWidth: "85%" },
  messageText: { color: "#e5e2e1", fontSize: 15, lineHeight: 22 },
  sentLabel: { fontSize: 10, color: "rgba(196, 199, 199, 0.5)", marginTop: 8, letterSpacing: 1, textTransform: "uppercase", paddingHorizontal: 4 },
  aiMessageContainer: { width: "100%" },
  aiHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 8 },
  aiAccent: { width: 6, height: 24, backgroundColor: "#EF3340", borderRadius: 10 },
  aiTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 2, color: "#c4c7c7", textTransform: "uppercase" },
  aiText: { color: "#e5e2e1", fontSize: 16, lineHeight: 26 },
  listContainer: { paddingLeft: 4, gap: 12 },
  listItem: { flexDirection: "row", gap: 12 },
  listNumber: { color: "#abc7ff", fontWeight: "bold" },
  listText: { color: "#e5e2e1", flex: 1, lineHeight: 24 },
  citationsContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 24, gap: 8 },
  citationBadge: { backgroundColor: "#0e0e0e", borderWidth: 1, borderColor: "rgba(68, 71, 72, 0.15)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 8 },
  citationText: { fontSize: 11, fontWeight: "500", color: "#abc7ff" },
  loadingDots: { flexDirection: "row", paddingVertical: 8, gap: 6 },
  dot: { width: 6, height: 6, backgroundColor: "#c6c6c7", borderRadius: 3 },
  bottomArea: { backgroundColor: "#131313", paddingBottom: 16 },
  inputWrapper: { paddingHorizontal: 20, marginBottom: 16 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#0e0e0e", borderRadius: 99, borderWidth: 1, borderColor: "rgba(68, 71, 72, 0.1)", padding: 8 },
  iconButton: { padding: 8 },
  textInput: { flex: 1, color: "#e5e2e1", paddingHorizontal: 8, fontSize: 15 },
  sendButton: { backgroundColor: "#c6c6c7", width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  navBar: { backgroundColor: "#131313", borderTopWidth: 1, borderTopColor: "rgba(68, 71, 72, 0.1)", flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8, paddingBottom: 32, paddingTop: 8 },
  navItemActive: { alignItems: "center", justifyContent: "center", backgroundColor: "#353534", borderRadius: 12, padding: 12 },
  navItem: { alignItems: "center", justifyContent: "center", padding: 12 },
  navTextActive: { fontSize: 10, textTransform: "uppercase", letterSpacing: 1, fontWeight: "500", marginTop: 4, color: "#e5e2e1" },
  navText: { fontSize: 10, textTransform: "uppercase", letterSpacing: 1, fontWeight: "500", marginTop: 4, color: "#c4c7c7" },
});
