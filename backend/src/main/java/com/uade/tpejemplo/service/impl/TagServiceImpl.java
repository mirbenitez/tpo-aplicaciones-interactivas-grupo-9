package com.uade.tpejemplo.service.impl;

import com.uade.tpejemplo.dto.request.TagRequest;
import com.uade.tpejemplo.dto.response.TagResponse;
import com.uade.tpejemplo.exception.BusinessException;
import com.uade.tpejemplo.exception.ResourceNotFoundException;
import com.uade.tpejemplo.model.Cliente;
import com.uade.tpejemplo.model.Tag;
import com.uade.tpejemplo.repository.ClienteRepository;
import com.uade.tpejemplo.repository.TagRepository;
import com.uade.tpejemplo.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {
    private final TagRepository tagRepository;
    private final ClienteRepository clienteRepository;

    @Override
    public TagResponse crear(TagRequest request) {
        if (tagRepository.existsByNombre(request.getNombre())) {
            throw new BusinessException("Ya existe una etiqueta con nombre: " + request.getNombre());
        }
        Tag tag = new Tag();
        tag.setNombre(request.getNombre());
        tagRepository.save(tag);
        return new TagResponse(tag.getId(), tag.getNombre());
    }

    @Override
    public TagResponse actualizar(Long id, TagRequest request) {
        Tag tag = tagRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Etiqueta", "ID", id.toString()));

        if (tagRepository.existsByNombre(request.getNombre()) && !tag.getNombre().equalsIgnoreCase(request.getNombre())) {
            throw new BusinessException("Ya existe una etiqueta con nombre: " + request.getNombre());
        }

        tag.setNombre(request.getNombre());
        tagRepository.save(tag);
        return new TagResponse(tag.getId(), tag.getNombre());
    }


    @Override
    public TagResponse buscarPorId(Long id) {
        Tag tag = tagRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Etiqueta", "ID", id.toString()));
        return new TagResponse(tag.getId(), tag.getNombre());
    }

    @Override
    public List<TagResponse> listar() {
        return tagRepository.findAll().stream()
            .map(t -> new TagResponse(t.getId(), t.getNombre()))
            .toList();
    }

    @Override
    public void eliminar(Long id) {
        Tag tag = tagRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Etiqueta", "ID", id.toString()));

        // Antes de borrar la etiqueta, se elimina su asociación con todos los clientes
        // para evitar problemas de integridad referencial en la tabla intermedia.
        if (tag.getClientes() != null) {
            tag.getClientes().forEach(cliente -> {
                if (cliente.getTags() != null) {
                    cliente.getTags().removeIf(t -> t.getId().equals(id));
                }
            });
        }

        tagRepository.delete(tag);
    }

    @Override
    public void asignarACliente(String dniCliente, Long idEtiqueta) {
        Cliente cliente = clienteRepository.findByDni(dniCliente)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente", "DNI", dniCliente));
        Tag tag = tagRepository.findById(idEtiqueta)
            .orElseThrow(() -> new ResourceNotFoundException("Etiqueta", "ID", idEtiqueta.toString()));
        if (cliente.getTags() == null) {
            cliente.setTags(new java.util.ArrayList<>());
        }
        if (cliente.getTags().stream().noneMatch(t -> t.getId().equals(idEtiqueta))) {
            cliente.getTags().add(tag);
            clienteRepository.save(cliente);
        }
    }

    @Override
    public void desasignarDeCliente(String dniCliente, Long idEtiqueta) {
        Cliente cliente = clienteRepository.findByDni(dniCliente)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente", "DNI", dniCliente));
        tagRepository.findById(idEtiqueta)
            .orElseThrow(() -> new ResourceNotFoundException("Etiqueta", "ID", idEtiqueta.toString()));
        if (cliente.getTags() != null && cliente.getTags().removeIf(t -> t.getId().equals(idEtiqueta))) {
            clienteRepository.save(cliente);
        }
    }
}