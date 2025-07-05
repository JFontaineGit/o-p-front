# Design Tokens del Carrito - Documentación Completa

## 📁 Estructura de Archivos

```
src/app/shared/
├── _cart-variables.scss      # Variables y tokens base
├── _cart-mixins.scss         # Mixins y funciones reutilizables
├── _cart-utilities.scss      # Clases CSS utilitarias
├── _cart-index.scss          # Archivo índice para importaciones
├── _cart-documentation.scss  # Ejemplos de uso (solo desarrollo)
└── CART_DESIGN_TOKENS.md     # Esta documentación
```

## 🚀 Cómo Usar

### Importación Básica

```scss
// En tu componente
@use '../../shared/_cart-index.scss' as cart;

.mi-componente {
  color: cart.$cart-primary;
  padding: cart.$cart-spacing-md;
  @include cart.cart-button-primary;
}
```

### Importación Individual

```scss
// Solo variables
@use '../../shared/_cart-variables.scss' as cart;

// Solo mixins
@use '../../shared/_cart-mixins.scss' as cart-mixins;

// Solo utilidades
@use '../../shared/_cart-utilities.scss' as cart-utils;
```

## 🎨 Sistema de Colores

### Colores Principales
- `$cart-primary`: #3b82f6 (Azul principal)
- `$cart-primary-hover`: #2563eb (Azul hover)
- `$cart-secondary`: #64748b (Gris secundario)
- `$cart-success`: #10b981 (Verde éxito)
- `$cart-danger`: #ef4444 (Rojo error)
- `$cart-warning`: #f59e0b (Amarillo advertencia)

### Colores de Texto
- `$cart-text-primary`: #1e293b (Texto principal)
- `$cart-text-secondary`: #64748b (Texto secundario)
- `$cart-text-tertiary`: #94a3b8 (Texto terciario)
- `$cart-text-disabled`: #cbd5e1 (Texto deshabilitado)
- `$cart-text-inverse`: #ffffff (Texto inverso)

### Colores de Fondo
- `$cart-background`: #f8fafc (Fondo principal)
- `$cart-surface`: #ffffff (Superficie)
- `$cart-surface-hover`: #f8fafc (Superficie hover)

## 📏 Sistema de Espaciado

### Espaciado Base
- `$cart-spacing-2xs`: 0.25rem (4px)
- `$cart-spacing-xs`: 0.5rem (8px)
- `$cart-spacing-sm`: 0.75rem (12px)
- `$cart-spacing-md`: 1rem (16px)
- `$cart-spacing-lg`: 1.5rem (24px)
- `$cart-spacing-xl`: 2rem (32px)
- `$cart-spacing-2xl`: 3rem (48px)
- `$cart-spacing-3xl`: 4rem (64px)

## 🔤 Sistema de Tipografía

### Tamaños de Fuente
- `$cart-font-size-xs`: 0.75rem (12px)
- `$cart-font-size-sm`: 0.875rem (14px)
- `$cart-font-size-base`: 1rem (16px)
- `$cart-font-size-lg`: 1.125rem (18px)
- `$cart-font-size-xl`: 1.25rem (20px)
- `$cart-font-size-2xl`: 1.5rem (24px)
- `$cart-font-size-3xl`: 1.875rem (30px)
- `$cart-font-size-4xl`: 2.25rem (36px)

### Pesos de Fuente
- `$cart-font-weight-light`: 300
- `$cart-font-weight-normal`: 400
- `$cart-font-weight-medium`: 500
- `$cart-font-weight-semibold`: 600
- `$cart-font-weight-bold`: 700
- `$cart-font-weight-extrabold`: 800

## 🎯 Mixins Principales

### Layout
```scss
@include cart-mixins.cart-container;      // Contenedor principal
@include cart-mixins.cart-grid;           // Grid layout
@include cart-mixins.cart-flex;           // Flexbox
@include cart-mixins.cart-flex-center;    // Flex centrado
@include cart-mixins.cart-flex-between;   // Flex space-between
@include cart-mixins.cart-flex-column;    // Flex columna
```

### Componentes
```scss
@include cart-mixins.cart-card;           // Tarjeta básica
@include cart-mixins.cart-card-elevated;  // Tarjeta elevada
@include cart-mixins.cart-card-interactive; // Tarjeta interactiva
```

### Botones
```scss
@include cart-mixins.cart-button-primary;   // Botón primario
@include cart-mixins.cart-button-secondary; // Botón secundario
@include cart-mixins.cart-button-success;   // Botón éxito
@include cart-mixins.cart-button-danger;    // Botón peligro
@include cart-mixins.cart-button-warning;   // Botón advertencia
@include cart-mixins.cart-button-outline;   // Botón outline
@include cart-mixins.cart-button-ghost;     // Botón ghost
```

### Formularios
```scss
@include cart-mixins.cart-input-base;     // Input básico
@include cart-mixins.cart-input-number;   // Input numérico
@include cart-mixins.cart-select;         // Select
```

### Tipografía
```scss
@include cart-mixins.cart-heading(1);     // H1
@include cart-mixins.cart-heading(2);     // H2
@include cart-mixins.cart-heading(3);     // H3
@include cart-mixins.cart-body-text;      // Texto cuerpo
@include cart-mixins.cart-caption;        // Captión
```

### Estados
```scss
@include cart-mixins.cart-loading;        // Estado de carga
@include cart-mixins.cart-skeleton;       // Skeleton loading
@include cart-mixins.cart-disabled;       // Estado deshabilitado
```

### Animaciones
```scss
@include cart-mixins.cart-fade-in;        // Fade in
@include cart-mixins.cart-slide-in-up;    // Slide in up
@include cart-mixins.cart-scale-in;       // Scale in
@include cart-mixins.cart-bounce-in;      // Bounce in
```

### Responsive
```scss
@include cart-mixins.cart-mobile-only { /* estilos */ }
@include cart-mixins.cart-tablet-only { /* estilos */ }
@include cart-mixins.cart-desktop-only { /* estilos */ }
@include cart-mixins.cart-tablet-up { /* estilos */ }
@include cart-mixins.cart-desktop-up { /* estilos */ }
```

## 🛠️ Clases Utilitarias

### Layout
```html
<div class="cart-container">Contenedor principal</div>
<div class="cart-grid">Grid layout</div>
<div class="cart-flex cart-flex-center">Flex centrado</div>
<div class="cart-flex cart-flex-between">Flex space-between</div>
<div class="cart-flex cart-flex-column">Flex columna</div>
```

### Espaciado
```html
<div class="cart-p-md">Padding medio</div>
<div class="cart-px-lg">Padding horizontal largo</div>
<div class="cart-py-sm">Padding vertical pequeño</div>
<div class="cart-m-xl">Margin extra largo</div>
<div class="cart-gap-md">Gap medio</div>
```

### Tipografía
```html
<h1 class="cart-heading-1">Título H1</h1>
<h2 class="cart-heading-2">Título H2</h2>
<p class="cart-text-lg cart-font-medium">Texto grande medio</p>
<span class="cart-caption">Captión</span>
<div class="cart-truncate">Texto truncado</div>
```

### Colores
```html
<div class="cart-bg-primary">Fondo primario</div>
<div class="cart-bg-surface">Fondo superficie</div>
<p class="cart-text-primary">Texto primario</p>
<p class="cart-text-secondary">Texto secundario</p>
```

### Bordes
```html
<div class="cart-border cart-rounded-lg">Borde redondeado</div>
<div class="cart-border-2 cart-border-primary">Borde primario</div>
```

### Sombras
```html
<div class="cart-shadow-sm">Sombra pequeña</div>
<div class="cart-shadow-lg">Sombra grande</div>
```

### Botones
```html
<button class="cart-btn cart-btn-primary">Botón primario</button>
<button class="cart-btn cart-btn-danger">Botón peligro</button>
<button class="cart-btn cart-btn-outline">Botón outline</button>
```

## 📱 Breakpoints

- **Mobile**: max-width: 640px
- **Tablet**: 641px - 768px
- **Desktop**: min-width: 769px
- **Large Desktop**: min-width: 1024px

## ⚡ Transiciones

- `$cart-transition-fast`: 0.15s
- `$cart-transition-normal`: 0.2s
- `$cart-transition-slow`: 0.3s
- `$cart-transition-slower`: 0.5s

## 🎭 Estados

- `$cart-opacity-disabled`: 0.5
- `$cart-opacity-loading`: 0.6
- `$cart-opacity-hover`: 0.8
- `$cart-opacity-active`: 0.9

## 🔧 Ejemplos Prácticos

### Componente de Botón
```scss
.cart-button {
  @include cart-mixins.cart-button-primary;
  @include cart-mixins.cart-button-size('lg');
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: cart.$cart-shadow-lg;
  }
  
  &:disabled {
    @include cart-mixins.cart-disabled;
  }
}
```

### Componente de Tarjeta
```scss
.cart-card {
  @include cart-mixins.cart-card;
  @include cart-mixins.cart-flex-column;
  padding: cart.$cart-spacing-lg;
  gap: cart.$cart-spacing-md;
  
  .cart-card-title {
    @include cart-mixins.cart-heading(3);
    color: cart.$cart-text-primary;
  }
  
  .cart-card-content {
    @include cart-mixins.cart-body-text('base', 'secondary');
  }
}
```

### Componente Responsive
```scss
.cart-responsive-component {
  @include cart-mixins.cart-grid(1fr cart.$cart-sidebar-width, cart.$cart-spacing-xl);
  
  @include cart-mixins.cart-mobile-only {
    @include cart-mixins.cart-grid(1fr, cart.$cart-spacing-lg);
  }
}
```

## 🎯 Mejores Prácticas

1. **Usa el archivo índice**: Importa `_cart-index.scss` para acceso completo
2. **Prefiere mixins sobre clases**: Los mixins son más flexibles
3. **Usa variables directamente**: Para valores únicos
4. **Mantén consistencia**: Usa siempre los tokens del sistema
5. **Documenta variaciones**: Si necesitas valores fuera del sistema

## 🔄 Actualizaciones

Para actualizar el sistema de design tokens:

1. Modifica `_cart-variables.scss` para nuevos tokens
2. Agrega mixins en `_cart-mixins.scss`
3. Crea utilidades en `_cart-utilities.scss`
4. Actualiza esta documentación
5. Prueba en componentes existentes

## 📚 Recursos Adicionales

- Ver `_cart-documentation.scss` para más ejemplos
- Consulta los componentes existentes para patrones
- Usa las herramientas de desarrollo del navegador para debugging 