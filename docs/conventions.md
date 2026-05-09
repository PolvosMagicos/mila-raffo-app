# Convenciones del proyecto

---

## Nombres de archivos

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Entidad | `nombre.entity.ts` | `product.entity.ts` |
| Repositorio (interfaz) | `nombre.repository.ts` | `products.repository.ts` |
| Repositorio (impl) | `nombre.repository.impl.ts` | `products.repository.impl.ts` |
| Use case | `verbo-sustantivo.usecase.ts` | `get-products.usecase.ts` |
| Datasource remoto | `nombre.remote.datasource.ts` | `products.remote.datasource.ts` |
| Datasource local | `nombre.local.datasource.ts` | `cart.local.datasource.ts` |
| Modelo de API | `nombre-response.model.ts` | `auth-response.model.ts` |
| Store | `nombre.store.ts` | `products.store.ts` |
| DI wiring | `di.ts` | `di.ts` |
| API pública | `index.ts` | `index.ts` |
| Screen (expo-router) | `nombre.tsx` en minúsculas con guiones | `catalog.tsx`, `[id].tsx` |
| Componente UI | `PascalCase.tsx` | `ProductCard.tsx` |
| Hook | `use-nombre.ts` | `use-theme.ts` |

---

## TypeScript

El proyecto usa `strict: true`. Algunas reglas específicas:

### Tipos de dominio: siempre interfaces, nunca clases

```typescript
// BIEN
export interface Product { id: string; name: string; }

// MAL — las entidades de dominio son datos, no objetos con comportamiento
export class Product { constructor(public id: string) {} }
```

### Use cases: siempre clases con un solo método `execute`

```typescript
// BIEN
export class GetProductsUseCase {
  constructor(private readonly repository: ProductsRepository) {}
  execute(filters?: ProductsFilters): Promise<PaginatedProducts> {
    return this.repository.getAll(filters);
  }
}
```

### Importar tipos con `import type`

Cuando solo usás el tipo (no el valor en runtime), usar `import type`:

```typescript
import type { Product } from '@/modules/products';
import type { AxiosInstance } from 'axios';
```

### No usar `any`. Alternativas:

```typescript
// En vez de any para errores:
catch (err) {
  const message = err instanceof Error ? err.message : 'Error desconocido';
}

// En vez de any para tipos de expo-router temporales:
router.replace('/ruta' as never);
```

---

## Stores Zustand

### Patrón obligatorio de selector

**Regla crítica (React 19):** nunca usar selector de objeto. React 19 llama a `getSnapshot` de `useSyncExternalStore` y espera que el resultado sea referencialmente estable. Un selector `(s) => ({ a, b })` crea un objeto nuevo en cada llamada → React detecta cambio → re-render → loop infinito.

```typescript
// BIEN — un selector por valor (primitivos y funciones son referencialmente estables)
const items = useProductsStore((s) => s.items);
const isLoading = useProductsStore((s) => s.isLoading);
const fetchProducts = useProductsStore((s) => s.fetchProducts);

// MAL — crea un objeto nuevo en cada llamada a getSnapshot → loop en React 19
const { items, isLoading } = useProductsStore((s) => ({
  items: s.items,
  isLoading: s.isLoading,
}));

// TAMBIÉN MAL — todas las keys del store en un solo desestructurado
const store = useProductsStore();
```

### Estado inicial como constante

```typescript
const initialState = { items: [], isLoading: false, error: null };

export const useProductsStore = create<...>((set) => ({
  ...initialState,
  // acciones...
  reset: () => set(initialState),
}));
```

### Acceso imperativo (fuera de React)

Para acceder al store fuera de componentes (ej: en otros servicios):

```typescript
// En el store
export const productsStore = {
  getState: () => useProductsStore.getState(),
};

// En otro archivo
import { productsStore } from '@/modules/products';
const items = productsStore.getState().items;
```

---

## Pantallas (screens)

### Una pantalla = un componente default export

```typescript
export default function CatalogScreen() {
  // ...
}
```

### Sin lógica de negocio en pantallas

La pantalla solo:
1. Lee del store.
2. Llama acciones del store.
3. Renderiza UI.

```typescript
// BIEN
export default function CatalogScreen() {
  const { items, fetchProducts } = useProductsStore((s) => ({
    items: s.items,
    fetchProducts: s.fetchProducts,
  }));

  useEffect(() => { fetchProducts(); }, []);
  return <ProductGrid items={items} />;
}

// MAL — lógica de negocio en la pantalla
export default function CatalogScreen() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    axios.get('/products').then(r => setProducts(r.data)); // ← NO
  }, []);
}
```

---

## Imports

### Orden de imports (linter enforces this)

1. React y React Native
2. Librerías externas (expo, zustand, axios)
3. Imports absolutos del proyecto (`@/...`)
4. Imports relativos (`./...`, `../...`)

### Usar siempre el alias `@/`

```typescript
// BIEN
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/modules/auth';

// MAL
import { Colors } from '../../../constants/theme';
```

---

## API Client

Nunca crear una instancia nueva de axios. Siempre usar el singleton:

```typescript
import { apiClient } from '@/modules/auth'; // o desde @/core/network/api-client
```

El `apiClient` ya maneja:
- Attachment del Bearer token en cada request
- Refresh automático del token ante 401
- Timeout de 15 segundos

---

## Manejo de errores

En stores: capturar, guardar en `error: string | null`, no silenciar:

```typescript
try {
  const data = await useCase.execute(params);
  set({ data });
} catch (err) {
  set({ error: err instanceof Error ? err.message : 'Error' });
  throw err; // re-throw si la pantalla necesita reaccionar
} finally {
  set({ isLoading: false });
}
```

En pantallas: mostrar `error` del store con un componente de error/toast, y ofrecer `clearError()` al cerrar.

---

## Estilos

- Siempre `StyleSheet.create({})`, nunca estilos inline en JSX.
- Colores de `Colors.*`, tamaños de `FontSize.*`, fuentes de `FontFamily.*`, espaciado de `Spacing.*`.
- No hardcodear valores de color, tamaño o fuente.

```typescript
// BIEN
const styles = StyleSheet.create({
  title: {
    fontFamily: FontFamily.editorialBold,
    fontSize: FontSize['2xl'],
    color: Colors.light.foreground,
  },
});

// MAL
<Text style={{ fontFamily: 'Cormorant_700Bold', fontSize: 30, color: '#111827' }}>
```
