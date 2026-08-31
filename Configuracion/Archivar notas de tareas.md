---
tipo: procedimiento
tags:
  - sistema/obsidian
  - tareas
---

# Archivar y reversar notas de tareas

## Archivar

Ejecutar `QuickAdd: Run` → `Archivar notas de tareas`.

El macro busca únicamente los enlaces `[[nota]]` de `00_Inbox/Tareas.md`, mueve
las notas existentes desde `00_Inbox/Notas de tareas` a `99_Archivo/Notas de tareas`
y retira de `Tareas.md` únicamente las líneas que las enlazan. El contenido retirado
queda en el manifiesto para poder reversarlo; no elimina notas ni sobrescribe archivos.

Cada operación queda registrada en `.archivo-notas-tareas.json`.

## Reversar

Ejecutar `QuickAdd: Run` → `Reversar notas de tareas`.

La última operación se revierte: las notas vuelven a su carpeta original y las líneas
de tareas regresan a `Tareas.md`. Si ya existe una nota con el mismo nombre, se omite
para evitar sobrescribirla.
