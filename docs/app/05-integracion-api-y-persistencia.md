# 05 - Integracion API y Persistencia

---

## Configuracion de entorno

La URL base vive en `src/core/config/env.ts`:

```typescript
const DEV_API_URL = 'http://localhost:3000/api/v1';
const PROD_API_URL = '';
```

En desarrollo, la app apunta al backend local con prefijo `/api/v1`.

## API Client

El singleton `apiClient` vive en `src/core/network/api-client.ts`.

Responsabilidades:

- Crear una instancia Axios con `baseURL: ENV.API_URL`.
- Definir timeout de 15 segundos.
- Enviar `Content-Type: application/json`.
- Adjuntar `Authorization: Bearer <accessToken>` a cada request cuando existe token.
- Interceptar `401` y hacer refresh silencioso una vez.
- Evitar retry automatico en endpoints `/auth/*`.
- Limpiar tokens locales si el refresh falla.

## Flujo de refresh token

```
Request falla con 401
  -> apiClient revisa que no sea /auth/*
  -> lee refresh token desde secure storage
  -> POST /auth/refresh
  -> guarda nuevos tokens
  -> reintenta request original
```

Si ya hay un refresh en curso, las requests esperan en una cola hasta que exista un nuevo access token.

## Storage seguro

La persistencia sensible usa `src/core/storage/secure-storage.ts`, que abstrae `expo-secure-store`.

Claves usadas por auth y API client:

| Clave | Contenido |
|---|---|
| `auth.access_token` | Access token JWT |
| `auth.refresh_token` | Refresh token |
| `auth.user` | Usuario serializado |

## Datasources remotos

Los datasources remotos son la unica capa que debe conocer rutas HTTP concretas.

Ejemplos:

| Datasource | Endpoint base |
|---|---|
| `AuthRemoteDataSource` | `/auth` |
| `ProductsRemoteDataSource` | `/products` |
| `CartApiDataSource` | `/cart` |
| `OrdersRemoteDataSource` | `/orders` |
| `AddressesRemoteDataSource` | `/addresses` |
| `ProfileRemoteDataSource` | `/users/me` |
| `WishlistApiDataSource` | `/wishlist` |

## Mapeo de datos

Cuando la respuesta del backend no coincide con el shape de dominio mobile, se debe mapear en `data/models` o `data/repositories`, no en pantallas.

Ejemplo:

```
Backend ProductResponse
  -> mapProductResponse()
  -> Domain Product
  -> Zustand store
  -> UI
```

## Reglas de integracion

1. No crear nuevas instancias de Axios.
2. No llamar API directamente desde pantallas.
3. No guardar tokens desde componentes React.
4. Mantener rutas HTTP en datasources.
5. Mantener transformaciones de payload fuera de la UI.
6. Si el backend cambia DTOs o enums, actualizar entidades, modelos y payloads juntos.
