package com.uade.tpejemplo.controller;

import com.uade.tpejemplo.dto.request.TagRequest;
import com.uade.tpejemplo.dto.response.TagResponse;
import com.uade.tpejemplo.service.TagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/etiquetas")
@RequiredArgsConstructor
public class TagController {
    private final TagService tagService;
    @PostMapping
    public ResponseEntity<TagResponse> crear(@Valid @RequestBody TagRequest request) {
        TagResponse response = tagService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @PutMapping("/{id}")
    public ResponseEntity<TagResponse> actualizar(@PathVariable Long id, @Valid @RequestBody TagRequest request) {
        TagResponse response = tagService.actualizar(id, request);
        return ResponseEntity.ok(response);
    }
    @GetMapping
    public ResponseEntity<List<TagResponse>> listar() {
        return ResponseEntity.ok(tagService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TagResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(tagService.buscarPorId(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        tagService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}