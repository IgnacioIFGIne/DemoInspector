import csv, io
from flask import jsonify, request, session, Blueprint, Response
import modelo.repositorio_inspector
from __main__ import app
import os
from datetime import datetime

app = Blueprint('rest_app', __name__)

ruta_servicios_rest = "/rest/"

#metodo para comprobar si el servidor esta activo
@app.route(ruta_servicios_rest)
def inicio_servicios_rest():
    return "REST OPERATIVOS"


#------------------------------------------------------------------------
#--------------------------------METODOS GET-----------------------------
#------------------------------------------------------------------------



#metodo para obtener todas las incidencias
@app.route(ruta_servicios_rest + "/obtener_incidencias")
def obtener_incidencias():
    incidencias = modelo.repositorio_inspector.obtener_incidencias()
    print(incidencias)
    return jsonify(incidencias)

#metodo para obtener una incidencia por id 
@app.route(ruta_servicios_rest + "/obtener_incidencia_id", methods=["GET"])
def obtener_incidencia_id():
    id = request.args.get("id")
    incidencia = modelo.repositorio_inspector.obtener_incidencia_id(id)
    return jsonify(incidencia)

@app.route(ruta_servicios_rest + "/actualizar_incidencia", methods = ["POST"])
def actualizar_incidencia():
    print("Headers:", request.headers)
    data = request.get_json
    print("JSON data: ", data)
    
    elemento = request.get_json()["elemento"]
    instalacion = request.get_json()["instalacion"]
    ubicacion = request.get_json()["ubicacion"]
    tipo = request.get_json()["tipo"]
    estado = request.get_json()["estado"]
    fecha = request.get_json()["fecha"]
    observaciones = request.get_json()["observaciones"]
    
    id = request.get_json()["id"]

    
    print(f"----REGISTRO ACTUALIZADO----- ID, {id} elemento: {elemento}, instalacion: {instalacion}, ubicacion: {ubicacion}, tipo: {tipo}, estado: {estado}, fecha: {fecha}, observaciones: {observaciones}")
    
    modelo.repositorio_inspector.actualizar_incidencia(elemento, instalacion, ubicacion, tipo, estado, fecha, observaciones, id)
    
    return jsonify("ok")


# Endpoint para exportar todas las incidencias a CSV
@app.route(ruta_servicios_rest + "/exportar_incidencias", methods=["GET"])
def exportar_incidencias():
    # Paso 1: Obtener todas las incidencias de la base de datos
    incidencias = modelo.repositorio_inspector.obtener_incidencias()
    
    # Paso 2: Crear el CSV en memoria usando io.StringIO y csv.writer con delimitador ';'
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    
    # Si existen incidencias, escribimos la cabecera y los datos
    if incidencias:
        header = list(incidencias[0].keys())
        writer.writerow(header)
        for incidencia in incidencias:
            writer.writerow([incidencia[h] for h in header])
    else:
        writer.writerow(["No hay incidencias disponibles"])
    
    contenido_csv = output.getvalue()
    output.close()
    
    # Paso 3: Retornar el CSV para descarga
    return Response(
        contenido_csv,
        mimetype="text/csv",
        headers={
            "Content-disposition": "attachment; filename=incidencias.csv"
        }
    )


#------------------------------------------------------------------------
#------------------------------METODOS POST------------------------------
#------------------------------------------------------------------------



#metodo para registrar una incidencia
@app.route(ruta_servicios_rest + "/registrar_incidencia", methods=["POST"])
def registrar_incidencia():
    
        print("Headers:", request.headers)
        print("Raw Data:", request.data)  # Muestra los datos sin procesar
        data = request.get_json()  # Procesa el JSON
        print("JSON Data:", data)

    
        elemento = request.get_json()["elemento"]
        instalacion = request.get_json()["instalacion"]
        ubicacion = request.get_json()["ubicacion"]
        tipo = request.get_json()["tipo"]
        estado = request.get_json()["estado"]
        fecha = request.get_json()["fecha"]
        observaciones = request.get_json()["observaciones"]
        
        print(f"----REGISTRAR INCIDENCIA----- elemento: {elemento}, instalacion: {instalacion}, ubicacion: {ubicacion}, tipo: {tipo}, estado: {estado}, fecha: {fecha}, observaciones: {observaciones}")
        
        modelo.repositorio_inspector.registrar_incidencia(elemento, instalacion, ubicacion, tipo, estado, fecha, observaciones)
        
        return jsonify("ok")
    
    

    

@app.route(ruta_servicios_rest + "/exportar_incidencia", methods=["GET"])
def exportar_incidencia():
    # Paso 1: Recoger el parámetro id
    id_incidencia = request.args.get("id")
    if not id_incidencia:
        return jsonify({"error": "No se proporcionó el id de la incidencia"}), 400

    # Paso 2: Obtener la incidencia desde la base de datos
    incidencia = modelo.repositorio_inspector.obtener_incidencia_id(id_incidencia)
    if not incidencia:
        return jsonify({"error": "No se encontró la incidencia con el id proporcionado"}), 404

    # Paso 3: Crear el CSV en memoria usando io.StringIO y csv.writer con delimitador ';'
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')

    # Escribimos la fila de cabecera con las claves del diccionario
    header = list(incidencia.keys())
    writer.writerow(header)

    # Escribimos la fila de datos con los valores correspondientes
    writer.writerow([incidencia[key] for key in header])

    # Obtenemos el contenido CSV generado
    contenido_csv = output.getvalue()
    output.close()

    # Paso 4: Retornar el archivo CSV para descarga
    return Response(
        contenido_csv,
        mimetype="text/csv",
        headers={
            "Content-disposition": f"attachment; filename=incidencia_{id_incidencia}.csv"
        }
    ) 
     
# Endpoint para importar y actualizar una incidencia desde un CSV
@app.route(ruta_servicios_rest + "/importar_incidencia", methods=["POST"])
def importar_incidencia():
    # Paso 1: Verificar que se haya enviado un archivo CSV
    if "file" not in request.files:
        return jsonify({"error": "No se encontró el archivo CSV en la solicitud"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No se seleccionó ningún archivo"}), 400

    try:
        # Paso 2: Leer el contenido del archivo CSV
        stream = io.StringIO(file.stream.read().decode("utf-8"))
        reader = csv.reader(stream, delimiter=';')
        
        # Paso 3: Leer la cabecera y la primera fila de datos
        header = next(reader, None)
        if not header:
            return jsonify({"error": "El archivo CSV está vacío"}), 400

        row = next(reader, None)
        if not row:
            return jsonify({"error": "El archivo CSV no contiene datos de incidencia"}), 400

        # Paso 4: Construir un diccionario con los datos usando la cabecera
        incidencia_data = dict(zip(header, row))

        # Paso 5: Validar que el CSV incluya el campo "id"
        if "id" not in incidencia_data or not incidencia_data["id"]:
            return jsonify({"error": "El CSV debe contener el campo 'id'"}), 400

        # Paso 6: Actualizar la incidencia en la base de datos
        modelo.repositorio_inspector.actualizar_incidencia(
            incidencia_data.get("elemento"),
            incidencia_data.get("instalacion"),
            incidencia_data.get("ubicacion"),
            incidencia_data.get("tipo"),
            incidencia_data.get("estado"),
            incidencia_data.get("fecha"),
            incidencia_data.get("observaciones"),
            incidencia_data.get("id")
        )
        return jsonify({"mensaje": "Incidencia actualizada correctamente"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
# Endpoint para importar y actualizar todas las incidencias desde un CSV
@app.route(ruta_servicios_rest + "/importar_incidencias", methods=["POST"])
def importar_incidencias():
    # Paso 1: Verificar que se haya enviado el archivo CSV en la solicitud
    if "file" not in request.files:
        return jsonify({"error": "No se encontró el archivo CSV en la solicitud"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No se seleccionó ningún archivo"}), 400
    
    try:
        # Paso 2: Leer el contenido del archivo CSV
        stream = io.StringIO(file.stream.read().decode("utf-8"))
        reader = csv.reader(stream, delimiter=';')
        
        # Paso 3: Extraer la cabecera del CSV
        header = next(reader, None)
        if not header:
            return jsonify({"error": "El archivo CSV está vacío"}), 400
        
        # Paso 4: Procesar cada fila y actualizar la incidencia
        updated_count = 0
        for row in reader:
            if not row:  # Omitir filas vacías
                continue
            data = dict(zip(header, row))
            # Se requiere el campo "id" para identificar la incidencia a actualizar
            if "id" not in data or not data["id"]:
                continue
            
            modelo.repositorio_inspector.actualizar_incidencia(
                data.get("elemento"),
                data.get("instalacion"),
                data.get("ubicacion"),
                data.get("tipo"),
                data.get("estado"),
                data.get("fecha"),
                data.get("observaciones"),
                data.get("id")
            )
            updated_count += 1
        
        # Paso 5: Devolver un mensaje indicando cuántas incidencias se han actualizado
        return jsonify({"mensaje": f"Se han actualizado {updated_count} incidencias correctamente."}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500