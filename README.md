# Gestión de Productos Financieros

Aplicación web desarrollada con Angular para administrar productos financieros mediante una API REST.

La aplicación permite consultar, buscar, registrar, editar y eliminar productos financieros, aplicando validaciones de negocio, notificaciones visuales, manejo de errores, diseño responsive y pruebas automatizadas.

---

## Funcionalidades implementadas

- Listado de productos financieros.
- Búsqueda por ID, nombre o descripción.
- Paginación de resultados.
- Selector de cantidad por página: 5, 10 o 20 productos.
- Registro de productos financieros.
- Edición de productos existentes.
- Eliminación con modal de confirmación.
- Verificación de ID duplicado contra la API.
- Validación de campos requeridos.
- Validación de longitud para nombre y descripción.
- Validación de URL para el logo.
- Validación de fecha de liberación.
- Cálculo automático de fecha de revisión un año después de la fecha de liberación.
- Manejo de estados de carga, error y lista vacía.
- Notificaciones de éxito, error e información.
- Diseño responsive para escritorio y móvil.
- Tooltips informativos en columnas de la tabla.
- Pruebas automatizadas con Vitest.

---

## Tecnologías utilizadas

- Angular 22
- TypeScript
- RxJS
- Vitest
- Angular HttpClient
- SCSS
- HTML semántico
- API REST

---

## Requisitos previos

Debes tener instalado:

- Node.js
- npm

Puedes verificar las versiones instaladas con:

```bash
node --version
npm --version
```

También puedes verificar la versión de Angular:

```bash
npx ng version
```

---

## Instalación del frontend

Abre una terminal dentro de la carpeta del proyecto:

```bash
cd bp-financial-products
```

Instala las dependencias:

```bash
npm install
```

Si el reporte de cobertura indica que falta el paquete de Vitest, instala:

```bash
npm install -D @vitest/coverage-v8@^4.0.8
```

---

## Ejecución del backend

La aplicación necesita el backend de la prueba técnica ejecutándose antes de iniciar el frontend.

Abre otra terminal y entra a la carpeta del backend:

```bash
cd ruta-del-backend
```

Instala las dependencias del backend:

```bash
npm install
```

Inicia el backend:

```bash
npm start
```

El backend debe ejecutarse en:

```text
http://localhost:3002
```

La aplicación consume los endpoints bajo esta URL:

```text
http://localhost:3002/bp
```

---

## Ejecución del frontend

Con el backend iniciado, abre una terminal en la carpeta del frontend y ejecuta:

```bash
npm start
```

Luego abre en el navegador:

```text
http://localhost:4200
```

---

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Inicia la aplicación en modo desarrollo |
| `npm run build` | Genera el build de producción |
| `npm test` | Ejecuta las pruebas automatizadas |
| `npm run test:coverage` | Ejecuta las pruebas con reporte de cobertura |
| `npm run watch` | Genera el build en modo observación |

---

## Ejecutar pruebas

Para ejecutar las pruebas:

```bash
npm test
```

Para ejecutar las pruebas y generar cobertura:

```bash
npm run test:coverage
```

Las pruebas cubren:

- Servicio de productos financieros.
- Servicio de notificaciones.
- Validadores de campos.
- Validadores de fechas.
- Página de listado de productos.
- Página de formulario de productos.
- Componente de notificaciones.
- Componente de encabezado.

---

## Generar build de producción

Para validar que el proyecto compila correctamente para producción:

```bash
npm run build
```

---

## Endpoints utilizados

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/bp/products` | Obtiene todos los productos |
| `POST` | `/bp/products` | Crea un producto |
| `PUT` | `/bp/products/:id` | Actualiza un producto |
| `DELETE` | `/bp/products/:id` | Elimina un producto |
| `GET` | `/bp/products/verification/:id` | Verifica si el ID ya existe |

---

## Requisitos funcionales cubiertos

| Requisito | Implementación |
|---|---|
| Listar productos | Tabla con datos recibidos desde la API |
| Buscar productos | Búsqueda por ID, nombre y descripción |
| Paginación | Selector de 5, 10 o 20 elementos por página |
| Registrar producto | Formulario con validaciones |
| Editar producto | Ruta de edición por producto |
| Eliminar producto | Modal de confirmación y actualización de lista |
| Validar ID duplicado | Consulta al endpoint de verificación |
| Manejo de errores | Mensajes visuales y opción de reintentar |
| Diseño responsive | Adaptación para escritorio y móvil |
| Pruebas | Pruebas unitarias con Vitest |

---

## Reglas de validación

| Campo | Regla |
|---|---|
| ID | Obligatorio, formato válido y no duplicado |
| Nombre | Obligatorio, entre 5 y 100 caracteres |
| Descripción | Obligatoria, entre 10 y 200 caracteres |
| Logo | Obligatorio y debe ser una URL HTTP o HTTPS válida |
| Fecha de liberación | Obligatoria y no puede ser anterior a la fecha actual |
| Fecha de revisión | Se calcula automáticamente un año después de la fecha de liberación |

---

## Estructura principal del proyecto

```text
src/
└── app/
    ├── core/
    │   ├── config/
    │   ├── models/
    │   └── services/
    │
    ├── feature/
    │   └── products/
    │       ├── pages/
    │       │   ├── product-form/
    │       │   └── product-list/
    │       └── validators/
    │
    ├── shared/
    │   ├── components/
    │   │   ├── app-header/
    │   │   └── app-toast/
    │   └── utils/
    │
    ├── app.config.ts
    ├── app.routes.ts
    └── app.ts
```

---

## Consideraciones de diseño

- No se utilizaron frameworks CSS.
- No se utilizaron componentes prefabricados.
- La interfaz fue creada con SCSS personalizado.
- Se utilizan Angular Signals para el manejo de estados locales.
- Se muestran mensajes visuales para operaciones exitosas, errores y acciones informativas.
- La tabla se adapta a dispositivos móviles.
- Los tooltips incluyen soporte para hover y navegación con teclado.
- Se implementaron estados visuales de carga, error y lista vacía.

---

## Autor

Junior Castillo
