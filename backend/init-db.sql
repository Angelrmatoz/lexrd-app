-- Este script se ejecuta automáticamente la primera vez que
-- el contenedor de PostgreSQL arranca (docker-entrypoint-initdb.d).
-- Habilita la extensión pgvector para búsqueda vectorial semántica.

CREATE EXTENSION IF NOT EXISTS vector;
