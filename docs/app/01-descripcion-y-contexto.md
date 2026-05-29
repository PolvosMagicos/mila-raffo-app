# 01 - Descripcion General y Contexto

---

## Que es

La app mobile de Mila Raffo es una aplicacion **Expo / React Native** para clientes del ecommerce de accesorios de cuero artesanales. Consume la API del backend NestJS y organiza la experiencia de compra en catalogo, detalle de producto, carrito, pedidos, perfil, direcciones y wishlist.

## Que problema resuelve

- Permite que un cliente navegue el catalogo mobile de productos.
- Muestra detalle de productos, variantes, imagenes, caracteristicas y stock.
- Maneja autenticacion de clientes con tokens JWT y refresh token.
- Permite agregar variantes al carrito y administrar cantidades.
- Permite crear y consultar pedidos.
- Permite consultar y actualizar perfil, direcciones y wishlist.
- Mantiene una estructura de codigo por dominio para poder crecer sin mezclar UI, API y reglas de negocio.

## Stack Tecnologico

| Componente | Tecnologia |
|---|---|
| Runtime mobile | Expo 55 |
| Framework UI | React Native 0.83 |
| React | React 19 |
| Routing | Expo Router 55 |
| Estado | Zustand 5 |
| HTTP | Axios |
| Storage seguro | expo-secure-store |
| Fuentes | @expo-google-fonts |
| Iconos | @expo/vector-icons / Ionicons |
| Lenguaje | TypeScript 5.9 con strict mode |
| Lint | expo lint / ESLint 9 |

## Alcance de negocio

### Catalogo

El catalogo consume `/products` con filtros alineados al backend:

- `q`
- `name`
- `categoryId`
- `available`
- `minBasePrice`
- `maxBasePrice`
- `sortBy`
- `sortOrder`
- `limit`
- `offset`

El detalle de producto vive como ruta hija de catalogo en `src/app/(app)/catalog/[id].tsx`.

### Compra

La compra se apoya en el backend para carrito y ordenes:

- Carrito remoto en `/cart`.
- Items de carrito por `variantId` y `quantity`.
- Ordenes en `/orders`.
- Cancelacion de orden con `PATCH /orders/:id/cancel`.

### Autenticacion

La app guarda access token, refresh token y usuario en secure storage. El `apiClient` adjunta el Bearer token y hace refresh silencioso ante respuestas `401`, excepto para endpoints de auth.

## Limites actuales

- `PROD_API_URL` esta vacio en `src/core/config/env.ts`.
- No hay suite de tests automatizada configurada.
- El carrito local existe como datasource de respaldo conceptual, pero el flujo activo usa API.
- Las categorias se derivan del payload de productos cargados; no hay modulo de categorias propio.
