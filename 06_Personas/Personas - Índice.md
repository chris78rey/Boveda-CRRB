---
tipo: indice
tags:
  - persona
---

# Personas

```dataview
TABLE WITHOUT ID file.link AS "Persona", organizacion AS "Organización", cargo AS "Cargo", relacion AS "Relación", ultimo_contacto AS "Último contacto"
FROM "06_Personas"
WHERE tipo = "persona"
SORT file.name ASC
```

