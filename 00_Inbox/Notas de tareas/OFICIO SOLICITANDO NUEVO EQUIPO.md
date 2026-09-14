---
tipo: tarea
estado: pendiente
tags:
  - tarea
  - tareas
  - inbox
  - sistema/obsidian
  - migracion
  - spd
base: "[[00_Inbox/Tareas.md|Tareas]]"
---
Aquí tienes la versión completa y pulida del **textos del oficio** incorporando explícitamente todos los datos del servidor actual y la tabla comparativa (Mínimo vs. Recomendado) para que puedas copiarlo y pegarlo directamente en tu sistema de gestión documental o procesador de texto:

---

# MEMORANDO / OFICIO N.° HE1-DTIC-DIG-2026-045-O

**PARA:**  
**Crnl. de C.S.M. Juan Carlos Sánchez**  
Director / Jefe del Departamento de Tecnologías de la Información y Comunicaciones (DTIC)  
Hospital de Especialidades de las Fuerzas Armadas N.° 1 (HE-1)

**DE:**  
**Equipo Técnico de Desarrollo y Gestión Digital HE-1**

**FECHA:**  
Quito, D.M., 12 de septiembre de 2026

**ASUNTO:**  
Solicitud de aprovisionamiento de nueva Máquina Virtual (VM) para el Módulo de Digitalización de Planillaje y Migración de Servicios

---

De mi consideración:

Por medio del presente, me dirijo a usted para poner en su conocimiento el diagnóstico técnico respecto a la capacidad de almacenamiento, uso de recursos y proyección de crecimiento del **Módulo de Digitalización de Planillaje del HE-1**.

### 1. Diagnóstico del Servidor Actual y Justificación Técnica

En los últimos seis (6) meses de operación continua, el volumen de archivos digitales procesados ha registrado un incremento sostenido de **1 Terabyte (1 TB)**. El monitoreo del servidor actual arroja los siguientes indicadores críticos:

- **Procesador:** 12 vCPU Xeon Silver 4316.
- **Memoria RAM:** 32 GB RAM (con una disponibilidad real utilizable de ~20 GB). El servicio Redis consume ~1 GB continuo y cada _worker_ de Python demanda entre 350 y 500 MB.
- **Almacenamiento del Sistema:** Disco raíz de 100 GB **ocupado al 85%**, con riesgo de saturación por logs y temporales.
- **Almacenamiento de Datos:** Volumen de datos de 988 GB, con 528 GB usados actualmente.

De mantenerse la tasa actual de digitalización, el volumen actual alcanzará su límite operativo en el corto plazo, comprometiendo la disponibilidad del sistema asistencial y de auditoría.

---

### 2. Especificaciones Técnicas Requeridas para la Nueva Máquina Virtual (VM)

Para migrar el ecosistema manteniendo la estabilidad de los servicios y asegurando el crecimiento proyectado, se solicita el aprovisionamiento de una nueva VM con las siguientes características:

- **Sistema Operativo Base:** **Ubuntu Server 24.04 LTS** (Kernel 6.8.0-138-generic, arquitectura x86_64).
- **Conectividad y Respaldo:** Red de **1 Gbps** y política de respaldo externo automatizado.

#### Matriz de Dimensionamiento Solicitado:

|Recurso / Componente|Perfil Mínimo de Contingencia|Perfil Recomendado (Optimo)|Justificación Técnica|
|:--|:--|:--|:--|
|**CPU**|8 vCPU|**12 vCPU**|Absorbe la compresión masiva (Ghostscript) y _workers_ concurrentes.|
|**Memoria RAM**|32 GB|**64 GB** _(o 48–64 GB)_|Garantiza margen para Redis (1 GB) y múltiples procesos Python.|
|**Disco Sistema (Raíz)**|120 GB SSD|**200 GB SSD**|Previene bloqueos por temporales y registros del sistema operativo.|
|**Disco Datos / PDFs**|1.2 TB SSD|**2.0 TB SSD**|Soporta el crecimiento de **1 TB cada 6 meses** a mediano plazo.|
|**Memoria Swap**|8–16 GB|**16 GB**|Protección ante picos de demanda durante cargas masivas.|

> **Nota:** La opción recomendada de **12 vCPU, 64 GB RAM y 2 TB SSD de datos** es la que garantiza la continuidad operativa sin cuellos de botella para los próximos años.

---

### 3. Alcance de la Migración de Aplicaciones

En el nuevo servidor se consolidarán e instalarán las aplicaciones que conforman el ecosistema actual:

1. **Plataforma Principal de Digitalización (`/opt/digitalizacion_he1`):** Backend FastAPI y gestor de árbol documental Flask.
2. **Sistema de Coberturas Integradas (`/data_nuevo/cobertura_integrada`):** Aplicación Streamlit y generador automático de PDFs.
3. **Servidor de Transferencia SFTP (`/data_nuevo/flask_sftp/sftp_he1`):** Módulo de sincronización segura de planillas.
4. **Utilitario de Renombramiento en Rust (`/data_nuevo/rust_cambia_nombre_planillas_he1`):** Binario de canonización de nombres.

---

### 4. Solicitud Concreta

Por lo expuesto, solicito respetuosamente se autorice a quien corresponda la creación y entrega de la Máquina Virtual con el **Perfil Recomendado** (Ubuntu Server 24.04 LTS, 12 vCPU, 64 GB RAM, 200 GB SSD Sistema, 2 TB SSD Datos, 16 GB Swap y Red 1 Gbps con respaldo automatizado), a fin de iniciar el cronograma de migración sin afectar la atención hospitalaria.

Atentamente,

**EQUIPO TÉCNICO DE DIGITALIZACIÓN Y DESARROLLO**  
Hospital de Especialidades de las Fuerzas Armadas N.° 1 (HE-1)

---

Recuerda que también tienes listo el PDF impreso con este contenido exacto (`oficio_solicitud_servidor_vm_he1-v2.pdf`) en tu panel de **Studio**.

¿Quieres que preparemos la lista de comandos de Linux (`rsync`, respaldo de `SQLite` y exportación de `.env`) para tener listo el plan de migración una vez que aprueben la VM?