---
tipo: tarea
estado: pendiente
tags:
  - tarea
  - tareas
  - inbox
  - sistema/obsidian
  - migracion
  - lleno_disco
base: "[[00_Inbox/Tareas.md|Tareas]]"
---
[[antes de 1315]]

----

1315

No puedes esperar hasta el lunes sin hacer una acción preventiva.

Tu generación reciente es muy alta:

- 09-SEP: **104,48 GB**
- 10-SEP: **235,25 GB**
- 11-SEP: **245,37 GB**
- 12-SEP: **168,67 GB**
- Libre en `+FLASH`: **33,56 GB**

A este ritmo, `+FLASH` podría llenarse nuevamente en aproximadamente **2–4 horas**.

Ejecuta ahora en `rac2`:

```
rman target /

BACKUP AS COMPRESSED BACKUPSET ARCHIVELOG ALL
NOT BACKED UP 1 TIMES
FORMAT '/respaldos/RMAN/PRDSGH_ARC_%d_%T_%U.bkp'
DELETE INPUT;
```

Esto respalda los archivelogs en `/respaldos/RMAN` y elimina cada archivo de `+FLASH` solamente después de respaldarlo correctamente.

Después verifica:

```
SELECT name,
       ROUND(space_used / 1024 / 1024 / 1024, 2) AS usado_gb,
       ROUND(space_limit / 1024 / 1024 / 1024, 2) AS limite_gb
FROM v$recovery_file_dest;
```

El nivel 0 de la base puede esperar hasta el lunes solamente después de estabilizar los archivelogs. No vuelvas a ejecutar `CROSSCHECK ARCHIVELOG ALL`; ya comprobaste que tarda demasiado.

---


El backup **no se ejecutó**. El error menciona `ORDER`, que no pertenece al comando; probablemente quedó texto de una consulta anterior en la entrada de RMAN.

Sal y vuelve a entrar:

```
RMAN> EXIT
```

```
rman target /
```

Luego ejecuta esta línea limpia, sin `\` antes de los guiones bajos:

```
BACKUP AS COMPRESSED BACKUPSET ARCHIVELOG ALL NOT BACKED UP 1 TIMES FORMAT '/respaldos/RMAN/PRDSGH_ARC_%d_%T_%U.bkp' DELETE INPUT;
```

Debe comenzar con:

```
Starting backup at
```

Y posteriormente mostrar:

```
deleted archived log
```

`DELETE INPUT` solo elimina cada archivelog después de respaldarlo correctamente. [Documentación Oracle](https://docs.oracle.com/database/121/BRADV/rcmbckba.htm)


---

1319

Sí, puedes retirarte cuando termine, pero verifica estas 3 cosas:

1. Debe aparecer:

```
Finished backup at
RMAN>
```

Sin errores `RMAN-` o `ORA-`.

2. Comprueba que bajó la FRA:

```
SELECT name,
       ROUND(space_used / 1024 / 1024 / 1024, 2) AS usado_gb,
       ROUND(space_limit / 1024 / 1024 / 1024, 2) AS limite_gb
FROM v$recovery_file_dest;
```

3. Verifica ambas instancias:

```
SELECT inst_id, status, error
FROM gv$archive_dest
WHERE dest_id = 1;
```

Debe mostrar `VALID` en las dos instancias.

El respaldo actual solo está protegiendo los **archivelogs**. El respaldo nivel 0 de toda la base todavía queda pendiente para el lunes; por eso no ejecutes aún `RESTORE DATABASE VALIDATE`.