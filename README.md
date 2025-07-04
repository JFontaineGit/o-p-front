
# 🎨 Olimpiadas de Programación - Frontend 





![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white) 
![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white)
![Bootstrap](https://img.shields.io/badge/bootstrap-%238511FA.svg?style=for-the-badge&logo=bootstrap&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
	![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)


## ⚡ Acerca del proyecto
Front-End moderno y responsivo desarrollado con Angular, diseñado para integrarse fluidamente con el bloque backend de la aplicación propuesta mediante una API REST eficiente.
## 🛠️ Tecnologías

- **Angular**: Framework web estructurado basado en componentes.  
- **SASS**: Preprocesador CSS para estilos avanzados y organizados.  
- **TypeScript**: Superset de JavaScript para tipado estático.   
- **HTML5 y CSS3/SASS**: Maquetación responsiva y estilos personalizados.  
## 🚀 Características principales

- Catálogo de paquetes de turismo y productos con navegación fluida y filtros visuales  
- Carrito de compras persistente y dinámico
- Armado personalizado de paquete
- Formularios de login y registro con autenticación mediante JWT  
- Visualización de pedidos e historial de pedidos
- Página de contacto moderna y amigable 
- Interfaz adaptativa para escritorio y móviles  
- Panel operativo para agente de ventas y navegación protegida por roles
- Integración con backend mediante servicios y observables
## 📋 Requisitos
```
# Instalar dependencias
bun install

# Servir aplicación en desarrollo
ng serve

# Compilar para producción
ng build
```

## 📁 Estructura
**La aplicación está organizada bajo la carpeta src/app, siguiendo buenas prácticas de modularización, reutilización y separación de responsabilidades.**

```
📂 src/
├── 📂 app/
│   ├── 📂 components/         # Componentes visuales reutilizables
    ├── 📂 environments/       # Configuraciones de entorno para desarrollo.
        └── 📄 environment.ts  
│   ├── 📂 guards/             # Guardas de rutas (autenticación, roles)
│   ├── 📂 interceptors/       # Interceptores HTTP (ej. tokens, errores)
│   ├── 📂 interfaces/         # Interfaces TypeScript para tipado de datos
│   ├── 📂 services/           # Servicios para lógica de negocio y HTTP
│   ├── 📂 shared/             # Pipes, directivas y módulos compartidos
│   └── 📂 styles/             # Estilos globales en SASS (mixins, variables)
│       └── 🎨 styles.scss
│
│
│
├── 🚀 index.html              # Doc. HTML principal de la app donde Angular monta la aplicación
├── 👤 main.ts                 # Entrada principal del cliente
├── 👤 main.server.ts          # Entrada principal para SSR
├── 📄 app.component.ts        # Componente raíz
├── 📄 app.component.html      # Componente raíz (estructura base del DOM)
├── 📄 app.component.scss      # Componente raíz (estilos principales)
├── 🔧 app.component.spec.ts   # Pruebas unitarias del componente raíz
├── ⚙️ app.config.ts           # Configuración general de la app
├── ⚙️ app.config.server.ts    # Configuración para servidor (SSR)
├── 🌐 app.routes.ts           # Definición de rutas cliente
└── 🌐 app.routes.server.ts    # Definición de rutas en SSR
```
