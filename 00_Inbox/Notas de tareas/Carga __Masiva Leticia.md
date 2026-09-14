---
tags:
  - spd
  - _
  - "#_"
base: "[[graphify-out/GRAPH_REPORT.md|GRAPH_REPORT]]"
---

Este texto puede copiarse completo en el otro modelo. Está diseñado para que revise únicamente los archivos necesarios y ejecute directamente la implementación.

Se requiere extender la automatización ya implementada para la opción **«Usuario experto – Carga masiva»** hacia la opción **«Carga masiva administradores»**, conservando exactamente las diferencias funcionales y de seguridad de esta última.

## 1. Objetivo

La opción:

```text
/experto/carga-masiva-leticia
```

visible como:

```text
Carga masiva administradores
```

debe dejar de procesar los ZIP mediante `threading.Thread` dentro de FastAPI y debe utilizar la infraestructura durable que ya funciona para:

```text
/experto/carga-masiva
```

La implementación deberá reutilizar:

- La misma cola Redis.
    
- El mismo índice Redis de carpetas.
    
- Las mismas tablas Oracle:
    
    - `CD_MASS_UPLOAD_JOB`
        
    - `CD_MASS_UPLOAD_FOLDER`
        
- El mismo worker independiente:
    
    - `scripts/expert_mass_redis_worker.py`
        
- Los mismos mecanismos de:
    
    - progreso;
        
    - cancelación;
        
    - recuperación;
        
    - reanudación;
        
    - auditoría;
        
    - actualización de Redis después de copiar.
        
- La copia de archivos sin calcular SHA-256 del contenido.
    

No se debe crear una segunda cola, un segundo worker, otra base SQLite ni nuevas tablas Oracle.

---

# 2. Archivos que deben revisarse y modificarse

Limitar la investigación inicialmente a estos archivos:

```text
fastapi_app/app.py
scripts/expert_mass_redis.py
scripts/expert_mass_redis_worker.py
.env.example
```

Solo revisar el archivo del servicio `systemd` que actualmente ejecuta `scripts/expert_mass_redis_worker.py` para confirmar que utiliza el mismo `.env`.

No modificar las siguientes funcionalidades:

```text
Carga masiva por especialidad
Carga masiva lote grande
Carga masiva optimizada piloto
Carga masiva revisión histórica
Carga normal de carpetas
```

---

# 3. Estado actual confirmado

La carga masiva normal utiliza Redis/Oracle cuando:

```env
EXPERT_MASS_REDIS_ENABLED=1
```

Las rutas normales ya llaman a:

```python
_expert_mass_enqueue_zip(...)
_expert_mass_enqueue_plan(...)
```

El worker independiente procesa las operaciones:

```text
validate
process
execute
```

La carga masiva administradores todavía llama a:

```python
_mass_validate_async_start(...)
_mass_process_async_start(...)
_mass_execute_async_start(...)
```

Estas funciones crean un:

```python
threading.Thread(..., daemon=True)
```

dentro de FastAPI.

Esto provoca que la carga administrativa:

- dependa del proceso web;
    
- pueda interrumpirse al reiniciar FastAPI;
    
- no se recupere desde Oracle como la carga experta;
    
- no utilice completamente la automatización Redis ya desarrollada.
    

La ruta administrativa asíncrona ya utiliza:

```python
progress_profile="light"
skip_hash_for_audit=True
```

pero las rutas antiguas `/validar` y `/ejecutar` todavía pueden ejecutar la lógica local. En especial, `/ejecutar` llama directamente a `_mass_execute_plan()` sin garantizar `skip_hash_for_audit=True`.

---

# 4. Diferencia funcional que debe conservarse

La carga masiva normal debe continuar bloqueando documentos de trámites completamente revisados.

La carga masiva administradores debe continuar permitiendo la carga en trámites revisados, pero exclusivamente para los usuarios autorizados.

Actualmente, el código contiene:

```python
_CONTROL_DOC_REVIEW_UPLOAD_BYPASS_USERS = {
    "LETICIA_MORENO",
}
```

También contiene:

```python
_MONTHLY_CLOSURE_UPLOAD_BYPASS_USERS = {
    "LETICIA_MORENO",
}
```

Por tanto, aunque la pantalla se denomina «Carga masiva administradores», actualmente el permiso especial pertenece solamente a:

```text
LETICIA_MORENO
```

No agregar otros usuarios automáticamente.

---

# 5. Operaciones nuevas en la cola

Incorporar tres operaciones nuevas, manteniendo intactas las existentes:

```python
OP_VALIDATE = "validate"
OP_PROCESS = "process"
OP_EXECUTE = "execute"

OP_ADMIN_VALIDATE = "admin_validate"
OP_ADMIN_PROCESS = "admin_process"
OP_ADMIN_EXECUTE = "admin_execute"
```

Crear un conjunto explícito:

```python
ALLOWED_OPERATIONS = {
    OP_VALIDATE,
    OP_PROCESS,
    OP_EXECUTE,
    OP_ADMIN_VALIDATE,
    OP_ADMIN_PROCESS,
    OP_ADMIN_EXECUTE,
}
```

La longitud de estos valores es compatible con el límite actual de 30 caracteres aplicado al campo Oracle `OPERATION`.

Agregar una función que valide y normalice las operaciones antes de guardarlas en Oracle o Redis:

```python
def normalize_operation(value: object) -> str:
    operation = str(value or "").strip().lower()
    if operation not in ALLOWED_OPERATIONS:
        raise ExpertMassRedisError(
            f"Operación de carga masiva no permitida: {operation}"
        )
    return operation
```

Utilizarla dentro de:

```python
enqueue(...)
oracle_insert_job(...)
oracle_requeue_job(...)
```

No aceptar silenciosamente cualquier texto como operación.

---

# 6. Configuración compartida de usuarios

Evitar tener una lista en FastAPI y otra diferente en el worker.

Agregar en `scripts/expert_mass_redis.py` funciones compartidas para canonicalizar y validar usuarios:

```python
def canonical_user(value: object) -> str:
    raw = str(value or "").strip().upper().replace(" ", "_")
    return re.sub(r"[^A-Z0-9_$#]", "", raw)


def configured_users(variable: str, default: str = "") -> set[str]:
    raw = str(os.environ.get(variable) or default)
    return {
        canonical_user(item)
        for item in re.split(r"[,;\s]+", raw)
        if canonical_user(item)
    }


def admin_mass_users() -> set[str]:
    return configured_users(
        "EXPERT_MASS_ADMIN_USERS",
        "LETICIA_MORENO",
    )


def admin_mass_user_allowed(value: object) -> bool:
    user = canonical_user(value)
    return bool(user) and user in admin_mass_users()


def monthly_bypass_users() -> set[str]:
    current = configured_users(
        "EXPERT_MASS_MONTHLY_BYPASS_USERS",
        "LETICIA_MORENO",
    )

    # Compatibilidad con la variable ya usada por el worker.
    legacy = configured_users(
        "MASS_UPLOAD_OPTIMIZED_MONTHLY_BYPASS_USERS",
        "",
    )
    return current | legacy
```

Agregar en `.env.example`:

```env
# Activa la cola Redis/Oracle para carga masiva
EXPERT_MASS_REDIS_ENABLED=1

# Usuarios autorizados para Carga masiva administradores
EXPERT_MASS_ADMIN_USERS=LETICIA_MORENO

# Usuarios autorizados para cargar en periodos cerrados
EXPERT_MASS_MONTHLY_BYPASS_USERS=LETICIA_MORENO
```

En `fastapi_app/app.py`, modificar:

```python
_can_use_leticia_review_mass_upload(...)
```

para que utilice la función compartida:

```python
def _can_use_leticia_review_mass_upload(oracle_user: str) -> bool:
    return _expert_admin_mass_user_allowed(oracle_user)
```

Importar la función desde:

```python
scripts.expert_mass_redis
```

No ampliar permisos por pertenecer a `SPD_ADMIN`, `_PRODUCTIVIDAD_ADMIN_USERS` u otra lista general. El permiso para ignorar la revisión debe seguir siendo específico.

---

# 7. Cambios en `_expert_mass_enqueue_zip`

La función existente debe guardar también la operación dentro del estado inicial.

Ejemplo:

```python
operation_s = _expert_normalize_operation(operation)
admin_mode = operation_s in {
    "admin_validate",
    "admin_process",
    "admin_execute",
}

_mass_status_init(
    token,
    status="queued",
    last_message=f"{status_label}: guardando ZIP y enviando al worker...",
    oracle_user=_canon_oracle_user(oracle_user or "?"),
    client_ip=client_ip,
    progress_profile="light",
    operation=operation_s,
    admin_mode=admin_mode,
)
```

Separar obligatoriamente la inserción Oracle del envío Redis.

El flujo correcto debe ser:

```python
try:
    _expert_oracle_insert_job(...)
except Exception:
    # Aquí sí se considera que no se pudo encolar.
    ...

try:
    _expert_redis_enqueue(token, operation_s)
except Exception as exc:
    # No marcar el trabajo como ERROR.
    # El trabajo ya está durablemente registrado en Oracle.
    # El worker puede recuperarlo mediante oracle_next_queued_job().
    _mass_status_update(
        token,
        status="queued",
        last_message=(
            "Trabajo registrado en Oracle. Redis no respondió; "
            "el worker lo recogerá desde la cola durable."
        ),
        redis_warning=str(exc),
    )
```

Si Oracle insertó correctamente el trabajo y Redis falla, la respuesta al usuario debe continuar indicando que el trabajo quedó en cola.

No provocar que el usuario vuelva a enviar el mismo ZIP y cree un trabajo duplicado.

Aplicar la misma separación en `_expert_mass_enqueue_plan()`:

1. Reencolar en Oracle.
    
2. Intentar publicar en Redis.
    
3. Si Redis falla, mantener el trabajo en estado `QUEUED` en Oracle.
    

---

# 8. Modificar `_expert_mass_enqueue_plan`

Actualmente esta función utiliza internamente:

```python
operation="execute"
```

Modificar su firma para recibir la operación:

```python
def _expert_mass_enqueue_plan(
    request: Request,
    token: str,
    *,
    response_prefix: str,
    operation: str = "execute",
) -> Response:
```

Normalizarla:

```python
operation_s = _expert_normalize_operation(operation)
```

Utilizar `operation_s` tanto en:

```python
_expert_oracle_requeue_job(...)
_expert_oracle_insert_job(...)
_expert_redis_enqueue(...)
```

Para la pantalla normal se debe seguir enviando:

```python
operation="execute"
```

Para administradores se debe enviar:

```python
operation="admin_execute"
```

---

# 9. Cambios exactos en las rutas administrativas

## 9.1 Validación asíncrona

Modificar:

```python
@app.post("/experto/carga-masiva-leticia/validar-async")
```

Esta ruta actualmente no vuelve a comprobar explícitamente el permiso especial. El acceso a la página no es suficiente, porque alguien podría invocar directamente el `POST`.

Debe obtener el usuario de sesión y validar:

```python
oracle_user = ""
if isinstance(getattr(request, "session", None), dict):
    oracle_user = str(request.session.get("oracle_user") or "")

if not _can_use_leticia_review_mass_upload(oracle_user):
    return JSONResponse(
        {"error": "No autorizado para carga masiva administradores."},
        status_code=403,
    )
```

Cuando Redis esté habilitado:

```python
if _expert_mass_redis_enabled():
    return _expert_mass_enqueue_zip(
        request,
        zip_file,
        response_prefix="/experto/carga-masiva-leticia",
        operation="admin_validate",
        status_label="Validación carga masiva administradores",
    )
```

Mantener temporalmente el mecanismo anterior solamente como fallback controlado cuando:

```env
EXPERT_MASS_REDIS_ENABLED=0
```

## 9.2 Procesamiento completo

Modificar:

```python
@app.post("/experto/carga-masiva-leticia/procesar-async")
```

Después de comprobar el usuario autorizado:

```python
if _expert_mass_redis_enabled():
    return _expert_mass_enqueue_zip(
        request,
        zip_file,
        response_prefix="/experto/carga-masiva-leticia",
        operation="admin_process",
        status_label="Carga masiva administradores",
    )
```

No llamar a `_mass_process_async_start()` cuando Redis esté habilitado.

Mantener el fallback anterior, detrás de la bandera, únicamente para rollback:

```python
return _mass_process_async_start(
    request,
    zip_file,
    response_prefix="/experto/carga-masiva-leticia",
    block_reason_fn=_bulk_upload_block_reason_leticia_review_mode,
    source="expert_mass_process_leticia",
    status_label="Proceso masivo revisados",
    progress_profile="light",
    skip_hash_for_audit=True,
)
```

## 9.3 Ejecución de un plan ya validado

Modificar:

```python
@app.post("/experto/carga-masiva-leticia/ejecutar-async")
```

Cuando Redis esté habilitado:

```python
if _expert_mass_redis_enabled():
    return _expert_mass_enqueue_plan(
        request,
        token,
        response_prefix="/experto/carga-masiva-leticia",
        operation="admin_execute",
    )
```

## 9.4 Rutas antiguas

Revisar:

```text
/experto/carga-masiva-leticia/validar
/experto/carga-masiva-leticia/ejecutar
```

Ambas deben:

- validar nuevamente el usuario;
    
- delegar al mecanismo Redis/Oracle cuando esté habilitado;
    
- no crear ejecución directa;
    
- no calcular SHA;
    
- no permitir que un `POST` directo evada la autorización.
    

La ruta antigua `/ejecutar` no debe seguir llamando directamente a:

```python
_mass_execute_plan(...)
```

cuando `EXPERT_MASS_REDIS_ENABLED=1`.

---

# 10. Cambios en el worker

Modificar únicamente:

```text
scripts/expert_mass_redis_worker.py
```

No importar `fastapi_app.app`, porque el worker debe continuar independiente de FastAPI.

## 10.1 Resolver la política de la operación

Agregar:

```python
_ADMIN_OPERATIONS = {
    "admin_validate",
    "admin_process",
    "admin_execute",
}


def _operation_policy(
    operation: object,
    oracle_user: object,
) -> tuple[str, bool, bool]:
    operation_s = normalize_operation(operation)
    admin_mode = operation_s in _ADMIN_OPERATIONS

    if admin_mode and not admin_mass_user_allowed(oracle_user):
        raise RuntimeError(
            "Usuario no autorizado para carga masiva administradores"
        )

    base_operation = {
        "validate": "validate",
        "process": "process",
        "execute": "execute",
        "admin_validate": "validate",
        "admin_process": "process",
        "admin_execute": "execute",
    }[operation_s]

    allow_review_bypass = admin_mode
    allow_monthly_bypass = (
        admin_mode
        and canonical_user(oracle_user) in monthly_bypass_users()
    )

    return (
        base_operation,
        allow_review_bypass,
        allow_monthly_bypass,
    )
```

Importar desde `expert_mass_redis.py`:

```python
admin_mass_user_allowed
canonical_user
monthly_bypass_users
normalize_operation
```

## 10.2 Modificar `_process_job`

Después de reclamar el trabajo Oracle:

```python
job = oracle_claim_job(job_id, worker_id)
```

resolver:

```python
operation_raw = str(job.get("operation") or operation or "process")
base_operation, allow_review_bypass, allow_monthly_bypass = (
    _operation_policy(
        operation_raw,
        job.get("oracle_user"),
    )
)
```

La lógica debe quedar conceptualmente así:

```python
if base_operation == "validate":
    plan = _build_plan(job_id, _zip_path(job_id))
    _write_json_atomic(_plan_path(job_id), plan)
    # Guardar totales, estado y plan.
    return

if base_operation == "process":
    plan = _build_plan(job_id, _zip_path(job_id))
    _write_json_atomic(_plan_path(job_id), plan)
else:
    # execute
    plan = json.loads(
        _plan_path(job_id).read_text(encoding="utf-8")
    )

_execute_plan(
    job,
    plan,
    worker_id,
    allow_review_bypass=allow_review_bypass,
    allow_monthly_bypass=allow_monthly_bypass,
)
```

No tratar `admin_process` como si fuera `execute`. Debe construir el plan antes de copiar.

## 10.3 Modificar `_execute_plan`

Cambiar la firma:

```python
def _execute_plan(
    job: dict[str, object],
    plan: dict[str, object],
    worker_id: str,
    *,
    allow_review_bypass: bool = False,
    allow_monthly_bypass: bool = False,
) -> None:
```

Pasar estas banderas a `_oracle_block_reasons()`.

---

# 11. Reglas de bloqueo del worker

Modificar:

```python
_oracle_block_reasons(...)
```

para recibir:

```python
def _oracle_block_reasons(
    tramites: list[str],
    user: str,
    *,
    allow_review_bypass: bool = False,
    allow_monthly_bypass: bool = False,
) -> dict[str, str]:
```

Cambiar la regla de revisión:

```python
if (
    reviewed > 0
    and pending == 0
    and tramite not in unlocked
    and not allow_review_bypass
):
    reasons[tramite] = "review"
    continue
```

Cambiar la regla mensual:

```python
if (
    period in closed
    and (period, tramite) not in exceptions
    and not allow_monthly_bypass
):
    reasons[tramite] = "monthly"
```

Resultados esperados:

|Operación|Trámite revisado|Periodo cerrado|
|---|--:|--:|
|`process`|Bloqueado|Bloqueado, salvo regla normal|
|`execute`|Bloqueado|Bloqueado, salvo regla normal|
|`admin_process` autorizado|Permitido|Según lista mensual autorizada|
|`admin_execute` autorizado|Permitido|Según lista mensual autorizada|
|Operación administrativa no autorizada|Error de seguridad|Error de seguridad|

No modificar las reglas de la carga normal.

---

# 12. No calcular SHA del PDF

La nueva modalidad administrativa debe utilizar `_copy_pdf()` del worker existente.

El worker actualmente registra:

```text
sha256 = NULL
```

en la auditoría. Esto debe conservarse.

No llamar a:

```python
_sha256_file(...)
hashlib.sha256(...)
```

sobre los PDF copiados.

No leer nuevamente el archivo después de copiarlo para calcular una huella.

Sí se deben conservar:

- usuario Oracle;
    
- dirección IP;
    
- carpeta;
    
- nombre del PDF;
    
- ruta destino;
    
- tamaño;
    
- fecha;
    
- estado;
    
- reemplazo;
    
- error;
    
- copia de respaldo cuando reemplaza;
    
- reporte CSV.
    

No eliminar esta instrucción del worker:

```python
hashlib.blake2b(str(dest).encode(), digest_size=16)
```

Ese `blake2b` solo genera el nombre corto del archivo de bloqueo a partir de la ruta destino. No calcula el hash del contenido del PDF y evita escrituras simultáneas sobre el mismo archivo.

---

# 13. Copia segura y reemplazos

Conservar el comportamiento actual de `_copy_pdf()`:

1. Validar que la carpeta está dentro de `_base_dir()`.
    
2. Rechazar enlaces simbólicos.
    
3. Adquirir un bloqueo exclusivo por destino.
    
4. Si el PDF existe, crear respaldo.
    
5. Escribir primero en un archivo `.part`.
    
6. Ejecutar `flush()` y `fsync()`.
    
7. Reemplazar atómicamente con `os.replace()`.
    
8. Registrar auditoría.
    
9. Restaurar el respaldo si la auditoría o la copia falla.
    
10. Eliminar el `.part` después de un error.
    

No reemplazar esta lógica por una copia directa con `shutil.copyfile()`.

---

# 14. Estado, progreso, reporte y cancelación

Actualmente `_expert_mass_queue_response()` construye las URLs usando `response_prefix`.

Si recibe:

```text
/experto/carga-masiva-leticia
```

generará:

```text
/experto/carga-masiva-leticia/status/{token}
/experto/carga-masiva-leticia/progreso/{token}
```

Estas rutas administrativas deben existir o la respuesta debe usar explícitamente las rutas compartidas.

Se recomienda crear rutas administrativas que reutilicen funciones internas comunes:

```text
GET  /experto/carga-masiva-leticia/status/{token}
GET  /experto/carga-masiva-leticia/progreso/{token}
GET  /experto/carga-masiva-leticia/reporte/{token}
GET  /experto/carga-masiva-leticia/reporte/{token}.csv
POST /experto/carga-masiva-leticia/cancelar/{token}
```

Todas deben:

- exigir autenticación;
    
- comprobar `_can_use_leticia_review_mass_upload()`;
    
- comprobar que el `oracle_user` del trabajo corresponde al usuario de sesión;
    
- consultar primero el estado Redis;
    
- usar Oracle como respaldo si Redis no tiene el estado;
    
- impedir consultar o cancelar trabajos ajenos;
    
- utilizar el mismo reporte CSV generado por el worker.
    

Agregar al resultado de `_expert_mass_status_from_oracle()`:

```python
"operation": str(row.get("operation") or ""),
"oracle_user": str(row.get("oracle_user") or ""),
"admin_mode": str(row.get("operation") or "") in {
    "admin_validate",
    "admin_process",
    "admin_execute",
},
```

El estado Redis también debe conservar:

```text
operation
oracle_user
admin_mode
```

Parametrizar `_mass_validate_progress_page()` para que no tenga enlaces administrativos apuntando a la pantalla normal.

Firma sugerida:

```python
def _mass_validate_progress_page(
    token: str,
    job: dict[str, object],
    *,
    route_prefix: str = "/experto/carga-masiva",
) -> HTMLResponse:
```

Usar `route_prefix` para:

- consulta de estado;
    
- cancelación;
    
- vista del reporte;
    
- descarga del CSV;
    
- regreso a la pantalla correspondiente.
    

Para administradores:

```python
route_prefix="/experto/carga-masiva-leticia"
```

---

# 15. Cancelación durable

La ruta administrativa de cancelación debe utilizar, cuando Redis esté habilitado:

```python
_expert_oracle_request_cancel(token)
_expert_redis_request_cancel(token)
```

Orden:

1. Validar autenticación.
    
2. Validar usuario administrativo.
    
3. Consultar el trabajo.
    
4. Validar que pertenece al usuario de sesión.
    
5. Marcar `CANCEL_REQUESTED='S'` en Oracle.
    
6. Intentar publicar la cancelación en Redis.
    
7. Si Redis falla, conservar la cancelación Oracle.
    
8. Responder con `cancelling` o `cancelled`.
    

El worker debe continuar comprobando:

- la llave Redis de cancelación;
    
- `CANCEL_REQUESTED` en Oracle;
    
- la señal durante la copia por bloques.
    

---

# 16. Recuperación después de reinicios

Conservar:

```python
oracle_recover_stale(...)
oracle_next_queued_job(...)
oracle_completed_folder_indexes(...)
```

Comportamiento esperado:

- Si FastAPI se reinicia, el worker continúa.
    
- Si Redis se reinicia, Oracle conserva el trabajo.
    
- Si el worker se reinicia, el heartbeat vencido permite reencolar.
    
- Las carpetas con estado `COMPLETED` no se vuelven a copiar.
    
- Una carpeta parcial puede procesarse nuevamente desde su inicio.
    
- Los reemplazos siguen siendo seguros gracias a respaldo, bloqueo y escritura atómica.
    

No agregar una segunda base de trabajos para administradores.

---

# 17. Actualización de las cachés después de copiar

Conservar:

```python
_sync_pairs(pending_pairs)
```

Después de cada conjunto de copias exitosas, registrar los pares:

```text
trámite/año
```

mediante:

```sql
P_CD_ENCOLA_REDIS
```

La actualización de `CD_REDIS_SYNC` debe ejecutarse también para `admin_process` y `admin_execute`.

No reconstruir completamente las cachés por cada carga.

---

# 18. Concurrencia

La modalidad normal y la administrativa deben compartir la misma cola y el mismo número actual de workers.

No aumentar la cantidad de workers durante esta modificación.

Esto evita que:

- una carga experta;
    
- una carga administrativa;
    
- y otra carga masiva
    

compitan simultáneamente por el almacenamiento.

Los bloqueos por archivo deben mantenerse como defensa adicional.

---

# 19. Compatibilidad y rollback

Mantener temporalmente el comportamiento local cuando:

```env
EXPERT_MASS_REDIS_ENABLED=0
```

Cuando tenga valor `1`:

- las rutas normales usarán Redis/Oracle;
    
- las rutas administrativas usarán Redis/Oracle;
    
- no se crearán threads de carga dentro de FastAPI.
    

No eliminar todavía las funciones locales:

```python
_mass_process_async_start(...)
_mass_execute_async_start(...)
_mass_validate_async_start(...)
```

Pueden quedar como rollback hasta terminar las pruebas.

Agregar mensajes de log que identifiquen:

```text
operation=admin_process
operation=admin_execute
oracle_user=LETICIA_MORENO
job_id=...
```

No registrar contraseñas, cookies, tokens de sesión ni contenido de los PDF.

---

# 20. Pruebas automatizadas mínimas

Crear o adaptar pruebas que cubran:

## Autorización

1. `LETICIA_MORENO` puede encolar `admin_process`.
    
2. Otro usuario recibe HTTP 403.
    
3. Un trabajo `admin_process` insertado manualmente para un usuario no autorizado es rechazado por el worker.
    
4. El `POST /validar-async` no permite evadir la autorización.
    
5. El `POST /ejecutar` antiguo no permite evadir la autorización.
    

## Operaciones

6. `process` construye plan y copia.
    
7. `execute` utiliza un plan existente.
    
8. `admin_process` construye plan y copia.
    
9. `admin_execute` utiliza un plan existente.
    
10. `admin_validate` solamente construye el plan.
    

## Bloqueos

11. `process` bloquea un trámite completamente revisado.
    
12. `admin_process` autorizado permite ese mismo trámite.
    
13. `admin_process` no autorizado falla antes de copiar.
    
14. El cierre mensual mantiene las reglas actuales.
    
15. Un usuario sin bypass mensual queda bloqueado.
    

## SHA

16. Ninguna ejecución del worker llama a `_sha256_file()`.
    
17. La columna `uploads_audit.sha256` queda en `NULL`.
    
18. La auditoría conserva usuario, IP, tamaño, ruta, nombre y estado.
    

## Persistencia

19. Si Redis falla después de insertar en Oracle, el trabajo queda `QUEUED`.
    
20. `oracle_next_queued_job()` permite que el worker lo recupere.
    
21. Un trabajo con heartbeat vencido vuelve a cola.
    
22. Una carpeta `COMPLETED` se omite al reanudar.
    
23. La cancelación Oracle funciona aunque Redis no responda.
    

## Regresión

24. La carga normal continúa bloqueando trámites revisados.
    
25. La carga normal sigue usando `validate`, `process` y `execute`.
    
26. No cambian las cargas por especialidad, lote grande, histórica ni piloto.
    

---

# 21. Prueba manual controlada

Realizar la prueba con un ZIP pequeño y carpetas de pruebas. No usar inicialmente un lote productivo grande.

Casos:

### Caso A: carga administrativa permitida

- Usuario: `LETICIA_MORENO`.
    
- Trámite: completamente revisado.
    
- Resultado:
    
    - trabajo Oracle creado;
        
    - operación `admin_process`;
        
    - worker reclama el trabajo;
        
    - PDF copiado;
        
    - `blocked_by_review=0`;
        
    - auditoría con `sha256=NULL`;
        
    - reporte CSV disponible;
        
    - actualización Redis del trámite encolada.
        

### Caso B: carga normal bloqueada

- Mismo trámite.
    
- Ruta normal `/experto/carga-masiva`.
    
- Resultado:
    
    - PDF no copiado;
        
    - `blocked_by_review>0`.
        

### Caso C: usuario no autorizado

- Invocar directamente el `POST` administrativo.
    
- Resultado:
    
    - HTTP 403;
        
    - no se crea trabajo Oracle;
        
    - no se guarda ZIP definitivo;
        
    - no se publica en Redis.
        

### Caso D: reinicio de FastAPI

- Iniciar `admin_process`.
    
- Reiniciar únicamente FastAPI.
    
- Resultado:
    
    - el worker continúa;
        
    - el trabajo termina;
        
    - el navegador puede recuperar el estado.
        

### Caso E: Redis no disponible

- Registrar un trabajo en Oracle.
    
- Simular fallo de publicación Redis.
    
- Resultado:
    
    - trabajo permanece `QUEUED`;
        
    - el worker lo encuentra consultando Oracle;
        
    - no se solicita subir nuevamente el ZIP.
        

### Caso F: reinicio del worker

- Interrumpir el worker durante una carga de prueba.
    
- Esperar la recuperación del heartbeat o ejecutar el mecanismo controlado de recuperación.
    
- Resultado:
    
    - el trabajo vuelve a cola;
        
    - las carpetas completadas no se repiten;
        
    - el trabajo finaliza.
        

---

# 22. Verificaciones técnicas

Ejecutar como mínimo:

```bash
python -m py_compile \
  fastapi_app/app.py \
  scripts/expert_mass_redis.py \
  scripts/expert_mass_redis_worker.py
```

Ejecutar las pruebas específicas del proyecto, si existen:

```bash
pytest -q
```

No ocultar fallos de pruebas existentes relacionados con los archivos modificados.

Consultar el trabajo Oracle:

```sql
SELECT
    JOB_ID,
    ORACLE_USER,
    OPERATION,
    STATUS,
    WORKER_ID,
    ATTEMPT_COUNT,
    CANCEL_REQUESTED,
    TOTAL_FOLDERS,
    PROCESSED_FOLDERS,
    TOTAL_PDFS,
    PROCESSED_PDFS,
    COPIED_PDFS,
    FAILED_PDFS,
    LAST_MESSAGE,
    ERROR_MESSAGE
FROM CD_MASS_UPLOAD_JOB
WHERE JOB_ID = :job_id;
```

Consultar el detalle por carpeta:

```sql
SELECT
    JOB_ID,
    FOLDER_INDEX,
    SOURCE_FOLDER,
    DESTINATION_FOLDER,
    STATUS,
    TOTAL_PDFS,
    PROCESSED_PDFS,
    COPIED_PDFS,
    FAILED_PDFS,
    LAST_MEMBER,
    ERROR_MESSAGE
FROM CD_MASS_UPLOAD_FOLDER
WHERE JOB_ID = :job_id
ORDER BY FOLDER_INDEX;
```

Verificar la auditoría:

```sql
-- Si uploads_audit está en SQLite, realizar la consulta en esa base.
SELECT
    oracle_user,
    folder_path,
    filename,
    sha256,
    action,
    saved_to,
    original_bytes,
    final_bytes,
    status,
    error
FROM uploads_audit
ORDER BY id DESC
LIMIT 20;
```

El campo `sha256` debe quedar vacío o `NULL`.

---

# 23. Restricciones obligatorias

No realizar ninguno de estos cambios:

- No crear otro worker.
    
- No crear otra cola Redis.
    
- No crear otra tabla de trabajos.
    
- No calcular SHA-256.
    
- No cargar todo el índice de carpetas en memoria por cada ZIP.
    
- No recorrer todo el repositorio para cada carpeta.
    
- No modificar los permisos de la carga normal.
    
- No permitir el bypass a todos los administradores.
    
- No confiar solamente en la seguridad del frontend.
    
- No dejar rutas antiguas capaces de saltarse la autorización.
    
- No hacer que el éxito del registro Oracle dependa de Redis.
    
- No cambiar la estructura permitida del ZIP:
    
    - `TRAMITE/archivo.pdf`.
        
- No tocar las otras modalidades de carga masiva.
    

---

# 24. Criterios de aceptación

La implementación se considera terminada únicamente cuando:

1. «Carga masiva administradores» utiliza el worker independiente.
    
2. No crea `threading.Thread` cuando Redis está habilitado.
    
3. El trabajo queda registrado en Oracle antes de Redis.
    
4. El worker reconoce `admin_validate`, `admin_process` y `admin_execute`.
    
5. El worker vuelve a validar el usuario autorizado.
    
6. `LETICIA_MORENO` conserva el permiso actual.
    
7. Los demás usuarios no adquieren ese permiso.
    
8. Los trámites revisados se permiten solamente en la modalidad administrativa autorizada.
    
9. La carga normal continúa bloqueándolos.
    
10. No se calcula SHA del PDF.
    
11. La auditoría queda completa con `sha256=NULL`.
    
12. La cancelación funciona en Oracle y Redis.
    
13. El progreso puede recuperarse después de cerrar el navegador.
    
14. Reiniciar FastAPI no interrumpe la copia.
    
15. Reiniciar Redis no pierde el trabajo.
    
16. Reiniciar el worker permite recuperar el trabajo.
    
17. Las cachés del trámite se actualizan después de copiar.
    
18. Las otras modalidades permanecen sin cambios.
    

---

# 25. Entrega esperada

Después de implementar, presentar:

1. Lista exacta de archivos modificados.
    
2. Descripción breve de cada modificación.
    
3. Diferencias entre el flujo normal y administrativo.
    
4. Variables de entorno agregadas.
    
5. Pruebas ejecutadas y resultados.
    
6. Resultado de `py_compile`.
    
7. Resultado de las pruebas automatizadas.
    
8. Procedimiento de despliegue.
    
9. Procedimiento de rollback mediante:
    
    ```env
    EXPERT_MASS_REDIS_ENABLED=0
    ```
    
10. Evidencia de que `uploads_audit.sha256` queda en `NULL`.
    
11. Confirmación de que no se creó otra cola, tabla o worker.
    
12. Cualquier riesgo o fallo encontrado antes de reiniciar servicios productivos.
    

Realizar la implementación directamente y evitar volver a analizar todo el repositorio. Comenzar por los cuatro archivos indicados y ampliar la revisión únicamente si una dependencia concreta lo exige.---
tags:
- 
---

