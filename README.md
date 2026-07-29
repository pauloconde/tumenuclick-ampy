# 🚀 Tu Menú Click - Tortas de Laura

---

## 📋 Tabla de Contenidos

1. [Pre-requisitos](#pre-requisitos)
2. [Paso 1: Generar Nuevo Cliente (CLI)](#paso-1-generar-nuevo-cliente-cli)
3. [Paso 2: Configurar Sanity CMS](#paso-2-configurar-sanity-cms)
4. [Paso 3: Identidad Visual y Datos](#paso-3-identidad-visual-y-datos)
5. [Paso 4: Deployment en Vercel](#paso-4-deployment-en-vercel)
6. [Mantenimiento y Guía de Campos](#mantenimiento-y-guía-de-campos)

---

## Pre-requisitos

Antes de comenzar, asegúrate de tener configurado tu entorno:

- [ ] **Node.js 18+** instalado.
- [ ] **Tu Menú Click CLI** instalado globalmente (`npm link` en tu carpeta de herramientas).
- [ ] **Cuenta de Sanity.io** (para crear el `Project ID`).
- [ ] **Cuenta de Vercel** (para el despliegue).

**Información del cliente necesaria:**
- [ ] Nombre del negocio.
- [ ] Logo (SVG/PNG) y Colores Hexadecimales.
- [ ] Datos de contacto y Redes Sociales.

---

## Paso 1: Generar Nuevo Cliente (CLI)

Olvídate de clonar manualmente. Usa el generador automático que configura las variables de entorno, limpia los metadatos y prepara el proyecto.

1.  Abre tu terminal en tu carpeta de proyectos (ej: `~/Documentos/Clientes`).
2.  Ejecuta el comando maestro:

```bash
create-tumenu