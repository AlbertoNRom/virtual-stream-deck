# Test Suite Documentation

Este proyecto incluye una suite de tests completa que cubre las funcionalidades principales de la aplicación Virtual Stream Deck.

## Estructura de Tests

```
tests/
├── setup.ts                           # Configuración global de tests
├── unit/
│   └── store.test.ts                  # Tests unitarios del store Zustand
├── components/
│   ├── stream-deck-grid.test.tsx      # Tests del componente StreamDeckGrid
│   ├── sound-library.test.tsx         # Tests del componente SoundLibrary
│   └── key-config.test.tsx            # Tests del componente KeyConfig
├── integration/
│   └── dashboard-integration.test.tsx # Tests de integración del dashboard
└── e2e/
    ├── auth.spec.ts                   # Tests E2E de autenticación
    └── dashboard.spec.ts              # Tests E2E del dashboard
```

## Tecnologías de Testing

- **Vitest**: Framework de testing unitario y de integración
- **Playwright**: Framework de testing end-to-end
- **Testing Library**: Utilidades para testing de componentes React
- **JSDOM**: Entorno DOM simulado para tests unitarios

## Scripts Disponibles

```bash
# Tests unitarios y de componentes
npm run test              # Ejecutar tests en modo watch
npm run test:run          # Ejecutar tests una vez
npm run test:ui           # Ejecutar tests con interfaz visual
npm run test:coverage     # Ejecutar tests con reporte de cobertura

# Tests end-to-end
npm run test:e2e          # Ejecutar tests E2E
npm run test:e2e:ui       # Ejecutar tests E2E con interfaz visual
npm run test:e2e:headed   # Ejecutar tests E2E con navegador visible

# Ejecutar todos los tests
npm run test:all          # Ejecutar tests unitarios y E2E
```

## Cobertura de Tests

### Tests Unitarios

#### Store (Zustand)
- ✅ Gestión de sonidos (agregar, eliminar, establecer)
- ✅ Gestión de teclas del stream deck (establecer, actualizar, seleccionar, limpiar)
- ✅ Configuración de la grilla
- ✅ Reproducción de audio (reproducir, detener, detener todos)
- ✅ Manejo de sonidos inexistentes

### Tests de Componentes

#### StreamDeckGrid
- ✅ Renderizado de la grilla con columnas configuradas
- ✅ Visualización de teclas del stream deck
- ✅ Manejo de estados vacíos
- ✅ Clicks en teclas (con y sin sound_id)
- ✅ Aplicación de colores de fondo personalizados
- ✅ Visualización de etiquetas por defecto
- ✅ Renderizado de múltiples teclas en posiciones correctas

#### SoundLibrary
- ✅ Renderizado del componente
- ✅ Funcionalidad de búsqueda
- ✅ Visualización de tarjetas de sonido
- ✅ Acciones de reproducir/detener
- ✅ Configuración de teclas
- ✅ Estados vacíos
- ✅ Área de carga de archivos
- ✅ Advertencias de límite de sonidos

#### KeyConfig
- ✅ Renderizado del panel de configuración
- ✅ Visualización de información de tecla seleccionada
- ✅ Estado vacío cuando no hay tecla seleccionada
- ✅ Manejo de cambios en inputs (etiqueta, hotkey, color)
- ✅ Selector de color
- ✅ Botones de guardar y eliminar
- ✅ Selección de sonidos
- ✅ Validación de inputs
- ✅ Reset de formulario

### Tests de Integración

#### Dashboard Integration
- ✅ Renderizado de todos los componentes del dashboard
- ✅ Visualización correcta de números de sonidos y teclas
- ✅ Selección de teclas
- ✅ Configuración de teclas cuando están seleccionadas
- ✅ Actualización de etiquetas y colores de teclas
- ✅ Agregar y eliminar sonidos
- ✅ Reproducción de sonidos
- ✅ Flujo completo: seleccionar tecla, modificar, cerrar
- ✅ Operaciones múltiples de sonidos

### Tests End-to-End

#### Autenticación
- ✅ Visualización de página de login
- ✅ Opciones de autenticación
- ✅ Redirección de usuarios no autenticados
- ✅ Responsividad en móvil

#### Dashboard E2E
- ✅ Visualización del layout del dashboard
- ✅ Grilla del stream deck
- ✅ Biblioteca de sonidos
- ✅ Búsqueda de sonidos
- ✅ Clicks en teclas
- ✅ Botón de logout
- ✅ Responsividad
- ✅ Estados vacíos

## Mocks y Configuración

### Mocks Globales (setup.ts)
- **Howler.js**: Simulación de reproducción de audio
- **Next.js Router**: Navegación simulada
- **Supabase Client**: Cliente de base de datos simulado
- **react-dropzone**: Carga de archivos simulada
- **sonner**: Notificaciones toast simuladas
- **react-hotkeys-hook**: Atajos de teclado simulados
- **@dnd-kit**: Drag and drop simulado

### Datos de Prueba
- Sonidos de ejemplo con metadatos completos
- Teclas del stream deck configuradas
- Configuración de grilla (2x3)
- Estados de usuario autenticado/no autenticado

## Ejecutar Tests

### Prerrequisitos
```bash
# Instalar dependencias
npm install
```

### Tests Unitarios y de Componentes
```bash
# Modo watch (recomendado para desarrollo)
npm run test

# Ejecutar una vez
npm run test:run

# Con interfaz visual
npm run test:ui

# Con cobertura
npm run test:coverage
```

### Tests End-to-End
```bash
# Instalar navegadores de Playwright (solo la primera vez)
npx playwright install

# Ejecutar tests E2E
npm run test:e2e

# Con interfaz visual
npm run test:e2e:ui

# Con navegador visible
npm run test:e2e:headed
```

### Todos los Tests
```bash
npm run test:all
```

## Estrategia de Testing

### Happy Path Focus
Los tests se enfocan en los **caminos felices** (happy paths) de la aplicación:
- Flujos de usuario exitosos
- Funcionalidades principales
- Interacciones típicas
- Estados esperados

### Cobertura Equilibrada
- **Tests Unitarios**: Lógica de negocio y estado
- **Tests de Componentes**: Renderizado e interacciones
- **Tests de Integración**: Comunicación entre componentes
- **Tests E2E**: Flujos completos de usuario

### Mocking Strategy
- Dependencias externas mockeadas para aislamiento
- Datos de prueba consistentes
- Estados predecibles
- Simulación de APIs y servicios

## Mejores Prácticas

1. **Nombres Descriptivos**: Los tests tienen nombres claros que describen qué verifican
2. **Arrange-Act-Assert**: Estructura clara en cada test
3. **Aislamiento**: Cada test es independiente
4. **Datos de Prueba**: Uso de datos consistentes y realistas
5. **Cleanup**: Limpieza automática entre tests
6. **Mocking Inteligente**: Solo se mockea lo necesario

## Troubleshooting

### Tests Unitarios Fallan
- Verificar que las dependencias estén instaladas
- Revisar la configuración en `vitest.config.ts`
- Comprobar los mocks en `tests/setup.ts`

### Tests E2E Fallan
- Asegurar que los navegadores de Playwright estén instalados
- Verificar que el servidor de desarrollo esté disponible
- Revisar la configuración en `playwright.config.ts`

### Problemas de Performance
- Usar `test:run` en lugar de modo watch para CI
- Ejecutar tests E2E en paralelo con cuidado
- Considerar usar `--reporter=dot` para output más limpio

## Contribuir

Al agregar nuevas funcionalidades:
1. Escribir tests unitarios para la lógica
2. Agregar tests de componentes para UI
3. Considerar tests de integración si hay interacciones complejas
4. Agregar tests E2E para flujos críticos de usuario
5. Mantener la cobertura de happy paths
6. Actualizar esta documentación si es necesario