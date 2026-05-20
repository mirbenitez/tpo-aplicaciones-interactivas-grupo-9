# Lienzo completo — Entrega 1 Backend del módulo Etiquetas

## 1. Contexto del trabajo

El proyecto base del profesor ya trae un sistema de clientes, créditos, cuotas, cobranzas y usuarios. Sobre esa base, en la Entrega 1 se agregó el módulo **Sistema de etiquetas para clientes**.

La idea del módulo es simple: poder clasificar clientes con etiquetas como `VIP`, `Moroso`, `Nuevo` o `Riesgoso`.

---

## 2. Qué se implementó

Se agregó:

- una nueva entidad `Tag`
- una relación many-to-many entre `Cliente` y `Tag`
- repositorio para etiquetas
- servicio con lógica de negocio
- endpoints REST completos para CRUD de etiquetas
- endpoints para asignar y quitar etiquetas a clientes
- validaciones con Bean Validation
- manejo de errores
- uso de JWT sobre la estructura de seguridad ya existente

---

## 3. Teoría necesaria

### ¿Qué es una entidad?
Una entidad es una clase Java que representa una tabla de la base de datos.

### ¿Qué es un repositorio?
Es la capa que accede a la base de datos. Con Spring Data JPA permite guardar, buscar, actualizar y borrar datos sin escribir SQL manual.

### ¿Qué es un service?
Es la capa donde va la lógica de negocio. Ahí se decide qué se puede hacer y qué no.

### ¿Qué es un controller?
Es la capa que expone endpoints REST para que otro sistema o un frontend pueda consumir la información.

### ¿Qué es many-to-many?
Significa que un cliente puede tener varias etiquetas y una etiqueta puede pertenecer a varios clientes.

---

## 4. Flujo general de la implementación

### Crear etiqueta
1. llega una request al controller
2. el controller llama al service
3. el service valida que no exista otra etiqueta con el mismo nombre
4. el repository guarda la etiqueta
5. se devuelve la respuesta

### Asignar etiqueta a cliente
1. llega el DNI del cliente y el ID de la etiqueta
2. el service busca cliente y etiqueta
3. valida que existan
4. agrega la etiqueta a la lista del cliente
5. guarda el cliente
6. JPA actualiza la tabla intermedia

---

## 5. Código importante explicado

### 5.1 Entidad Tag

```java
@Entity                     // Marca la clase como entidad JPA
@Table(name = "etiquetas") // Define el nombre de la tabla en la base
@Data                       // Genera getters, setters, etc. con Lombok
@NoArgsConstructor          // Constructor vacío
@AllArgsConstructor         // Constructor con todos los campos
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // ID autoincremental de la etiqueta

    @Column(name = "nombre", nullable = false, unique = true)
    private String nombre;
    // Nombre de la etiqueta. No puede ser nulo ni repetirse

    @ManyToMany(mappedBy = "tags")
    private List<Cliente> clientes;
    // Lista de clientes que tienen esta etiqueta
}
```

### 5.2 Relación en Cliente

```java
@ManyToMany(fetch = FetchType.EAGER)
@JoinTable(
    name = "clientes_etiquetas",
    joinColumns = @JoinColumn(name = "dni_cliente"),
    inverseJoinColumns = @JoinColumn(name = "id_etiqueta")
)
private List<Tag> tags;
```

Explicación:
- `@ManyToMany` indica la relación muchos a muchos
- `@JoinTable` define la tabla intermedia
- `dni_cliente` apunta al cliente
- `id_etiqueta` apunta a la etiqueta

### 5.3 DTO de entrada

```java
@Data
public class TagRequest {

    @NotBlank(message = "El nombre de la etiqueta es obligatorio")
    private String nombre;
    // Nombre que llega desde la request
}
```

Esto valida que no te manden una etiqueta vacía.

### 5.4 Repository

```java
public interface TagRepository extends JpaRepository<Tag, Long> {
    boolean existsByNombre(String nombre);
    // Pregunta si ya existe una etiqueta con ese nombre
}
```

### 5.5 Service

```java
public interface TagService {
    TagResponse crear(TagRequest request);
    TagResponse actualizar(Long id, TagRequest request);
    TagResponse buscarPorId(Long id);
    List<TagResponse> listar();
    void eliminar(Long id);
    void asignarACliente(String dniCliente, Long idEtiqueta);
    void desasignarDeCliente(String dniCliente, Long idEtiqueta);
}
```

### 5.6 Lógica de negocio principal

#### Crear etiqueta
```java
@Override
public TagResponse crear(TagRequest request) {
    if (tagRepository.existsByNombre(request.getNombre())) {
        throw new BusinessException("Ya existe una etiqueta con nombre: " + request.getNombre());
    }
    // Si ya existe, corta con error

    Tag tag = new Tag();
    tag.setNombre(request.getNombre());
    // Crea la entidad y le pone el nombre

    tagRepository.save(tag);
    // Guarda en base

    return new TagResponse(tag.getId(), tag.getNombre());
    // Devuelve la respuesta
}
```

#### Buscar etiqueta por id
```java
@Override
public TagResponse buscarPorId(Long id) {
    Tag tag = tagRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Etiqueta", "ID", id.toString()));
    // Busca la etiqueta y si no existe lanza error

    return new TagResponse(tag.getId(), tag.getNombre());
}
```

#### Actualizar etiqueta
```java
@Override
public TagResponse actualizar(Long id, TagRequest request) {
    Tag tag = tagRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Etiqueta", "ID", id.toString()));
    // Busca la etiqueta

    if (tagRepository.existsByNombre(request.getNombre()) && !tag.getNombre().equalsIgnoreCase(request.getNombre())) {
        throw new BusinessException("Ya existe una etiqueta con nombre: " + request.getNombre());
    }
    // Si querés cambiar a un nombre ya usado por otra etiqueta, da error

    tag.setNombre(request.getNombre());
    // Cambia el nombre

    tagRepository.save(tag);
    // Guarda cambios

    return new TagResponse(tag.getId(), tag.getNombre());
}
```

#### Eliminar etiqueta
```java
@Override
public void eliminar(Long id) {
    Tag tag = tagRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Etiqueta", "ID", id.toString()));
    // Busca etiqueta

    if (tag.getClientes() != null) {
        tag.getClientes().forEach(cliente -> {
            if (cliente.getTags() != null) {
                cliente.getTags().removeIf(t -> t.getId().equals(id));
            }
        });
    }
    // La desasocia de todos los clientes antes de borrarla

    tagRepository.delete(tag);
    // La elimina de la base
}
```

#### Asignar etiqueta a cliente
```java
@Override
public void asignarACliente(String dniCliente, Long idEtiqueta) {
    Cliente cliente = clienteRepository.findByDni(dniCliente)
        .orElseThrow(() -> new ResourceNotFoundException("Cliente", "DNI", dniCliente));

    Tag tag = tagRepository.findById(idEtiqueta)
        .orElseThrow(() -> new ResourceNotFoundException("Etiqueta", "ID", idEtiqueta.toString()));

    if (cliente.getTags() == null) {
        cliente.setTags(new ArrayList<>());
    }

    if (cliente.getTags().stream().noneMatch(t -> t.getId().equals(idEtiqueta))) {
        cliente.getTags().add(tag);
        clienteRepository.save(cliente);
    }
}
```

#### Quitar etiqueta de cliente
```java
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
```

### 5.7 Controller

```java
@RestController
@RequestMapping("/api/etiquetas")
@RequiredArgsConstructor
public class TagController {
    private final TagService tagService;

    @PostMapping
    public ResponseEntity<TagResponse> crear(@Valid @RequestBody TagRequest request) {
        TagResponse response = tagService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TagResponse> actualizar(@PathVariable Long id, @Valid @RequestBody TagRequest request) {
        TagResponse response = tagService.actualizar(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<TagResponse>> listar() {
        return ResponseEntity.ok(tagService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TagResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(tagService.buscarPorId(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        tagService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
```

### 5.8 Controller de relación cliente-etiqueta

```java
@RestController
@RequestMapping("/api/clientes/{dni}/etiquetas")
@RequiredArgsConstructor
public class ClienteTagController {
    private final TagService tagService;

    @PostMapping("/{idEtiqueta}")
    public ResponseEntity<Void> asignar(@PathVariable String dni, @PathVariable Long idEtiqueta) {
        tagService.asignarACliente(dni, idEtiqueta);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{idEtiqueta}")
    public ResponseEntity<Void> desasignar(@PathVariable String dni, @PathVariable Long idEtiqueta) {
        tagService.desasignarDeCliente(dni, idEtiqueta);
        return ResponseEntity.noContent().build();
    }
}
```

---

## 6. CRUD completo de etiquetas

### CREATE
`POST /api/etiquetas`

### READ
`GET /api/etiquetas`
`GET /api/etiquetas/{id}`

### UPDATE
`PUT /api/etiquetas/{id}`

### DELETE
`DELETE /api/etiquetas/{id}`

---

## 7. Endpoints extra del módulo

Además del CRUD de la entidad etiqueta, se agregaron operaciones de relación:

- `POST /api/clientes/{dni}/etiquetas/{idEtiqueta}`
- `DELETE /api/clientes/{dni}/etiquetas/{idEtiqueta}`

---

## 8. Ejemplo real completo

### Crear etiqueta
```http
POST /api/etiquetas
```

Body:
```json
{
  "nombre": "VIP"
}
```

### Asignar a cliente
```http
POST /api/clientes/12345678/etiquetas/1
```

### Buscar cliente
Cuando se consulta el cliente, ahora devuelve sus etiquetas en `ClienteResponse`.

### Actualizar etiqueta
```http
PUT /api/etiquetas/1
```

Body:
```json
{
  "nombre": "Cliente VIP"
}
```

### Eliminar etiqueta
```http
DELETE /api/etiquetas/1
```

---

## 9. Seguridad y validaciones

### JWT
La seguridad base ya estaba en el proyecto y se mantiene. Los endpoints del módulo quedan protegidos mediante token JWT.

### Validaciones
Se valida que:
- el nombre no venga vacío
- no se repitan etiquetas
- no se trabajen clientes o etiquetas inexistentes

---

## 10. Qué cubre de la Entrega 1

Con esta implementación se cubre:

- entidades JPA necesarias
- relaciones entre entidades
- repositorios
- servicios de negocio
- endpoints REST CRUD
- validaciones con Bean Validation
- autenticación con JWT
- manejo básico de errores

---

## 11. Resumen final

El módulo de etiquetas permite clasificar clientes sobre el sistema base del profesor. Se implementó de manera backend pura, con Spring Boot, JPA, JWT y validaciones, respetando lo pedido por la Entrega 1.
