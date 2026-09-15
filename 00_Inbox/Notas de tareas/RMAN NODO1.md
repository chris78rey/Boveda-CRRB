---
base: "[[00_Inbox/Notas de tareas/SACAR CODIGOS SCRIPTS DE TODOS LOS CRONTAB DEL NODO2.md|SACAR CODIGOS SCRIPTS DE TODOS LOS CRONTAB DEL NODO2]]"
tags:
  - tarea
  - oracle
  - rman
  - inbox
  - ssh
---

![[Pasted image 20260914133738.png]]ssh oracle@172.16.60.20 -p 22

```
ssh -o HostKeyAlgorithms=+ssh-rsa -p 22 oracle@172.16.60.20
```


```
[oracle@rac1 ~]$ crontab -l
0 6 * * * /fra/script/clean_trace.sh
0,10,20,30,40,50,55 * * * * /usr/dbvisit/standby/dbvctl -d prdsgh
0 13 * * * /home/oracle/scripts/rman_obsolete.sh  &> /home/oracle/scripts/rman_obsolete.log
0 6 * * * /home/oracle/scripts/borra_arch_mas_5_dias.sh  &> /home/oracle/scripts/borra_arch_mas_5_dias.log
0 * * * * /home/oracle/scripts/dbvnetStatus.sh
[oracle@rac1 ~]$
```



# /fra/script/clean_trace.sh
```
[oracle@rac1 ~]$
[oracle@rac1 ~]$ cat /fra/script/clean_trace.sh
cat: /fra/script/clean_trace.sh: No existe el fichero o el directorio
[oracle@rac1 ~]$
```



# /usr/dbvisit/standby/dbvctl 



```

```




 # /home/oracle/scripts/rman_obsolete.sh 
```
#!/bin/bash
cd
. ./.bash_profile
rman target / <<EOF
run {
  REPORT OBSOLETE;
  DELETE NOPROMPT OBSOLETE;
  CROSSCHECK BACKUP;
}
exit;
EOF
```



/home/oracle/scripts/borra_arch_mas_5_dias.sh
```
#!/bin/bash
cd
. ./.bash_profile
rman target / <<EOF
RUN {
        crosscheck backup;
        delete force noprompt archivelog until time 'SYSDATE-10';
        crosscheck archivelog all;
}
exit;
EOF
```



/home/oracle/scripts/dbvnetStatus.sh


```
status=$(ps -ef |grep dbvnet |grep start)

if [[ "$status" == "" ]]; then
rm -rf /usr/dbvisit/dbvnet/conf/dbvnetd.pid
/usr/dbvisit/dbvnet/dbvnet -d start
fi
```



```
oracle@rac1 ~]$ su -
Contraseña:
[root@rac1 ~]#
[root@rac1 ~]#
[root@rac1 ~]#
[root@rac1 ~]# crontab -l
*/5 * * * * /root/scripts/delete_root.sh & > /root/scripts/delete_root.log
00 10 * * 0 /root/scripts/optimiza_bdb.sh & /root/scripts/optimiza_bdb.log
00 15 * * 0 /root/scripts/audtrail.sh & /root/scripts/audtrail.log
[root@rac1 ~]#
```



/root/scripts/delete_root.sh 

```
#!/bin/bash
/bin/find /disk1/app/oracle/tfa/rac1/log -type f -name "*.log" -exec rm -f {} \;
/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac1/listener_scan2/alert -type f -name "*.xml" -exec rm -f {} \;
/bin/find /disk1/app/oracle/tfa/rac1/log -type f -name "*.log" -exec rm -f {} \;
/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac1/listener_scan2/alert -type f -name "*.xml" -exec rm -f {} \;
#/bin/find /FSFRA/BACKUPS/prdsgh* -type f -mtime +3 -exec rm -rf {} \;
/bin/find /disk1/app/oracle/diag/tnslsnr/rac1/listener/trace -type f -name "*.log" -mtime +3 -exec rm -f {} \;
/bin/find /disk1/app/oracle/diag/tnslsnr/rac1/listener/alert -type f -name "*.xml" -mtime +3 -exec rm -f {} \;
/bin/find /disk1/app/oracle/diag/tnslsnr/rac1/listener/trace/listener.log -type f -exec rm -rf {} \;
/bin/find  /disk1/app/oracle/diag/rdbms/prdsgh/prdsgh1/trace/ -type f -name "*.trc" -exec rm -f {} \;
/bin/find  /disk1/app/oracle/diag/rdbms/prdsgh/prdsgh1/trace/ -type f -name "*.trm" -exec rm -f {} \;
```



/root/scripts/optimiza_bdb.sh

```
#!/bin/bash
/disk1/11.2.0/grid/bin/crsctl stop res ora.crf -init
/bin/find /disk1/11.2.0/grid/crf/db/rac1/ -type f -name "*.bdb" -exec rm -f {} \;
/disk1/11.2.0/grid/bin/crsctl start res ora.crf -init



/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac1/listener_scan1/alert -type f -name "*.xml" -mtime +3 -exec rm -f {} \;
/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac1/listener_scan2/alert -type f -name "*.xml" -mtime +3 -exec rm -f {} \;
/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac1/listener_scan3/alert -type f -name "*.xml" -mtime +3 -exec rm -f {} \;
/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac1/listener_scan1/trace -type f -name "*.log" -exec rm -f {} \;
/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac1/listener_scan2/trace -type f -name "*.log" -exec rm -f {} \;
/bin/find /disk1/11.2.0/grid/log/diag/tnslsnr/rac1/listener_scan3/trace -type f -name "*.log" -exec rm -f {} \;
#esto se agrego 2020
/bin/find  /disk1/app/oracle/diag/rdbms/prdsgh/prdsgh1/trace/ -type f -name "*.trc" -exec rm -f {} \;
/bin/find  /disk1/app/oracle/diag/rdbms/prdsgh/prdsgh1/trace/ -type f -name "*.trm" -exec rm -f {} \;
/bin/find  /disk1/app/oracle/product/rac1_prdsgh/sysman/emd/upload/ -type f -name "*.xml" -exec rm -f {} \;
```


/root/scripts/audtrail.sh
```
#!/bin/bash
/bin/find /disk1/app/oracle/admin/prdsgh/adump/ -type f -name "*.aud" -exec rm -f {} \;
```