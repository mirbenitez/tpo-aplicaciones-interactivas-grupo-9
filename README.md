# TPO Aplicaciones Interactivas — Entrega 2

## Módulo

Sistema de etiquetas para clientes. La entrega 1 fue el backend completo; acá agregamos el frontend en React que lo consume.

## Qué hicimos en esta entrega

Desarrollamos la interfaz en React del módulo de etiquetas: crear, editar, eliminar y listar etiquetas, y también asignarlas o quitarlas a clientes buscando por DNI.

También completamos las pantallas de Créditos y Cobranzas que en la entrega anterior solo tenían alta y consulta. Ahora tienen editar y eliminar, y agregamos los endpoints correspondientes en el backend.

## Cómo levantar el proyecto

Necesitás tener Java 17+, Maven y Node.js 18+.

**Backend** (corre en el puerto 8080):
```bash
cd backend
mvn spring-boot:run
```

**Frontend** (corre en el puerto 5173):
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

## Tecnologías usadas

- React 19 + React Router v7
- Redux Toolkit para el manejo de estado
- Fetch API para las llamadas al backend
- Vite como bundler

## Seguridad

Todas las rutas están protegidas con un componente `PrivateRoute` que verifica que haya sesión activa. El token JWT se guarda en localStorage y se manda automáticamente en cada request.
