# TPO Aplicaciones Interactivas — Entrega 1

## Módulo elegido

Se implementó el módulo **Sistema de etiquetas para clientes**, pedido por la cátedra para clasificar clientes mediante etiquetas y así permitir análisis o segmentación. Este módulo se agregó sobre el proyecto base provisto por el profesor, manteniendo la arquitectura existente y trabajando solo con lo que entra en la **Entrega 1**: backend, persistencia con JPA, seguridad con JWT, validaciones y manejo básico de errores.

## Objetivo de esta entrega

En esta primera entrega se desarrolló únicamente el **backend** del módulo. El frontend del proyecto base se mantiene dentro del repositorio porque forma parte de la estructura original de la cátedra, pero no es el foco de esta etapa.

## Descripción simple del módulo

El sistema permite que un cliente tenga una o varias etiquetas, por ejemplo:

- VIP
- Nuevo
- Moroso
- Riesgoso

Esto sirve para clasificar clientes de forma flexible. Una misma etiqueta puede estar asociada a varios clientes, y un cliente puede tener varias etiquetas.

## Modelo de datos

### Entidad Tag

Representa una etiqueta del sistema.

Campos:
- `id`: identificador de la etiqueta
- `nombre`: nombre de la etiqueta

### Relación Cliente ↔ Tag

Se modeló una relación **muchos a muchos**:

- un cliente puede tener muchas etiquetas
- una etiqueta puede pertenecer a muchos clientes

Para eso se utiliza la tabla intermedia: `clientes_etiquetas`.

### Esquema lógico

```
Cliente ---< clientes_etiquetas >--- Tag
```

## Estructura importante del backend

### Entidades
- `Cliente.java`
- `Tag.java`

### Repositorios
- `ClienteRepository.java`
- `TagRepository.java`

### Servicios
- `TagService.java`
- `TagServiceImpl.java`

### Controladores
- `TagController.java`
- `ClienteTagController.java`

### Validaciones y errores
- `TagRequest.java`
- `BusinessException.java`
- `ResourceNotFoundException.java`
- `GlobalExceptionHandler.java`

## Cómo funciona el módulo

### 1. Crear una etiqueta

Se envía un `POST /api/etiquetas` con un JSON como este:

```json
{
  "nombre": "VIP"
}
```

El backend valida que el nombre no esté vacío y que no exista otra etiqueta con el mismo nombre. Si todo está bien, guarda la nueva etiqueta en la base de datos.

### 2. Listar etiquetas

Con `GET /api/etiquetas` se obtienen todas las etiquetas creadas.

### 3. Buscar una etiqueta puntual

Con `GET /api/etiquetas/{id}` se puede obtener una etiqueta específica por su ID.

### 4. Actualizar una etiqueta

Con `PUT /api/etiquetas/{id}` se cambia el nombre de una etiqueta existente.

Ejemplo:

```json
{
  "nombre": "Cliente VIP"
}
```

### 5. Eliminar una etiqueta

Con `DELETE /api/etiquetas/{id}` se borra una etiqueta del sistema. Antes de eliminarla, el backend la desasocia de los clientes que la tengan asignada, para no romper la relación many-to-many.

### 6. Asignar etiqueta a cliente

Con `POST /api/clientes/{dni}/etiquetas/{idEtiqueta}` se crea la relación entre un cliente y una etiqueta.

### 7. Quitar etiqueta de cliente

Con `DELETE /api/clientes/{dni}/etiquetas/{idEtiqueta}` se elimina esa relación sin borrar ni al cliente ni a la etiqueta.

## Endpoints implementados

### CRUD de etiquetas
- `POST /api/etiquetas` → crear etiqueta
- `GET /api/etiquetas` → listar etiquetas
- `GET /api/etiquetas/{id}` → buscar etiqueta por ID
- `PUT /api/etiquetas/{id}` → actualizar etiqueta
- `DELETE /api/etiquetas/{id}` → eliminar etiqueta

### Operaciones de relación cliente-etiqueta
- `POST /api/clientes/{dni}/etiquetas/{idEtiqueta}` → asignar etiqueta a cliente
- `DELETE /api/clientes/{dni}/etiquetas/{idEtiqueta}` → quitar etiqueta de cliente

## Validaciones aplicadas

### Bean Validation
En `TagRequest` se usa:

```java
@NotBlank(message = "El nombre de la etiqueta es obligatorio")
```

Eso evita crear o actualizar etiquetas con nombre vacío.

### Reglas de negocio
- no se permiten nombres de etiquetas repetidos
- no se puede operar con clientes inexistentes
- no se puede operar con etiquetas inexistentes

## Seguridad con JWT

El proyecto mantiene la seguridad base con JWT.

Flujo:
1. el usuario se registra o inicia sesión
2. el backend devuelve un token JWT
3. ese token se envía en la cabecera `Authorization: Bearer <token>`
4. los endpoints del módulo quedan protegidos como parte del backend autenticado

## Manejo de errores

El proyecto devuelve errores uniformes mediante `GlobalExceptionHandler`.

Errores principales:
- `ResourceNotFoundException` → cuando no existe cliente o etiqueta
- `BusinessException` → cuando se intenta repetir una etiqueta o violar una regla de negocio
- errores de validación con `@Valid`

## Qué entra de la materia en esta entrega

Esta implementación está pensada para la **Entrega 1**, por lo tanto cubre:

- arquitectura backend con Spring Boot
- persistencia con JPA / Hibernate
- relaciones entre entidades
- repositorios
- servicios REST
- endpoints CRUD
- validaciones con Bean Validation
- autenticación con JWT
- manejo básico de errores

## Nota sobre el frontend

El proyecto base incluye carpeta `frontend/`, pero en esta entrega no se evalúa el desarrollo frontend. Se deja dentro del repositorio porque forma parte de la estructura original dada por la cátedra.
