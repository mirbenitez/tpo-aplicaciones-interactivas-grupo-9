package com.uade.tpejemplo.service;

import com.uade.tpejemplo.dto.request.CreditoRequest;
import com.uade.tpejemplo.dto.response.CreditoResponse;

import java.util.List;

public interface CreditoService {

    CreditoResponse crear(CreditoRequest request);

    CreditoResponse actualizar(Long id, CreditoRequest request);

    CreditoResponse buscarPorId(Long id);

    List<CreditoResponse> listarPorCliente(String dniCliente);

    void eliminar(Long id);
}
