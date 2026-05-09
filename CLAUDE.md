# mila-raffo-app — Instrucciones para IA y desarrolladores

App mobile de ecommerce para **Mila Raffo** (marca de indumentaria). Construida con Expo SDK 55, expo-router, React 19, TypeScript strict y Zustand.

---

## Stack

| Herramienta | Uso |
|-------------|-----|
| Expo SDK 55 + expo-router | Framework + routing file-based |
| React Native 0.83 | UI nativa |
| TypeScript strict | Tipado estricto en todo el proyecto |
| Zustand | State management (singletons por módulo) |
| Axios | HTTP client (singleton en `src/core/network/api-client.ts`) |
| expo-secure-store | Almacenamiento seguro de tokens |
| Google Fonts (Raleway, Cormorant, Bitter) | Tipografía de marca |

**Backend**: NestJS en `http://localhost:3000` (dev). Ver `src/core/config/env.ts`.

---

## Arquitectura

El proyecto usa **Clean Architecture** con módulos independientes. Leer `docs/architecture.md` antes de cualquier tarea.

### Módulos existentes

```
src/modules/
├── auth/       ← autenticación, tokens, sesión
├── products/   ← catálogo de productos
├── cart/       ← carrito (almacenamiento local)
├── orders/     ← pedidos del usuario
├── addresses/  ← direcciones de entrega
└── profile/    ← perfil del usuario
```

Cada módulo tiene: `domain/` → `data/` → `presentation/store/` → `di.ts` → `index.ts`.

### Regla de imports más importante

Importar SIEMPRE desde el `index.ts` del módulo, nunca desde rutas internas:

```typescript
// BIEN
import { useProductsStore } from '@/modules/products';

// MAL
import { ProductsRepositoryImpl } from '@/modules/products/data/repositories/products.repository.impl';
```

---

## Comandos útiles

```bash
npm start          # Expo dev server
npm run ios        # iOS simulator
npm run android    # Android emulator
npx tsc --noEmit   # Type check (el error de animated-icon.module.css es pre-existente, ignorarlo)
```

---

## Tareas comunes — cómo hacerlas

### Agregar un módulo nuevo

Seguir el tutorial completo en `docs/modules.md`. Los pasos son siempre los mismos: entity → repository (interfaz) → usecases → datasource → repository.impl → store → di.ts → index.ts.

### Agregar una pantalla nueva

- **Tab nuevo**: crear `src/app/(app)/nombre.tsx` + agregar trigger en `src/app/(app)/_layout.tsx`.
- **Pantalla de detalle**: crear subcarpeta con Stack propio. Ver `docs/navigation.md`.
- **Modal**: crear `.tsx` en `(app)/` y navegar con `presentation: 'modal'`.

### Usar colores o tipografía

Siempre importar de `@/constants/theme`:
```typescript
import { Colors, FontFamily, FontSize, Spacing, Radius } from '@/constants/theme';
```
Ver `docs/theme.md` para el catálogo completo.

### Hacer llamadas autenticadas a la API

Usar el `apiClient` singleton. El token se adjunta automáticamente. Si devuelve 401, intenta refresh solo:
```typescript
import { apiClient } from '@/modules/auth';
const { data } = await apiClient.get('/endpoint');
```

### Proteger un endpoint que necesita auth

No hace falta hacer nada especial. Todo lo que esté en el grupo `(app)/` ya está protegido por el auth guard del root `_layout.tsx`.

### Leer el estado de autenticación

```typescript
import { useAuthStore, authStore } from '@/modules/auth';

// En componentes React:
const { user, isAuthenticated } = useAuthStore((s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }));

// Fuera de React (ej: en un datasource):
const isAuth = authStore.isAuthenticated();
const tokens = authStore.getTokens();
```

### Acceder al carrito desde otro módulo

```typescript
import { cartStore } from '@/modules/cart';
const count = cartStore.getItemCount();
```

---

## Regla crítica de Zustand con React 19

**Nunca usar selector de objeto en los stores.** React 19 requiere que el resultado de `getSnapshot` sea referencialmente estable. Un objeto `{}` nunca lo es → loop infinito.

```typescript
// CORRECTO — un selector por valor
const login = useAuthStore((s) => s.login);
const isLoading = useAuthStore((s) => s.isLoading);

// INCORRECTO — rompe en React 19
const { login, isLoading } = useAuthStore((s) => ({ login: s.login, isLoading: s.isLoading }));
```

---

## Lo que NO hacer

- **No crear instancias de axios.** Usar siempre `apiClient` de `@/core/network/api-client`.
- **No hardcodear colores, tamaños ni fuentes.** Usar `Colors`, `FontSize`, `FontFamily`, `Spacing`.
- **No poner lógica de negocio en pantallas.** La pantalla solo lee del store y llama acciones.
- **No importar desde rutas internas de otros módulos.**
- **No usar `any`.** Si necesitás escapar del tipado de expo-router usar `as never`.
- **No modificar el `di.ts` de un módulo para inyectar dependencias de otro módulo.** Si dos módulos se necesitan, coordinarlo en la pantalla/store que los usa.
- **No romper la regla de capas**: domain no importa de data, data no importa de presentation.

---

## Diseño y marca

- Color de acento principal: `#EC7C43` (naranja Mila Raffo).
- Fuente editorial: Cormorant (títulos, marca).
- Fuente de cuerpo: Raleway (texto corriente).
- Fuente de datos: Bitter (precios, números).
- El tema está sincronizado con `mila-raffo-ecommerce-front/src/app/globals.css`. Si cambia un token ahí, actualizarlo también en `src/constants/theme.ts`.

---

## Documentación interna

| Archivo | Contenido |
|---------|-----------|
| `docs/architecture.md` | Explicación de capas, reglas, flujo de datos |
| `docs/modules.md` | Tutorial paso a paso para crear un módulo nuevo |
| `docs/theme.md` | Colores, tipografía, spacing, radius con ejemplos |
| `docs/navigation.md` | Estructura de rutas, auth guard, cómo agregar pantallas |
| `docs/conventions.md` | Nombres de archivos, TypeScript, imports, estilos |
