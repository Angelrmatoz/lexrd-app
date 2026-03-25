package com.lexrd.backend.service;

import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    /**
     * Scans the knowledge-base classpath and returns a list of PDF filenames.
     */
    public List<String> getAvailableDocuments() throws IOException {
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources("classpath:knowledge-base/**/*.pdf");

        return Arrays.stream(resources)
                .map(Resource::getFilename)
                .collect(Collectors.toList());
    }
}
