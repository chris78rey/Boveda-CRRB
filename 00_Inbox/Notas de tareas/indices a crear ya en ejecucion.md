---
tags:
  - cuentas_jn
  - tarea
  - tareas
  - inbox
  - sistema/obsidian
  - migracion
base: "[[00_Inbox/Notas de tareas/REVISAR CUENTAS JN.md|REVISAR CUENTAS JN]]"
---



El plan muestra `TABLE ACCESS FULL` porque Oracle aplica `TO_CHAR` sobre `JN_DATETIME` y no puede usar directamente un índice normal.

### Opción recomendada: índice por `YYYYMM`

Según los tablespaces que compartiste, usaría `TS_CUENTAS_JN`, porque tiene aproximadamente 80 GB libres:

```
CREATE INDEX SIS.CUENTAS_JN_YYYYMM_I
ON SIS.CUENTAS_JN (
    TO_CHAR(JN_DATETIME, 'YYYYMM')
)
TABLESPACE TS_CUENTAS_JN;
```

Luego actualiza estadísticas:

```
BEGIN
    DBMS_STATS.GATHER_INDEX_STATS(
        ownname => 'SIS',
        indname => 'CUENTAS_JN_YYYYMM_I'
    );
END;
/
```

Consulta:

```
SELECT COUNT(*)
FROM SIS.CUENTAS_JN
WHERE TO_CHAR(JN_DATETIME, 'YYYYMM') = '202609';
```

Verifica el nuevo plan:

```
EXPLAIN PLAN FOR
SELECT COUNT(*)
FROM SIS.CUENTAS_JN
WHERE TO_CHAR(JN_DATETIME, 'YYYYMM') = '202609';

SELECT *
FROM TABLE(DBMS_XPLAN.DISPLAY);
```

### Opción más eficiente si ya existe índice sobre `JN_DATETIME`

```
SELECT COUNT(*)
FROM SIS.CUENTAS_JN
WHERE JN_DATETIME >= DATE '2026-09-01'
  AND JN_DATETIME <  DATE '2026-10-01';
```

Esta segunda forma normalmente es preferible porque puede usar directamente un índice normal sobre `JN_DATETIME`. El índice `YYYYMM` conviene cuando tus consultas siempre reciben el período como texto, por ejemplo `'202609'`.


[[Esta nota esta vacia]]