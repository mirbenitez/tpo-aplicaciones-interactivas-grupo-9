package com.uade.tpejemplo.controller;

import com.uade.tpejemplo.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clientes/{dni}/etiquetas")
@RequiredArgsConstructor
public class ClienteTagController {
    private final TagService tagService;
    @PostMapping("/{idEtiqueta}")
    public ResponseEntity<Void> asignar(@PathVariable String dni, @PathVariable Long idEtiqueta) {
        tagService.asignarACliente(dni, idEtiqueta);
        return ResponseEntity.noContent().build();
    }
    @DeleteMapping("/{idEtiqueta}")
    public ResponseEntity<Void> desasignar(@PathVariable String dni, @PathVariable Long idEtiqueta) {
        tagService.desasignarDeCliente(dni, idEtiqueta);
        return ResponseEntity.noContent().build();
    }
}