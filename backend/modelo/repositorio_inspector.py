import modelo.conexion

#-------------------METODOS GET-------------------
def obtener_incidencias():
    conexion = modelo.conexion.conectar()
    sql = "SELECT * FROM incidencias ORDER BY id DESC"
    cursor = conexion.cursor(dictionary=True)
    cursor.execute(sql)
    incidencias = cursor.fetchall()
    cursor.close()
    conexion.close()
    
    #print all the data in a way that is easy to read
    for incidencia in incidencias:
        print(incidencia["elemento"], incidencia["instalacion"], incidencia["ubicacion"], incidencia["tipo"], incidencia["estado"])
  
    return incidencias
    
def obtener_incidencia_id(id):
    conexion = modelo.conexion.conectar()
    sql = "SELECT * FROM incidencias WHERE id = %s"
    cursor = conexion.cursor(dictionary=True)
    cursor.execute(sql, (id,))
    incidencia = cursor.fetchone()
    cursor.close()
    conexion.close()
    
    print(incidencia["elemento"], incidencia["instalacion"], incidencia["ubicacion"], incidencia["tipo"], incidencia["estado"])
  
    return incidencia


#-------------------METODOS POST-------------------


def registrar_incidencia(elemento, instalacion, ubicacion, tipo, estado, fecha, observaciones):
    conexion = modelo.conexion.conectar()
    sql = "INSERT INTO incidencias (elemento, instalacion, ubicacion, tipo, estado, fecha, observaciones) VALUES (%s, %s, %s, %s, %s, %s, %s)"
    values = (elemento, instalacion, ubicacion, tipo, estado, fecha, observaciones)
    cursor = conexion.cursor()
    cursor.execute(sql, values)
    id_generado = cursor.lastrowid  # generamos el id
    conexion.commit()
    cursor.close()
    conexion.close()
    return id_generado  # lo devuelvo para que lo pille la img


# def registrar_incidencia(elemento, instalacion, ubicacion, tipo, estado, fecha, observaciones):
#     conexion = modelo.conexion.conectar()
#     sql = "INSERT INTO incidencias (elemento, instalacion, ubicacion, tipo, estado, fecha, observaciones) VALUES (%s, %s, %s, %s, %s, %s, %s)"
#     values = (elemento, instalacion, ubicacion, tipo, estado, fecha, observaciones)
#     cursor = conexion.cursor()
#     cursor.execute(sql, values)
#     conexion.commit()
#     cursor.close()
#     conexion.close()
    
def actualizar_incidencia(elemento, instalacion, ubicacion, tipo, estado, fecha, observaciones, id):
    
    conexion = modelo.conexion.conectar()
    sql = "UPDATE incidencias SET elemento = %s, instalacion = %s, ubicacion = %s, tipo = %s, estado = %s, fecha = %s, observaciones = %s WHERE incidencias.id = %s"
    values = ( elemento, instalacion, ubicacion, tipo, estado, fecha, observaciones, id)
    cursor = conexion.cursor()
    cursor.execute(sql, values)
    
    print(f"--BACKEND--  instalacion: " + instalacion + " id= " + str(id))
    
    conexion.commit()
    cursor.close()
    conexion.close()