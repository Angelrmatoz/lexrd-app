package com.lexrd.backend.service;

import org.springframework.ai.transformer.splitter.TextSplitter;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * A {@link TextSplitter} implementation that splits text from legal documents
 * based on Dominican law structure (e.g., "Libro", "Título", "Capítulo", "Artículo").
 */
public class StructuralLawSplitter extends TextSplitter {

    private static final Pattern HEADING_PATTERN = Pattern.compile(
            "^(LIBRO|T[ÍI]TULO|CAP[ÍI]TULO|SECCI[ÓO]N|SUBSECCI[ÓO]N|P[ÁA]RRAFO|ART[ÍI]CULO|ART\\.)\\s+.*",
            Pattern.CASE_INSENSITIVE | Pattern.MULTILINE);

    @Override
    protected List<String> splitText(String text) {
        List<String> chunks = new ArrayList<>();
        Matcher matcher = HEADING_PATTERN.matcher(text);

        int lastEnd = 0;
        String lastChunk = null;

        while (matcher.find()) {
            if (lastChunk != null) {
                String chunkContent = text.substring(lastEnd, matcher.start()).trim();
                if (!chunkContent.isEmpty()) {
                    chunks.add(lastChunk + "\n" + chunkContent);
                }
            }
            lastChunk = matcher.group().trim();
            lastEnd = matcher.end();
        }

        if (lastChunk != null) {
            String remainingContent = text.substring(lastEnd).trim();
            chunks.add(lastChunk + "\n" + remainingContent);
        }

        if (chunks.isEmpty() && !text.trim().isEmpty()) {
            chunks.add(text);
        }

        return chunks;
    }
}
