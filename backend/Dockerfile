# ──────────────────────────────────────────────────────────────
# Dockerfile — LexRD Backend (Spring Boot)
# Multi-stage: build con Maven, runtime con JRE mínimo
# ──────────────────────────────────────────────────────────────

# ── STAGE 1: Build ───────────────────────────────────────────
FROM eclipse-temurin:25-jdk AS builder

WORKDIR /app

# Copiar archivos de Maven primero (cache de dependencias)
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw mvnw

# Asegurar permisos de ejecución para el wrapper
RUN chmod +x mvnw

# Descargar dependencias en capa separada (cache inteligente)
RUN ./mvnw dependency:go-offline -B

# Copiar el código fuente y compilar
COPY src ./src
RUN ./mvnw package -DskipTests -B

# ── STAGE 2: Runtime ─────────────────────────────────────────
FROM eclipse-temurin:25-jre AS runtime

WORKDIR /app

# Instalar libstdc++ para ONNX Runtime y libgomp para PyTorch
RUN apt-get update && \
    apt-get install -y --no-install-recommends libstdc++6 libgomp1 wget unzip ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Descargar el modelo de Jina directamente en la imagen para evitar descargas en tiempo de ejecución
RUN mkdir -p /app/models/jina-embeddings-v2-base-es && \
    echo "Descargando modelo ONNX..." && \
    wget -qO /app/models/jina-embeddings-v2-base-es/model.onnx "https://huggingface.co/jinaai/jina-embeddings-v2-base-es/resolve/main/onnx/model.onnx" && \
    echo "Descargando tokenizer..." && \
    wget -qO /app/models/jina-embeddings-v2-base-es/tokenizer.json "https://huggingface.co/jinaai/jina-embeddings-v2-base-es/resolve/main/tokenizer.json"

# Copiar solo el JAR compilado del stage anterior
COPY --from=builder /app/target/*.jar app.jar

# Exponer el puerto del servidor
EXPOSE 4000

# Habilitar acceso nativo para ONNX Runtime (Java decide la memoria automáticamente)
ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:prod}", \
  "--enable-native-access=ALL-UNNAMED", \
  "-jar", "app.jar"]
