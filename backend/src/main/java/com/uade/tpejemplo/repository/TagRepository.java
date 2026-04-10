package com.uade.tpejemplo.repository;

import com.uade.tpejemplo.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<Tag, Long> {
    boolean existsByNombre(String nombre);
}