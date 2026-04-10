# TPO Aplicaciones Interactivas — Entrega 1

## Módulo elegido

Para este trabajo elegimos el módulo Sistema de etiquetas para clientes. La idea es poder clasificar clientes con etiquetas como "VIP", "Moroso", etc. Trabajamos sobre el proyecto base que nos dio la cátedra, sin tocar la arquitectura original. En esta primera entrega nos enfocamos solo en el backend.

## Qué hicimos en esta entrega

Desarrollamos el backend completo del módulo de etiquetas. Creamos las entidades, los repositorios, los servicios y los endpoints REST necesarios para poder crear, modificar, eliminar y asignar etiquetas a clientes.

## Cómo funciona el módulo

El sistema permite asignarle etiquetas a los clientes. Por ejemplo, un cliente puede tener las etiquetas:

- VIP
- Nuevo
- Moroso
- Riesgoso

Un cliente puede tener varias etiquetas, y una misma etiqueta puede estar en varios clientes.

## Modelo de datos

### Entidad Tag

Representa una etiqueta. Tiene dos campos:
- `id`: identificador
- `nombre`: el texto de la etiqueta

### Relación Cliente - Tag

Es una relación muchos a muchos. Se resuelve con una tabla intermedia `clientes_etiquetas` que JPA genera automáticamente.

`Cliente ---< clientes_etiquetas >--- Tag`

## Estructura del backend

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

### Manejo de errores
- `BusinessException.java`
- `ResourceNotFoundException.java`
- `GlobalExceptionHandler.java`

## Endpoints implementados

### Etiquetas (CRUD)
- `POST /api/etiquetas` → crea una etiqueta nueva
- `GET /api/etiquetas` → trae todas las etiquetas
- `GET /api/etiquetas/{id}` → trae una etiqueta por ID
- `PUT /api/etiquetas/{id}` → modifica una etiqueta
- `DELETE /api/etiquetas/{id}` → borra una etiqueta

### Relación cliente-etiqueta
- `POST /api/clientes/{dni}/etiquetas/{idEtiqueta}` → le asigna una etiqueta a un cliente
- `DELETE /api/clientes/{dni}/etiquetas/{idEtiqueta}` → le saca una etiqueta a un cliente

## Ejemplos de uso

Crear una etiqueta: `POST /api/etiquetas` con body `{ "nombre": "VIP" }`

Modificar una etiqueta: `PUT /api/etiquetas/1` con body `{ "nombre": "Cliente VIP" }`

Asignar etiqueta a un cliente: `POST /api/clientes/12345678/etiquetas/1`

## Validaciones

- El nombre de la etiqueta no puede estar vacío
- No se pueden crear dos etiquetas con el mismo nombre
- Si el cliente o la etiqueta no existen, devuelve error
- Si se manda un request inválido, devuelve error 400

## Seguridad

Usamos la seguridad JWT que ya venía en el proyecto base:

1. El usuario se registra o hace login
2. El backend le devuelve un token
3. Ese token se manda en el header `Authorization` en cada request
4. Sin token no se puede acceder a ningún endpoint

## Manejo de errores

Los errores se manejan con un `GlobalExceptionHandler` que devuelve respuestas claras:

- `ResourceNotFoundException` → cuando no se encuentra un cliente o etiqueta
- `BusinessException` → cuando se viola alguna regla, por ejemplo nombre repetido
- Errores de validación → cuando faltan campos obligatorios

## Qué cubre esta entrega

- Backend con Spring Boot
- Persistencia con JPA / Hibernate
- Relaciones entre entidades
- Repositorios y servicios
- Endpoints REST con CRUD completo
- Validaciones con Bean Validation
- Autenticación con JWT
- Manejo de errores