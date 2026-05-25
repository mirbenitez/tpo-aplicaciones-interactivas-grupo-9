# TPO Aplicaciones Interactivas — Entrega 2

## Módulo

Sistema de etiquetas para clientes. La entrega 1 fue el backend completo; en esta entrega agregamos el frontend en React que lo consume.

## Qué hicimos en esta entrega

El foco principal fue desarrollar la interfaz en React del módulo de etiquetas. Desde la pantalla de Etiquetas se pueden crear, editar, eliminar y listar etiquetas. Desde la pantalla de Etiquetas por cliente se busca un cliente por DNI y se le asignan o quitan etiquetas, mostrando en todo momento cuáles tiene asignadas y cuáles están disponibles.

También completamos las pantallas de Créditos y Cobranzas que en la entrega anterior solo tenían alta y consulta. Ahora tienen editar y eliminar, y para soportarlos agregamos los endpoints `PUT /api/creditos/{id}`, `DELETE /api/creditos/{id}`, `PUT /api/cobranzas/{id}` y `DELETE /api/cobranzas/{id}` en el backend.

## Archivos nuevos del frontend

- `frontend/src/api/etiquetas.js` — llamadas HTTP para todos los endpoints de etiquetas
- `frontend/src/api/apiClient.js` — wrapper de fetch que agrega el token JWT a cada request
- `frontend/src/store/slices/etiquetasSlice.js` — slice de Redux con thunks para cada operación
- `frontend/src/pages/Etiquetas.jsx` — pantalla de CRUD de etiquetas
- `frontend/src/pages/ClienteEtiquetas.jsx` — pantalla para gestionar etiquetas de un cliente

## Archivos modificados

- `frontend/src/pages/Clientes.jsx` — ahora muestra los chips de etiquetas asignadas a cada cliente
- `frontend/src/pages/Creditos.jsx` — se agregaron botones de editar y eliminar
- `frontend/src/pages/Cobranzas.jsx` — se agregaron botones de editar y eliminar
- `frontend/src/store/slices/creditosSlice.js` y `cobranzasSlice.js` — nuevos thunks de update y remove
- `frontend/src/components/Navbar.jsx` — link al módulo de Etiquetas
- `frontend/src/App.jsx` — nuevas rutas `/etiquetas` y `/clientes/etiquetas`

## Tecnologías usadas en el frontend

- React 19 con React Router v7 para el ruteo
- Redux Toolkit para el manejo de estado global, con `createAsyncThunk` para las operaciones asíncronas
- Fetch API para las llamadas al backend
- Vite como bundler

## Cómo levantar el proyecto

Necesitás tener Java 17+, Maven y Node.js 18+.

**Backend** (puerto 8080):
```bash
cd backend
mvn spring-boot:run
```

**Frontend** (puerto 5173):
```bash
cd frontend
npm install
npm run dev
```

Después abrís http://localhost:5173 en el navegador.

## Cómo probarlo

1. Registrate en `/register` o iniciá sesión si ya tenés cuenta
2. Creá algún cliente en la pantalla de Clientes
3. Andá a Etiquetas y creá algunas (VIP, Moroso, etc.), probá editar y eliminar
4. Desde Clientes entrá a "Gestionar etiquetas", buscá un cliente por DNI y asignale etiquetas
5. Volvé a Clientes y vas a ver los chips de colores en la tabla
6. En Créditos y Cobranzas podés probar el CRUD completo

## Seguridad

Todas las rutas están protegidas con `PrivateRoute`, que verifica que haya un usuario autenticado en el store de Redux. El token JWT se guarda en localStorage y se envía automáticamente en cada request a través de `apiClient.js`.
