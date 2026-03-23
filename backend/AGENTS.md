# Backend - Agents Documentation

This directory contains the Spring Boot backend service for the Lexrd project.

## Tech Stack
- **Framework**: Spring Boot.
- **Build System**: Maven (`mvnw` wrapper).
- **Language**: Java 17+ (assumed).
- **Architecture**: Domain-driven/Package-by-feature.

## Project Structure
- `src/main/java/com/lexrd/backend/`: Application source code.
- `src/test/java/com/lexrd/backend/`: Unit and integration tests.
- `src/main/resources/`: Configuration files and static assets.

## Commands
- **Build**: `./mvnw clean install` (Linux) or `.\mvnw.cmd clean install` (Windows).
- **Run**: `./mvnw spring-boot:run` or `.\mvnw.cmd spring-boot:run`.
- **Test**: `./mvnw test` or `.\mvnw.cmd test`.

## Conventions
- **Naming**: PascalCase for Classes and Interfaces, camelCase for methods and variables.
- **Packages**: Use reverse domain name notation (`com.lexrd.backend`).
- **REST APIs**: Use standard HTTP methods and pluralized nouns for resources.

## Developer Notes
- Monitor `application.properties` for port settings and external service configurations.
- Ensure the backend service is running before testing the frontend's API interactions.
