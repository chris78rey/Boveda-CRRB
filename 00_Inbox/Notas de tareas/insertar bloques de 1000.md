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


Si `CUENTASJN` y `SIS.CUENTAS_JN` tienen exactamente las mismas columnas y en el mismo orden, ejecuta:

```

SET SERVEROUTPUT ON SIZE UNLIMITED;

DECLARE
    c_lote CONSTANT PLS_INTEGER := 10000;

    CURSOR c_origen IS
        SELECT *
        FROM SIS.CUENTASJN;
        -- Si está en otro esquema:
        -- FROM ESQUEMA_ORIGEN.CUENTASJN;

    TYPE t_registros IS TABLE OF c_origen%ROWTYPE
        INDEX BY PLS_INTEGER;

    v_registros t_registros;
    v_total     PLS_INTEGER := 0;
    
    -- 1. Declarar una excepción específica para capturar los errores del FORALL
    bulk_errors EXCEPTION;
    PRAGMA EXCEPTION_INIT(bulk_errors, -24381);
    v_errores_lote PLS_INTEGER;

BEGIN
    OPEN c_origen;

    LOOP
        FETCH c_origen
        BULK COLLECT INTO v_registros
        LIMIT c_lote;

        EXIT WHEN v_registros.COUNT = 0;

        -- 2. Envolver el FORALL en su propio bloque BEGIN...EXCEPTION
        BEGIN
            -- 3. Agregar la cláusula SAVE EXCEPTIONS
            FORALL i IN 1 .. v_registros.COUNT SAVE EXCEPTIONS
                INSERT INTO SIS.CUENTAS_JN
                VALUES v_registros(i);
                
        EXCEPTION
            WHEN bulk_errors THEN
                -- 4. Capturar y gestionar los errores de este lote
                v_errores_lote := SQL%BULK_EXCEPTIONS.COUNT;
                DBMS_OUTPUT.PUT_LINE('Se encontraron ' || v_errores_lote || ' errores en este lote.');
                
                -- Opcional: Imprimir el detalle de cada fila que falló
                FOR j IN 1 .. v_errores_lote LOOP
                    DBMS_OUTPUT.PUT_LINE(
                        'Error en el índice: ' || SQL%BULK_EXCEPTIONS(j).ERROR_INDEX ||
                        ' | Código ORA-' || SQL%BULK_EXCEPTIONS(j).ERROR_CODE
                    );
                END LOOP;
        END;

        -- 5. Usar SQL%ROWCOUNT para sumar SOLO los registros insertados con éxito
        v_total := v_total + SQL%ROWCOUNT;

        COMMIT;

        DBMS_OUTPUT.PUT_LINE('Registros procesados exitosamente hasta ahora: ' || v_total);
    END LOOP;

    CLOSE c_origen;

    DBMS_OUTPUT.PUT_LINE('Carga finalizada. Total de inserciones exitosas: ' || v_total);

EXCEPTION
    WHEN OTHERS THEN
        IF c_origen%ISOPEN THEN
            CLOSE c_origen;
        END IF;

        ROLLBACK;
        RAISE;
END;
/


```

Antes de ejecutarlo verifica:

```
SELECT COUNT(*) FROM CUENTASJN;

SELECT COUNT(*) FROM SIS.CUENTAS_JN;
```

Importante: si ocurre un error, los lotes anteriores de 10.000 registros ya quedaron confirmados. Además, si ejecutas nuevamente el bloque, podrías duplicar registros.
