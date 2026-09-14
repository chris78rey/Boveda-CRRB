---
tipo: prompt
categoria: User
tags:
  - prompt
---

# graphify inferido

## Prompt
Actúa como un Arquitecto de Software Experto. Te he adjuntado un archivo generado por Repomix que contiene el código fuente completo de mi proyecto y la salida actual del mapa de conocimiento de Graphify (`GRAPH_REPORT.md` y/o `graph.json`).

El grafo actual se construyó utilizando un motor local (AST). Por lo tanto, tiene dos grandes limitaciones:

1. Carece de relaciones inferidas (0% INFERRED edges), por lo que es ciego ante contratos de datos implícitos, flujos complejos o similitudes semánticas.

2. Las agrupaciones de módulos tienen nombres matemáticos genéricos (ej. "Community 0", "Community 1") en lugar de nombres funcionales reales.

Tu tarea es analizar todo el repositorio y devolverme EXACTAMENTE DOS bloques de código listos para ser guardados en mi proyecto:

**Bloque 1: Archivo `graphify-out/.graphify_labels.json`**

Analiza los nodos que pertenecen a cada "Community" y deduce cuál es el propósito de ese grupo. Genera un JSON válido donde la clave sea el número de la comunidad (en formato string) y el valor sea un nombre descriptivo de 2 a 5 palabras (ej. "Módulo de Autenticación", "Capa de Base de Datos").

**Bloque 2: Archivo `docs/arquitectura_inferida.md`**

Identifica las relaciones faltantes: llamadas dinámicas, componentes que resuelven el mismo problema (`semantically_similar_to`), y conceptos lógicos compartidos (`conceptually_related_to`).

Redacta este archivo usando oraciones declarativas claras, mencionando los nombres exactos de los archivos y las clases/funciones. Por ejemplo:

- "El componente `X` en el archivo `a.ts` es similar semánticamente a la clase `Y` en `b.py` porque ambos validan la misma carga."

- "El servicio `Z` se relaciona conceptualmente con la tabla `W` de la base de datos."

- "Razón de diseño (# WHY): El módulo `A` no llama a `B` directamente porque usa un bus de eventos."

No generes explicaciones adicionales fuera de los dos bloques de código solicitados.
