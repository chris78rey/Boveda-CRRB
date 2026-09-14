---
tags:
  - spf
  - _
  - "#_"
base: "[[graphify-out/GRAPH_REPORT.md|GRAPH_REPORT]]"
---

Tras revisar [digi_01(2).txt](sandbox:/workspace/scratch/a9fb2ffac672/upload/digi_01\(2\).txt) y [digi_02(2).txt](sandbox:/workspace/scratch/a9fb2ffac672/upload/digi_02\(2\).txt), los procesos con mayor necesidad de recursos son los siguientes.

|Prioridad|Proceso u opción|Recurso principal|Motivo|
|---|---|---|---|
|Crítica|Carga masiva de ZIP y PDFs|Disco, CPU y RAM|Descomprime, copia cientos o miles de PDFs, actualiza auditoría y puede calcular SHA-256|
|Crítica|`redis-server` con índice de carpetas/PDFs|RAM|Mantiene permanentemente rutas, metadatos, índices por trámite y registros de Oracle|
|Muy alta|Carga de ambas cachés de Redis|Disco, Oracle, CPU y RAM|Lee `SELECT *` de Oracle y recorre dos veces el árbol completo de carpetas y PDFs|
|Muy alta|`refresh_sftp_mirror.sh`|Disco y capacidad de almacenamiento|Duplica prácticamente todo el repositorio mediante `rsync` y mantiene versiones `BUILD`, `DST` y `PREV`|
|Muy alta|Optimización y unión de PDFs con Ghostscript|CPU, disco y RAM|Reprocesa y reescribe completamente cada PDF|
|Alta|Reindexación de carpetas|Disco y RAM|Recorre todo `DIGI_BASE_DIR`, guarda todas las rutas en memoria y reconstruye `folders.sqlite`|
|Alta|Exportación mensual SFTP|Disco, RAM y red|Recorre las carpetas varias veces, construye listas completas y transfiere todos los archivos|
|Alta|Auditorías globales del repositorio|Disco, RAM y Oracle|Recorren cientos de miles de carpetas/PDFs y comparan contra SQLite u Oracle|
|Media-alta|Generador de carpetas desde Oracle|Oracle y disco|Consulta registros pendientes y crea estructuras; se ejecuta cada 10 segundos|
|Media-alta|Copia SQLite → Oracle / procesos Polars|Oracle, red y RAM|Lee lotes completos y ejecuta inserciones masivas|
|Baja|API de consulta Redis|CPU y RAM moderadas|Las búsquedas normales son rápidas y no leen PDFs|
|Baja|Telegram polling, estado de trabajos y colas SQLite|CPU y RAM bajas|Solo consultan pequeños estados o esperan eventos|

### 1. Carga masiva: el proceso más delicado

El proyecto contiene varias implementaciones:

- Carga masiva estándar: copia el PDF y después vuelve a leerlo para calcular SHA-256. Esto prácticamente duplica la lectura de disco.
    
- Carga especial de Leticia: usa `skip_hash_for_audit=True`; reduce bastante CPU y operaciones de disco.
    
- Piloto optimizado: utiliza `mass_upload_optimized_worker.py` y `mass_upload_optimized_processor.py`. Acepta ZIP de hasta 2 GB comprimidos y hasta 20 GB expandidos.
    
- El piloto permite, por defecto, hasta tres trabajos simultáneos mediante `MASS_UPLOAD_MAX_CONCURRENT=3`.
    

Con tres usuarios procesando ZIP grandes, pueden existir tres procesos de descompresión y copia trabajando simultáneamente. En ese escenario, el cuello de botella probablemente será el almacenamiento, no la RAM.

Además, el piloto optimizado respalda los PDFs reemplazados y ejecuta `fsync`; esto protege la integridad, pero produce bastante escritura física.

### 2. Redis: dos consumos diferentes

Debe distinguirse entre:

- `motor_redis/worker.py`: construye el índice. Tiene límite de 512 MB y 100% de una CPU.
    
- `redis-server`: conserva el índice completo en memoria. Este será el verdadero consumidor permanente de RAM.
    

La carga del índice del filesystem realiza:

1. Un primer recorrido para contar carpetas y PDFs.
    
2. Un segundo recorrido para almacenar rutas y metadatos en Redis.
    

Con aproximadamente 180.000 carpetas y siete PDFs por carpeta, se revisarían cerca de 1,26 millones de PDFs dos veces. No se cargan los binarios, pero sí rutas, tamaños, fechas, JSON y listas por trámite.

En los archivos revisados no aparece un límite `maxmemory` para Redis. En un servidor de 32 GB convendría establecerlo expresamente.

### 3. FastAPI puede multiplicar el consumo

El proceso FastAPI mantiene `_MASS_FOLDER_INDEX_CACHE`, un índice Python de todas las carpetas. Este índice puede ocupar cientos de megabytes dependiendo de la longitud de las rutas.

Si se ejecutan cuatro workers de Uvicorn, cada worker tendrá su propia copia:

```text
4 workers FastAPI
→ 4 cachés de carpetas
→ 4 JVM embebidas potenciales por JDBC
→ hasta 4 workers internos de lotes grandes
```

La rutina `_ensure_large_mass_worker_started()` se ejecuta al iniciar cada proceso FastAPI. Por ello, aumentar workers sin separar las tareas pesadas puede multiplicar RAM y concurrencia inesperadamente.

### 4. Procesos que deberían estar separados de la aplicación web

Los siguientes deberían ejecutarse como servicios o workers independientes, con límites de CPU y memoria:

- Carga masiva.
    
- Optimización y unión de PDFs.
    
- Carga completa de cachés Redis.
    
- Reindexación total de carpetas.
    
- Exportación y réplica SFTP.
    
- Auditorías globales.
    
- Procesos SQLite → Oracle.
    

La API web debería quedarse principalmente con búsquedas, visualización, autenticación, carga individual y consulta del estado de los trabajos.

### Mayor riesgo encontrado

La carga masiva antigua crea un `threading.Thread` por solicitud, sin un límite global visible. Varios usuarios podrían iniciar tareas simultáneas dentro del mismo proceso FastAPI.

El piloto optimizado es más controlable porque tiene cola, workers separados, recuperación de trabajos y límite de concurrencia. Para el servidor actual, lo prudente sería comenzar con:

```env
MASS_UPLOAD_MAX_CONCURRENT=1
```

Después podría probarse con `2`. El valor `3` solamente debería utilizarse cuando las mediciones demuestren que el almacenamiento soporta tres escrituras y descompresiones simultáneas sin afectar a los usuarios.

Para conocer qué proceso está consumiendo recursos en tiempo real, harían falta mediciones de `pidstat`, `iotop`, `systemd-cgtop` y `redis-cli INFO memory`; los archivos adjuntos permiten identificar el riesgo por diseño, pero no muestran porcentajes actuales.