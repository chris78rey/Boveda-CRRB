---
base: "[[00_Inbox/Notas de tareas/REVISAR CUENTAS JN.md|REVISAR CUENTAS JN]]"
tags:
  - tarea
  - tareas
  - inbox
  - sistema/obsidian
  - migracion
---
Con el reporte completo, cambia la recomendación:

## Mejor destino para estos índices

```
TS_CUENTAS_JN
```

Tiene:

```
Libre:      80 GB
Usado:      1 MB
Tamaño máx: 90 GB
Bigfile:    Sí
```

Además, parece ser el tablespace exclusivo de `CUENTAS_JN`, que fue truncada. Es el lugar con mayor disponibilidad y permite reutilizar ese espacio.

`TBINDICES_SIS` también sirve, pero solo tiene aproximadamente **2,51 GB libres**. Tus índices ocupan **1,793 GB**, por lo que quedarían apenas unos **700 MB libres**.

## Mover los índices

Genera los comandos:

```
SELECT
  'ALTER INDEX ' || owner || '.' || index_name ||
  ' REBUILD TABLESPACE TS_CUENTAS_JN;'
FROM dba_indexes
WHERE owner = 'SIS'
  AND table_name = 'CUENTAS_JN'
  AND tablespace_name = 'TBDATOSG'
  AND index_type = 'NORMAL'
ORDER BY index_name;
```

Ejemplo:

```
ALTER INDEX SIS.CUENTAS_JN_ANIO_I
REBUILD TABLESPACE TS_CUENTAS_JN;
```

Ejecuta los índices uno por uno.

Luego valida:

```
SELECT index_name,
       tablespace_name,
       status
FROM dba_indexes
WHERE owner = 'SIS'
  AND table_name = 'CUENTAS_JN'
ORDER BY index_name;
```

Debe aparecer:

```
TS_CUENTAS_JN   VALID
```

No recomiendo `TBDATOSG`: está al **98 % de uso** y no tiene margen suficiente. La única desventaja de `TS_CUENTAS_JN` es que tabla e índices estarán en el mismo tablespace, pero para aprovechar el espacio disponible es la opción más práctica. Oracle permite ubicar un índice en el mismo o en diferente tablespace que la tabla. [Oracle](https://docs.oracle.com/en/database/oracle/oracle-database/19/admin/managing-indexes.html)
