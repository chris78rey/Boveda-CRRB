---
tipo: procedimiento
tags:
  - sistema/seguridad
  - sistema/respaldo
---

# Seguridad y respaldos

## Secretos

- No guardar contraseñas, tokens, API keys, claves privadas ni cadenas con credenciales.
- Usar KeePassXC, Bitwarden o 1Password.
- Guardar en la bóveda únicamente referencias, usuarios y fechas de rotación.
- No sincronizar bases `.kdbx` ni archivos de claves mediante Git.

## Antes de hacer push

1. Ejecutar `git status`.
2. Revisar `git diff`.
3. Buscar accidentalmente secretos en los cambios.
4. Confirmar que `.env`, certificados y claves estén ignorados.
5. Ejecutar el commit y push solo después de revisar.

## Restauración periódica

- Probar que una nota eliminada pueda recuperarse desde Git.
- Probar la restauración de la configuración de QuickAdd.
- Ejecutar `Restaurar estructura`.
- Mantener una copia externa de la bóveda.
- Verificar que la copia externa pueda abrirse en otra ubicación.

## Trazabilidad

Cada requisito debe enlazar sus tareas, pruebas y despliegues. Usar el ID del
requisito en la descripción de la tarea, por ejemplo `RF-001.01`.
