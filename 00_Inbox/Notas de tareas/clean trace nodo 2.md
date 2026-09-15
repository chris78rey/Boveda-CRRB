---
base: "[[00_Inbox/Notas de tareas/SACAR CODIGOS SCRIPTS DE TODOS LOS CRONTAB DEL NODO2.md|SACAR CODIGOS SCRIPTS DE TODOS LOS CRONTAB DEL NODO2]]"
tags:
  - tarea
  - oracle
  - rman
  - inbox
---
```
#!/bin/bash
cd /usr/dbvisit/standby/trace
rm -f  *.trc
find /disk1/11.2.0/grid/log/diag/tnslsnr/rac2/listener_scan1/alert -type f -name "*.xml" -exec rm -f {} \;
/bin/find /disk1/app/oracle/diag/rdbms/prdsgh/prdsgh2/trace/ -type f -name "*.trc" -exec rm -f {} \;
/bin/find /disk1/app/oracle/diag/rdbms/prdsgh/prdsgh2/trace/ -type f -name "*.trm" -exec rm -f {} \;
/bin/find /disk1/app/oracle/diag/rdbms/prdsgh/prdsgh2/trace/ -type f -name "alert_prdsgh2.log" -exec rm -f {} \;
/bin/find /disk1/app/oracle/diag/rdbms/prdsgh/prdsgh2/alert/ -type f -name "*.xml" -exec rm -f {} \;
```