# Auto-cotizador de Lista Escolar — VISODI

Página web donde el cliente arma su lista escolar por su cuenta: entra al link, busca los productos, pone las cantidades y descarga su cotización en PDF con el total ya calculado.

**VISODI El Chalet del Cartucho C.A.** · La Gran Papelería de Venezuela · [visodi.com](https://www.visodi.com)

**🌐 Página en vivo:** https://nelchacin.github.io/cotizador-lista-escolar-visodi/

## Cómo actualizar la página publicada

La página se publica con GitHub Pages desde la rama `main`. Cualquier cambio se actualiza así:

```bash
git add -A
git commit -m "descripción del cambio"
git push
```

En 1–2 minutos GitHub Pages refresca el link automáticamente. Nada más que hacer.

## Qué incluye

- Catálogo de **97 productos escolares** con precio base en USD; el I.V.A. se muestra desglosado en la cotización (subtotal + IVA + total).
- Buscador por nombre o código y filtros por categoría (cuadernos, escritura, pegas, papeles, arte, carpetas…).
- Botones **− / +** para las cantidades, con el total siempre visible abajo.
- Cotización con nombre del cliente, fecha, tabla de productos y total, lista para **descargar/imprimir en PDF**.
- La selección se guarda en el navegador (`localStorage`): si el cliente recarga la página, no pierde su lista.
- Diseño responsive: teléfono, tablet y computadora.

## Cómo probarlo

Es un sitio **100% estático** — no necesita base de datos ni PHP.

- **Opción rápida:** abrir `index.html` con doble clic en cualquier navegador.
- **Con XAMPP:** copiar la carpeta dentro de `htdocs` y entrar a `http://localhost/Proyecto%20lista/`.
- **Servidor simple:** `python3 -m http.server 8080` dentro de la carpeta y abrir `http://localhost:8080`.

## Cómo montarlo en el dominio

Subir **la carpeta completa tal cual** (index.html, css/, js/, img/) a cualquier hosting:

- cPanel / hosting compartido: subir a `public_html/cotizador/` → queda en `visodi.com/cotizador/`.
- También funciona en Netlify, Vercel, GitHub Pages o un subdominio.

No hay nada que configurar: no usa backend.

## Cómo actualizar los precios

Los precios viven en `js/productos.js`, que se genera desde el Excel del sistema:

```bash
pip3 install xlrd   # solo la primera vez
python3 tools/generar_productos.py "/ruta/al/Listado de precios.xls"
```

El script lee las columnas Código / Descripción / Precio / I.V.A. y escribe el precio base y el IVA por unidad (2 decimales). Luego `git push` y la página se actualiza sola.

## Estructura

```
index.html                  Página única (catálogo + cotización)
css/estilos.css             Estilos (branding Visodi, responsive, impresión)
js/app.js                   Lógica (filtros, cantidades, totales, PDF)
js/productos.js             Datos de productos (generado, no editar a mano)
img/logo-visodi.png         Logo
tools/generar_productos.py  Regenera productos.js desde el Excel
```
