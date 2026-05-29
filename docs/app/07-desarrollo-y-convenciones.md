# 07 - Desarrollo y Convenciones

---

## Comandos

| Comando | Uso |
|---|---|
| `npm install` | Instalar dependencias |
| `npm run start` | Iniciar Expo |
| `npm run android` | Abrir Android |
| `npm run ios` | Abrir iOS |
| `npm run web` | Abrir web |
| `npm run pixel` | Android local con adb reverse y cache clean |
| `npm run lint` | Ejecutar lint de Expo |

Tambien existe `bun.lock`; si el equipo usa Bun, mantener consistencia con el gestor elegido para evitar churn de lockfiles.

## TypeScript

El proyecto usa `strict: true`. Reglas recomendadas:

- Usar `interface` para entidades de dominio.
- Usar `import type` cuando el import solo es de tipos.
- Evitar `any`.
- Mantener DTOs y entidades tipados desde el borde de red.

## Imports

Usar alias `@/`:

```typescript
import { apiClient } from '@/core/network/api-client';
import { useAuthStore } from '@/modules/auth';
```

Evitar rutas relativas largas:

```typescript
import { useAuthStore } from '../../../modules/auth';
```

## Nombres de archivo

| Tipo | Patron |
|---|---|
| Entidad | `name.entity.ts` |
| Repository interface | `name.repository.ts` |
| Repository implementation | `name.repository.impl.ts` |
| Use case | `verb-name.usecase.ts` |
| Remote datasource | `name.remote.datasource.ts` |
| Local datasource | `name.local.datasource.ts` |
| API model | `name-response.model.ts` |
| Store | `name.store.ts` |
| DI | `di.ts` |
| Public API | `index.ts` |

## Como agregar un modulo

1. Crear carpetas `domain`, `data`, `presentation`.
2. Definir entidades de dominio.
3. Definir interfaz de repository.
4. Crear use cases.
5. Crear datasource remoto/local.
6. Implementar repository.
7. Crear store Zustand.
8. Conectar dependencias en `di.ts`.
9. Exportar solo lo necesario en `index.ts`.
10. Crear pantalla en `src/app` si el modulo tiene UI.

La guia extendida esta en `docs/modules.md`.

## Como agregar una pantalla

1. Identificar si pertenece a auth, app principal o subflujo.
2. Crear archivo en `src/app`.
3. Consumir stores del modulo.
4. Evitar llamadas directas a API.
5. Registrar tab o stack si corresponde.

## Validacion antes de entregar cambios

Para cambios de codigo:

```bash
npm run lint
```

Para cambios de documentacion pura, no es necesario ejecutar Expo ni levantar backend, pero si conviene revisar links y paths.

## Limite de documentacion

Esta documentacion describe el estado actual del repo mobile. Si el backend cambia contratos, actualizar esta documentacion junto con:

- Entidades de dominio.
- Modelos de data.
- Datasources.
- Stores afectados.
- Pantallas que renderizan esos datos.
