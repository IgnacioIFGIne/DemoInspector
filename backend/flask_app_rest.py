import csv
import io
from flask import Response, jsonify, request, session, Blueprint
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

@app.route(ruta_servicios_rest + "/actualizar_incidencia", methods=["POST"])
def actualizar_incidencia():
    print("Headers:", request.headers)
    # Se obtiene el JSON completo de la solicitud
    data = request.get_json()
    print("JSON data:", data)
    
    # Extraer los datos necesarios
    elemento = data["elemento"]
    instalacion = data["instalacion"]
    ubicacion = data["ubicacion"]
    tipo = data["tipo"]
    estado = data["estado"]
    fecha = data["fecha"]
    observaciones = data["observaciones"]
    id_actualizar = data["id"]

    # Verificar si alguna incidencia (distinta a la que se va a actualizar) ya tiene el mismo valor en 'instalacion'
    incidencias = modelo.repositorio_inspector.obtener_incidencias()
    for inc in incidencias:
        if inc["instalacion"].strip().lower() == instalacion.strip().lower() and str(inc["id"]) != str(id_actualizar):
            return jsonify({"error": "este nombre de incidencia ya existe"}), 400

    print(f"----REGISTRO ACTUALIZADO----- ID: {id_actualizar}, elemento: {elemento}, instalacion: {instalacion}, ubicacion: {ubicacion}, tipo: {tipo}, estado: {estado}, fecha: {fecha}, observaciones: {observaciones}")
    
    modelo.repositorio_inspector.actualizar_incidencia(
        elemento, instalacion, ubicacion, tipo, estado, fecha, observaciones, id_actualizar
    )
    
    return jsonify("ok")




#------------------------------------------------------------------------
#------------------------------METODOS POST------------------------------
#------------------------------------------------------------------------



@app.route(ruta_servicios_rest + "/subir_foto", methods=["POST"])
def subir_foto():
    if 'foto' not in request.files:
        return jsonify({"error": "No se encontró el archivo en la petición"}), 400

    foto = request.files['foto']
    print("Archivo recibido:", foto.filename)

    # Verifica que el archivo tiene nombre
    if foto.filename == '':
        return jsonify({"error": "Nombre de archivo vacío"}), 400

    # Ruta de destino
    ruta_guardado = os.path.join("static", "imagesIncidencias")
    os.makedirs(ruta_guardado, exist_ok=True)  # Crea el directorio si no existe

    nombre_archivo = foto.filename  # Ya incluye el ID: por ejemplo, "23.jpg"
    ruta_completa = os.path.join(ruta_guardado, nombre_archivo)

    try:
        foto.save(ruta_completa)
        print(f"Imagen guardada en: {ruta_completa}")
        return jsonify("ok")
    except Exception as e:
        print("Error al guardar imagen:", e)
        return jsonify({"error": "No se pudo guardar la imagen"}), 500



#metodo para registrar una incidencia
@app.route(ruta_servicios_rest + "registrar_incidencia", methods=["POST"])
def registrar_incidencia():
    try:
        # Recoger los datos desde el formulario
        elemento = request.form["elemento"]
        instalacion = request.form["instalacion"]
        ubicacion = request.form["ubicacion"]
        tipo = request.form["tipo"]
        estado = request.form["estado"]
        
        # Generar el timestamp actual en el formato "DD/MM/YYYY - hh:mm:ss"
        fecha = datetime.now().strftime("%d/%m/%Y - %H:%M:%S")
        
        observaciones = request.form.get("observaciones", "")
        
        # Verificar si alguna incidencia ya tiene el mismo valor en 'instalacion'
        incidencias = modelo.repositorio_inspector.obtener_incidencias()
        for inc in incidencias:
            if inc["instalacion"].strip().lower() == instalacion.strip().lower():
                return jsonify({"error": "este nombre de incidencia ya existe"}), 400

        # Registrar la incidencia y obtener el ID generado
        id_generado = modelo.repositorio_inspector.registrar_incidencia(
            elemento, instalacion, ubicacion, tipo, estado, fecha, observaciones
        )

        # Guardar la imagen si se ha enviado
        if 'foto' in request.files:
            foto = request.files['foto']
            ruta_guardado = os.path.join("static", "imagesIncidencias")
            os.makedirs(ruta_guardado, exist_ok=True)
            ruta_foto = os.path.join(ruta_guardado, f"{id_generado}.jpg")
            foto.save(ruta_foto)

        return jsonify({"status": "ok", "id": id_generado})
    
    except Exception as e:
        print(f"Error al registrar incidencia: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
#------------------------------------------------------------------------
#------------------------------importar---------------------------------
#------------------------------------------------------------------------



@app.route(ruta_servicios_rest + "/importar_incidencia", methods=["POST"])
def importar_incidencia():
    # Paso 1: Verificar que se haya enviado un archivo CSV
    if "file" not in request.files:
        print("Error: No se encontró el archivo CSV en la solicitud")
        return jsonify({"error": "No se encontró el archivo CSV en la solicitud"}), 400

    file = request.files["file"]
    if file.filename == "":
        print("Error: No se seleccionó ningún archivo")
        return jsonify({"error": "No se seleccionó ningún archivo"}), 400

    print("Archivo recibido:", file.filename)

    try:
        # Paso 2: Leer el contenido del archivo CSV
        # Se utiliza utf-8-sig para que el BOM (si existe) se elimine automáticamente.
        try:
            content = file.stream.read().decode("utf-8-sig")
            print("Archivo decodificado con UTF-8-SIG correctamente")
        except UnicodeDecodeError:
            file.stream.seek(0)
            content = file.stream.read().decode("latin-1")
            print("Archivo decodificado con Latin-1")
            
        stream = io.StringIO(content)
        reader = csv.reader(stream, delimiter=';')
       
        # Paso 3: Leer la cabecera y la primera fila de datos
        header = next(reader, None)
        print("Cabecera del CSV:", header)
        if not header:
            print("Error: El archivo CSV está vacío")
            return jsonify({"error": "El archivo CSV está vacío"}), 400
 
        row = next(reader, None)
        print("Datos encontrados en la primera fila:", row)
        if not row:
            print("Error: El archivo CSV no contiene datos de incidencia")
            return jsonify({"error": "El archivo CSV no contiene datos de incidencia"}), 400
 
        # Paso 4: Construir un diccionario con los datos usando la cabecera
        incidencia_data = dict(zip(header, row))
        print("Datos de incidencia mapeados:", incidencia_data)
 
        # Paso 5: Validar que el CSV incluya el campo "id"
        if "id" not in incidencia_data or not incidencia_data["id"]:
            print("Error: El CSV debe contener el campo 'id'")
            return jsonify({"error": "El CSV debe contener el campo 'id'"}), 400
 
        # Paso 6: Actualizar la incidencia en la base de datos
        print("Actualizando incidencia con id:", incidencia_data.get("id"))
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
        print("Incidencia actualizada correctamente")
        return jsonify({"mensaje": "Incidencia actualizada correctamente"}), 200

    except Exception as e:
        print("Error durante la importación de incidencia:", str(e))
        return jsonify({"error": str(e)}), 500



@app.route(ruta_servicios_rest + "/importar_incidencias", methods=["POST"])
def importar_incidencias():
    # Paso 1: Verificar que se haya enviado el archivo CSV en la solicitud
    if "file" not in request.files:
        print("Error: No se encontró el archivo CSV en la solicitud")
        return jsonify({"error": "No se encontró el archivo CSV en la solicitud"}), 400
    file = request.files["file"]
    if file.filename == "":
        print("Error: No se seleccionó ningún archivo")
        return jsonify({"error": "No se seleccionó ningún archivo"}), 400

    print("Archivo recibido:", file.filename)

    try:
        # Paso 2: Leer el contenido del archivo CSV
        # Intentar con UTF-8-SIG para eliminar el BOM automáticamente; si falla, usar Latin-1
        try:
            content = file.stream.read().decode("utf-8-sig")
            print("Archivo decodificado con UTF-8-SIG correctamente")
        except UnicodeDecodeError:
            file.stream.seek(0)
            content = file.stream.read().decode("latin-1")
            print("Archivo decodificado con Latin-1")
        
        stream = io.StringIO(content)
        reader = csv.reader(stream, delimiter=';')
        
        # Paso 3: Extraer la cabecera del CSV
        header = next(reader, None)
        print("Cabecera del CSV:", header)
        if not header:
            print("Error: El archivo CSV está vacío")
            return jsonify({"error": "El archivo CSV está vacío"}), 400
        
        # Paso 4: Procesar cada fila y actualizar la incidencia
        updated_count = 0
        row_number = 1
        for row in reader:
            row_number += 1
            if not row:
                print(f"Fila {row_number} vacía. Se omite.")
                continue
            data = dict(zip(header, row))
            print(f"Fila {row_number} procesada:", data)
            # Se requiere el campo "id" para identificar la incidencia a actualizar
            if "id" not in data or not data["id"]:
                print(f"Fila {row_number} omitida: falta el campo 'id'")
                continue
            
            print(f"Actualizando incidencia con id {data.get('id')}:")
            print(f" - Elemento: {data.get('elemento')}")
            print(f" - Instalacion: {data.get('instalacion')}")
            print(f" - Ubicacion: {data.get('ubicacion')}")
            print(f" - Tipo: {data.get('tipo')}")
            print(f" - Estado: {data.get('estado')}")
            print(f" - Fecha: {data.get('fecha')}")
            print(f" - Observaciones: {data.get('observaciones')}")
            
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
        
        print("Total incidencias actualizadas:", updated_count)
        return jsonify({"mensaje": f"Se han actualizado {updated_count} incidencias correctamente."}), 200

    except Exception as e:
        print("Error durante la importación múltiple de incidencias:", str(e))
        return jsonify({"error": str(e)}), 500


    
    
#------------------------------------------------------------------------
#------------------------------exportar---------------------------------
#------------------------------------------------------------------------

# Endpoint para exportar todas las incidencias a CSV
@app.route(ruta_servicios_rest + "/exportar_incidencias", methods = ["GET"])
def exportar_incidencias():
    
    print("Exportando incidencias a CSV...")
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



# Endpoint para exportar todas las incidencias a CSV
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
     


    
    