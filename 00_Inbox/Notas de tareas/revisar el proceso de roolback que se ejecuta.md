---
tags:
  - "null"
  - tarea
  - tareas
  - inbox
  - sistema/obsidian
  - migracion
base: "[[00_Inbox/Notas de tareas/REVISAR CUENTAS JN.md|REVISAR CUENTAS JN]]"
---


```
SET SERVEROUTPUT ON SIZE UNLIMITED;

DECLARE
   v_antes       NUMBER;
   v_despues     NUMBER;
   v_inicio      NUMBER;
   v_fin         NUMBER;
   v_minutos     NUMBER;
   v_velocidad   NUMBER;
   v_estimado    NUMBER;
BEGIN
   SELECT t.used_ublk
     INTO v_antes
     FROM gv$session s
          JOIN gv$transaction t ON t.addr = s.taddr AND t.inst_id = s.inst_id
    WHERE s.sid = 10105 AND s.serial# = 57189 AND s.inst_id = 2;

   v_inicio := DBMS_UTILITY.GET_TIME;

   DBMS_OUTPUT.PUT_LINE ('Bloques iniciales: ' || v_antes);
   DBMS_OUTPUT.PUT_LINE ('Esperando 30 segundos...');

   DBMS_LOCK.SLEEP (30);

   BEGIN
      SELECT t.used_ublk
        INTO v_despues
        FROM gv$session s
             JOIN gv$transaction t
                ON t.addr = s.taddr AND t.inst_id = s.inst_id
       WHERE s.sid = 10105 AND s.serial# = 57189 AND s.inst_id = 2;

      v_fin := DBMS_UTILITY.GET_TIME;
      v_minutos := (v_fin - v_inicio) / 6000;

      DBMS_OUTPUT.PUT_LINE ('Bloques actuales: ' || v_despues);

      IF v_despues < v_antes
      THEN
         v_velocidad := (v_antes - v_despues) / v_minutos;
         v_estimado := v_despues / v_velocidad;

         DBMS_OUTPUT.PUT_LINE (
               'Velocidad aproximada: '
            || ROUND (v_velocidad)
            || ' bloques/minuto');

         DBMS_OUTPUT.PUT_LINE (
               'Tiempo restante estimado: aproximadamente '
            || ROUND (v_estimado, 1)
            || ' minutos');
      ELSE
         DBMS_OUTPUT.PUT_LINE (
            'No se pudo calcular: no hubo reducción durante la medición.');
      END IF;
   EXCEPTION
      WHEN NO_DATA_FOUND
      THEN
         DBMS_OUTPUT.PUT_LINE (
            'La transacción ya terminó durante la medición.');
   END;
END;
/
```




```
SELECT COUNT (1) FROM sis.cuentas_jn

```


```
SET SERVEROUTPUT ON SIZE UNLIMITED;

DECLARE
   v_antes       NUMBER;
   v_despues     NUMBER;
   v_inicio      NUMBER;
   v_fin         NUMBER;
   v_minutos     NUMBER;
   v_velocidad   NUMBER;
   v_estimado    NUMBER;
BEGIN
   SELECT t.used_ublk
     INTO v_antes
     FROM gv$session s
          JOIN gv$transaction t ON t.addr = s.taddr AND t.inst_id = s.inst_id
    WHERE s.sid = 10105 AND s.serial# = 57189 AND s.inst_id = 2;

   v_inicio := DBMS_UTILITY.GET_TIME;

   DBMS_OUTPUT.PUT_LINE ('Bloques iniciales: ' || v_antes);
   DBMS_OUTPUT.PUT_LINE ('Esperando 30 segundos...');

   DBMS_LOCK.SLEEP (30);

   BEGIN
      SELECT t.used_ublk
        INTO v_despues
        FROM gv$session s
             JOIN gv$transaction t
                ON t.addr = s.taddr AND t.inst_id = s.inst_id
       WHERE s.sid = 10105 AND s.serial# = 57189 AND s.inst_id = 2;

      v_fin := DBMS_UTILITY.GET_TIME;
      v_minutos := (v_fin - v_inicio) / 6000;

      DBMS_OUTPUT.PUT_LINE ('Bloques actuales: ' || v_despues);

      IF v_despues < v_antes
      THEN
         v_velocidad := (v_antes - v_despues) / v_minutos;
         v_estimado := v_despues / v_velocidad;

         DBMS_OUTPUT.PUT_LINE (
               'Velocidad aproximada: '
            || ROUND (v_velocidad)
            || ' bloques/minuto');

         DBMS_OUTPUT.PUT_LINE (
               'Tiempo restante estimado: aproximadamente '
            || ROUND (v_estimado, 1)
            || ' minutos');
      ELSE
         DBMS_OUTPUT.PUT_LINE (
            'No se pudo calcular: no hubo reducción durante la medición.');
      END IF;
   EXCEPTION
      WHEN NO_DATA_FOUND
      THEN
         DBMS_OUTPUT.PUT_LINE (
            'La transacción ya terminó durante la medición.');
   END;
END;
/
```
