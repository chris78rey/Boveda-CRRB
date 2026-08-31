<%*
const inheritedTags = await tp.user.heredar_tags(tp);
const tagsYaml = inheritedTags.length ? `\n${inheritedTags.map((tag) => `  - ${tag}`).join("\n")}` : " []";
const estado = await tp.system.suggester(["Activo", "Mantenimiento", "Retirado", "Propuesto"], ["activo", "mantenimiento", "retirado", "propuesto"]);
const ambiente = await tp.system.suggester(["Producción", "Pruebas", "Desarrollo", "Laboratorio"], ["produccion", "pruebas", "desarrollo", "laboratorio"]);
const host = await tp.system.prompt("Host físico o clúster", "");
%>---
tipo: infraestructura
subtipo: maquina_virtual
fecha_creacion: <% tp.date.now("YYYY-MM-DD") %>
estado: <% estado %>
ambiente: <% ambiente %>
host_fisico: "<% host %>"
hypervisor: ""
hostname: "<% tp.file.title %>"
ip: ""
sistema_operativo: ""
vcpus: 0
memoria_gb: 0
almacenamiento_gb: 0
responsable: ""
criticidad: media
tags:<% tagsYaml %>
---

# <% tp.file.title %>

## Plataforma

- Host/clúster: 
- Hypervisor: 
- Sistema operativo: 
- IP/hostname: 

## Recursos

| vCPU | Memoria GB | Almacenamiento GB |
|---:|---:|---:|
|  |  |  |

## Credenciales asociadas

```dataview
TABLE servicio, usuario, estado, rotacion_dias
FROM "03_Areas/Infraestructura/Credenciales"
WHERE equipo = this.file.link
SORT servicio ASC
```

## Dependencias

- Servicios alojados:
- Respaldos:
- Monitoreo:
