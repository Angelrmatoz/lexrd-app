# ──────────────────────────────────────────────────────────────
# Dockerfile — LexRD Backend (Spring Boot)
# Multi-stage: build con Maven, runtime con JRE mínimo
# ──────────────────────────────────────────────────────────────

# ── STAGE 1: Build ───────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

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
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

# Copiar solo el JAR compilado del stage anterior
COPY --from=builder /app/target/*.jar app.jar

# Exponer el puerto del servidor
EXPOSE 4000

# Arrancar con perfil de producción
ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
