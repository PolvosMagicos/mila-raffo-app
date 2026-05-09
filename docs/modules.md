# Cómo agregar un nuevo módulo

Esta guía crea el módulo `reviews` (reseñas de productos) como ejemplo completo. Seguí los mismos pasos para cualquier módulo nuevo.

---

## Paso 1 — Crear la estructura de carpetas

```bash
mkdir -p src/modules/reviews/domain/entities
mkdir -p src/modules/reviews/domain/repositories
mkdir -p src/modules/reviews/domain/usecases
mkdir -p src/modules/reviews/data/models
mkdir -p src/modules/reviews/data/datasources
mkdir -p src/modules/reviews/data/repositories
mkdir -p src/modules/reviews/presentation/store
```

---

## Paso 2 — Domain: entidades

`src/modules/reviews/domain/entities/review.entity.ts`

```typescript
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;       // 1-5
  comment: string;
  createdAt: string;
}

export interface CreateReviewInput {
  productId: string;
  rating: number;
  comment: string;
}
```

---

## Paso 3 — Domain: interfaz del repositorio

`src/modules/reviews/domain/repositories/reviews.repository.ts`

```typescript
import type { Review, CreateReviewInput } from '../entities/review.entity';

export interface ReviewsRepository {
  getByProduct(productId: string): Promise<Review[]>;
  create(input: CreateReviewInput): Promise<Review>;
}
```

---

## Paso 4 — Domain: use cases (uno por operación)

`src/modules/reviews/domain/usecases/get-reviews.usecase.ts`

```typescript
import type { ReviewsRepository } from '../repositories/reviews.repository';
import type { Review } from '../entities/review.entity';

export class GetReviewsUseCase {
  constructor(private readonly repository: ReviewsRepository) {}

  execute(productId: string): Promise<Review[]> {
    return this.repository.getByProduct(productId);
  }
}
```

`src/modules/reviews/domain/usecases/create-review.usecase.ts`

```typescript
import type { ReviewsRepository } from '../repositories/reviews.repository';
import type { Review, CreateReviewInput } from '../entities/review.entity';

export class CreateReviewUseCase {
  constructor(private readonly repository: ReviewsRepository) {}

  execute(input: CreateReviewInput): Promise<Review> {
    return this.repository.create(input);
  }
}
```

---

## Paso 5 — Data: datasource remoto

`src/modules/reviews/data/datasources/reviews.remote.datasource.ts`

```typescript
import type { AxiosInstance } from 'axios';
import type { Review, CreateReviewInput } from '../../domain/entities/review.entity';

export class ReviewsRemoteDataSource {
  constructor(private readonly http: AxiosInstance) {}

  getByProduct(productId: string): Promise<{ data: Review[] }> {
    return this.http.get(`/products/${productId}/reviews`);
  }

  create(input: CreateReviewInput): Promise<{ data: Review }> {
    return this.http.post('/reviews', input);
  }
}
```

---

## Paso 6 — Data: repository implementation

`src/modules/reviews/data/repositories/reviews.repository.impl.ts`

```typescript
import type { ReviewsRepository } from '../../domain/repositories/reviews.repository';
import type { Review, CreateReviewInput } from '../../domain/entities/review.entity';
import type { ReviewsRemoteDataSource } from '../datasources/reviews.remote.datasource';

export class ReviewsRepositoryImpl implements ReviewsRepository {
  constructor(private readonly remote: ReviewsRemoteDataSource) {}

  async getByProduct(productId: string): Promise<Review[]> {
    const { data } = await this.remote.getByProduct(productId);
    return data;
  }

  async create(input: CreateReviewInput): Promise<Review> {
    const { data } = await this.remote.create(input);
    return data;
  }
}
```

---

## Paso 7 — Presentation: Zustand store

`src/modules/reviews/presentation/store/reviews.store.ts`

```typescript
import { create } from 'zustand';
import type { Review, CreateReviewInput } from '../../domain/entities/review.entity';
import { reviewsModule } from '../../di';

interface ReviewsState {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
}

interface ReviewsActions {
  fetchReviews: (productId: string) => Promise<void>;
  createReview: (input: CreateReviewInput) => Promise<void>;
  clearError: () => void;
}

export const useReviewsStore = create<ReviewsState & ReviewsActions>((set) => ({
  reviews: [],
  isLoading: false,
  error: null,

  fetchReviews: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const reviews = await reviewsModule.getReviewsUseCase.execute(productId);
      set({ reviews });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error loading reviews' });
    } finally {
      set({ isLoading: false });
    }
  },

  createReview: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const review = await reviewsModule.createReviewUseCase.execute(input);
      set((s) => ({ reviews: [review, ...s.reviews] }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error creating review' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
```

---

## Paso 8 — di.ts (wiring de dependencias)

`src/modules/reviews/di.ts`

```typescript
import { apiClient } from '@/core/network/api-client';
import { ReviewsRemoteDataSource } from './data/datasources/reviews.remote.datasource';
import { ReviewsRepositoryImpl } from './data/repositories/reviews.repository.impl';
import { GetReviewsUseCase } from './domain/usecases/get-reviews.usecase';
import { CreateReviewUseCase } from './domain/usecases/create-review.usecase';

const remote = new ReviewsRemoteDataSource(apiClient);
const reviewsRepository = new ReviewsRepositoryImpl(remote);

export const reviewsModule = {
  reviewsRepository,
  getReviewsUseCase: new GetReviewsUseCase(reviewsRepository),
  createReviewUseCase: new CreateReviewUseCase(reviewsRepository),
} as const;
```

---

## Paso 9 — index.ts (API pública)

`src/modules/reviews/index.ts`

```typescript
export { useReviewsStore } from './presentation/store/reviews.store';
export type { Review, CreateReviewInput } from './domain/entities/review.entity';
```

---

## Paso 10 — Usar en una pantalla

```typescript
// src/app/(app)/product/[id].tsx
import { useReviewsStore } from '@/modules/reviews';

export default function ProductDetailScreen() {
  const { reviews, isLoading, fetchReviews } = useReviewsStore((s) => ({
    reviews: s.reviews,
    isLoading: s.isLoading,
    fetchReviews: s.fetchReviews,
  }));

  useEffect(() => {
    fetchReviews(productId);
  }, [productId]);

  // ...
}
```

---

## Módulos existentes como referencia

| Módulo | Datasource | Notas |
|--------|-----------|-------|
| `auth` | Remote + Local (SecureStore) | Maneja tokens; usar `apiClient` de su `index.ts` |
| `products` | Remote | Paginado con `ProductsFilters` |
| `cart` | Local (SecureStore) | Sin backend; persiste en dispositivo |
| `orders` | Remote | Crea pedidos desde el carrito |
| `addresses` | Remote | CRUD + setDefault |
| `profile` | Remote | Endpoint `/users/me` |

---

## Módulo con datasource local (sin backend)

Si el módulo no tiene backend (ej: favoritos guardados localmente):

1. Omití el `remote.datasource.ts` y el `models/` folder.
2. En `di.ts` no importes `apiClient`.
3. El datasource local usa `secureStorage` de `@/core/storage/secure-storage`.

Ver `src/modules/cart/data/datasources/cart.local.datasource.ts` como referencia.
