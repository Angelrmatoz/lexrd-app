package com.lexrd.backend.controller;

import com.lexrd.backend.service.IngestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/ingest")
@RequiredArgsConstructor
public class IngestionController {

    private final IngestionService ingestionService;

    @PostMapping("/pdf")
    public ResponseEntity<String> uploadPdf(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty.");
        }

        try {
            ingestionService.ingestPdfAsync(file);
            return ResponseEntity.accepted().body("Processing document in the background...");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error starting ingestion: " + e.getMessage());
        }
    }
}
