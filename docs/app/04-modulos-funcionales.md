# 04 - Modulos Funcionales

---

## Auth

Ubicacion: `src/modules/auth`

Responsabilidades:

- Login.
- Registro.
- Logout.
- Refresh token.
- Persistencia local de tokens y usuario.
- Estado global de sesion.

Endpoints usados:

| Operacion | Endpoint |
|---|---|
| Login | `POST /auth/login` |
| Registro | `POST /auth/register` |
| Logout | `POST /auth/logout` |
| Refresh | `POST /auth/refresh` |

Store principal: `useAuthStore`.

## Products

Ubicacion: `src/modules/products`

Responsabilidades:

- Listar productos paginados.
- Aplicar filtros de catalogo.
- Obtener detalle por id.
- Obtener detalle por slug.
- Mapear respuesta del backend a entidades mobile.

Endpoints usados:

| Operacion | Endpoint |
|---|---|
| Listar productos | `GET /products` |
| Detalle por id o slug | `GET /products/:idOrSlug` |

Filtros soportados:

- `categoryId`
- `q`
- `name`
- `available`
- `minBasePrice`
- `maxBasePrice`
- `sortBy`
- `sortOrder`
- `page`
- `limit`
- `offset`

Store principal: `useProductsStore`.

## Cart

Ubicacion: `src/modules/cart`

Responsabilidades:

- Obtener carrito.
- Agregar item por variante.
- Actualizar cantidad.
- Remover item.
- Vaciar carrito.

Endpoints usados:

| Operacion | Endpoint |
|---|---|
| Obtener carrito | `GET /cart` |
| Agregar item | `POST /cart/items` |
| Actualizar item | `PATCH /cart/items/:itemId` |
| Remover item | `DELETE /cart/items/:itemId` |
| Vaciar carrito | `DELETE /cart` |

Store principal: `useCartStore`.

## Orders

Ubicacion: `src/modules/orders`

Responsabilidades:

- Listar pedidos del usuario.
- Obtener pedido por id.
- Crear pedido.
- Cancelar pedido.

Endpoints usados:

| Operacion | Endpoint |
|---|---|
| Listar pedidos | `GET /orders` |
| Detalle | `GET /orders/:id` |
| Crear | `POST /orders` |
| Cancelar | `PATCH /orders/:id/cancel` |

Store principal: `useOrdersStore`.

Estados de pedido usados por la app:

- `pending`
- `confirmed`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

## Profile

Ubicacion: `src/modules/profile`

Responsabilidades:

- Obtener perfil del usuario autenticado.
- Actualizar perfil.
- Cambiar password.

Endpoints usados:

| Operacion | Endpoint |
|---|---|
| Obtener perfil | `GET /users/me` |
| Actualizar perfil | `PATCH /users/me` |
| Cambiar password | `PATCH /users/me/password` |

Store principal: `useProfileStore`.

## Addresses

Ubicacion: `src/modules/addresses`

Responsabilidades:

- Listar direcciones.
- Obtener direccion por id.
- Crear direccion.
- Actualizar direccion.
- Eliminar direccion.
- Marcar direccion por defecto.

Endpoints usados:

| Operacion | Endpoint |
|---|---|
| Listar | `GET /addresses` |
| Detalle | `GET /addresses/:id` |
| Crear | `POST /addresses` |
| Actualizar | `PATCH /addresses/:id` |
| Eliminar | `DELETE /addresses/:id` |
| Marcar default | `PATCH /addresses/:id/default` |

Store principal: `useAddressesStore`.

## Wishlist

Ubicacion: `src/modules/wishlist`

Responsabilidades:

- Obtener wishlist.
- Agregar item por variante.
- Remover item.

Endpoints usados:

| Operacion | Endpoint |
|---|---|
| Obtener wishlist | `GET /wishlist` |
| Agregar item | `POST /wishlist/items` |
| Remover item | `DELETE /wishlist/items/:itemId` |

Store principal: `useWishlistStore`.
