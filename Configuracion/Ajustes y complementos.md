---
tipo: guia
tags:
  - sistema/obsidian
---

# Ajustes y complementos

La plantilla mantiene el conjunto de complementos mostrado y asigna a cada uno una función clara.

| Complemento | Uso dentro de la bóveda | Ajuste principal |
|---|---|---|
| Advanced Tables | Cronogramas, riesgos, entregables y evaluaciones | Mantener el formato automático de tablas |
| Calendar | Navegación por notas diarias | Carpeta `01_Diario` |
| Dataview | Paneles automáticos e índices | No requiere JavaScript para las consultas incluidas |
| Excalidraw | Arquitecturas, procesos y mapas mentales | Carpeta `07_Recursos/Excalidraw` |
| Kanban | Flujo visual de proyectos | Abrir [[02_Proyectos/Tablero de proyectos]] como tablero |
| Map View | Registro de sedes, clientes o lugares | Usar [[09_Plantillas/Lugar]] con la propiedad `location` |
| Pandoc Plugin | Exportación de informes a DOCX, PDF o ePub | Guardar resultados en `07_Recursos/Exportaciones` |
| QuickAdd | Captura y creación rápida | Configurado; respaldo en [[Configuracion/QuickAdd-CRRB-v2.json]] |
| Recent Files | Acceso a notas usadas recientemente | Mantener sin cambios |
| Tasks | Prioridades, fechas y tableros de tareas | Excluir `09_Plantillas` y `99_Archivo` |
| Templater | Creación de notas con propiedades y preguntas | Carpeta `09_Plantillas`; activar al crear archivos |
| YTranscript | Captura y síntesis de videos | Usar [[09_Plantillas/Video y transcripción]] |

## Templater

Templater ya apunta a `09_Plantillas` y ejecuta automáticamente las instrucciones
de cada plantilla cuando QuickAdd crea una nota. Para crear manualmente una nota
se puede usar **Templater: Create new note from template**.

## QuickAdd

QuickAdd ya contiene los dos menús CRRB dentro de su archivo `data.json`:

- **CRRB - Capturar**.
- **CRRB - Crear nota**.

También conserva las opciones originales **00 Tareas**, **01 Tags**, **Menu
Tareas** y **Menu Tags**, incluidos `crrb Task`, `crrb Task Dashboard` y `crrb
Tags`.

El archivo `QuickAdd-CRRB-v2.json` es un respaldo importable. Solo se necesita
importarlo cuando la plantilla se integre en otra bóveda sin reemplazar su
configuración existente.

Para restaurarlo manualmente:

1. Abrir **Configuración → QuickAdd**.
2. Usar la opción de importar paquete.
3. Seleccionar `Configuracion/QuickAdd-CRRB-v2.json`.
4. Asignar un atajo a `QuickAdd: Run QuickAdd` y, si se desea, atajos directos a las capturas más frecuentes.

El menú agrega:

- Tarea con fecha.
- Tarea sin fecha.
- Idea o nota rápida.
- Registro en la nota diaria.
- Creación de proyecto, reunión, incidente, nota de estudio, video, persona, sistema y correo.

## Tasks

Las prioridades utilizadas son compatibles con el sistema existente:

| Símbolo | Prioridad |
|---|---|
| `🔺` | Máxima |
| `⏫` | Alta |
| `🔼` | Media |
| `🔽` | Baja |
| `⏬` | Mínima |

Los campos `[orden:: número]` y `[ambito:: valor]` se conservan para consultas de Dataview.

## Pandoc

Para exportaciones institucionales se recomienda abrir una nota, revisar que los adjuntos sean visibles y ejecutar el formato deseado desde Pandoc. La salida puede almacenarse en `07_Recursos/Exportaciones`.

## Seguridad

La bóveda no debe guardar contraseñas, tokens, API keys, claves privadas ni cadenas de conexión con credenciales. Solo deben registrarse referencias a la ubicación segura donde se administra cada secreto.
