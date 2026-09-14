---
tags:
  - spd
  - _
  - "#_"
base: "[[graphify-out/GRAPH_REPORT.md|GRAPH_REPORT]]"
---



Sí, se puede y el código ya tiene gran parte de esa funcionalidad. Existe `refresh_tramite_cache()`, que elimina de Redis la información anterior de un trámite y vuelve a indexar solamente sus carpetas y PDFs. No tendría que recargar el millón de archivos ni esperar dos minutos.

### Flujo recomendado

```mermaid
flowchart LR
    A["Operación sobre PDF"] --> B["Disco actualizado"]
    B --> C["Auditoría registrada"]
    C --> D["Trabajo Redis encolado"]
    D --> E["Refrescar solo el trámite"]
```

Después de una operación exitosa:

```python
cache.enqueue({
    "job": "warm_tramite",
    "tramite": tramite,
    "anio_desde": "2026",
    "anio_hasta": "2026"
})
```

El worker existente recibiría el trabajo y ejecutaría:

```python
refresh_tramite_cache(tramite, "2026", "2026")
```

También ya existe este endpoint:

```http
POST http://127.0.0.1:8090/api/cache/tramite/6101455
```

Por tanto, la aplicación principal podría notificar al motor Redis mediante el endpoint o escribiendo directamente en la cola.

### Operaciones que deberían disparar la actualización

|Operación|Actualización necesaria|
|---|---|
|Subir PDF|Refrescar trámite destino|
|Reemplazar PDF|Refrescar trámite destino|
|Eliminar PDF|Refrescar trámite afectado|
|Renombrar PDF|Refrescar trámite afectado|
|Unir PDFs|Refrescar trámite afectado|
|Optimizar PDF|Actualizar tamaño y fecha del PDF|
|Mover PDF dentro del mismo trámite|Refrescar ese trámite|
|Mover PDF entre trámites|Refrescar trámite origen y destino|
|Carga masiva|Refrescar una vez cada trámite modificado|

### Carga masiva

No debería enviarse un trabajo Redis por cada PDF. Para 20.000 carpetas se recopilarían primero los trámites modificados:

```python
tramites_modificados = set()

for pdf in archivos:
    copiar_pdf(pdf)
    tramites_modificados.add(pdf.tramite)

for tramite in tramites_modificados:
    encolar_refresco_redis(tramite)
```

Incluso sería mejor agrupar varios trámites:

```python
cache.enqueue({
    "job": "warm_tramites",
    "tramites": sorted(tramites_modificados),
    "anio": "2026"
})
```

El worker los procesaría progresivamente sin bloquear FastAPI.

### Evitar trabajos duplicados

Si en pocos segundos se suben siete PDFs al mismo trámite, no deberían crearse siete actualizaciones. Redis puede implementar una marca temporal:

```python
pending_key = f"dig:v1:refresh-pending:2026:{tramite}"

if redis.set(pending_key, "1", nx=True, ex=30):
    cache.enqueue({
        "job": "warm_tramite",
        "tramite": tramite,
        "anio_desde": "2026",
        "anio_hasta": "2026"
    })
```

Esto produciría como máximo un refresco del trámite cada 30 segundos.

### Dos alternativas de actualización

1. **Refrescar el trámite completo — recomendada inicialmente**
    
    El worker elimina de Redis los datos antiguos del trámite y vuelve a revisar su carpeta. Como normalmente existen unos siete PDFs por trámite, el costo es mínimo y se evita implementar reglas diferentes para subir, borrar y renombrar.
    
2. **Modificar directamente las claves Redis**
    
    Por ejemplo, una carga ejecutaría `HSET`, una eliminación `HDEL` y un cambio de nombre eliminaría la clave anterior y crearía la nueva. Es más rápido, pero también más delicado porque podría dejar inconsistencias.
    

Para este proyecto conviene comenzar con la primera alternativa.

### Si los archivos cambian fuera de la aplicación

Cuando un PDF se modifica desde FastAPI, la actualización puede garantizarse porque la aplicación conoce el trámite.

Si alguien copia, elimina o renombra archivos directamente desde Linux, Redis no lo sabrá. En ese caso se requeriría:

- Un monitor del filesystem con `inotify`.
    
- Un comando administrativo que refresque un trámite específico.
    
- Una reconciliación completa periódica como mecanismo de seguridad.
    

Con 180.000 carpetas, no conviene depender únicamente de `inotify`; el mecanismo principal debería ser que todas las operaciones pasen por la aplicación y que el escaneo completo de dos minutos quede como verificación periódica.

La estructura actual está bastante cerca de conseguirlo: solamente falta llamar al refresco incremental después de cada operación exitosa y agregar la agrupación de trámites para las cargas masivas.