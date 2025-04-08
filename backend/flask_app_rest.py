from flask import jsonify, request, session, Blueprint
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
        fecha = request.form["fecha"]
        observaciones = request.form.get("observaciones", "")
        
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



# @app.route(ruta_servicios_rest + "/registrar_incidencia", methods=["POST"])
# def registrar_incidencia():
    
#         print("Headers:", request.headers)
#         print("Raw Data:", request.data)  # Muestra los datos sin procesar
#         data = request.get_json()  # Procesa el JSON
#         print("JSON Data:", data)

    
#         elemento = request.get_json()["elemento"]
#         instalacion = request.get_json()["instalacion"]
#         ubicacion = request.get_json()["ubicacion"]
#         tipo = request.get_json()["tipo"]
#         estado = request.get_json()["estado"]
#         fecha = request.get_json()["fecha"]
#         observaciones = request.get_json()["observaciones"]
        
#         print(f"----REGISTRAR INCIDENCIA----- elemento: {elemento}, instalacion: {instalacion}, ubicacion: {ubicacion}, tipo: {tipo}, estado: {estado}, fecha: {fecha}, observaciones: {observaciones}")
        
#         modelo.repositorio_inspector.registrar_incidencia(elemento, instalacion, ubicacion, tipo, estado, fecha, observaciones)
        
#         return jsonify("ok")
    
    
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
    
    
     