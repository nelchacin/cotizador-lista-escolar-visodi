#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genera js/productos.js a partir del listado de precios en Excel (.xls).

Uso:
    python3 tools/generar_productos.py "/ruta/al/Listado de precios.xls"

Requiere: pip3 install xlrd

El Excel debe tener las columnas (fila 1 como encabezado):
    Código | Descripción | Cantidad | Precio | I.V.A. | Neto

Se publican por separado el precio base y el monto de I.V.A. por unidad
(ambos redondeados a 2 decimales); la página los desglosa en la cotización.
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
        precio_base = round(float(sh.cell_value(r, 4)), 2)
        iva = round(float(sh.cell_value(r, 5)), 2)
        productos.append({"codigo": codigo, "nombre": nombre, "precio": precio_base, "iva": iva})

    productos.sort(key=lambda p: p["nombre"])

    filas = ",\n".join(
        "  " + json.dumps(p, ensure_ascii=False) for p in productos
    )
    contenido = (
        "// Generado por tools/generar_productos.py — no editar a mano.\n"
        "// precio = base sin IVA; iva = monto de IVA por unidad (USD).\n"
        "const PRODUCTOS = [\n" + filas + "\n];\n"
    )
    salida = "js/productos.js"
    with open(salida, "w", encoding="utf-8") as f:
        f.write(contenido)
    print(f"OK: {len(productos)} productos escritos en {salida}")


if __name__ == "__main__":
    main()
