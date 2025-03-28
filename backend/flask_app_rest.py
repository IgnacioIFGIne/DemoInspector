from flask import jsonify, request, Blueprint
from modelo.repositorio_inspector import obtener_incidencias_db, obtener_incidencia_id_db, registrar_incidencia_db, actualizar_incidencia_db  


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
    incidencias = obtener_incidencias_db()
    print(incidencias)
    return jsonify(incidencias)

#metodo para obtener una incidencia por id 
@app.route(ruta_servicios_rest + "/obtener_incidencia_id", methods=["GET"])
def obtener_incidencia():
    id = request.args.get("id")
    incidencia = obtener_incidencia_id_db(id)
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
        
        registrar_incidencia_db(elemento, instalacion, ubicacion, tipo, estado, fecha, observaciones)
        
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
    
    actualizar_incidencia_db(elemento, instalacion, ubicacion, tipo, estado, fecha, observaciones, id)
    
    return jsonify("ok")
    
    
     