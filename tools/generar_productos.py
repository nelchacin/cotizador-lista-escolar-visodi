#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genera js/productos.js a partir del listado de precios en Excel (.xls).

Uso:
    python3 tools/generar_productos.py "/ruta/al/Listado de precios.xls"

Requiere: pip3 install xlrd

El Excel debe tener las columnas (fila 1 como encabezado):
    Código | Descripción | Cantidad | Precio | I.V.A. | Neto

El precio publicado es el precio final: Precio base + I.V.A., redondeado a 2 decimales.
"""
import json
import sys

import xlrd


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    ruta = sys.argv[1]
    wb = xlrd.open_workbook(ruta)
    sh = wb.sheet_by_index(0)

    productos = []
    for r in range(sh.nrows):
        codigo = str(sh.cell_value(r, 1)).strip()
        nombre = str(sh.cell_value(r, 2)).strip()
        if not codigo or codigo.lower() == "código" or not nombre:
            continue
        # Los códigos de barras numéricos llegan como float ("7592456000022.0")
        if codigo.endswith(".0"):
            codigo = codigo[:-2]
        precio_base = float(sh.cell_value(r, 4))
        iva = float(sh.cell_value(r, 5))
        precio_final = round(precio_base + iva, 2)
        productos.append({"codigo": codigo, "nombre": nombre, "precio": precio_final})

    productos.sort(key=lambda p: p["nombre"])

    filas = ",\n".join(
        "  " + json.dumps(p, ensure_ascii=False) for p in productos
    )
    contenido = (
        "// Generado por tools/generar_productos.py — no editar a mano.\n"
        "// Precios finales con IVA incluido (USD).\n"
        "const PRODUCTOS = [\n" + filas + "\n];\n"
    )
    salida = "js/productos.js"
    with open(salida, "w", encoding="utf-8") as f:
        f.write(contenido)
    print(f"OK: {len(productos)} productos escritos en {salida}")


if __name__ == "__main__":
    main()
