const ROOT = "07_Recursos/Prompts/importados";

function modal(title, value = "", readOnly = false) {
  return new Promise(resolve => {
    const overlay = document.body.createDiv();
    overlay.style.cssText = "position:fixed;inset:0;z-index:10000;background:#26323888;display:flex;align-items:center;justify-content:center";
    const box = overlay.createDiv();
    box.style.cssText = "background:#f5f0e7;padding:24px;border-radius:16px;width:min(780px,94vw);max-height:90vh;overflow:auto";
    box.createEl("h2", { text: title });
    const input = box.createEl("textarea");
    input.value = value;
    input.readOnly = readOnly;
    input.rows = readOnly ? 16 : 18;
    input.style.cssText = "width:100%;margin:12px 0;resize:vertical;font-family:monospace";
    const ok = box.createEl("button", { text: readOnly ? "Confirmar importación" : "Continuar" });
    const cancel = box.createEl("button", { text: "Cancelar" });
    cancel.style.marginLeft = "8px";
    ok.onclick = () => { overlay.remove(); resolve(readOnly ? true : input.value.trim()); };
    cancel.onclick = () => { overlay.remove(); resolve(null); };
    input.focus();
  });
}

function cleanText(text) {
  return String(text || "")
    .replace(/^\s*```(?:yaml|yml|markdown|md)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .replace(/\[\s*(?:PLACEHOLDER|TEMATICA|TEMA)\s*\]/gi, "{{TEMA}}")
    .replace(/\{\{\s*(?:PLACEHOLDER|TEMATICA|TEMA)\s*\}\}/gi, "{{TEMA}}")
    .trim();
}

function yamlValue(line) {
  const value = line.replace(/^\s*(?:-\s*)?(?:label|value|title|category):\s*/, "").trim();
  return value.replace(/^['"]|['"]$/g, "").trim();
}

// Harpa guarda los grupos como options + condition + message. Se parsea localmente
// para no depender de que el LLM entienda YAML ni perder opciones largas.
function parseHarpa(source) {
  const lines = source.replace(/\r/g, "").split("\n");
  const titleLine = lines.find(line => /^\s*title:\s*/i.test(line));
  const name = titleLine ? yamlValue(titleLine) : "Prompt importado";
  const labels = [];
  let inOptions = false;
  for (const line of lines) {
    if (/^\s*options:\s*$/i.test(line)) { inOptions = true; continue; }
    if (inOptions && /^\s*-\s*label:\s*/i.test(line)) labels.push(yamlValue(line));
    if (inOptions && /^\s*(?:default|vision|optionsInvalid|condition|type):/.test(line)) inOptions = false;
  }
  // Algunos YAML exportados por Harpa cambian la indentación; recuperamos
  // igualmente las etiquetas consecutivas del bloque de opciones.
  if (labels.length < 2) {
    labels.length = 0;
    for (const match of source.matchAll(/^\s*-\s*label:\s*(.+?)\s*$/gim)) labels.push(match[1].replace(/^['"]|['"]$/g, "").trim());
  }
  const options = [];
  for (let i = 0; i < lines.length; i++) {
    const condition = lines[i].match(/^\s*-\s*condition:\s*['"]?\{\{[^}]+\}\}\s*=\s*(.*?)['"]?\s*$/i);
    if (!condition) continue;
    const optionName = condition[1].trim().replace(/^['"]|['"]$/g, "");
    let messageIndex = -1;
    for (let j = i + 1; j < lines.length; j++) {
      if (/^\s*message:\s*/i.test(lines[j])) { messageIndex = j; break; }
      if (/^\s*-\s*(?:condition|type):/.test(lines[j])) break;
    }
    if (messageIndex < 0) continue;
    const messageLine = lines[messageIndex];
    let content = messageLine.replace(/^\s*message:\s*/i, "").trim();
    const block = /^(?:\|[-+]?|>[-+]?)$/.test(content);
    if (block) {
      const body = [];
      const firstBodyIndent = lines[messageIndex + 1]?.match(/^\s*/)?.[0].length || 0;
      for (let j = messageIndex + 1; j < lines.length; j++) {
        if (/^\s*-\s*(?:condition|type|label):/.test(lines[j])) break;
        body.push(lines[j].slice(Math.min(firstBodyIndent, lines[j].match(/^\s*/)?.[0].length || 0)));
      }
      content = body.join("\n");
    }
    options.push({ name: optionName, instructions: cleanText(content) });
  }
  if (labels.length >= 2 && options.length >= 2) {
    const byName = new Map();
    for (const option of options) { if (!byName.has(option.name)) byName.set(option.name, []); byName.get(option.name).push(option); }
    return { type: "group", name, category: "estudio", sharedPlaceholders: [], options: labels.map(label => (byName.get(label)?.shift() || { name: label, instructions: "No se encontró el bloque de instrucciones asociado en el YAML." })) };
  }
  return null;
}

function safeName(name) { return String(name).replace(/[\\/:*?"<>|]/g, "-").trim() || "prompt-importado"; }

module.exports = async ({ app }) => {
  const source = await modal("Importar prompt o grupo desde Harpa", "");
  if (!source) return;
  let data = null;
  {
    let key = "", model = "google/gemini-3.1-flash-lite";
    try {
      const fs = require("fs");
      const path = require("path");
      const os = require("os");
      const configPath = process.platform === "win32"
        ? path.join(process.env.APPDATA || os.homedir(), "crrb", "openrouter.env")
        : path.join(os.homedir(), ".config", "crrb", "openrouter.env");
      if (fs.existsSync(configPath)) {
        const env = fs.readFileSync(configPath, "utf8");
        key = env.match(/^OPENROUTER_API_KEY=(.*)$/m)?.[1]?.trim() || "";
        model = env.match(/^OPENROUTER_MODEL=(.*)$/m)?.[1]?.trim() || model;
      }
      if (!key) {
        key = await modal("API key de OpenRouter");
        model = await modal("Modelo de OpenRouter", model);
        fs.mkdirSync(path.dirname(configPath), { recursive: true });
        fs.writeFileSync(configPath, `OPENROUTER_API_KEY=${key}\nOPENROUTER_MODEL=${model}\n`, { mode: 0o600 });
      }
    } catch (error) { throw new Error("No se pudo leer la configuración de OpenRouter: " + error.message); }
    const systemPrompt = `Eres un importador especializado en flujos YAML exportados por Harpa. Tu trabajo es interpretar la estructura y conservar el contenido, no resumirlo.

REGLAS DE INTERPRETACIÓN:
1. Lee todos los bloques meta y steps. No descartes pasos por estar antes o después de clear.
2. Un bloque type: ask con options representa botones. Usa el texto de label como nombre visible y value como valor interno.
3. Cada bloque condition como {{param}} = valor debe asociarse con el bloque say/message que le sigue. Conserva el message COMPLETO: Markdown, títulos, listas, código, variables y saltos de línea.
4. Si hay ask + options + conditions, devuelve un solo elemento type group con una opción por cada botón, en el mismo orden. Conserva opciones duplicadas y relaciónalas por orden de aparición.
5. Si hay varios grupos meta separados, devuelve un item por grupo. Si solo hay un prompt sin options, devuelve type prompt.
6. Convierte PLACEHOLDER, TEMATICA, TEMA, [PLACEHOLDER], [TEMATICA] y sus variantes entre llaves en {{TEMA}}. Conserva otros placeholders como {{DOMINIO}}.
7. No uses el texto de label de un step como contenido si existe un message asociado. No confundas el primer condition auxiliar con una opción si no tiene botón correspondiente.
8. Nunca resumas, combines, inventes ni dejes instrucciones vacías. Si no encuentras un mensaje asociado, copia el bloque say más cercano completo; si aun así falta, marca la importación como inválida.

FORMATO OBLIGATORIO: responde únicamente JSON válido, sin markdown ni explicaciones, con esta forma exacta:
{"items":[{"type":"group","name":"Nombre","category":"estudio","sharedPlaceholders":[],"instructions":"","options":[{"name":"Botón 1","instructions":"Texto completo"}]}]}
Para un prompt individual usa options:[] e instructions con todo el texto. Todos los grupos deben tener al menos dos opciones y cada option.instructions debe contener texto real.`;
    const request = () => fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model, temperature: 0.1, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: source }] }) });
    let response = await request();
    if (!response.ok && (response.status === 401 || response.status === 403)) {
      const replacement = await modal("La clave no fue aceptada. Corrígela", key);
      if (!replacement) throw new Error("No se actualizó la clave de OpenRouter");
      key = replacement;
      try {
        const fs = require("fs");
        const path = require("path");
        const os = require("os");
        const configPath = process.platform === "win32"
          ? path.join(process.env.APPDATA || os.homedir(), "crrb", "openrouter.env")
          : path.join(os.homedir(), ".config", "crrb", "openrouter.env");
        fs.mkdirSync(path.dirname(configPath), { recursive: true });
        fs.writeFileSync(configPath, `OPENROUTER_API_KEY=${key}\nOPENROUTER_MODEL=${model}\n`, { mode: 0o600 });
      } catch (error) { throw new Error("No se pudo guardar la nueva clave: " + error.message); }
      response = await request();
    }
    if (!response.ok) throw new Error("OpenRouter respondió " + response.status);
    const raw = (await response.json()).choices?.[0]?.message?.content || "";
    try {
      const parsed = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/gi, ""));
      data = (parsed.items || []).find(item => item.type === "group" ? item.options?.length : String(item.instructions || "").trim()) || null;
    } catch (error) { data = null; }
    if (!data) data = parseHarpa(source);
    if (!data) throw new Error("No se detectó un prompt válido en la respuesta ni en el YAML");
  }
  const invalidGroup = data.type === "group" && (!Array.isArray(data.options) || !data.options.length || data.options.some(option => !String(option.instructions || "").trim()));
  const invalidPrompt = data.type !== "group" && !String(data.instructions || "").trim();
  if (invalidGroup || invalidPrompt) {
    new Notice("Importación detenida: se detectó una opción o prompt sin texto. No se guardó ningún archivo.");
    return;
  }
  const summary = data.type === "group" ? `GRUPO: ${data.name}\nCategoría: ${data.category}\nOpciones (${data.options.length}):\n${data.options.map(option => `• ${option.name} (${String(option.instructions).length} caracteres)`).join("\n")}` : `PROMPT: ${data.name}\nCategoría: ${data.category || "estudio"}\n\n${data.instructions}`;
  if (!await modal("Vista previa de la importación", summary, true)) { new Notice("Importación cancelada"); return; }
  if (!app.vault.getAbstractFileByPath(ROOT)) await app.vault.createFolder(ROOT);
  const body = data.type === "group" ? `---\ntipo: grupo\ncategoria: ${data.category || "estudio"}\ntags:\n  - prompt\n  - grupo\n---\n\n# ${data.name}\n\n## Placeholders compartidos\n${(data.sharedPlaceholders || []).map(value => `- \`${value}\``).join("\n")}\n\n## Opciones\n${data.options.map(option => `\n### ${option.name}\n${cleanText(option.instructions)}`).join("\n")}` : `---\ntipo: prompt\ncategoria: ${data.category || "estudio"}\ntags:\n  - prompt\n---\n\n# ${data.name}\n\n## Prompt\n${cleanText(data.instructions)}\n`;
  const path = `${ROOT}/${safeName(data.name)}.md`;
  const existing = app.vault.getAbstractFileByPath(path);
  if (existing) await app.vault.modify(existing, body); else await app.vault.create(path, body);
  new Notice(`Importado correctamente: ${data.type === "group" ? `grupo con ${data.options.length} opciones` : "prompt individual"}`);
};
