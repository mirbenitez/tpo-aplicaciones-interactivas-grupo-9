package com.uade.tpejemplo.service;

import com.uade.tpejemplo.dto.request.TagRequest;
import com.uade.tpejemplo.dto.response.TagResponse;

import java.util.List;

public interface TagService {
    TagResponse crear(TagRequest request);
    TagResponse actualizar(Long id, TagRequest request);
    TagResponse buscarPorId(Long id);
    List<TagResponse> listar();
    void eliminar(Long id);
    void asignarACliente(String dniCliente, Long idEtiqueta);
    void desasignarDeCliente(String dniCliente, Long idEtiqueta);
}