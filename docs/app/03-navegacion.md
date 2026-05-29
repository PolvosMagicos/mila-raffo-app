# 03 - Navegacion

---

## Resumen

La app usa **Expo Router** con rutas basadas en archivos. Los grupos `(auth)` y `(app)` organizan layouts sin aparecer en la URL publica.

```
src/app/
|-- _layout.tsx
|-- index.tsx
|-- (auth)/
|   |-- _layout.tsx
|   |-- login.tsx
|   `-- register.tsx
`-- (app)/
    |-- _layout.tsx
    |-- home.tsx
    |-- catalog/
    |   |-- _layout.tsx
    |   |-- index.tsx
    |   `-- [id].tsx
    |-- cart.tsx
    |-- orders.tsx
    |-- profile.tsx
    `-- wishlist.tsx
```

## Root layout

`src/app/_layout.tsx` carga fuentes con `useFonts(APP_FONTS)` e inicializa la sesion con `useAuthStore.initialize()`.

Hasta que fuentes y auth estan listas, el layout devuelve `null`. Esto evita renderizar rutas antes de conocer el estado real de autenticacion.

## Redirect inicial

`src/app/index.tsx` decide el primer destino:

| Estado | Destino |
|---|---|
| `isAuthenticated === true` | `/home` |
| `isAuthenticated === false` | `/login` |

## Grupo auth

`src/app/(auth)` contiene pantallas para usuarios no autenticados:

- `/login`
- `/register`

El layout interno usa Stack sin header.

## Grupo app

`src/app/(app)/_layout.tsx` protege la zona autenticada. Si el usuario no esta autenticado, devuelve un redirect a `/login`.

El grupo usa tabs:

| Ruta | Tab | Visible |
|---|---|---|
| `/home` | Inicio | Si |
| `/catalog` | Catalogo | Si |
| `/cart` | Boton central con marca | Si |
| `/orders` | Pedidos | Si |
| `/profile` | Perfil | Si |
| `/wishlist` | Wishlist | No, `href: null` |

## Catalogo como subflujo

Catalogo es una carpeta con Stack propio:

```
src/app/(app)/catalog/
|-- _layout.tsx
|-- index.tsx
`-- [id].tsx
```

Esto mantiene la jerarquia correcta:

- Lista: `/catalog`
- Detalle: `/catalog/:id`

Las cards de producto deben navegar con:

```typescript
router.push(`/catalog/${product.id}`);
```

## Regla para nuevas pantallas

| Caso | Ubicacion recomendada |
|---|---|
| Nueva tab principal | `src/app/(app)/<name>.tsx` y registrar en `(app)/_layout.tsx` |
| Pantalla hija de catalogo | `src/app/(app)/catalog/<route>.tsx` |
| Pantalla de detalle de otro flujo | Crear carpeta con `_layout.tsx`, `index.tsx` y `[id].tsx` |
| Pantalla solo auth | `src/app/(auth)/<name>.tsx` |

## Regla importante

Si una pantalla nace desde un flujo existente, la ruta debe respetar esa jerarquia. Por ejemplo, el detalle de producto es hijo de catalogo, no una ruta hermana como `/product/:id`.
