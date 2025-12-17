<div align="center">

# GundamTCG

[![Astro](https://img.shields.io/badge/Astro-5.16-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

</div>

---

## ✨ Características

<table>
<tr>
<td width="50%">

### 🎴 **Base de Datos Completa**

Accede a información detallada de todas las cartas del TCG de Gundam, incluyendo:

- Rarezas y costos
- Efectos y habilidades

</td>
<td width="50%">

### 🛠️ **Constructor de Decks**

Crea y gestiona tus mazos:

- Editor de decks
- Exportación e importación

</td>
</tr>
<tr>
<td width="50%">

### 📚 **Gestión de Colección**

Lleva un registro completo de tus cartas:

- Seguimiento de cantidades
- Rarezas de las cartas junto sus artes alternativos
- Estadísticas de colección

</td>
<td width="50%">

### 🔍 **Búsqueda Avanzada**

Encuentra exactamente lo que necesitas:

- Filtros por color, tipo, rareza
- Búsqueda por texto

</td>
</tr>
</table>

---

## 🚀 Tecnologías

Este proyecto está construido con tecnologías modernas y robustas:

| Tecnología                                        | Propósito                               |
| ------------------------------------------------- | --------------------------------------- |
| **[Astro](https://astro.build)**                  | Framework web con arquitectura de islas |
| **[TypeScript](https://www.typescriptlang.org/)** | Tipado estático                         |
| **[Tailwind CSS](https://tailwindcss.com)**       | Framework CSS                           |
| **[Prisma](https://www.prisma.io/)**              | ORM de MySQL                            |
| **[Chart.js](https://www.chartjs.org/)**          | Visualización de datos y estadísticas   |
| **[JWT](https://jwt.io/)**                        | Autenticación segura de usuarios        |
| **[Playwright](https://playwright.dev/)**         | Testing end-to-end automatizado         |
| **[Vitest](https://vitest.dev/)**                 | Framework de testing unitario           |

---

## 📦 Instalación

### Prerrequisitos

- **Node.js** 18.x o superior
- **pnpm** 8.x o superior o npm
- **MySQL** 8.x o superior

### Pasos de Instalación

1. **Clona el repositorio**

   ```bash
   git clone https://github.com/tu-usuario/GundamTCGAPP.git
   cd GundamTCGAPP
   ```

2. **Instala las dependencias**

   ```bash
   pnpm install
   # o si usas npm
   npm install
   ```

3. **Configura las variables de entorno**

   Crea un archivo `.env` en la raíz del proyecto:

   ```env
   DATABASE_URL="mysql://usuario:contraseña@localhost:3306/gundamtcg"
   JWT_SECRET="tu_clave_secreta_super_segura"
   ```

4. **Configura la base de datos**

   ```bash
   # Genera el cliente de Prisma
   pnpm prisma generate

   # Ejecuta las migraciones (si existen)
   pnpm prisma db push
   ```

5. **Inicia el servidor de desarrollo**
   ```bash
   pnpm dev
   ```

---

## 🎮 Uso

### Desarrollo Local

```bash
# Iniciar servidor de desarrollo
pnpm dev

# Compilar para producción
pnpm build

# Previsualizar build de producción
pnpm preview

# Formatear código
pnpm formatear
```

### Testing

```bash
# Ejecutar todos los tests
pnpm test

# Tests unitarios
pnpm test:unit

# Tests end-to-end
pnpm test:e2e
```

### Base de Datos

```bash
# Abrir Prisma Studio (GUI para la BD)
pnpm prisma studio

# Generar cliente de Prisma
pnpm prisma generate

# Sincronizar esquema con la BD
pnpm prisma db push
```

---

## 📁 Estructura del Proyecto

```
GundamTCGAPP/
├── prisma/
│   └── schema.prisma          # Esquema de base de datos
├── public/                    # Archivos estáticos
├── src/
│   ├── assets/               # Recursos (imágenes, fuentes)
│   ├── components/           # Componentes reutilizables
│   │   ├── Filtros.astro
│   │   ├── Footer.astro
│   │   └── Navbar.astro
│   ├── layouts/              # Layouts de página
│   │   ├── MainLayout.astro
│   │   └── LayoutLogin.astro
│   ├── pages/                # Rutas de la aplicación
│   │   ├── index.astro       # Página principal
│   │   ├── login.astro       # Autenticación
│   │   ├── cartas/           # Explorador de cartas
│   │   ├── decks/            # Constructor de decks
│   │   └── coleccion/        # Gestión de colección
│   ├── styles/               # Estilos globales
│   ├── types/                # Definiciones de TypeScript
│   ├── utils/                # Utilidades y helpers
│   └── middleware.ts         # Middleware de autenticación
├── tests/                    # Tests E2E
├── astro.config.mjs          # Configuración de Astro
├── tailwind.config.mjs       # Configuración de Tailwind
└── package.json
```

---

## 🗄️ Modelo de Datos

El proyecto utiliza una base de datos relacional con las siguientes entidades principales:

- **Users** - Usuarios de la plataforma
- **Cards** - Cartas del TCG
- **Decks** - Mazos creados por usuarios
- **Collections** - Colecciones personales de cartas
- **Colors, Types, Tags, Traits, Animes, Zones, Link** - Atributos de las cartas

<details>
<summary>📊 Ver diagrama de relaciones</summary>

```
Users ──┬── Decks ──── DeckCards ──── Cards
        │
        └── UserCollections ──── Cards
                                   │
                                   ├── Colors
                                   ├── Types
                                   ├── Tags
                                   ├── Traits
                                   ├── Animes
                                   ├── Zones
                                   └── Links
```

</details>

<div align="center">

**[⬆ Volver arriba](#-gundamtcg)**

</div>
