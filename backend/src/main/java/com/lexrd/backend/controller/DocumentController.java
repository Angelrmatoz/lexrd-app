package com.lexrd.backend.controller;

import com.lexrd.backend.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    public ResponseEntity<List<String>> listDocuments() {
        try {
            return ResponseEntity.ok(documentService.getAvailableDocuments());
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
