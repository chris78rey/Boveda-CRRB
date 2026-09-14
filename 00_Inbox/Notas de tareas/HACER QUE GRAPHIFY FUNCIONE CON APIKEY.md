---
tipo: tarea
estado: pendiente
tags:
  - graphify
  - codigo
  - comandos
base: "[[00_Inbox/Tareas.md|Tareas]]"
---

# HACER QUE GRAPHIFY FUNCIONE CON APIKEY

← Volver a la página base: [[00_Inbox/Tareas.md|Tareas]]

> [!info] Estado
> 🟡 Pendiente · 🔺 · Orden 104

> [!abstract] Página base
> [[00_Inbox/Tareas.md|Tareas]]



```
graphify extract . --backend openai --model "$OPENAI_MODEL"
```



  Verificación después de reiniciar:

```
bash -lc 'printf "Modelo: %s\n" "$OPENAI_MODEL"; if [ -n "$OPENAI_API_KEY" ]; then   echo "OPENAI_API_KEY: OK"; else echo "OPENAI_API_KEY: FALTA"; fi'
```



• Desde el repositorio ejecuta:

```  
  graphify cluster-only . --no-label
```

```
  graphify export callflow-html  
```

```
graphify export html
```

  Generará:

```
  graphify-out/graph.html       # grafo interactivo
  graphify-out/GRAPH_REPORT.md  # reporte
  graphify-out/callflow.html    # flujo de llamadas
```

  Para abrirlos:

```
  xdg-open graphify-out/graph.html
  xdg-open graphify-out/callflow.html
```

  La herramienta también puede generar un árbol HTML:

```
  graphify tree --graph graphify-out/graph.json \
    --output graphify-out/GRAPH_TREE.html \
    --root .
```