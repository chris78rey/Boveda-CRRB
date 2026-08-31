---
tipo: guia
estado: vigente
tags:
  - sistema/obsidian
  - guia
---

# Bóveda CRRB

Esta plantilla organiza la información con cuatro niveles:

1. **Capturar:** todo entra primero en `00_Inbox`.
2. **Ejecutar:** los proyectos y tareas se gestionan desde `02_Proyectos` y `08_Dashboards`.
3. **Mantener:** las responsabilidades continuas viven en `03_Areas`.
4. **Aprender:** el conocimiento reutilizable se guarda en `04_Conocimiento`.

## Instalación como bóveda nueva

1. Descomprimir el ZIP completo, incluida la carpeta oculta `.obsidian`.
2. En Obsidian, seleccionar **Abrir otra bóveda → Abrir carpeta como bóveda**.
3. Elegir la carpeta `Boveda-CRRB` descomprimida.
4. Si Obsidian solicita autorización, activar el modo restringido y habilitar los complementos comunitarios incluidos.
5. Abrir [[Inicio]] y marcarlo como favorito.

QuickAdd ya está configurado en `.obsidian/plugins/quickadd/data.json`. El archivo
`Configuracion/QuickAdd-CRRB-v2.json` se conserva únicamente como respaldo
importable.

## Integración con una bóveda existente

1. Realizar una copia de seguridad de la bóveda actual.
2. Copiar primero las carpetas numeradas, `Inicio.md` y las plantillas.
3. Copiar `.obsidian/plugins` solo si se desea instalar o actualizar los complementos incluidos.
4. Antes de reemplazar `.obsidian/plugins/quickadd/data.json`, exportar la configuración QuickAdd existente.
5. Si se desea conservar el QuickAdd anterior, importar `Configuracion/QuickAdd-CRRB-v2.json` desde el complemento en lugar de reemplazar `data.json`.

> [!warning] Carpetas ocultas
> En Windows puede ser necesario activar **Ver → Mostrar → Elementos ocultos** para visualizar `.obsidian`. Aunque no se muestre en el Explorador, Obsidian sí la utiliza.

## Regla para mantener limpia la raíz

La raíz debe conservar únicamente `Inicio.md` y esta guía. Toda nota nueva debe entrar por QuickAdd, por una plantilla o por `00_Inbox`.

## Convención de propiedades

| Propiedad | Uso |
|---|---|
| `tipo` | proyecto, reunión, incidente, concepto, curso, persona, lugar o diario |
| `estado` | activo, espera, pausado, cerrado o archivado |
| `ambito` | oficina, externo, docencia o personal |
| `area` | responsabilidad permanente relacionada |
| `proyecto` | enlace al proyecto relacionado |
| `fecha_creacion` | fecha inicial de la nota |
| `fecha_limite` | compromiso principal de la nota |
| `progreso` | valor numérico entre 0 y 100 |

Los estados y ámbitos deben escribirse siempre en minúsculas para que Dataview pueda agruparlos sin duplicados.
