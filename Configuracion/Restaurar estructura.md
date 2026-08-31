---
tipo: procedimiento
tags:
  - sistema/obsidian
  - mantenimiento
---

# Restaurar estructura

Este procedimiento recrea únicamente las carpetas base que falten en la bóveda.
No elimina, mueve ni sobrescribe notas existentes.

## Uso desde QuickAdd

El macro `Restaurar estructura` ya está registrado en la configuración de
QuickAdd. Después de recargar Obsidian, se puede ejecutar desde la paleta de
comandos con `QuickAdd: Run` → `Restaurar estructura`.

Después puede añadirse como comando en Commander o como botón dentro de una nota.

## Qué hace

- Comprueba las carpetas base de Inbox, Diario, Proyectos, Áreas, Conocimiento,
  Reuniones, Personas, Recursos, Dashboards, Plantillas, Archivo y Configuración.
- También comprueba las carpetas de `03_Areas/Infraestructura` para equipos, máquinas
  virtuales, redes, servicios, credenciales, certificados y licencias.
- Comprueba `07_Recursos/Prompts` y sus categorías para mantener disponible la biblioteca
  de prompts y su historial.
- La carpeta `Requisitos` se crea dentro de cada proyecto al registrar el primer requisito.
- Crea solo las carpetas ausentes.
- Muestra cuántas carpetas fueron creadas.

Para recuperar una nota eliminada se necesita Git, GitHub o una copia de respaldo;
este procedimiento protege únicamente la estructura de carpetas.
