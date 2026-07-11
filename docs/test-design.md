# Diseno de Pruebas

Este documento traza los casos de prueba de la app React Native a la logica de negocio cubierta, la estrategia de aislamiento y el oraculo esperado. Las pruebas son deterministicas y hermeticas: no dependen de backend, red, almacenamiento real, emulador ni estado del sistema.

## Configuracion

La configuracion de Jest esta en `jest.config.js`:

- `preset: 'ts-jest'` para ejecutar pruebas TypeScript.
- `testEnvironment: 'node'` para mantener las pruebas fuera del runtime de React Native.
- `watchman: false` para evitar fallas por estado local de Watchman.
- `moduleNameMapper` para resolver imports `@/`.
- `testMatch` limitado a `src/**/__tests__/**/*.test.ts`.

El setup global esta en `jest.setup.ts` y mockea servicios externos:

- `expo-secure-store`
- `expo-constants`
- `expo-router`
- `expo-location`

## Suites Unitarias

| Suite | IDs de caso | Alcance | Aislamiento | Oraculo | Tipos de escenario |
| --- | --- | --- | --- | --- | --- |
| `cart-calculations.test.ts` | `UC-CART-01` a `UC-CART-12` | Subtotales, total del carrito, conteo de items, normalizacion de cantidades, limites por stock | Funciones puras, sin storage ni red | Totales numericos exactos, errores esperados, decisiones booleanas de stock | Nominales, excepcionales, borde |
| `product-filters.test.ts` | `UC-PROD-01` a `UC-PROD-12` | Normalizacion de busqueda, filtros por categoria/color/precio/disponibilidad, ordenamiento, paginacion | Funciones puras sobre fixtures fijos en memoria | Orden exacto de ids, inclusion y exclusion de productos | Nominales, excepcionales, borde |
| `checkout-rules.test.ts` | `UC-CHK-01` a `UC-CHK-13` | Costos de envio, total de checkout, validacion por paso, payload de pedido, mapeo de metodo de pago | Funciones puras sobre fixtures fijos de carrito y direccion | Mensajes exactos de error, payloads y canales de pago | Nominales, excepcionales, borde |
| `order-totals.test.ts` | `UC-ORD-01` a `UC-ORD-14` | Totales de item, descuentos, impuestos, envio, cancelacion, estado de envio | Funciones puras, sin dependencias de servicios | Totales exactos, errores esperados, decisiones de estado | Nominales, excepcionales, borde |

## Suites de Integracion

| Suite | IDs de caso | Colaboracion verificada | Aislamiento | Oraculo | Tipos de escenario |
| --- | --- | --- | --- | --- | --- |
| `product-catalog.service.test.ts` | `IC-PROD-01` a `IC-PROD-06` | Servicio de catalogo + repository + fallback local con filtros, ordenamiento y paginacion | Repository mockeado, catalogo fallback fijo, sin HTTP | Llamadas al repository primario, ids del fallback, error deterministico cuando no hay producto | Nominales, fallback, excepcionales |
| `cart.repository.flow.test.ts` | `IC-CART-01` a `IC-CART-03` | Repository de carrito + datasource en memoria + calculos de carrito durante add/update/remove/clear | Datasource en memoria, sin API client ni storage | Totales y conteos exactos despues de cada operacion, error propagado | Nominales, flujo completo, excepcionales |

## Resultados Verificados

| Comando | Resultado |
|---|---|
| `npm run test:unit` | 4 suites unitarias pasaron, 51 tests pasaron |
| `npm test` | 6 suites pasaron, 60 tests pasaron |
| `npm run test:coverage` | 6 suites pasaron, 60 tests pasaron y se genero reporte de cobertura |
| `npm run lint` | Paso sin errores |
| `npx tsc --noEmit` | Paso sin errores |

## Automatizacion

- `npm test` ejecuta todas las suites unitarias y de integracion con Jest.
- `npm run test:unit` ejecuta solo las cuatro suites unitarias bajo `__tests__/unit`.
- `npm run test:coverage` ejecuta la suite completa con recoleccion de cobertura.
- `coverage/` esta ignorado en Git porque es salida generada por Jest.
- Los mocks de `jest.setup.ts` evitan dependencias externas y hacen que los tests sean repetibles en CI o en maquinas locales.

## Trazabilidad por Requisito

| Requisito | Evidencia |
|---|---|
| Al menos 4 suites unitarias con 40+ tests | 4 suites unitarias, 51 tests unitarios |
| Logica de negocio cubierta | Calculos, validaciones, filtros, totales, estados y payloads |
| Tests deterministicos y hermeticos | Fixtures en memoria, funciones puras, mocks de Expo, sin red |
| Al menos 2 suites de integracion | 2 suites de integracion, 9 tests |
| Colaboracion entre modulos | Catalogo con repository/fallback y carrito con repository/datasource/calculos |
| Casos con trazabilidad, aislamiento y oraculo | IDs `UC-*` e `IC-*`, tablas de aislamiento y oraculo en este documento |
| Scripts npm | `test`, `test:unit`, `test:coverage` |
