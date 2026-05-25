package com.uade.tpejemplo.service.impl;

import com.uade.tpejemplo.dto.request.CreditoRequest;
import com.uade.tpejemplo.dto.response.CreditoResponse;
import com.uade.tpejemplo.dto.response.CuotaResponse;
import com.uade.tpejemplo.exception.ResourceNotFoundException;
import com.uade.tpejemplo.model.Cliente;
import com.uade.tpejemplo.model.Credito;
import com.uade.tpejemplo.model.Cuota;
import com.uade.tpejemplo.model.CuotaId;
import com.uade.tpejemplo.repository.ClienteRepository;
import com.uade.tpejemplo.repository.CobranzaRepository;
import com.uade.tpejemplo.repository.CreditoRepository;
import com.uade.tpejemplo.repository.CuotaRepository;
import com.uade.tpejemplo.service.CreditoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CreditoServiceImpl implements CreditoService {

    private final CreditoRepository creditoRepository;
    private final ClienteRepository clienteRepository;
    private final CuotaRepository cuotaRepository;
    private final CobranzaRepository cobranzaRepository;

    @Override
    @Transactional
    public CreditoResponse crear(CreditoRequest request) {
        Cliente cliente = clienteRepository.findByDni(request.getDniCliente())
            .orElseThrow(() -> new ResourceNotFoundException("Cliente", "DNI", request.getDniCliente()));

        Credito credito = new Credito(
            null,
            cliente,
            request.getDeudaOriginal(),
            request.getFecha(),
            request.getImporteCuota(),
            request.getCantidadCuotas(),
            null
        );
        creditoRepository.save(credito);

        // Generar cuotas automáticamente con vencimiento mensual
        List<Cuota> cuotas = new ArrayList<>();
        for (int i = 1; i <= request.getCantidadCuotas(); i++) {
            Cuota cuota = new Cuota(
                new CuotaId(credito.getId(), i),
                credito,
                request.getFecha().plusMonths(i)
            );
            cuotas.add(cuota);
        }
        cuotaRepository.saveAll(cuotas);

        return toResponse(credito, cuotas);
    }

    @Override
    public CreditoResponse buscarPorId(Long id) {
        Credito credito = creditoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Crédito", "id", id));
        List<Cuota> cuotas = cuotaRepository.findByIdIdCredito(id);
        return toResponse(credito, cuotas);
    }

    @Override
    @Transactional
    public CreditoResponse actualizar(Long id, CreditoRequest request) {
        Credito credito = creditoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Crédito", "id", id));

        Cliente cliente = clienteRepository.findByDni(request.getDniCliente())
            .orElseThrow(() -> new ResourceNotFoundException("Cliente", "DNI", request.getDniCliente()));

        // Actualizar datos básicos del crédito
        credito.setCliente(cliente);
        credito.setDeudaOriginal(request.getDeudaOriginal());
        credito.setFecha(request.getFecha());
        credito.setImporteCuota(request.getImporteCuota());

        // Si cambia la cantidad de cuotas, regeneramos las cuotas del crédito
        // (siempre que no haya cobranzas registradas, para no romper datos pagados)
        boolean cantidadCambio = !credito.getCantidadCuotas().equals(request.getCantidadCuotas());
        if (cantidadCambio) {
            boolean tieneCobranzas = !cobranzaRepository.findByCuotaIdIdCredito(id).isEmpty();
            if (tieneCobranzas) {
                throw new com.uade.tpejemplo.exception.BusinessException(
                    "No se puede cambiar la cantidad de cuotas porque el crédito ya tiene cobranzas registradas"
                );
            }
            // borrar cuotas viejas
            cuotaRepository.deleteAll(cuotaRepository.findByIdIdCredito(id));
            credito.setCantidadCuotas(request.getCantidadCuotas());
        } else {
            // si no cambió la cantidad, igual actualizamos fechas según la nueva fecha base
            cuotaRepository.deleteAll(cuotaRepository.findByIdIdCredito(id));
        }

        creditoRepository.save(credito);

        // regenerar cuotas
        List<Cuota> cuotas = new ArrayList<>();
        for (int i = 1; i <= credito.getCantidadCuotas(); i++) {
            cuotas.add(new Cuota(
                new CuotaId(credito.getId(), i),
                credito,
                request.getFecha().plusMonths(i)
            ));
        }
        cuotaRepository.saveAll(cuotas);

        return toResponse(credito, cuotas);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Credito credito = creditoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Crédito", "id", id));

        // No permitir borrar si hay cobranzas asociadas
        if (!cobranzaRepository.findByCuotaIdIdCredito(id).isEmpty()) {
            throw new com.uade.tpejemplo.exception.BusinessException(
                "No se puede eliminar el crédito porque tiene cobranzas registradas"
            );
        }

        // Borrar primero las cuotas (FK)
        cuotaRepository.deleteAll(cuotaRepository.findByIdIdCredito(id));
        creditoRepository.delete(credito);
    }

    @Override
    public List<CreditoResponse> listarPorCliente(String dniCliente) {
        if (!clienteRepository.existsByDni(dniCliente)) {
            throw new ResourceNotFoundException("Cliente", "DNI", dniCliente);
        }
        return creditoRepository.findByClienteDni(dniCliente).stream()
            .map(c -> toResponse(c, cuotaRepository.findByIdIdCredito(c.getId())))
            .toList();
    }

    private CreditoResponse toResponse(Credito credito, List<Cuota> cuotas) {
        List<CuotaResponse> cuotasResponse = cuotas.stream()
            .map(c -> new CuotaResponse(
                c.getId().getIdCredito(),
                c.getId().getIdCuota(),
                c.getFechaVencimiento(),
                cobranzaRepository.existsByCuotaIdIdCreditoAndCuotaIdIdCuota(
                    c.getId().getIdCredito(), c.getId().getIdCuota()
                )
            ))
            .toList();

        return new CreditoResponse(
            credito.getId(),
            credito.getCliente().getDni(),
            credito.getCliente().getNombre(),
            credito.getDeudaOriginal(),
            credito.getFecha(),
            credito.getImporteCuota(),
            credito.getCantidadCuotas(),
            cuotasResponse
        );
    }
}
