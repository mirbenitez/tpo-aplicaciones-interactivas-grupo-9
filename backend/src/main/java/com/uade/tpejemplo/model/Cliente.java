package com.uade.tpejemplo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import com.uade.tpejemplo.model.Tag;

@Entity
@Table(name = "clientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    @Id
    @Column(name = "dni", length = 15)
    private String dni;

    @NotBlank
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Credito> creditos;

    /**
     * Etiquetas asociadas al cliente. La relación es muchos‑a‑muchos porque un
     * cliente puede poseer varias etiquetas y una etiqueta puede estar
     * asociada a varios clientes. Se utiliza una tabla intermedia
     * «clientes_etiquetas» para mantener las asociaciones.
     */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "clientes_etiquetas",
        joinColumns = @JoinColumn(name = "dni_cliente"),
        inverseJoinColumns = @JoinColumn(name = "id_etiqueta")
    )
    private List<Tag> tags;
}
