# Mila Raffo App Mobile

Aplicacion mobile Expo / React Native para el ecommerce de Mila Raffo. La app consume el backend NestJS, organiza el codigo por modulos de negocio y usa Expo Router para separar auth, tabs principales y subflujos como catalogo.

## Stack

- Expo 55
- React Native 0.83
- React 19
- Expo Router 55
- Zustand 5
- Axios
- TypeScript strict

## Primeros pasos

```bash
npm install
npm run start
```

Comandos utiles:

```bash
npm run android
npm run ios
npm run web
npm run lint
```

La URL del backend se configura en `src/core/config/env.ts`. En desarrollo apunta a:

```text
http://localhost:3000/api/v1
```

## Documentacion

La documentacion principal esta en [docs/app/00-index.md](./docs/app/00-index.md), siguiendo la misma estructura numerada usada por el backend.

Guias puntuales existentes:

- [Arquitectura](./docs/architecture.md)
- [Convenciones](./docs/conventions.md)
- [Modulos](./docs/modules.md)
- [Navegacion](./docs/navigation.md)
- [Tema](./docs/theme.md)
