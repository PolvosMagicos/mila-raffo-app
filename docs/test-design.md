# Test Design

This document traces the React Native app test cases to the required business logic, isolation strategy, and oracle.

## Unit Suites

| Suite | Case IDs | Scope | Isolation | Oracle | Scenario types |
| --- | --- | --- | --- | --- | --- |
| `cart-calculations.test.ts` | `UC-CART-01` to `UC-CART-12` | Cart subtotals, totals, item count, quantity normalization, stock limits | Pure functions, no storage or network | Exact numeric totals, thrown validation errors, boolean stock decisions | Nominal, exceptional, boundary |
| `product-filters.test.ts` | `UC-PROD-01` to `UC-PROD-12` | Search normalization, category/color/price/availability filters, sorting, pagination | Pure functions over fixed in-memory product fixtures | Exact product id ordering and inclusion/exclusion | Nominal, exceptional, boundary |
| `checkout-rules.test.ts` | `UC-CHK-01` to `UC-CHK-13` | Shipping costs, checkout totals, step validation, order item payload, payment channel mapping | Pure functions over fixed cart/address fixtures | Exact error messages, payload objects, payment channel values | Nominal, exceptional, boundary |
| `order-totals.test.ts` | `UC-ORD-01` to `UC-ORD-14` | Order item totals, discounts, tax, shipping, cancellation, shipment status | Pure functions, no service dependencies | Exact totals, thrown validation errors, status decisions | Nominal, exceptional, boundary |

## Integration Suites

| Suite | Case IDs | Collaboration verified | Isolation | Oracle | Scenario types |
| --- | --- | --- | --- | --- | --- |
| `product-catalog.service.test.ts` | `IC-PROD-01` to `IC-PROD-06` | Catalog service + repository + local fallback filtering/sorting/pagination | Mocked repository, fixed fallback catalog, no HTTP | Primary repository calls, fallback product ids, deterministic fallback error | Nominal, fallback, exceptional |
| `cart.repository.flow.test.ts` | `IC-CART-01` to `IC-CART-03` | Cart repository + data source + cart calculations through add/update/remove/clear flow | In-memory data source, no API client, no storage | Exact cart totals/counts after each operation, propagated update error | Nominal, full flow, exceptional |

## Automation

- `npm test` runs all unit and integration suites with Jest.
- `npm run test:unit` runs only the four unit suites under `__tests__/unit`.
- `npm run test:coverage` runs the complete suite with coverage collection.
- `jest.setup.ts` mocks external Expo services so tests are hermetic.
- `jest.config.js` disables Watchman to avoid host-specific filesystem state.
