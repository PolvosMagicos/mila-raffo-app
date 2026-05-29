# 08 - Riesgos y Recomendaciones

---

## Riesgos actuales

| Riesgo | Impacto | Recomendacion |
|---|---|---|
| `PROD_API_URL` vacio | Builds productivos no tendran backend valido | Definir estrategia de variables por ambiente |
| No hay tests automatizados | Cambios en stores, mapping o navegacion pueden romperse sin aviso | Agregar tests enfocados para mappers, stores y casos criticos |
| Lockfiles de npm y bun conviven | Puede generar instalaciones no reproducibles | Elegir gestor oficial o documentar cuando usar cada uno |
| Categorias derivadas desde productos cargados | Filtros pueden quedar incompletos si la pagina actual no incluye todas las categorias | Crear modulo/endpoint de categorias si el backend lo expone |
| Carrito local no participa del flujo activo | Puede confundir sobre soporte offline | Documentar como fallback futuro o eliminar si no se usara |
| Wishlist no visible en tabs | Funcionalidad puede quedar dificil de descubrir | Definir entrada explicita en perfil, catalogo o detalle |
| Refresh token en interceptor no notifica store | Si refresh falla, storage se limpia pero la UI depende del siguiente cambio de estado | Evaluar integracion explicita con auth store ante refresh failure |

## Riesgos de integracion con backend

### Productos

El frontend depende de que `/products` soporte los filtros actuales y devuelva paginacion compatible con `PaginatedProductsResponse`.

Si cambia el DTO, revisar:

- `src/modules/products/domain/repositories/products.repository.ts`
- `src/modules/products/data/datasources/products.remote.datasource.ts`
- `src/modules/products/data/models/product-response.model.ts`
- `src/modules/products/presentation/store/products.store.ts`
- `src/app/(app)/catalog/index.tsx`

### Carrito

El carrito usa `variantId` como unidad de compra. Si el backend cambia a producto, SKU u otro identificador, actualizar entidades y payloads juntos.

### Ordenes

La app espera estados de orden en minusculas:

- `pending`
- `confirmed`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

Si el backend expone enums diferentes, el mapping debe vivir fuera de la UI.

## Mejoras priorizadas

1. Definir configuracion de ambientes para desarrollo, staging y produccion.
2. Agregar tests de mapping para productos, carrito y ordenes.
3. Agregar tests de stores para auth refresh, carrito y creacion de pedido.
4. Crear documentacion de onboarding con requisitos de Android/iOS si el equipo lo necesita.
5. Definir un flujo visible para wishlist.
6. Revisar soporte offline o eliminar datasources locales no usados.
7. Mantener documentacion sincronizada con los endpoints reales del backend.

## Regla de mantenimiento

Cada cambio que toque contratos con backend debe actualizar documentacion y tipos en el mismo PR. La fuente de verdad del contrato sigue siendo el backend, pero la app debe reflejarlo de forma explicita en sus entidades, datasources y docs.
