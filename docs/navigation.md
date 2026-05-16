# Navegación — Expo Router

## Estructura de rutas

La app usa **expo-router** con file-based routing. Los grupos entre paréntesis `(auth)` y `(app)` son invisibles en la URL pero organizan el layout.

```
src/app/
├── _layout.tsx           ← Root layout (fuentes + auth guard)
│
├── (auth)/               ← Grupo: usuarios NO autenticados
│   ├── _layout.tsx       ← Stack sin header
│   ├── login.tsx         → ruta: /login (internamente /(auth)/login)
│   └── register.tsx      → ruta: /register
│
└── (app)/                ← Grupo: usuarios AUTENTICADOS
    ├── _layout.tsx       ← NativeTabs (barra de tabs)
    ├── index.tsx         → tab: Inicio
    ├── catalog.tsx       → tab: Catálogo
    ├── cart.tsx          → tab: Carrito
    ├── orders.tsx        → tab: Pedidos
    └── profile.tsx       → tab: Perfil
```

---

## Auth Guard

El root `_layout.tsx` maneja la protección automática de rutas:

```typescript
// src/app/_layout.tsx (simplificado)
useEffect(() => {
  if (!fontsLoaded || isLoading) return;

  const inAuthGroup = (segments[0] as string) === '(auth)';

  if (!isAuthenticated && !inAuthGroup) {
    router.replace('/(auth)/login' as never); // → redirige a login
  } else if (isAuthenticated && inAuthGroup) {
    router.replace('/(app)' as never);        // → redirige a home
  }
}, [isAuthenticated, isLoading, fontsLoaded]);
```

No necesitás proteger rutas manualmente. El guard se ejecuta en cada cambio de estado de autenticación.

---

## Agregar una pantalla nueva dentro de los tabs

Para agregar una pantalla que **aparece en la barra de tabs**:

1. Crear el archivo en `src/app/(app)/nueva-tab.tsx`
2. Agregar el trigger en `src/app/(app)/_layout.tsx`:

```typescript
<NativeTabs.Trigger name="nueva-tab">
  <NativeTabs.Trigger.Label>Nueva Tab</NativeTabs.Trigger.Label>
  <NativeTabs.Trigger.Icon
    src={require('@/assets/images/tabIcons/icono.png')}
    renderingMode="template"
  />
</NativeTabs.Trigger>
```

---

## Agregar una pantalla de detalle (no aparece en tabs)

Para pantallas como "detalle de producto", "detalle de pedido", etc., necesitás usar un Stack anidado dentro del grupo `(app)`.

1. Crear una subcarpeta:
```
src/app/(app)/catalog/
├── _layout.tsx    ← Stack para el subflujo
├── index.tsx      ← /catalog (lista)
└── [id].tsx       ← /catalog/abc-123 (detalle)
```

2. El `_layout.tsx` del subflujo:
```typescript
import { Stack } from 'expo-router';

export default function ProductLayout() {
  return <Stack screenOptions={{ headerShown: true, title: '' }} />;
}
```

3. Navegar desde cualquier pantalla:
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();
router.push(`/catalog/${product.id}`);
```

4. Recibir el parámetro en `[id].tsx`:
```typescript
import { useLocalSearchParams } from 'expo-router';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // ...
}
```

---

## Pantallas modales

Para modales (ej: selección de dirección en checkout):

```
src/app/(app)/
└── address-picker.tsx   ← modal
```

En el `_layout.tsx` de `(app)` o en la pantalla padre:
```typescript
router.push('/address-picker');
```

Para presentarlo como modal en iOS, configurarlo con:
```typescript
<Stack.Screen name="address-picker" options={{ presentation: 'modal' }} />
```

---

## Navegación entre grupos

Al hacer logout, el auth store limpia el estado. El guard del root `_layout.tsx` detecta que `isAuthenticated === false` y redirige automáticamente a `/(auth)/login`. No necesitás navegar manualmente al hacer logout.

---

## Íconos de tabs

Los íconos están en `src/assets/images/tabIcons/`. Usar siempre `renderingMode="template"` para que el sistema aplique el color seleccionado/no-seleccionado automáticamente.

Tamaño recomendado: 28x28px, PNG con fondo transparente.
