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
    
    
     