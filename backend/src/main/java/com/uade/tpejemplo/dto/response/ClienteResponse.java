package com.uade.tpejemplo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import com.uade.tpejemplo.dto.response.TagResponse;

@Data
@AllArgsConstructor
public class ClienteResponse {
    private String dni;
    private String nombre;
    private java.util.List<TagResponse> etiquetas;
}
