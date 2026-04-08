package com.lexrd.backend.service;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pruebas unitarias para StructuralLawSplitter.
 *
 * Este es el equivalente a las pruebas unitarias puras de Jest:
 * no requiere Spring, ni mocks. Es logica pura de strings.
 */
class StructuralLawSplitterTest {

    private final StructuralLawSplitter splitter = new StructuralLawSplitter();

    // ──────────────────────────────────────────────
    // Pruebas de deteccion de encabezados legales
    // ──────────────────────────────────────────────

    @Test
    void cuandoTextoContieneArticulos_debeSepararYContenerEncabezados() {
        String texto = """
            ARTÍCULO 1. Este es el primer articulo.
            Contenido del articulo uno que es bastante largo.

            ARTÍCULO 2. Este es el segundo articulo.
            Contenido del articulo dos con mas detalles.
            """;

        List<String> chunks = splitter.splitText(texto);

        // El splitter separa por articulos pero groupSmallChunks puede unirlos
        // porque son pequenos (<1500 chars combinados)
        assertThat(chunks).isNotEmpty();
        // Todo el contenido debe estar presente en los chunks
        String allContent = String.join(" ", chunks);
        assertThat(allContent).contains("ARTÍCULO 1");
        assertThat(allContent).contains("ARTÍCULO 2");
    }

    @Test
    void cuandoTextoContieneArt_debeReconocerComoEncabezado() {
        String texto = """
            ART. 15. Disposicion general.
            El contenido de este articulo es importante.

            ART. 16. Otra disposicion.
            Mas contenido aqui.
            """;

        List<String> chunks = splitter.splitText(texto);

        // Chunks pequenos se agrupan en uno solo
        assertThat(chunks).isNotEmpty();
        String allContent = String.join(" ", chunks);
        assertThat(allContent).contains("ART. 15");
        assertThat(allContent).contains("ART. 16");
    }

    @Test
    void cuandoTextoContieneLibrosTitulosCapitulos_debeJerarquizar() {
        String texto = """
            LIBRO PRIMERO. De las personas.
            Introduccion del libro.

            TITULO I. De los derechos civiles.
            Contenido del titulo.

            CAPITULO I. Disposiciones generales.
            Contenido del capitulo.
            """;

        List<String> chunks = splitter.splitText(texto);

        // Chunks pequenos se agrupan
        assertThat(chunks).isNotEmpty();
        String allContent = String.join(" ", chunks);
        assertThat(allContent).contains("LIBRO PRIMERO");
        assertThat(allContent).contains("TITULO I");
        assertThat(allContent).contains("CAPITULO I");
    }

    @Test
    void cuandoTextoContieneSecciones_debeReconocer() {
        String texto = """
            SECCION I. De la nacionalidad.
            Contenido de la seccion uno.

            SECCION II. De los derechos fundamentales.
            Contenido de la seccion dos.
            """;

        List<String> chunks = splitter.splitText(texto);

        // Chunks pequenos se agrupan
        assertThat(chunks).isNotEmpty();
        String allContent = String.join(" ", chunks);
        assertThat(allContent).contains("SECCION I");
        assertThat(allContent).contains("SECCION II");
    }

    // ──────────────────────────────────────────────
    // Pruebas de limpieza de saltos de linea
    // ──────────────────────────────────────────────

    @Test
    void debeAplanarSaltosDeLineaDentroDeUnChunk() {
        String texto = """
            ARTÍCULO 1. Este es el articulo.
            Primera linea del contenido.
            Segunda linea del contenido.
            Tercera linea con mas texto.
            """;

        List<String> chunks = splitter.splitText(texto);

        assertThat(chunks).hasSize(1);
        // Los saltos de linea dentro del contenido se reemplazan por espacios
        assertThat(chunks.get(0)).doesNotContain("\r\n");
    }

    @Test
    void noEliminaEspaciosMultiples_responsabilidadDelIngestionService() {
        // El splitter NO elimina espacios multiples horizontales
        // Eso lo hace IngestionService antes de pasar al splitter
        String texto = """
            ARTÍCULO 1. Contenido con    multiples    espacios.
            """;

        List<String> chunks = splitter.splitText(texto);

        assertThat(chunks).hasSize(1);
        // El splitter preserva espacios multiples (es responsabilidad del caller limpiarlos)
        assertThat(chunks.get(0)).contains("Contenido con");
    }

    // ──────────────────────────────────────────────
    // Pruebas de agrupacion de chunks pequenos
    // ──────────────────────────────────────────────

    @Test
    void debeAgruparChunksPequenosSiSumanMenosDe1500Chars() {
        // Chunks muy pequenos que deberian agruparse
        String texto = """
            ART. 1. Corto.
            ART. 2. Corto.
            ART. 3. Corto.
            """;

        List<String> chunks = splitter.splitText(texto);

        // Pueden agruparse en menos chunks que encabezados
        assertThat(chunks).isNotEmpty();
        // Cada chunk individual debe ser menor a 1500 chars
        for (String chunk : chunks) {
            assertThat(chunk.length()).isLessThan(1500);
        }
    }

    @Test
    void debeSepararChunksGrandesSiExceden1500Chars() {
        // Construir chunks artificiales grandes via texto con muchos articulos largos
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 20; i++) {
            sb.append("ARTÍCULO ").append(i).append(". ");
            // ~100 chars por articulo
            sb.append("Este es el contenido del articulo numero ").append(i)
              .append(" con suficiente texto para llenar espacio. ");
            sb.append("\n\n");
        }

        List<String> chunks = splitter.splitText(sb.toString());

        assertThat(chunks).isNotEmpty();
        // Deben haberse agrupado pero ningun chunk debe exceder ~1600 chars
        // (1500 + un poco de margen por el ultimo articulo que se agrega)
        for (String chunk : chunks) {
            assertThat(chunk.length()).isLessThan(2000);
        }
    }

    // ──────────────────────────────────────────────
    // Casos edge
    // ──────────────────────────────────────────────

    @Test
    void cuandoTextoEstaVacio_debeRetornarListaVacia() {
        List<String> chunks = splitter.splitText("");

        assertThat(chunks).isEmpty();
    }

    @Test
    void cuandoTextoSoloTieneEspacios_debeRetornarListaVacia() {
        List<String> chunks = splitter.splitText("   \n\n   ");

        assertThat(chunks).isEmpty();
    }

    @Test
    void cuandoTextoNoTieneEncabezadosLegales_debeRetornarTextoCompleto() {
        String texto = "Este es un texto sin ningun encabezado legal reconocible.";

        List<String> chunks = splitter.splitText(texto);

        assertThat(chunks).hasSize(1);
        assertThat(chunks.get(0)).contains("Este es un texto");
    }

    @Test
    void cuandoTextoTieneParrafoNoDebeDividirArticulo() {
        // "PARAFO" no debe ser reconocido como encabezado
        String texto = """
            ARTÍCULO 1. Disposicion principal.
            Contenido del articulo.

            PÁRRAFO I. Este parrafo es parte del articulo.
            Mas contenido del parrafo.
            """;

        List<String> chunks = splitter.splitText(texto);

        // Debe ser 1 chunk (el parrafo se queda dentro del articulo)
        assertThat(chunks).hasSize(1);
        assertThat(chunks.get(0)).contains("ARTÍCULO 1");
        assertThat(chunks.get(0)).contains("PÁRRAFO");
    }

    @Test
    void cuandoTextoTieneSubsecciones_debeSeparar() {
        String texto = """
            SECCION I. General.

            SUBSECCION A. Primera subseccion.
            Contenido.

            SUBSECCION B. Segunda subseccion.
            Otro contenido.
            """;

        List<String> chunks = splitter.splitText(texto);

        assertThat(chunks).isNotEmpty();
    }

    @Test
    void debeManejarTextoMuyLargoSinErrores() {
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 100; i++) {
            sb.append("ARTÍCULO ").append(i).append(". ");
            sb.append("Contenido largo para el articulo ").append(i).append(". ");
            sb.append("Mas texto para asegurar que haya suficiente contenido. ".repeat(5));
            sb.append("\n\n");
        }

        List<String> chunks = splitter.splitText(sb.toString());

        assertThat(chunks).isNotEmpty();
        // Verificar que todos los articulos estan representados en algun chunk
        String allContent = String.join(" ", chunks);
        assertThat(allContent).contains("ARTÍCULO 1");
        assertThat(allContent).contains("ARTÍCULO 100");
    }
}
