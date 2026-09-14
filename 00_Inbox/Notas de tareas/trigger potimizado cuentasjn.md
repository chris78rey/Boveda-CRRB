---
base: "[[00_Inbox/Notas de tareas/REVISAR CUENTAS JN.md|REVISAR CUENTAS JN]]"
tags:
  - tarea
  - tareas
  - inbox
  - sistema/obsidian
  - migracion
---


Sí. Según el contexto adjunto, el principal problema es este:

- `CNTLLNJN` registra cualquier `UPDATE` sobre `CUENTAS`.
- `RGSACTPRCPRM` actualiza automáticamente `ACTUALIZADO_POR` y `FECHA_ACTUALIZACION`.
- Por tanto, modificaciones técnicas o repetidas terminan generando filas en `CUENTAS_JN`.
- La vista `CUENTAS_CARGOS_NOMBRES_JN` usa `CUENTAS_JN`, así que no conviene eliminar toda la auditoría; conviene filtrar eventos.

## Regla recomendada

Registrar:

- Todos los `DELETE`.
- Solo los `UPDATE` que cambien datos importantes del negocio.
- No registrar cambios únicamente en:
    - `ACTUALIZADO_POR`
    - `FECHA_ACTUALIZACION`
    - `CREADO_POR`
- No registrar un `UPDATE` si asigna el mismo valor anterior.

Oracle permite usar `UPDATE OF` para que el trigger solo se active cuando se actualizan determinadas columnas. [Oracle](https://docs.oracle.com/en/database/oracle/oracle-database/26/lnpls/dml-triggers.html)

## Trigger optimizado

Ejemplo considerando como importantes los campos financieros, estado y auditoría operativa:

```
CREATE OR REPLACE TRIGGER SIS.CNTLLNJN
AFTER DELETE OR UPDATE OF
      ESTADO,
      FECHA,
      CANTIDAD,
      VALOR,
      PORCENTAJE_PROMOCION,
      DESCUENTO_OTORGADO,
      IVA,
      VALORE,
      IVAE,
      OBSERVACION,
      PLA_NUMERO_PLANILLA,
      SEGURO,
      NUMERO_PERMANENCIA,
      FECHA_EJECUCION,
      SERVICIO,
      CONFIRMADO,
      AUDITADO,
      AUDITADO_POR
ON SIS.CUENTAS
FOR EACH ROW
BEGIN
  IF DELETING
     OR DECODE(:OLD.ESTADO,       :NEW.ESTADO,       0, 1) = 1
     OR DECODE(:OLD.FECHA,        :NEW.FECHA,        0, 1) = 1
     OR DECODE(:OLD.CANTIDAD,     :NEW.CANTIDAD,     0, 1) = 1
     OR DECODE(:OLD.VALOR,        :NEW.VALOR,        0, 1) = 1
     OR DECODE(:OLD.PORCENTAJE_PROMOCION,
               :NEW.PORCENTAJE_PROMOCION, 0, 1) = 1
     OR DECODE(:OLD.DESCUENTO_OTORGADO,
               :NEW.DESCUENTO_OTORGADO, 0, 1) = 1
     OR DECODE(:OLD.IVA,          :NEW.IVA,          0, 1) = 1
     OR DECODE(:OLD.VALORE,       :NEW.VALORE,       0, 1) = 1
     OR DECODE(:OLD.IVAE,         :NEW.IVAE,         0, 1) = 1
     OR DECODE(:OLD.OBSERVACION,  :NEW.OBSERVACION,  0, 1) = 1
     OR DECODE(:OLD.PLA_NUMERO_PLANILLA,
               :NEW.PLA_NUMERO_PLANILLA, 0, 1) = 1
     OR DECODE(:OLD.SEGURO,       :NEW.SEGURO,       0, 1) = 1
     OR DECODE(:OLD.NUMERO_PERMANENCIA,
               :NEW.NUMERO_PERMANENCIA, 0, 1) = 1
     OR DECODE(:OLD.FECHA_EJECUCION,
               :NEW.FECHA_EJECUCION, 0, 1) = 1
     OR DECODE(:OLD.SERVICIO,     :NEW.SERVICIO,     0, 1) = 1
     OR DECODE(:OLD.CONFIRMADO,   :NEW.CONFIRMADO,   0, 1) = 1
     OR DECODE(:OLD.AUDITADO,     :NEW.AUDITADO,     0, 1) = 1
     OR DECODE(:OLD.AUDITADO_POR, :NEW.AUDITADO_POR, 0, 1) = 1
  THEN

    /*
      Aquí debe permanecer el INSERT actual
      hacia SIS.CUENTAS_JN.
    */

    NULL;
  END IF;
END;
/
```

Debes colocar el `INSERT INTO SIS.CUENTAS_JN` original dentro del `IF`, reemplazando el `NULL`.

## Reducción más agresiva

Si la regla de negocio permite auditar únicamente cambios de estado y eliminaciones:

```
CREATE OR REPLACE TRIGGER SIS.CNTLLNJN
AFTER DELETE OR UPDATE OF ESTADO
ON SIS.CUENTAS
FOR EACH ROW
BEGIN
  IF DELETING
     OR DECODE(:OLD.ESTADO, :NEW.ESTADO, 0, 1) = 1
  THEN
    -- INSERT original en SIS.CUENTAS_JN
    NULL;
  END IF;
END;
/
```

Esta versión puede reducir mucho más los registros, pero ya no conservará cambios de valores, cantidades, descuentos u otros campos.

Antes de cambiarlo, valida qué triggers están activos sobre `CUENTAS`:

```
SELECT trigger_name,
       triggering_event,
       trigger_type,
       status
FROM dba_triggers
WHERE table_owner = 'SIS'
  AND table_name = 'CUENTAS';
```

Mi recomendación es iniciar con la primera versión: conservar `DELETE` y cambios de negocio, pero excluir las actualizaciones técnicas y los `UPDATE` que no cambian realmente los valores.