---
tipo: tarea
estado: pendiente
tags:
  - tarea
  - tareas
  - inbox
  - sistema/obsidian
  - migracion
base: "[[00_Inbox/Tareas.md|Tareas]]"
---
### revisar el chat
https://chatgpt.com/s/cx_6aa59d8300c08191980d12acc1706c37


Validación exitosa. El backup piece `193867` se puede leer y el archivelog `2867686` es recuperable.

Ahora ejecuta:

```
BACKUP AS COMPRESSED BACKUPSET ARCHIVELOG ALL NOT BACKED UP 1 TIMES FORMAT '/respaldos/RMAN/PRDSGH_ARC_%d_%T_%U.bkp' DELETE INPUT;
```

Al finalizar verifica que baje el uso de `+FLASH`. Esto valida ese archivelog, no todavía la recuperación completa de la base.