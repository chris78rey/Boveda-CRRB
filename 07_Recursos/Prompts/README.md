---
tipo: indice
tags:
  - prompt
---

# Biblioteca visual de prompts

La entrada recomendada es `QuickAdd → Biblioteca interactiva de prompts` (o
`CRRB - Prompts → Abrir biblioteca visual`). Todo se crea y se ejecuta desde
ventanas modales; no es necesario editar YAML manualmente.

Hay dos tipos de elementos:

- **Individual:** un archivo `.md` dentro de una categoría.
- **Grupo:** un archivo `.md` con sus opciones relacionadas. Una opción puede
  vivir dentro del grupo o reutilizar un prompt individual mediante una
  referencia `prompt-ref`; así no se pierde el vínculo con su archivo real.

Usa placeholders con esta sintaxis:

```text
Servidor: {{servidor}}
Ambiente: {{ambiente|produccion}}
Error: {{error}}
```

La biblioteca detecta automáticamente los placeholders y permite completar
textos largos en áreas amplias. En un grupo se pueden seleccionar varios
métodos, reutilizar un valor compartido como `{{TEMA}}`, completar solo los
campos adicionales necesarios, previsualizar cada resultado, copiar uno o
todos y abrir una nota de resultado.

`CRRB - Prompts → Copiar prompt` se conserva como acceso rápido compatible con
los prompts individuales actuales y también reconoce grupos.

Las copias completadas son opcionales y se guardan en `Historial`.
