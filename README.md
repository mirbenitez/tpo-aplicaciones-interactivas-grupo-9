# TPO Aplicaciones Interactivas — Entrega 2

## Módulo elegido

Se implementó el módulo **Sistema de etiquetas para clientes**, pedido por la cátedra para clasificar clientes mediante etiquetas y así permitir análisis o segmentación. La Entrega 1 cubrió el backend completo; esta **Entrega 2** se enfoca en el frontend en React que consume ese backend.

## Objetivo de esta entrega

En esta segunda entrega se desarrolló el **frontend** en React del módulo, conectado al backend mediante API REST. La aplicación permite gestionar etiquetas (crear, modificar, eliminar y listar) y administrar las etiquetas asignadas a cada cliente.

Además, para que todo el frontend quede consistente, se completaron las pantallas de **Créditos** y **Cobranzas** con las operaciones de modificar y eliminar que faltaban, y se agregaron los endpoints `PUT` y `DELETE` correspondientes en el backend.

## Lo nuevo de esta entrega

### Frontend (React) — módulo Etiquetas

- `frontend/src/api/etiquetas.js` — capa HTTP con `fetch` para todos los endpoints de etiquetas
- `frontend/src/store/slices/etiquetasSlice.js` — slice de Redux Toolkit con `createAsyncThunk` para cada operación
- `frontend/src/pages/Etiquetas.jsx` — pantalla con CRUD completo de etiquetas
- `frontend/src/pages/ClienteEtiquetas.jsx` — pantalla para asignar y quitar etiquetas a un cliente puntual

### Frontend — mejoras a módulos existentes

- `frontend/src/pages/Clientes.jsx` — ahora muestra los chips de etiquetas asignadas a cada cliente
- `frontend/src/pages/Creditos.jsx` — se agregaron botones de Editar y Eliminar (CRUD completo)
- `frontend/src/pages/Cobranzas.jsx` — se agregaron botones de Editar y Eliminar (CRUD completo)
- `frontend/src/components/Navbar.jsx` — link al nuevo módulo de Etiquetas
- `frontend/src/App.jsx` — nuevas rutas `/etiquetas` y `/clientes/etiquetas` protegidas con `PrivateRoute`

### Backend — endpoints nuevos

Para soportar el CRUD completo del frontend se agregaron:

- `PUT /api/creditos/{id}` — actualizar un crédito existente
- `DELETE /api/creditos/{id}` — eliminar un crédito
- `PUT /api/cobranzas/{id}` — actualizar una cobranza existente
- `DELETE /api/cobranzas/{id}` — eliminar una cobranza

Los endpoints del módulo de etiquetas ya estaban implementados en la Entrega 1.

## Cómo levantar el proyecto

### Requisitos

- Java 17+
- Maven
- Node.js 18+

### Backend (puerto 8080)

```bash
cd backend
mvn spring-boot:run
```

### Frontend (puerto 5173)

```bash
cd frontend
npm install
npm run dev
```

Abrir el navegador en [http://localhost:5173](http://localhost:5173).

## Cómo probar la aplicación

1. Registrarse en `/register` o iniciar sesión en `/login`.
2. Ir a **Clientes** y crear al menos un cliente.
3. Ir a **Etiquetas** y crear algunas (VIP, Moroso, Nuevo, Riesgoso).
4. Probar editar una y eliminar otra.
5. Ir a **Etiquetas por cliente** (botón "Gestionar etiquetas" desde la pantalla de Clientes), buscar por DNI y asignar varias etiquetas.
6. Volver a **Clientes** y verificar que los chips de colores aparecen en la tabla.
7. En **Créditos** y **Cobranzas** probar crear, modificar y eliminar registros.

## Endpoints REST utilizados por el frontend

### Módulo Etiquetas

| Operación   | Método | Endpoint                                          |
|-------------|--------|---------------------------------------------------|
| Listar      | GET    | `/api/etiquetas`                                  |
| Buscar      | GET    | `/api/etiquetas/{id}`                             |
| Crear       | POST   | `/api/etiquetas`                                  |
| Modificar   | PUT    | `/api/etiquetas/{id}`                             |
| Eliminar    | DELETE | `/api/etiquetas/{id}`                             |
| Asignar     | POST   | `/api/clientes/{dni}/etiquetas/{idEtiqueta}`      |
| Desasignar  | DELETE | `/api/clientes/{dni}/etiquetas/{idEtiqueta}`      |

### Otros módulos (CRUD completo)

| Recurso   | GET                                  | POST              | PUT                       | DELETE                    |
|-----------|--------------------------------------|-------------------|---------------------------|---------------------------|
| Clientes  | `/api/clientes`, `/api/clientes/{dni}` | `/api/clientes`   | —                         | —                         |
| Créditos  | `/api/creditos/cliente/{dni}`, `/api/creditos/{id}` | `/api/creditos`   | `/api/creditos/{id}`      | `/api/creditos/{id}`      |
| Cobranzas | `/api/cobranzas/credito/{idCredito}` | `/api/cobranzas`  | `/api/cobranzas/{id}`     | `/api/cobranzas/{id}`     |

## Tecnologías usadas en el frontend

- **React 19** — librería de UI
- **React Router v7** — ruteo entre pantallas
- **Redux Toolkit** + **react-redux** — manejo de estado global
- **Fetch API** — llamadas HTTP al backend
- **Vite** — bundler de desarrollo

## Requisitos cubiertos de la consigna de la Entrega 2

- ✅ Desarrollar una interfaz en React
- ✅ Visualizar información del módulo
- ✅ Crear registros
- ✅ Modificar registros
- ✅ Eliminar registros
- ✅ Conexión con el backend mediante API REST
- ✅ React Router (rutas protegidas con `PrivateRoute`)
- ✅ Llamadas HTTP mediante `fetch` (en `apiClient.js`)
- ✅ Manejo de errores básicos (capturados por los thunks de Redux y mostrados en pantalla)
- ✅ Manejo de estados de carga (flag `loading` con textos dinámicos en los botones)

## Seguridad

Todas las rutas del frontend (excepto `/login` y `/register`) están protegidas mediante el componente `PrivateRoute`, que verifica que haya un usuario autenticado en el store de Redux. El token JWT recibido en el login se guarda en `localStorage` y se envía automáticamente en cada request mediante el wrapper `apiClient.js`.
