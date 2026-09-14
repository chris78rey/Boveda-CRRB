---
tags:
  - "null"
  - _
  - "#_"
base: "[[graphify-out/GRAPH_REPORT.md|GRAPH_REPORT]]"
---
La optimización debe aplicarse exactamente al enlace **“Usuario experto: carga masiva”**, cuya ruta es `/experto/carga-masiva`. No debe modificarse la opción piloto `/experto/carga-masiva-optimizada` ni las variantes Leticia, especialidad o lote grande.

Estas son las instrucciones para el desarrollador:

# Optimización con Redis de Usuario experto: carga masiva

## 1. Alcance obligatorio

La modificación debe afectar únicamente estas rutas:

```text
/experto/carga-masiva
/experto/carga-masiva/validar
/experto/carga-masiva/validar-async
/experto/carga-masiva/procesar-async
/experto/carga-masiva/ejecutar
/experto/carga-masiva/ejecutar-async
/experto/carga-masiva/status/{token}
/experto/carga-masiva/cancelar/{token}
```

No modificar:

```text
/experto/carga-masiva-optimizada
/experto/carga-masiva-leticia
/experto/carga-masiva-especialidad
/experto/carga-masiva-lote-grande
```

La pantalla y sus URLs deben mantenerse. El cambio será interno.

## 2. Problemas encontrados actualmente

La carga masiva estándar tiene estos puntos costosos:

1. `_mass_upload_folder_index()` lee todos los registros de `folders.sqlite` en cada proceso.
    
2. Cada ruta recuperada ejecuta `Path.resolve()`, aunque el ZIP solo use una parte de las aproximadamente 180.000 carpetas.
    
3. `_mass_status_write()` actualiza memoria y reescribe `status.json` muchas veces durante la carga.
    
4. Sin `progress_profile="light"`, el estado y el reporte pueden escribirse prácticamente por cada PDF.
    
5. `_bulk_upload_block_reason()` consulta el estado documental y el periodo trámite por trámite.
    
6. La carga se ejecuta en un thread daemon dentro de FastAPI. Si FastAPI reinicia, el proceso puede perderse.
    
7. La ruta estándar todavía puede calcular SHA-256 después de copiar el PDF.
    
8. Al terminar, la carga masiva no registra agrupadamente todos los trámites modificados en `CD_REDIS_SYNC`.
    

Redis debe resolver principalmente el índice de carpetas, la cola, el progreso y la cancelación. No debe guardar los PDF.

## 3. Redis que debe reutilizarse

Debe usarse el Redis existente:

```text
DIGI_REDIS_URL=redis://127.0.0.1:6379/0
```

No instalar otra instancia y no exponer el puerto `6379` a la red.

No se debe importar directamente `motor_redis/core.py` desde `fastapi_app/app.py`, porque ese módulo inicializa configuración Oracle y Redis al importarse.

Crear un módulo pequeño e independiente:

```text
scripts/expert_mass_redis.py
```

Configuración recomendada:

```python
import os
import redis

def redis_client():
    return redis.Redis.from_url(
        os.environ.get(
            "DIGI_REDIS_URL",
            "redis://127.0.0.1:6379/0",
        ),
        decode_responses=True,
        socket_connect_timeout=1,
        socket_timeout=2,
        health_check_interval=30,
    )
```

## 4. Claves exclusivas

Usar un espacio separado para no afectar `dig:v1:jobs`:

```text
dig:v1:expert-mass:jobs
dig:v1:expert-mass:status:{job_id}
dig:v1:expert-mass:cancel:{job_id}
dig:v1:expert-mass:folder-map
dig:v1:expert-mass:folder-map:meta
```

No usar `KEYS`, `FLUSHDB` ni eliminar claves generales de `motor_redis`.

## 5. Índice de carpetas en Redis

Crear en `motor_redis/core.py` una colección dedicada:

```python
MASS_FOLDER_MAP_KEY = "dig:v1:expert-mass:folder-map"
MASS_FOLDER_META_KEY = "dig:v1:expert-mass:folder-map:meta"
```

Será un hash Redis:

```text
campo = nombre normalizado del trámite
valor = JSON con los candidatos de carpeta
```

Ejemplo:

```json
[
  {
    "id": 245734,
    "path": "/datos/2026/EXPEDIENTE/6101455",
    "year": "2026"
  }
]
```

Debe conservar varios candidatos cuando un trámite sea ambiguo.

### Construcción segura

El índice debe construirse en una clave temporal:

```text
dig:v1:expert-mass:folder-map:building:{uuid}
```

Cargarlo por bloques de 1.000 registros usando pipeline:

```python
pipe = client.pipeline(transaction=False)
pipe.hset(temp_key, mapping=batch)
pipe.execute()
```

Cuando termine correctamente:

```python
client.rename(temp_key, MASS_FOLDER_MAP_KEY)
```

Después actualizar:

```text
dig:v1:expert-mass:folder-map:meta
```

con:

```text
status=ready
version=<marca de tiempo o versión>
built_at=<fecha>
total_folders=<cantidad>
source=folders.sqlite
```

Mientras el catálogo de carpetas siga en SQLite, el índice podrá construirse desde allí. Cuando esa tabla migre a Oracle, solamente cambiará el origen de construcción; la estructura Redis permanecerá igual.

El mapa debe reconstruirse cuando se ejecute el reindexado de carpetas.

## 6. Consulta únicamente de los trámites del ZIP

No cargar el hash completo en memoria de Python.

Después de leer el ZIP, `_mass_process_worker()` ya obtiene:

```python
src_names = sorted(top_map.keys(), key=str.lower)
```

Consultar solamente esos nombres:

```python
values = redis_client.hmget(
    "dig:v1:expert-mass:folder-map",
    [name.strip().lower() for name in src_names],
)
```

Si existen 20.000 carpetas, dividir la consulta en bloques de 1.000 o 2.000 nombres.

Crear:

```python
def _mass_redis_folder_index(
    source_names: list[str],
) -> dict[str, list[dict[str, object]]]:
    ...
```

Y usarlo únicamente cuando el proceso provenga de:

```text
source="expert_mass_process"
source="expert_mass_execute"
```

Si Redis está apagado, el mapa no está listo o algún valor es inválido, debe ejecutarse un fallback.

El fallback no debe volver a leer las 180.000 carpetas. Debe consultar solamente los nombres del ZIP mediante el índice `idx_folders_name`, agrupados en bloques.

Cada ruta obtenida desde Redis debe validarse nuevamente:

- Debe existir.
    
- Debe ser directorio.
    
- Debe estar dentro de `DIGI_BASE_DIR`.
    
- Su identificador debe continuar correspondiendo a la ruta.
    
- No se deben seguir enlaces simbólicos fuera del repositorio.
    

Redis acelera la localización, pero no autoriza por sí solo el destino.

## 7. Estado de los trabajos en Redis

Actualmente `_mass_status_write()` reescribe `status.json` con demasiada frecuencia.

Modificar el flujo para que Redis sea el estado rápido:

```text
dig:v1:expert-mass:status:{token}
```

Puede guardarse como hash o como JSON. Debe tener TTL de 48 horas:

```python
pipe = client.pipeline()
pipe.hset(status_key, mapping=status_fields)
pipe.expire(status_key, 172800)
pipe.execute()
```

Política de actualización:

- Redis: cada 10 PDF o cada segundo.
    
- Oracle: cada carpeta o cada 15–30 segundos.
    
- Disco: únicamente checkpoints importantes y estado final.
    
- CSV de resultados: vaciar buffer cada 25–100 filas, no por cada fila.
    

`_mass_status_read()` debe:

1. Consultar Redis.
    
2. Si Redis no responde o la clave expiró, consultar Oracle o el estado persistente.
    
3. Mantener el mismo JSON que actualmente consume la pantalla.
    

Los endpoints y JavaScript no deben cambiar de contrato.

## 8. Quitar SHA-256 solamente en esta opción

Las tres entradas estándar deben pasar:

```python
skip_hash_for_audit=True
```

En:

```python
ui_expert_mass_upload_process_async()
ui_expert_mass_upload_execute_async()
ui_expert_mass_upload_execute()
```

También se recomienda pasar:

```python
progress_profile="light"
```

Ejemplo:

```python
return _mass_process_async_start(
    request,
    zip_file,
    response_prefix="/experto/carga-masiva",
    block_reason_fn=_bulk_upload_block_reason,
    source="expert_mass_process",
    status_label="Proceso masivo",
    progress_profile="light",
    skip_hash_for_audit=True,
)
```

No eliminar `_sha256_file()` globalmente. La auditoría de esta opción guardará:

```text
SHA256 = NULL
```

## 9. Validaciones Oracle agrupadas

No se debe ejecutar `_bulk_upload_block_reason()` individualmente para miles de trámites.

Crear:

```python
def _mass_bulk_block_reasons(
    tramites: list[str],
    oracle_user: str,
) -> dict[str, str]:
    ...
```

Esta función debe:

1. Abrir una sola conexión Oracle.
    
2. Consultar trámites en bloques de máximo 900.
    
3. Obtener agrupadamente:
    
    - cantidad revisada;
        
    - cantidad pendiente;
        
    - `DIG_ANIO`;
        
    - `FE_PLA_ANIOMES`.
        
4. Leer una sola vez desbloqueos, cierres y excepciones.
    
5. Construir:
    

```python
{
    "6101455": "",
    "6101456": "review",
    "6101457": "monthly"
}
```

Redis puede proporcionar una validación preliminar, pero antes de escribir los PDF debe realizarse esta comprobación agrupada en Oracle.

Esto reemplaza miles de conexiones o consultas individuales por unas pocas consultas grandes.

## 10. Cola Redis y worker independiente

La copia no debe continuar ejecutándose dentro de un thread daemon de FastAPI.

Crear un worker exclusivo:

```text
scripts/expert_mass_redis_worker.py
```

No usar `motor_redis/worker.py` para copiar PDF, porque una carga grande bloquearía los refrescos de Control documental.

Flujo:

1. FastAPI recibe y guarda el ZIP.
    
2. FastAPI registra el trabajo en Oracle.
    
3. Oracle confirma la transacción.
    
4. FastAPI publica solamente el `job_id`:
    

```python
client.lpush(
    "dig:v1:expert-mass:jobs",
    json.dumps({"job_id": job_id}),
)
```

5. El worker espera:
    

```python
client.brpop(
    "dig:v1:expert-mass:jobs",
    timeout=5,
)
```

6. El worker reclama el trabajo en Oracle.
    
7. El worker valida, mapea y copia los PDF.
    
8. El worker actualiza progreso Redis.
    
9. El worker finaliza el trabajo en Oracle.
    

El mensaje Redis no debe contener credenciales, binarios ni todo el plan.

## 11. Persistencia en Oracle

No crear otro `jobs.sqlite`.

Crear al menos:

```text
CD_MASS_UPLOAD_JOB
CD_MASS_UPLOAD_FOLDER
```

`CD_MASS_UPLOAD_JOB` debe guardar:

```text
JOB_ID
ORACLE_USER
ZIP_PATH
STATUS
CREATED_AT
STARTED_AT
FINISHED_AT
HEARTBEAT_AT
WORKER_ID
ATTEMPT_COUNT
MAX_ATTEMPTS
CANCEL_REQUESTED
TOTAL_FOLDERS
PROCESSED_FOLDERS
TOTAL_PDFS
PROCESSED_PDFS
COPIED_PDFS
FAILED_PDFS
LAST_FOLDER
LAST_MEMBER
LAST_MESSAGE
ERROR_MESSAGE
```

`CD_MASS_UPLOAD_FOLDER` debe guardar una fila por carpeta del ZIP y permitir reanudar desde la última carpeta terminada.

Estados:

```text
QUEUED
PROCESSING
COMPLETED
PARTIAL
CANCELLED
ERROR
```

Si Redis falla después del `COMMIT`, el trabajo debe permanecer `QUEUED`. El worker también debe buscar periódicamente trabajos pendientes en Oracle.

## 12. Reclamo seguro y recuperación

Antes de procesar, el worker debe cambiar atómicamente:

```text
QUEUED → PROCESSING
```

Debe utilizar `FOR UPDATE SKIP LOCKED` o un `UPDATE` condicional.

Aunque Redis entregue dos veces el mismo `job_id`, Oracle debe permitir que solamente un worker lo procese.

El worker debe actualizar heartbeat y lease. Si el worker desaparece:

- El trabajo vuelve a `QUEUED` cuando queden intentos.
    
- El trabajo pasa a `ERROR` cuando se agoten.
    
- Las carpetas `COMPLETED` no se vuelven a copiar.
    

## 13. Cancelación

Al cancelar:

1. Guardar `CANCEL_REQUESTED='S'` en Oracle.
    
2. Confirmar Oracle.
    
3. Crear:
    

```text
dig:v1:expert-mass:cancel:{job_id}
```

con TTL de 48 horas.

El worker debe consultar la bandera Redis periódicamente y Oracle como respaldo.

No consultar SQLite por cada megabyte copiado.

## 14. Copia de PDF

No guardar PDF en Redis.

Para cada archivo:

1. Copiar desde el ZIP hacia `archivo.pdf.part`.
    
2. Usar buffer de 4 MiB.
    
3. Ejecutar `flush()` y `fsync()`.
    
4. Publicar con `os.replace()`.
    
5. Mantener bloqueo por archivo destino.
    
6. Si existe el PDF, conservar backup antes del reemplazo.
    
7. Si falla la auditoría, restaurar el archivo anterior o eliminar el nuevo.
    

Debe reutilizarse la lógica segura de:

```text
scripts/mass_upload_optimized_processor.py
```

pero sin activar ni mostrar `/experto/carga-masiva-optimizada`.

## 15. Actualización del caché después de copiar

Durante la carga se deben acumular pares únicos:

```python
redis_pending: set[tuple[int, str]] = set()
```

Después de copiar correctamente una carpeta:

```python
redis_pending.add((tramite, anio))
```

Registrar los pares mediante el mecanismo existente:

```python
_cd_register_redis_pending_pairs(
    pairs=redis_pending,
    operation="MASS_UPLOAD",
)
```

Hacerlo agrupadamente y limpiar el conjunto después de confirmar.

No llamar `refresh_tramite_cache()` después de cada PDF.

`motor_redis/worker.py` procesará `CD_REDIS_SYNC` y refrescará cada trámite una sola vez, aunque se hayan copiado varios PDF.

Si la carga termina parcialmente, deben registrarse los trámites que sí fueron modificados.

## 16. Concurrencia

Comenzar con dos instancias del worker:

```text
expert-mass-worker@1
expert-mass-worker@2
```

No iniciar más hasta medir disco, CPU y tiempo.

Redis no será el mayor consumidor de memoria porque solamente guardará rutas, estados y metadatos. Los PDF seguirán en disco.

## 17. Variables de configuración

Agregar:

```text
EXPERT_MASS_REDIS_ENABLED=1
EXPERT_MASS_REDIS_QUEUE=dig:v1:expert-mass:jobs
EXPERT_MASS_REDIS_STATUS_TTL=172800
EXPERT_MASS_WORKER_COUNT=2
EXPERT_MASS_WORKER_POLL_SECONDS=5
EXPERT_MASS_HEARTBEAT_SECONDS=15
EXPERT_MASS_STALE_SECONDS=900
EXPERT_MASS_PROGRESS_EVERY_FILES=10
EXPERT_MASS_COPY_BUFFER_BYTES=4194304
EXPERT_MASS_SKIP_SHA256=1
```

Debe existir un feature flag que permita regresar temporalmente al flujo anterior.

## 18. Pruebas obligatorias

La implementación debe probar:

1. Un ZIP pequeño.
    
2. Un ZIP con miles de carpetas.
    
3. Tres usuarios cargando simultáneamente.
    
4. Redis detenido antes de registrar el trabajo.
    
5. Redis detenido durante la copia.
    
6. Reinicio de FastAPI durante una carga.
    
7. Caída del worker.
    
8. Mensaje Redis duplicado.
    
9. Cancelación durante un PDF grande.
    
10. Carpeta inexistente.
    
11. Carpeta ambigua.
    
12. Índice Redis desactualizado.
    
13. Trámite revisado.
    
14. Periodo cerrado.
    
15. Sustitución de PDF con backup.
    
16. Auditoría con `SHA256=NULL`.
    
17. Actualización posterior de `CD_REDIS_SYNC`.
    
18. Confirmación de que el nuevo PDF aparece en el caché del trámite.
    

## 19. Mediciones

Registrar por trabajo:

```text
upload_seconds
zip_scan_seconds
folder_mapping_seconds
oracle_validation_seconds
copy_seconds
audit_seconds
redis_sync_seconds
total_seconds
```

Comparar el mismo ZIP antes y después.

La mejora debe mostrar especialmente:

- Reducción del tiempo de mapeo.
    
- Menos lecturas completas de `folders.sqlite`.
    
- Menos escrituras repetidas de `status.json`.
    
- Menos consultas Oracle individuales.
    
- FastAPI disponible mientras se procesan los archivos.
    

La regla arquitectónica es:

**Oracle conserva y controla el trabajo; Redis acelera el índice, la cola, el progreso y la cancelación; el worker copia; el disco conserva los PDF; `CD_REDIS_SYNC` actualiza posteriormente el caché documental.**
