# 06 - Estado y UI

---

## Estado global

La app usa Zustand por modulo. Cada store combina:

- Estado del modulo.
- Flags de carga.
- Error actual.
- Acciones asincronas.

Ejemplo de shape:

```typescript
interface ProductsState {
  products: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
}
```

## Regla de selectors

Con React 19, evitar selectors que devuelven objetos nuevos.

Correcto:

```typescript
const products = useProductsStore((s) => s.products);
const fetchProducts = useProductsStore((s) => s.fetchProducts);
```

Evitar:

```typescript
const { products, fetchProducts } = useProductsStore((s) => ({
  products: s.products,
  fetchProducts: s.fetchProducts,
}));
```

## Estados de pantalla

Las pantallas deben leer del store:

- `isLoading` para loaders.
- `error` para estados de error.
- Acciones como `fetchProducts`, `addItem`, `createOrder`.

Las pantallas no deben:

- Instanciar repositorios.
- Llamar datasources.
- Crear clientes HTTP.
- Duplicar reglas de negocio del use case.

## Tema visual

Los tokens viven en `src/constants/theme.ts`:

| Token | Uso |
|---|---|
| `Colors` | Colores por light/dark mode |
| `Palette` | Colores estaticos |
| `FontFamily` | Familias tipograficas |
| `FontSize` | Escala de texto |
| `Spacing` | Espaciado |
| `Radius` | Bordes |

Fuentes cargadas:

- Raleway: texto, formularios y navegacion.
- Cormorant: marca y titulos editoriales.
- Bitter: precios y datos destacados.

## Layout principal

El tab bar vive en `src/app/(app)/_layout.tsx`.

Caracteristicas:

- Tabs para home, catalogo, carrito, pedidos y perfil.
- Boton central de carrito con logo.
- Wishlist registrada pero oculta del tab bar (`href: null`).
- Colores adaptados al color scheme.

## Catalogo

La pantalla `src/app/(app)/catalog/index.tsx` concentra:

- Listado de productos.
- Busqueda submit-only.
- Filtros plegables.
- Derivacion de categorias desde productos cargados.
- Navegacion a `/catalog/:id`.

El detalle vive en `src/app/(app)/catalog/[id].tsx`.

## Convenciones UI

1. Usar `StyleSheet.create`.
2. Usar tokens del tema en vez de colores hardcodeados.
3. Mantener formularios y acciones conectados a stores.
4. Usar `accessibilityRole` y estados de accesibilidad cuando corresponde.
5. Mantener textos de error y loading cerca de la pantalla que los muestra, pero el error base debe venir del store.
