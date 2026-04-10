package com.uade.tpejemplo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Entidad que representa una etiqueta que puede asociarse a uno o varios clientes.
 * Se utiliza para clasificar y segmentar clientes dentro del sistema. Cada
 * etiqueta posee un identificador único y un nombre.  La relación con
 * {@link Cliente} es bidireccional y se modela como muchos‑a‑muchos mediante
 * una tabla intermedia denominada «clientes_etiquetas».
 */
@Entity
@Table(name = "etiquetas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false, unique = true)
    private String nombre;

    @ManyToMany(mappedBy = "tags")
    private List<Cliente> clientes;
}