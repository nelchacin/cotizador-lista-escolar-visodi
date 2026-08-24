/* Auto-cotizador de Lista Escolar — VISODI
   Sin dependencias. Los productos vienen de js/productos.js (const PRODUCTOS). */

(function () {
  "use strict";

  var CLAVE_ALMACEN = "visodi-lista-escolar";

  /* ---------- Categorías (por palabras clave, en orden de prioridad) ---------- */
  var REGLAS_CATEGORIA = [
    ["Pegas y cintas", /PEGA|SILICON|CINTA|TIRRO/],
    ["Carpetas y sobres", /CARPETA|SOBRE/],
    ["Cuadernos y blocks", /LIBRETA|CUADERNO|BLOCK|RESMA|RESMILLA|HOJAS DE EXAMEN/],
    ["Arte y manualidades", /CREYON|TEMPERA|PINTURA|PINTADEDO|PLASTILINA|PLASTIDEDO|PINCEL|ESCARCHA|FOAMI|PALETA|PALITO|ESTAMBRE|GLOBO|CARTON|TIZA|ETIQUETA/],
    ["Papeles y cartulinas", /PAPEL|CARTULINA|CONTAC/],
    ["Escritura", /LAPIZ|BOLIGRAFO|MARCADOR|RESALTADOR|SACAPUNTA|BORRA|CORRECTOR|RAPIDOGRAF/]
  ];
  var CATEGORIA_OTROS = "Otros útiles";

  function categoriaDe(nombre) {
    for (var i = 0; i < REGLAS_CATEGORIA.length; i++) {
      if (REGLAS_CATEGORIA[i][1].test(nombre)) return REGLAS_CATEGORIA[i][0];
    }
    return CATEGORIA_OTROS;
  }

  PRODUCTOS.forEach(function (p) { p.categoria = categoriaDe(p.nombre); });

  /* ---------- Estado ---------- */
  var cantidades = {};            // codigo -> cantidad
  var filtroTexto = "";
  var filtroCategoria = "Todos";
  var tarjetas = {};              // codigo -> referencias DOM de la tarjeta visible

  function cargarEstado() {
    try {
      var guardado = JSON.parse(localStorage.getItem(CLAVE_ALMACEN));
      if (guardado && typeof guardado === "object") cantidades = guardado;
    } catch (e) { cantidades = {}; }
  }

  function guardarEstado() {
    try { localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(cantidades)); } catch (e) {}
  }

  /* ---------- Utilidades ---------- */
  function dinero(n) {
    return "$" + n.toFixed(2).replace(".", ",");
  }

  function normalizar(t) {
    return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function porId(id) { return document.getElementById(id); }

  function nombreBonito(t) {
    return t.toLowerCase().replace(/(^|[\s(/"])([a-záéíóúñü])/g, function (m, sep, letra) {
      return sep + letra.toUpperCase();
    });
  }

  /* ---------- Render de categorías ---------- */
  function pintarCategorias() {
    var nombres = ["Todos"];
    REGLAS_CATEGORIA.forEach(function (r) { nombres.push(r[0]); });
    nombres.push(CATEGORIA_OTROS);

    var cont = porId("categorias");
    cont.innerHTML = "";
    nombres.forEach(function (nombre) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip" + (nombre === filtroCategoria ? " chip-activo" : "");
      chip.textContent = nombre;
      chip.addEventListener("click", function () {
        filtroCategoria = nombre;
        pintarCategorias();
        pintarProductos();
      });
      cont.appendChild(chip);
    });
  }

  /* ---------- Render de productos ---------- */
  function productosFiltrados() {
    var texto = normalizar(filtroTexto.trim());
    return PRODUCTOS.filter(function (p) {
      if (filtroCategoria !== "Todos" && p.categoria !== filtroCategoria) return false;
      if (!texto) return true;
      return normalizar(p.nombre).indexOf(texto) !== -1 || p.codigo.toLowerCase().indexOf(texto) !== -1;
    });
  }

  function crearTarjeta(p) {
    var li = document.createElement("li");
    li.className = "producto";

    var info = document.createElement("div");
    info.className = "producto-info";

    var nombre = document.createElement("p");
    nombre.className = "producto-nombre";
    nombre.textContent = nombreBonito(p.nombre);

    var precio = document.createElement("p");
    precio.className = "producto-precio";
    precio.textContent = dinero(p.precio);

    /* Pie de tarjeta: control − n + */
    var pie = document.createElement("div");
    pie.className = "producto-pie";

    var control = document.createElement("div");
    control.className = "control-cantidad";

    var menos = document.createElement("button");
    menos.type = "button";
    menos.className = "btn-cantidad";
    menos.textContent = "−";
    menos.setAttribute("aria-label", "Quitar " + p.nombre);
    menos.addEventListener("click", function () { cambiarCantidad(p, -1); });

    var num = document.createElement("span");
    num.className = "cantidad";

    var mas = document.createElement("button");
    mas.type = "button";
    mas.className = "btn-cantidad";
    mas.textContent = "+";
    mas.setAttribute("aria-label", "Agregar otro " + p.nombre);
    mas.addEventListener("click", function () { cambiarCantidad(p, 1); });

    control.appendChild(menos);
    control.appendChild(num);
    control.appendChild(mas);

    pie.appendChild(control);

    info.appendChild(nombre);
    info.appendChild(precio);
    li.appendChild(info);
    li.appendChild(pie);

    tarjetas[p.codigo] = { li: li, num: num };
    actualizarTarjeta(p.codigo);
    return li;
  }

  /* Actualiza SOLO una tarjeta (sin repintar la lista: evita que la
     animación de entrada se repita al tocar − / +). */
  function actualizarTarjeta(codigo) {
    var t = tarjetas[codigo];
    if (!t) return;
    var cant = cantidades[codigo] || 0;
    t.li.classList.toggle("producto-elegido", cant > 0);
    t.num.textContent = cant;
  }

  function pintarProductos() {
    var lista = porId("lista-productos");
    lista.innerHTML = "";
    tarjetas = {};
    var visibles = productosFiltrados();
    porId("sin-resultados").hidden = visibles.length > 0;
    visibles.forEach(function (p) { lista.appendChild(crearTarjeta(p)); });
  }

  function cambiarCantidad(p, delta) {
    var nueva = (cantidades[p.codigo] || 0) + delta;
    if (nueva <= 0) delete cantidades[p.codigo];
    else cantidades[p.codigo] = nueva;
    guardarEstado();
    actualizarTarjeta(p.codigo);
    pintarBarraTotal();
  }

  /* ---------- Totales ---------- */
  function calcularTotales() {
    var articulos = 0, monto = 0;
    PRODUCTOS.forEach(function (p) {
      var c = cantidades[p.codigo] || 0;
      if (c > 0) { articulos += c; monto += c * p.precio; }
    });
    return { articulos: articulos, monto: monto };
  }

  function pintarBarraTotal() {
    var t = calcularTotales();
    var barra = porId("barra-total");
    barra.hidden = t.articulos === 0;
    porId("total-articulos").textContent = t.articulos + (t.articulos === 1 ? " artículo" : " artículos");
    porId("total-monto").textContent = dinero(t.monto);
  }

  /* ---------- Cotización ---------- */
  function pintarCotizacion() {
    var cuerpo = porId("cuerpo-cotizacion");
    cuerpo.innerHTML = "";
    var total = 0;

    PRODUCTOS.forEach(function (p) {
      var c = cantidades[p.codigo] || 0;
      if (c === 0) return;
      var subtotal = c * p.precio;
      total += subtotal;

      var tr = document.createElement("tr");
      [nombreBonito(p.nombre), c, dinero(p.precio), dinero(subtotal)].forEach(function (valor, i) {
        var td = document.createElement("td");
        if (i > 0) td.className = "col-num";
        td.textContent = valor;
        tr.appendChild(td);
      });
      cuerpo.appendChild(tr);
    });

    porId("total-cotizacion").textContent = dinero(total);
    porId("fecha-cotizacion").textContent = new Date().toLocaleDateString("es-VE", {
      day: "2-digit", month: "long", year: "numeric"
    });
  }

  function mostrarCotizacion() {
    pintarCotizacion();
    porId("pantalla-catalogo").hidden = true;
    porId("pantalla-cotizacion").hidden = false;
    window.scrollTo(0, 0);
  }

  function mostrarCatalogo() {
    porId("pantalla-cotizacion").hidden = true;
    porId("pantalla-catalogo").hidden = false;
  }

  /* ---------- Eventos ---------- */
  porId("buscador").addEventListener("input", function (e) {
    filtroTexto = e.target.value;
    pintarProductos();
  });

  porId("btn-ver-cotizacion").addEventListener("click", mostrarCotizacion);
  porId("btn-volver").addEventListener("click", mostrarCatalogo);

  porId("btn-pdf").addEventListener("click", function () {
    var nombre = porId("nombre-cliente").value.trim();
    porId("nombre-impreso").textContent = nombre ? "Cliente: " + nombre : "";
    window.print();
  });

  porId("btn-vaciar").addEventListener("click", function () {
    if (!confirm("¿Seguro que quieres vaciar toda tu lista?")) return;
    cantidades = {};
    guardarEstado();
    pintarProductos();
    pintarBarraTotal();
    mostrarCatalogo();
  });

  /* ---------- Inicio ---------- */
  cargarEstado();
  pintarCategorias();
  pintarProductos();
  pintarBarraTotal();
})();
