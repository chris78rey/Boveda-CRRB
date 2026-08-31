---
tipo: guia
tags:
  - sistema/obsidian
  - migracion
---

# Migración ordenada de la raíz

## Antes de mover

- [ ] Crear una copia completa de la bóveda.
- [ ] Instalar esta estructura sin reemplazar `.obsidian/plugins`.
- [ ] Comprobar que [[Inicio]] y los paneles abran correctamente.

## Clasificación de notas existentes

| Si la nota representa… | Mover a… |
|---|---|
| Algo todavía sin clasificar | `00_Inbox` |
| Un trabajo con resultado y final definido | `02_Proyectos` |
| Una responsabilidad permanente | `03_Areas` |
| Conocimiento reutilizable | `04_Conocimiento` |
| Una reunión o acta | `05_Reuniones` |
| Información de una persona | `06_Personas` |
| Un adjunto, diagrama o exportación | `07_Recursos` |
| Una vista automática | `08_Dashboards` |
| Un modelo reutilizable | `09_Plantillas` |
| Material cerrado o inactivo | `99_Archivo` |

## Dashboard anterior

1. Renombrar el `Dashboard.md` actual como `Dashboard anterior.md`.
2. Moverlo a `99_Archivo`.
3. Usar [[08_Dashboards/Dashboard]] como panel operativo.
4. El paquete incluye [[99_Archivo/Respaldo - Tareas del Dashboard original]] para conservar las tareas observadas en el archivo recibido.
5. Mover únicamente las tareas pendientes que sigan vigentes a [[00_Inbox/Tareas]].

## Método recomendado

La migración puede realizarse en bloques de 20 notas. Cada bloque debe seguir este orden:

1. Identificar el tipo de nota.
2. Moverla a su carpeta definitiva.
3. Aplicar la plantilla o agregar propiedades equivalentes.
4. Comprobar que aparezca en el Dashboard correspondiente.
5. Corregir enlaces rotos si existieran.

## Criterio de finalización

La migración termina cuando la raíz contiene únicamente `Inicio.md`, `LEEME - INSTALACION.md` y las carpetas principales.

