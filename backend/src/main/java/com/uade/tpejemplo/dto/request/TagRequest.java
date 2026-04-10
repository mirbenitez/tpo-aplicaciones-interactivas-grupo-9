package com.uade.tpejemplo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TagRequest {
    @NotBlank(message = "El nombre de la etiqueta es obligatorio")
    private String nombre;
}