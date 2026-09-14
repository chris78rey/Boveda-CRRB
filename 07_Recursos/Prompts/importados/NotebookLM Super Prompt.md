---
tipo: grupo
categoria: estudio
tags:
  - prompt
  - grupo
---

# NotebookLM Super Prompt

## Placeholders compartidos


## Opciones

### 🔎 Análisis Fundamental de Fuentes
**Super Prompt Genérico para Análisis Profundo en NotebookLM:**

"Actúa como un analista experto e investigador meticuloso. Realiza un análisis exhaustivo y multifacético de **todas las fuentes de información que han sido cargadas**. Tu objetivo es extraer información clave, descubrir conexiones ocultas, generar preguntas pertinentes y revelar perspectivas que podrían no ser obvias a primera vista, basándote únicamente en el contenido proporcionado. Por favor, estructura tu respuesta abordando los siguientes puntos de manera detallada:

1.  **Resumen Ejecutivo y Puntos Clave:**
    * Sintetiza las ideas principales, argumentos centrales y conclusiones más importantes presentes en el conjunto de los documentos.
    * Extrae y lista las definiciones clave relacionadas con los términos o conceptos más cruciales identificados en los textos.
    * Identifica los datos o evidencias más relevantes que soportan las conclusiones principales encontradas en las fuentes.

Presenta toda esta información de manera clara, organizada y bien estructurada, utilizando encabezados o secciones para cada uno de los 5 puntos solicitados."

### 🔗 Conexiones y Contradicciones Documentales
**Super Prompt Genérico para Análisis Profundo en NotebookLM:**

"Actúa como un analista experto e investigador meticuloso. Realiza un análisis exhaustivo y multifacético de **todas las fuentes de información que han sido cargadas**. Tu objetivo es extraer información clave, descubrir conexiones ocultas, generar preguntas pertinentes y revelar perspectivas que podrían no ser obvias a primera vista, basándote únicamente en el contenido proporcionado. Por favor, estructura tu respuesta abordando los siguientes puntos de manera detallada:

2.  **Conexiones, Correlaciones y Contradicciones:**
    * Identifica y explica patrones, temas recurrentes o conexiones significativas *entre* los diferentes documentos o secciones dentro de ellos.
    * Analiza si existe alguna correlación (sugerida o explícita) entre conceptos, eventos o datos clave que identifiques en las fuentes.
    * Señala cualquier contradicción, tensión, inconsistencia o diferencia notable en las perspectivas o datos presentados entre las distintas fuentes sobre los temas principales que abordan.
Presenta toda esta información de manera clara, organizada y bien estructurada, utilizando encabezados o secciones para cada uno de los 5 puntos solicitados."

### ❓ Generador de Preguntas Críticas
**Super Prompt Genérico para Análisis Profundo en NotebookLM:**

"Actúa como un analista experto e investigador meticuloso. Realiza un análisis exhaustivo y multifacético de **todas las fuentes de información que han sido cargadas**. Tu objetivo es extraer información clave, descubrir conexiones ocultas, generar preguntas pertinentes y revelar perspectivas que podrían no ser obvias a primera vista, basándote únicamente en el contenido proporcionado. Por favor, estructura tu respuesta abordando los siguientes puntos de manera detallada:

3.  **Generación de Preguntas Críticas y FAQs:**
    * Formula entre 5 y 7 preguntas críticas y profundas cuya respuesta requeriría una comprensión completa de estos documentos.
    * Identifica preguntas importantes que los documentos dejan sin respuesta, responden parcialmente o generan ambigüedad.
    * Si es posible, genera un breve formato FAQ (Pregunta-Respuesta) para las 3-4 preguntas más fundamentales, basando las respuestas *estrictamente* en la información contenida en las fuentes.
Presenta toda esta información de manera clara, organizada y bien estructurada, utilizando encabezados o secciones para cada uno de los 5 puntos solicitados."

### 👁️ Descubrimiento de Perspectivas Ocultas
**Super Prompt Genérico para Análisis Profundo en NotebookLM:**
"Actúa como un analista experto e investigador meticuloso. Realiza un análisis exhaustivo y multifacético de **todas las fuentes de información que han sido cargadas**. Tu objetivo es extraer información clave, descubrir conexiones ocultas, generar preguntas pertinentes y revelar perspectivas que podrían no ser obvias a primera vista, basándote únicamente en el contenido proporcionado. Por favor, estructura tu respuesta abordando los siguientes puntos de manera detallada:
4.  **Descubrimiento de Perspectivas Ocultas y Puntos Ciegos:**
    * Analiza qué aspectos importantes, matices, implicaciones a largo plazo o consecuencias no evidentes sobre los temas tratados podrían pasarse por alto con una lectura superficial del material proporcionado.
    * Identifica supuestos subyacentes o no declarados en los argumentos presentados en los textos.
    * Señala si hay perspectivas, voces o tipos de información relevantes sobre los temas tratados que estén notablemente ausentes o subrepresentados en el conjunto de documentos.
Presenta toda esta información de manera clara, organizada y bien estructurada, utilizando encabezados o secciones para cada uno de los 5 puntos solicitados."

### 🧠 Síntesis Holística y Estructura
**Super Prompt Genérico para Análisis Profundo en NotebookLM:**
"Actúa como un analista experto e investigador meticuloso. Realiza un análisis exhaustivo y multifacético de **todas las fuentes de información que han sido cargadas**. Tu objetivo es extraer información clave, descubrir conexiones ocultas, generar preguntas pertinentes y revelar perspectivas que podrían no ser obvias a primera vista, basándote únicamente en el contenido proporcionado. Por favor, estructura tu respuesta abordando los siguientes puntos de manera detallada:
5.  **Síntesis y Estructuración Final:**
    * Proporciona una síntesis final que vaya más allá de un simple resumen. Intenta revelar una comprensión holística, una conexión sorprendente o una conclusión novedosa que emerja al considerar todas las fuentes juntas.
    * Opcional: Sugiere una estructura (ej. un esquema o tabla comparativa) que organice la información clave de manera útil para comprender mejor el material.
Presenta toda esta información de manera clara, organizada y bien estructurada, utilizando encabezados o secciones para cada uno de los 5 puntos solicitados."

### 📝 Generador de Prompt Investigativo
**Tarea:** Analiza mis fuentes, identifica 3-5 lagunas/preguntas clave.

**Tu ÚNICA SALIDA debe ser un nuevo prompt** listo para copiar y pegar en un LLM de investigación (como Gemini).

**El prompt que generes debe instruir a ese LLM a:**
1.  Investigar la lista específica de lagunas/preguntas que identificaste.
2.  Proporcionar un resumen detallado para cada punto.
3.  **Exigir** citas de fuentes fiables (URLs, estudios) para todo.

**Formato de tu Salida:** Solo el texto del prompt secundario generado.

### 💬 Prompt Investigativo con Contexto
**Tarea:** Analiza las fuentes cargadas, identifica 5-7 lagunas o preguntas clave sin respuesta en ellas.

**Tu ÚNICA SALIDA debe ser un nuevo prompt**, listo para copiar en un LLM de investigación (ej. Gemini), **el cual NO tendrá acceso a mis fuentes originales**.

**El prompt que generes DEBE:**

1.  **Empezar con una breve frase de contexto**. Debe explicar que los puntos a investigar son lagunas identificadas tras analizar un conjunto de documentos sobre un tema específico (si puedes inferir el tema general de mis fuentes, menciónalo; si no, usa una frase genérica como "un conjunto de documentos de investigación"). **Esto es crucial** para que el otro LLM entienda por qué se piden esos temas aislados.
2.  Listar claramente las lagunas/preguntas específicas que identificaste.
3.  Instruir al otro LLM para que proporcione un resumen detallado para cada punto.
4.  **Exigir** de forma clara y obligatoria la **citación de fuentes** fiables (URLs, estudios, etc.) para toda la información proporcionada.

**Formato de tu Salida:** Solo el texto completo y listo para usar del prompt secundario que has generado (incluyendo la frase de contexto).

### 💬 Prompt Investigativo con Contexto2
**Tarea:** Analiza las fuentes cargadas, identifica lagunas o preguntas clave sin respuesta en ellas.

**Tu ÚNICA SALIDA debe ser un nuevo prompt**, listo para copiar en un LLM de investigación (ej. Gemini), **el cual NO tendrá acceso a mis fuentes originales**.

**El prompt que generes DEBE:**

1.  **Empezar con una breve frase de contexto**. Debe explicar que los puntos a investigar son lagunas identificadas tras analizar un conjunto de documentos sobre un tema específico (si puedes inferir el tema general de mis fuentes, menciónalo; si no, usa una frase genérica como "un conjunto de documentos de investigación"), debes tambien revisar que preguntas se te hicieron y no tenias suficiente información para responder y detecta en eso si hay brechas también en eso. **Esto es crucial** para que el otro LLM entienda por qué se piden esos temas aislados.
2.  Listar claramente las lagunas/preguntas específicas que identificaste.
3.  Instruir al otro LLM para que proporcione un resumen detallado para cada punto.
4.  **Exigir** de forma clara y obligatoria la **citación de fuentes** fiables (URLs, estudios, etc.) para toda la información proporcionada.

**Formato de tu Salida:** Solo el texto completo y listo para usar del prompt secundario que has generado (incluyendo la frase de contexto).

### ⚖️ Extracción para Consulta Legal
Analiza a fondo los documentos adjuntos y extrae los hechos clave para una consulta legal precisa. Basándote exclusivamente en la información de estos documentos, identifica y detalla:

1.  Actividad, Proceso o Situación Principal: Naturaleza central.
2.  Sector o Industria Involucrada: (ej: financiero, salud, tecnología).
3.  Actores Principales y Roles: Partes y sus funciones/relaciones.
4.  Manejo de Información o Datos Relevantes (si aplica): ¿Se manejan datos? ¿Qué tipo? (ej: personales, financieros).
5.  Transacciones, Acuerdos o Compromisos Clave (si aplica): Existencia o necesidad de contratos, licencias, etc.
6.  Contexto Geográfico o Jurisdiccional Relevante: Ubicación o ámbito principal (ej: Ecuador, nacional).
7.  Objetivos, Propósitos o Resultados Esperados: Fines de la actividad/proceso.
8.  Posibles Puntos de Interés o Preocupación Legal (Detectados en las Fuentes): Riesgos, disputas, incumplimientos, necesidad de autorizaciones, mención a normativas.

Presenta la información de forma clara, organizada y concisa usando estos encabezados, como base para una consulta legal.