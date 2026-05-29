# 02 - Arquitectura

---

## Resumen

La app usa una variante de **Clean Architecture por modulo**. Cada dominio mantiene sus entidades, contratos, casos de uso, implementaciones de datos, stores y wiring de dependencias.

```
src/
|-- app/                    # Expo Router: rutas y layouts
|-- components/             # Componentes compartidos existentes
|-- constants/              # Tema, fuentes y tokens visuales
|-- core/                   # Config, red, storage y utilidades base
|-- hooks/                  # Hooks compartidos
`-- modules/                # Dominios funcionales
    |-- addresses/
    |-- auth/
    |-- cart/
    |-- orders/
    |-- products/
    |-- profile/
    `-- wishlist/
```

## Capas por modulo

Cada modulo sigue esta forma:

```
src/modules/<module>/
|-- data/
|   |-- datasources/
|   |-- models/
|   `-- repositories/
|-- domain/
|   |-- entities/
|   |-- repositories/
|   `-- usecases/
|-- presentation/
|   `-- store/
|-- di.ts
`-- index.ts
```

## Domain

La capa `domain` define el contrato de negocio con TypeScript puro:

- `entities`: tipos de negocio que usa la app.
- `repositories`: interfaces que describen operaciones.
- `usecases`: clases con un metodo `execute()`.

El domain no debe importar React, Expo, Axios, SecureStore ni archivos de `data` o `presentation`.

## Data

La capa `data` implementa el contrato del domain:

- Datasources remotos llaman al backend con `apiClient`.
- Datasources locales encapsulan storage.
- Models traducen respuestas del backend cuando el shape no coincide con el dominio.
- Repositories implementan interfaces del domain.

## Presentation

La capa `presentation` contiene stores Zustand. Las pantallas no llaman datasources ni use cases directamente; consumen acciones y estado desde stores.

## Dependency Injection

Cada modulo tiene un `di.ts` que instancia dependencias y exporta un singleton:

```typescript
const remoteDataSource = new ProductsRemoteDataSource(apiClient);
const productsRepository = new ProductsRepositoryImpl(remoteDataSource);

export const productsModule = {
  productsRepository,
  getProductsUseCase: new GetProductsUseCase(productsRepository),
  getProductDetailUseCase: new GetProductDetailUseCase(productsRepository),
} as const;
```

## API publica del modulo

Cada modulo expone su API desde `index.ts`. Desde otros modulos o pantallas, importar desde el modulo publico:

```typescript
import { useProductsStore } from '@/modules/products';
```

Evitar imports a rutas internas de otro modulo:

```typescript
import { ProductsRepositoryImpl } from '@/modules/products/data/repositories/products.repository.impl';
```

## Flujo de datos

Ejemplo de catalogo:

```
src/app/(app)/catalog/index.tsx
  -> useProductsStore.fetchProducts()
  -> productsModule.getProductsUseCase.execute()
  -> ProductsRepositoryImpl.getAll()
  -> ProductsRemoteDataSource.getAll()
  -> apiClient.get('/products')
  -> Backend NestJS
```

La respuesta vuelve por el mismo camino hasta Zustand, y React Native renderiza la pantalla.

## Responsabilidades compartidas

| Carpeta | Responsabilidad |
|---|---|
| `src/core/config/env.ts` | URL base del backend |
| `src/core/network/api-client.ts` | Axios singleton, Bearer token y refresh |
| `src/core/storage/secure-storage.ts` | Abstraccion de secure storage |
| `src/constants/theme.ts` | Tokens visuales |
| `src/constants/fonts.ts` | Carga de fuentes |
| `src/app/_layout.tsx` | Inicializacion global de auth y fuentes |
