# Sistema de diseño — Tema

El tema está definido en `src/constants/theme.ts` y sincronizado con los CSS custom properties del proyecto ecommerce (`mila-raffo-ecommerce-front/src/app/globals.css`). Si cambia un color en el web, cambiarlo acá también.

---

## Colores

```typescript
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from 'react-native';

const scheme = useColorScheme() ?? 'light';
const colors = Colors[scheme];

// Tokens disponibles:
colors.background     // #ffffff / #09090b
colors.foreground     // #111827 / #f4f4f5
colors.muted          // #6b7280 / #9ca3af
colors.border         // #e5e7eb / #27272a
colors.accent         // #EC7C43 (igual en ambos modos)
colors.accentHover    // #f77b3b (igual en ambos modos)
```

**Palette** son colores estáticos (no cambian con dark mode):
```typescript
Palette.accent      // #EC7C43
Palette.accentHover // #f77b3b
Palette.greenWsp    // #A6C357
```

### Patrón correcto para componentes con dark mode

```typescript
const scheme = useColorScheme() ?? 'light';
const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  text: { color: colors.foreground },
  accent: { color: colors.accent },
});
```

### Sin dark mode (colores fijos)

Para componentes que siempre son del mismo color (ej: botón de acción):
```typescript
import { Palette } from '@/constants/theme';

const styles = StyleSheet.create({
  button: { backgroundColor: Palette.accent },
  buttonText: { color: '#ffffff' },
});
```

---

## Tipografía

### Familias disponibles

```typescript
import { FontFamily } from '@/constants/theme';

FontFamily.body           // Raleway 400 — texto corriente
FontFamily.bodyMedium     // Raleway 500 — énfasis suave
FontFamily.bodySemiBold   // Raleway 600 — labels, botones
FontFamily.bodyBold       // Raleway 700 — títulos de sección

FontFamily.editorial      // Cormorant 400 — encabezados elegantes
FontFamily.editorialItalic // Cormorant 400 Italic
FontFamily.editorialBold   // Cormorant 700 — marca, hero titles

FontFamily.accent         // Bitter 400 — precios, badges, datos destacados
FontFamily.accentBold     // Bitter 700
```

### Cuándo usar cada familia

| Familia | Uso |
|---------|-----|
| Raleway (body) | Textos, párrafos, navegación, formularios |
| Cormorant (editorial) | Nombre de la marca, títulos de producto, encabezados de sección |
| Bitter (accent) | Precios, totales, datos numéricos, badges |

### Tamaños

```typescript
import { FontSize } from '@/constants/theme';

FontSize.xs    // 11 — leyendas, timestamps
FontSize.sm    // 13 — texto secundario
FontSize.base  // 15 — texto base
FontSize.md    // 17 — body principal
FontSize.lg    // 20 — subtítulos
FontSize.xl    // 24 — títulos de sección
FontSize['2xl'] // 30
FontSize['3xl'] // 36 — títulos de pantalla
FontSize['4xl'] // 48 — hero / marca
```

### Ejemplo completo

```typescript
import { StyleSheet, Text } from 'react-native';
import { FontFamily, FontSize, Colors } from '@/constants/theme';

const styles = StyleSheet.create({
  brand: {
    fontFamily: FontFamily.editorialBold,
    fontSize: FontSize['4xl'],
    color: Colors.light.foreground,
  },
  price: {
    fontFamily: FontFamily.accentBold,
    fontSize: FontSize.xl,
    color: Colors.light.accent,
  },
  description: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.light.muted,
    lineHeight: FontSize.base * 1.5,
  },
});
```

---

## Spacing

Sistema de 8 puntos:

```typescript
import { Spacing } from '@/constants/theme';

Spacing.half  // 2
Spacing.one   // 4
Spacing.two   // 8
Spacing.three // 16
Spacing.four  // 24
Spacing.five  // 32
Spacing.six   // 64
```

Usar `Spacing.*` en vez de números mágicos para mantener consistencia.

---

## Radius

```typescript
import { Radius } from '@/constants/theme';

Radius.sm   // 6  — inputs pequeños
Radius.md   // 12 — cards, modales
Radius.lg   // 20 — sheets, bottom panels
Radius.full // 9999 — píldoras, avatares
```

---

## Fuentes — carga

Las fuentes se cargan una sola vez en `src/app/_layout.tsx` usando `useFonts(APP_FONTS)`. No hace falta cargarlas en ninguna otra pantalla.

Si necesitás agregar una variante nueva de fuente:

1. Importarla en `src/constants/fonts.ts`:
```typescript
import { Raleway_900Black } from '@expo-google-fonts/raleway';
export const APP_FONTS = { ...existentes, Raleway_900Black };
```

2. Agregar la clave en `FontFamily` en `theme.ts`:
```typescript
export const FontFamily = {
  ...existentes,
  bodyBlack: 'Raleway_900Black',
};
```

---

## Componentes themed existentes

En `src/components/` hay algunos componentes que ya aplican el tema:

- `ThemedText` — text con color automático según color scheme
- `ThemedView` — view con background automático

Estos son legacy del template inicial de Expo. Los nuevos componentes en `src/shared/components/` usan directamente `Colors` y `FontFamily`.
