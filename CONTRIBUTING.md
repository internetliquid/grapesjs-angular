# Contributing

Thanks for your interest in contributing to `@ilq/grapesjs-angular`.

## Development Setup

```bash
git clone https://github.com/internetliquid/grapesjs-angular.git
cd grapesjs-angular
npm install
```

## Build

```bash
# Build the library
npm run build:lib

# Build the demo app (requires library build first)
npm run build:demo
```

## Test

```bash
# Run library tests (Vitest)
npm run test:lib

# Watch mode
npm run test:lib:watch
```

## Demo App

```bash
# Build the library first
npm run build:lib

# Start the demo dev server
npm run start:demo
```

## Pull Request Process

1. Fork the repository and create a feature branch from `main`
2. Make your changes
3. Ensure `npm run build:lib` and `npm run test:lib` pass
4. Submit a pull request to `main`

## Code Style

- Standalone components only — no NgModules
- `inject()` for dependency injection — no constructor injection
- Signals for reactive state
- `ChangeDetectionStrategy.OnPush` on all components
- Zoneless-compatible — do not assume Zone.js is present
