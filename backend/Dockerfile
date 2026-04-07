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
    apt-get install -y --no-install-recommends libstdc++6 libgomp1 wget unzip && \
    rm -rf /var/lib/apt/lists/*

# Copiar solo el JAR compilado del stage anterior
COPY --from=builder /app/target/*.jar app.jar

# Exponer el puerto del servidor
EXPOSE 4000

# Habilitar acceso nativo para ONNX Runtime
ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:prod}", \
  "--enable-native-access=ALL-UNNAMED", \
  "-jar", "app.jar"]

# ──────────────────────────────────────────────────────────────
# STAGE 3: Development (con hot reload)
# ──────────────────────────────────────────────────────────────
FROM eclipse-temurin:25-jdk AS dev

WORKDIR /app

# Instalar libstdc++ para ONNX Runtime y libgomp para PyTorch
RUN apt-get update && \
    apt-get install -y --no-install-recommends libstdc++6 libgomp1 wget unzip && \
    rm -rf /var/lib/apt/lists/*

# Copiar solo pom.xml y mvnw para descargar dependencias
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw mvnw

# Descargar dependencias (capa cacheada)
RUN ./mvnw dependency:go-offline -B

# Exponer el puerto y el puerto de DevTools
EXPOSE 4000 8080

# Ejecutar con Spring Boot DevTools (hot reload)
ENTRYPOINT ["./mvnw", "spring-boot:run", \
  "-Dspring-boot.run.profiles=${SPRING_PROFILES_ACTIVE:dev}", \
  "-Dspring-boot.run.jvmArguments=-Djava.security.egd=file:/dev/./urandom --enable-native-access=ALL-UNNAMED"]
