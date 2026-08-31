<%*
const inheritedTags = await tp.user.heredar_tags(tp);
const tagsYaml = inheritedTags.length ? `\n${inheritedTags.map((tag) => `  - ${tag}`).join("\n")}` : " []";
const estado = await tp.system.suggester(["Activo", "Mantenimiento", "Retirado", "Propuesto"], ["activo", "mantenimiento", "retirado", "propuesto"]);
const ambiente = await tp.system.suggester(["Producción", "Pruebas", "Desarrollo", "Laboratorio"], ["produccion", "pruebas", "desarrollo", "laboratorio"]);
const ip = await tp.system.prompt("IP o rango", "");
%>---
tipo: infraestructura
subtipo: equipo
fecha_creacion: <% tp.date.now("YYYY-MM-DD") %>
estado: <% estado %>
ambiente: <% ambiente %>
hostname: "<% tp.file.title %>"
ip: "<% ip %>"
fabricante: ""
modelo: ""
serial: ""
sistema_operativo: ""
ubicacion: ""
responsable: ""
criticidad: media
tags:<% tagsYaml %>
---

# <% tp.file.title %>

## Identificación

| Campo | Valor |
|---|---|
| Fabricante/modelo |  |
| Serial |  |
| IP/hostname |  |
| Ubicación |  |
| Responsable |  |

## Credenciales asociadas

```dataview
TABLE servicio, usuario, estado, rotacion_dias
FROM "03_Areas/Infraestructura/Credenciales"
WHERE equipo = this.file.link
SORT servicio ASC
```

## Dependencias

- Hospeda: 
- Depende de: 
- Monitoreo: 

## Mantenimiento

- Última revisión:
- Próxima revisión:
- Notas:

> [!warning]
> Las contraseñas se guardan únicamente en el gestor de secretos referenciado.
