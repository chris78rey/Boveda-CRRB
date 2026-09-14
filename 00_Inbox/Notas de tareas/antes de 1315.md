---
base: "[[00_Inbox/Notas de tareas/LLENADA DE DISKO ORACLE.md|LLENADA DE DISKO ORACLE]]"
tags:
  - tarea
  - tareas
  - inbox
  - sistema/obsidian
  - migracion
  - lleno_disco
---
La causa está confirmada: la FRA `+FLASH` está llena.

- Límite: **700 GB**
- Usado: **700 GB**
- Recuperable: **0 GB**
- Instancia 2: destino `MANDATORY` con `ORA-19809`

Oracle no puede archivar los redo logs y por eso bloquea las conexiones normales. [Oracle ORA-00257](https://docs.oracle.com/en/error-help/db/ora-00257/)

### 1. Identifica qué está ocupando la FRA

Ejecuta como SYSDBA:

```
SELECT file_type,
       percent_space_used,
       percent_space_reclaimable
FROM v$flash_recovery_area_usage
ORDER BY percent_space_used DESC;
```

### 2. Verifica si `+FLASH` tiene espacio físico

```
sqlplus / as sysasm
```

```
SELECT name,
       total_mb,
       free_mb,
       usable_file_mb
FROM v$asm_diskgroup
WHERE name = 'FLASH';
```

Si tiene espacio físico, puedes aumentar la cuota, por ejemplo:

```
ALTER SYSTEM SET db_recovery_file_dest_size = 800G
SCOPE=BOTH
SID='*';
```

No ejecutes ese aumento si `usable_file_mb` es insuficiente.

### 3. Si no hay espacio, libera archivelogs con RMAN

Solo si existe un respaldo válido fuera de `+FLASH`:

```
rman target /

SHOW ALL;

LIST BACKUP OF ARCHIVELOG ALL;

CROSSCHECK ARCHIVELOG ALL;

DELETE NOPROMPT EXPIRED ARCHIVELOG ALL;
```

Después, si el respaldo está correctamente configurado:

```
BACKUP ARCHIVELOG ALL
NOT BACKED UP 1 TIMES
DELETE INPUT;
```

No borres archivos manualmente del sistema operativo ni uses `DELETE ARCHIVELOG` sin validar respaldos y Data Guard.

### 4. Verifica que se recuperó

```
ALTER SYSTEM ARCHIVE LOG CURRENT;
```

```
SELECT inst_id,
       dest_id,
       status,
       error
FROM gv$archive_dest
WHERE status <> 'INACTIVE'
   OR error IS NOT NULL;
```

Siguiente acción: ejecuta `v$flash_recovery_area_usage` y pega el resultado. Eso indicará si debes limpiar archivelogs, backups o flashback logs.


-----

Ejecuta en RMAN:

```
CROSSCHECK ARCHIVELOG ALL;

DELETE NOPROMPT EXPIRED ARCHIVELOG ALL;

DELETE NOPROMPT ARCHIVELOG ALL
BACKED UP 1 TIMES
TO DEVICE TYPE DISK;
```

Ese último comando elimina únicamente archivelogs que tienen al menos un respaldo en disco. Tus respaldos aparecen como `DISK` y existen conjuntos de archivelogs del **06-SEP-2026**.

`REPORT OBSOLETE` no libera los archivelogs porque solo reportó un backup de `SPFILE`.

Después verifica:

```
SELECT name,
       ROUND(space_limit / 1024 / 1024 / 1024, 2) AS limite_gb,
       ROUND(space_used / 1024 / 1024 / 1024, 2) AS usado_gb
FROM v$recovery_file_dest;
```

Y prueba el archivado:

```
ALTER SYSTEM ARCHIVE LOG CURRENT;
```

RMAN soporta eliminar archivelogs según el número de respaldos realizados y el tipo de dispositivo. [Documentación Oracle RMAN](https://docs.oracle.com/en/database/oracle/oracle-database/18/racad/managing-backup-and-recovery.html)

No ejecutes `DELETE ARCHIVELOG ALL` sin la cláusula `BACKED UP`.


----


Si todavía no aparece el mensaje `RMAN>`, presiona **Ctrl+C una sola vez**.

Estás ejecutando:

```
CROSSCHECK ARCHIVELOG ALL;
```

`validation succeeded` significa que RMAN está comprobando que cada archivelog existe. **Todavía no está borrando nada**. Al usar `ALL`, puede tardar mucho porque revisa todos los archivelogs.

Cuando vuelva el prompt `RMAN>`, ejecuta:

```
DELETE NOPROMPT ARCHIVELOG ALL
BACKED UP 1 TIMES
TO DEVICE TYPE DISK;
```

Esto eliminará solo archivelogs con al menos un respaldo en disco, como los respaldos encontrados en `/respaldos/RMAN`. Oracle documenta esta forma de limpieza para RAC. [Documentación Oracle RMAN](https://docs.oracle.com/en/database/oracle/oracle-database/18/racad/managing-backup-and-recovery.html)

Luego verifica:

```
SELECT name,
       ROUND(space_limit / 1024 / 1024 / 1024, 2) limite_gb,
       ROUND(space_used / 1024 / 1024 / 1024, 2) usado_gb
FROM v$recovery_file_dest;
```

No cierres abruptamente la instancia ni elimines archivos desde el sistema operativo.