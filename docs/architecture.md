# Arquitectura del proyecto

## Resumen

La app usa **Clean Architecture** dividida en 3 capas por módulo. El objetivo es que el negocio (domain) no dependa de nada externo: ni de Axios, ni de Expo, ni de React. Eso permite reemplazar cualquier parte sin tocar la lógica de negocio.

```
src/
├── core/                   ← Infraestructura compartida (no es un módulo de negocio)
│   ├── config/env.ts       ← URL del backend (dev/prod)
│   ├── network/api-client.ts  ← Axios singleton con refresh de token automático
│   └── storage/secure-storage.ts  ← Abstracción sobre expo-secure-store
│
├── modules/                ← Un directorio por dominio de negocio
│   ├── auth/
│   ├── products/
│   ├── cart/
│   ├── orders/
│   ├── addresses/
│   └── profile/
│
├── shared/
│   ├── components/         ← Componentes UI reutilizables entre módulos
│   └── hooks/              ← Hooks genéricos
│
├── constants/
│   ├── theme.ts            ← Colores, tipografía, spacing, radius
│   └── fonts.ts            ← Objeto APP_FONTS para useFonts()
│
└── app/                    ← Expo Router (solo routing, sin lógica)
    ├── _layout.tsx         ← Root: carga fuentes, init auth, guard de redirect
    ├── (auth)/             ← Grupo para usuarios no autenticados
    └── (app)/              ← Grupo para usuarios autenticados
```

---

## Las 3 capas de un módulo

### 1. Domain (núcleo del negocio)

- No importa nada de React, Expo ni frameworks externos.
- Solo TypeScript puro.
- Contiene:
  - **Entities**: interfaces que definen los objetos de negocio.
  - **Repositories**: interfaces (contratos) que describen qué operaciones existen.
  - **Use cases**: clases con un único método `execute()` que orquestan la lógica.

```
domain/
├── entities/
│   └── product.entity.ts     ← interface Product { ... }
├── repositories/
│   └── products.repository.ts  ← interface ProductsRepository { getAll(): ... }
└── usecases/
    └── get-products.usecase.ts  ← class GetProductsUseCase { execute() }
```

### 2. Data (implementación concreta)

- Implementa las interfaces del domain.
- Aquí viven las llamadas a la API (Axios) y al almacenamiento local (SecureStore).
- El domain nunca importa de data; data importa del domain.

```
data/
├── datasources/
│   ├── products.remote.datasource.ts  ← Axios calls
│   └── (optional) products.local.datasource.ts  ← SecureStore / AsyncStorage
├── models/
│   └── product-response.model.ts  ← DTO del backend + función de mapeo
└── repositories/
    └── products.repository.impl.ts  ← implements ProductsRepository
```

### 3. Presentation (React + Zustand)

- Zustand store con estado y acciones.
- Las acciones llaman a los use cases (que vienen del `di.ts`).
- Las pantallas solo llaman al store, nunca a datasources directamente.

```
presentation/
└── store/
    └── products.store.ts  ← useProductsStore = create<...>(...)
```

---

## di.ts — Dependency Injection

Cada módulo tiene un `di.ts` que instancia todo y los conecta. Es el único lugar donde se construyen los objetos. El resultado es un objeto `const` singleton exportado.

```typescript
// src/modules/products/di.ts
const remote = new ProductsRemoteDataSource(apiClient);
const repo = new ProductsRepositoryImpl(remote);

export const productsModule = {
  productsRepository: repo,
  getProductsUseCase: new GetProductsUseCase(repo),
} as const;
```

Los stores importan de `di.ts`. Nada más importa de `di.ts` desde afuera del módulo.

---

## index.ts — API pública de cada módulo

Cada módulo expone solo lo necesario en su `index.ts`. **Nunca importes desde rutas internas de otro módulo.**

```typescript
// BIEN
import { useProductsStore } from '@/modules/products';

// MAL — rompe el encapsulamiento
import { ProductsRepositoryImpl } from '@/modules/products/data/repositories/products.repository.impl';
```

---

## Flujo de datos (ejemplo: cargar productos)

```
Pantalla (catalog.tsx)
  └─ useProductsStore((s) => s.fetchProducts)
       └─ productsModule.getProductsUseCase.execute()    [di.ts]
            └─ ProductsRepositoryImpl.getAll()           [data/repositories]
                 └─ ProductsRemoteDataSource.getAll()    [data/datasources]
                      └─ apiClient.get('/products')      [core/network]
                           └─ API NestJS backend
```

El resultado sube por la misma cadena: API → datasource → repository → use case → store → React re-render.

---

## Reglas que no se rompen

1. **Domain nunca importa de data ni de presentation.** Si necesitás algo del framework en el domain, abstraelo en una interfaz (como `AuthRepository`).
2. **Las pantallas no llaman a use cases ni datasources directamente.** Solo hablan con el store.
3. **Los stores no se comunican entre sí directamente.** Si cart necesita datos de products, cart tiene su propia copia (ya incluida en `CartItem.product`).
4. **Todo lo que se expone hacia afuera pasa por `index.ts`.** Si no está en el index, no se usa desde afuera.
5. **El `apiClient` singleton de `@/core/network/api-client` se usa en todos los módulos remotos.** No crear instancias adicionales de axios.
