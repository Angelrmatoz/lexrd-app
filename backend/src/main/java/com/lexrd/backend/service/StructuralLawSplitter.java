package com.lexrd.backend.service;

import org.springframework.ai.transformer.splitter.TextSplitter;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class StructuralLawSplitter extends TextSplitter {

    // Regex actualizado: Excluimos "PÁRRAFO" para no dividir artículos a la mitad.
    private static final Pattern HEADING_PATTERN = Pattern.compile(
            "^(LIBRO|T[ÍI]TULO|CAP[ÍI]TULO|SECCI[ÓO]N|SUBSECCI[ÓO]N|ART[ÍI]CULO|ART\\\\.)\\s+.*",
            Pattern.CASE_INSENSITIVE | Pattern.MULTILINE);

    @Override
    protected List<String> splitText(String text) {
        List<String> chunks = new ArrayList<>();
        Matcher matcher = HEADING_PATTERN.matcher(text);

        int lastEnd = 0;
        String lastChunkHeading = "";

        while (matcher.find()) {
            String currentChunkHeading = matcher.group().trim();
            String chunkContent = text.substring(lastEnd, matcher.start()).trim();

            if (!chunkContent.isEmpty()) {
                chunks.add(lastChunkHeading + "\n" + chunkContent);
            }
            
            lastChunkHeading = currentChunkHeading;
            lastEnd = matcher.end();
        }

        if (lastEnd < text.length()) {
            String remainingContent = text.substring(lastEnd).trim();
            if (!remainingContent.isEmpty()) {
                chunks.add(lastChunkHeading + "\n" + remainingContent);
            }
        }

        if (chunks.isEmpty() && !text.trim().isEmpty()) {
            chunks.add(text);
        }

        return groupSmallChunks(chunks);
    }

    // Une chunks pequeños para preservar contexto semántico en pgvector
    private List<String> groupSmallChunks(List<String> chunks) {
        List<String> groupedChunks = new ArrayList<>();
        StringBuilder currentGroup = new StringBuilder();

        for (String chunk : chunks) {
            if (currentGroup.length() + chunk.length() < 1500) { 
                currentGroup.append("\n\n").append(chunk);
            } else {
                if (currentGroup.length() > 0) {
                    groupedChunks.add(currentGroup.toString().trim());
                }
                currentGroup = new StringBuilder(chunk);
            }
        }
        
        if (currentGroup.length() > 0) {
            groupedChunks.add(currentGroup.toString().trim());
        }
        
        return groupedChunks;
    }
}
