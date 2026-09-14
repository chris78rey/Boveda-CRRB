---
tipo: tarea
estado: pendiente
tags:
  - tarea
  - tareas
  - inbox
  - espacio_disco
  - sistema/obsidian
  - migracion
base: "[[00_Inbox/Tareas.md|Tareas]]"
---
Sí. Creé y validé una herramienta Go llamada `disklens`.

Archivos:

- [Ejecutable disklens](/home/crrb/Documents/Codex/2026-09-12/qu/disklens)
- [Código fuente main.go](/home/crrb/Documents/Codex/2026-09-12/qu/main.go)
- [Instrucciones README.md](/home/crrb/Documents/Codex/2026-09-12/qu/README.md)

Uso recomendado:

```
cd /home/crrb/Documents/Codex/2026-09-12/qu
./disklens -path /home/crrb -top 30 -depth 3
```

Para revisar todo el disco:

```
./disklens -path / -top 30 -depth 2
```

La herramienta:

- Solo lee; no mueve, comprime ni elimina.
- Muestra las carpetas más grandes.
- Muestra los archivos más grandes.
- Cuenta errores de permisos.
- No sigue enlaces simbólicos.
- Omite carpetas virtuales del sistema al escanear `/`.
- Permite exportar a JSON:

```
./disklens -path /home/crrb -json > resultado.json
```

El escaneo completo de `/` tarda más de 30 segundos debido al volumen de archivos, pero el ejecutable quedó generado correctamente.