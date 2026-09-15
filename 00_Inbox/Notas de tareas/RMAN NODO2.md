---
base: "[[00_Inbox/Notas de tareas/SACAR CODIGOS SCRIPTS DE TODOS LOS CRONTAB DEL NODO2.md|SACAR CODIGOS SCRIPTS DE TODOS LOS CRONTAB DEL NODO2]]"
tags:
  - tarea
  - oracle
  - rman
  - inbox
---


[[Armar el prompt para RMAN Oracle]]

```
[oracle@rac2 ~]$ cd /respaldos/
[oracle@rac2 respaldos]$ crontab -l
0 23 * * * /home/oracle/scripts/clean_trace.sh &> /home/oracle/scripts/clean_trace.log
#*/1 * * * * /home/oracle/scripts/upbase &> /home/oracle/scripts/upbase.log
#0 16 * * * /home/oracle/scripts/export.sh &> /home/oracle/scripts/export.log
0 5 * * * /home/oracle/scripts/delete.sh &> /home/oracle/scripts/delete.log
0 0 * * 6 /home/oracle/scripts/rman0.sh &> /home/oracle/scripts/rman0.log
0 0 * * 0-5 /home/oracle/scripts/rman1.sh &> /home/oracle/scripts/rman1.log
0 13 * * * /home/oracle/scripts/rman_obsolete.sh  &> /home/oracle/scripts/rman_obsolete.log
#0,05,10,15,20,25,30,35,40,45,50,55 * * * * /usr/dbvisit/standby/dbvisit prdsgh2
0 16 * * * /home/oracle/scripts/audtrail.sh &> /home/oracle/scripts/audtrail.log
30 12 * * * /home/oracle/scripts/borra_arch_mas_5_dias.sh  &> /home/oracle/scripts/borra_arch_mas_5_dias.log
#0 1 * * * /home/oracle/scripts/exp_clasico.sh &> /home/oracle/scripts/exp_clasico.log

#quiero aumentar estas tareas a los jobs de cron
#esta saca un respaldo dmp y el log respectivo a las 16 horas
#0 16 * * * /home/oracle/scripts/respaldo_a_comprimir.sh &> /home/oracle/scripts/respaldo_a_comprimir.log
0 16 * * 2,5,0 /home/oracle/scripts/respaldo_a_comprimir.sh &> /home/oracle/scripts/respaldo_a_comprimir.log
#esta tarea comprime todos los .dmp y .log en un solo archivo zip -9
#para descarga manual, se ejecuta 1am
#se debe tomar en cuenta que de los archivos dmp que no esten siendo accesados se sacara el zip y si esta
#sacando el respaldo en ese momento no lo tomara en cuenta
0 3 * * * /home/oracle/scripts/comprime_dmp_log.sh  &> /home/oracle/scripts/comprime_dmp_log.log
#Monitoreo
0 22 * * * /respaldos/bddStatus/revDiaria.sh
[oracle@rac2 respaldos]$

```

# /home/oracle/scripts/clean_trace.sh

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


# /home/oracle/scripts/delete.sh

```
#!/bin/bash
find /disk1/app/oracle/tfa/rac2/log -type f -name "*.log" -exec rm -f {} \;
find /disk1/app/oracle/diag/tnslsnr/rac2/listener/alert -type f -name "*.xml" -exec rm -f {} \;
find /disk1/11.2.0/grid/log/diag/tnslsnr/rac2/listener_scan1/alert -type f -name "*.xml" -exec rm -f {} \;

/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac2/listener_scan1/alert -type f -name "*.xml" -mtime +3 -exec rm -f {} \;
/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac2/listener_scan2/alert -type f -name "*.xml" -mtime +3 -exec rm -f {} \;
/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac2/listener_scan3/alert -type f -name "*.xml" -mtime +3 -exec rm -f {} \;
/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac2/listener_scan1/trace -type f -name "*.log" -exec rm -f {} \;
/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac2/listener_scan2/trace -type f -name "*.log" -exec rm -f {} \;
/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac2/listener_scan3/trace -type f -name "*.log" -exec rm -f {} \;

```


# /home/oracle/scripts/rman0.sh
```
#!/bin/bash
cd
. ./.bash_profile
rman target / <<EOF
run {
  CONFIGURE DEVICE TYPE DISK BACKUP TYPE TO BACKUPSET;
  crosscheck backup;
  allocate channel disco1 type disk;
  backup spfile format '/respaldos/RMAN/spfile_HE1_%U';
  backup as compressed backupset incremental level = 0 database
    format '/respaldos/RMAN/data_HE1_F_%U'
    current controlfile
    format '/respaldos/RMAN/ctrl_HE1_F_%U';
   backup as compressed backupset archivelog all FORMAT '/respaldos/RMAN/archive_HE1_F_%U';
  release channel disco1;
}
exit;

EOF


```


# /home/oracle/scripts/rman1.sh

```
#!/bin/bash
cd
. ./.bash_profile
rman target / <<EOF
run {
  CONFIGURE DEVICE TYPE DISK BACKUP TYPE TO BACKUPSET;
  crosscheck backup;
  allocate channel disco1 type disk;
  backup spfile format '/respaldos/RMAN/spfile_HE1_%U';
  backup as compressed backupset incremental level = 1 database
    format '/respaldos/RMAN/data_HE1_I_%U'
    current controlfile
    format '/respaldos/RMAN/ctrl_HE1_I_%U';
   backup as compressed backupset archivelog all FORMAT '/respaldos/RMAN/archive_HE1_I_%U';
  release channel disco1;
}
exit;

EOF


```


# /home/oracle/scripts/rman_obsolete.sh

```
#!/bin/bash
cd
. ./.bash_profile
find /respaldos/RMAN -name *_HE1_* -mtime +3 -exec rm -rf {} \;
rman target / <<EOF
run {
  CROSSCHECK BACKUP;
  REPORT OBSOLETE;
  DELETE NOPROMPT OBSOLETE;
  CROSSCHECK BACKUP;
}
exit;
EOF


```

# /home/oracle/scripts/audtrail.sh

```
#!/bin/bash
/bin/find /disk1/app/oracle/admin/prdsgh/adump/ -type f -name "*.aud" -exec rm -f {} \;
```


# /home/oracle/scripts/borra_arch_mas_5_dias.sh


```
#!/bin/bash
cd
. ./.bash_profile
rman target / <<EOF
RUN {
	crosscheck backup;	
	delete force noprompt archivelog until time 'SYSDATE-3';
	crosscheck archivelog all;	
}
exit;
EOF
```


# /home/oracle/scripts/respaldo_a_comprimir.sh

```
#obtener la fecha y hora actual
hoy=$(date +"%Y%m%d%H%M%S")
cd
. ./.bash_profile
expdp RESPALDOS/RESPALDOS directory=exportaciones dumpfile=prdsgh_$hoy.dmp logfile=prdsgh_$hoy.log BUFFER=900000000 FULL=YES job_name=prdsgh_$hoy;

# Eliminar automáticamente archivosgz después de 10 días
/bin/find /respaldos -type f -name "*.zip" -mtime +10 -exec rm -rf {} \;
/bin/find /respaldos -type f -name "*.log" -mtime +10 -exec rm -rf {} \;
```



# /home/oracle/scripts/comprime_dmp_log.sh

```
#!/bin/bash

# Directorio donde se encuentran los archivos .dmp y .log de Oracle
directorio_oracle="/respaldos"

# Navegar al directorio de Oracle
cd "$directorio_oracle" || exit

# Obtener la lista de archivos .dmp y .log que no están siendo accedidos en este momento
archivos_a_comprimir=$(find . -type f \( -name "*.dmp" -o -name "*.logx" \) -amin +1)

# Comprimir los archivos encontrados en archivos ZIP individuales
for archivo in $archivos_a_comprimir; do
    # Obtener el nombre base del archivo sin extensión
    nombre_base=$(basename "$archivo" | sed 's/\.[^.]*$//')

    # Obtener la extensión del archivo original
    extension=$(basename "$archivo" | sed 's/.*\.//')

    tiempo='%Y_%m_%d_%H_%M_%S'
    # Renombrar la extensión a "zip" si es .log, y agregar el sufijo de fecha y hora
    if [ "$extension" == "logx" ]; then
        nuevo_nombre="${nombre_base}__log_.zip"
    else
        nuevo_nombre="${nombre_base}__dmp_.zip"
    fi

    # Comprimir el archivo en el nuevo nombre de archivo correspondiente
    zip -9 "$nuevo_nombre" "$archivo"

    # Eliminar el archivo original después de comprimirlo
    rm "$archivo"
done
```



# /respaldos/bddStatus/revDiaria.sh

```
. /home/oracle/.bash_profile
ubicacionScripts="/respaldos/bddStatus"
cd $ubicacionScripts
fecha=$(date +"%Y-%m-%d")
sid=prdsgh2
pdb=NA
ip=10.10.10.251
cliente=HE1

$ubicacionScripts/bddsize.sh $sid $ubicacionScripts
df -P -k > $ubicacionScripts/logs/disco/inf_disco_$fecha.reno
$ubicacionScripts/rman.sh $sid $ubicacionScripts
$ubicacionScripts/tablespace.sh $sid $pdb $ubicacionScripts

find $ubicacionScripts/logs -name inf_*.reno -mtime +60 -exec rm -rf {} \;
#find $ubicacionScripts -name inf_*.reno
```



-----




```
[oracle@rac2 /]$ su -
Contraseña:
[root@rac2 ~]#
[root@rac2 ~]#
[root@rac2 ~]#
[root@rac2 ~]#
[root@rac2 ~]# crontab
^C[root@rac2 ~]# crontab  -l
10 * * * * /root/scripts/delete.sh &> /root/scripts/delete.log
* * 7 * *  /root/scripts/optimiza_bdb.sh &> /root/scripts/optimiza_bdb.log
* * 7 * *  /root/scripts/optimiza_adicionales.sh &> /root/scripts/optimiza_adicionales.log
0 5 * * *  /root/scripts/audtrail.sh &> /root/scripts/audtrail.log
```


# /root/scripts/delete.sh

```
#!/bin/bash
find /disk1/app/oracle/tfa/rac2/log -type f -name "*.log" -exec rm -f {} \;
find /disk1/app/oracle/diag/tnslsnr/rac2/listener/alert -type f -name "*.xml" -exec rm -f {} \;
find /disk1/11.2.0/grid/log/diag/tnslsnr/rac2/listener_scan1/alert -type f -name "*.xml" -exec rm -f {} \;

/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac2/listener_scan1/alert -type f -name "*.xml" -mtime +3 -exec rm -f {} \;
/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac2/listener_scan2/alert -type f -name "*.xml" -mtime +3 -exec rm -f {} \;
/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac2/listener_scan3/alert -type f -name "*.xml" -mtime +3 -exec rm -f {} \;
/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac2/listener_scan1/trace -type f -name "*.log" -exec rm -f {} \;
/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac2/listener_scan2/trace -type f -name "*.log" -exec rm -f {} \;
/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac2/listener_scan3/trace -type f -name "*.log" -exec rm -f {} \;
```


# /root/scripts/optimiza_bdb.sh
```
#!/bin/bash
/disk1/11.2.0/grid/bin/crsctl stop res ora.crf -init
/bin/find /disk1/11.2.0/grid/crf/db/rac2/ -type f -name "*.bdb" -exec rm -f {} \;
/disk1/11.2.0/grid/bin/crsctl start res ora.crf -init
```



# /root/scripts/optimiza_adicionales.sh

```
#!/bin/bash
/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac2/listener_scan2 -type f -name "*.trc" -exec rm -f {} \;
/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac2/listener_scan2 -type f -name "*.xml" -exec rm -f {} \;
```


# /root/scripts/audtrail.sh


```
#!/bin/bash
/bin/find /disk1/app/oracle/admin/prdsgh/adump/ -type f -name "*.aud" -exec rm -f {} \;
```



