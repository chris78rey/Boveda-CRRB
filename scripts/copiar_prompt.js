/*
 * Compatibilidad con el comando QuickAdd «Copiar prompt».
 * La biblioteca visual vive en prompt_modal.js; este flujo conserva el acceso
 * rápido de QuickAdd para prompts individuales y grupos ya guardados.
 */
const ROOT = "07_Recursos/Prompts";

module.exports = async ({ app, quickAddApi }) => {
  const notice = (message) => { if (typeof globalThis.Notice === "function") new globalThis.Notice(message); };
  const isIncluded = (file) => file.path.startsWith(`${ROOT}/`)
    && !/(^|\/)(README|Historial|Resultados)(\/|$)/i.test(file.path);
  const fm = (raw, key) => {
    const block = String(raw || "").match(/^---\s*\n([\s\S]*?)\n---/);
    const match = block?.[1].match(new RegExp(`^${key}\\s*:\\s*["']?([^"'\\n]+?)["']?\\s*$`, "im"));
    return match ? match[1].trim() : "";
  };
  const body = (raw) => (String(raw || "").match(/##\s+Prompt\s*\n([\s\S]*?)(?=\n##\s+|$)/i) || [, String(raw || "").replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "")])[1].trim();
  const vars = (source) => [...new Map([...String(source || "").matchAll(/\{\{\s*([^{}|]+?)(?:\|([^{}]*))?\s*\}\}/g)].map((match) => {
    const name = match[1].trim(); return [name.toUpperCase(), { name, fallback: (match[2] || "").trim() }];
  })) .values()];
  const replace = (source, values) => String(source || "").replace(/\{\{\s*([^{}|]+?)(?:\|([^{}]*))?\s*\}\}/g, (_m, name, fallback) => {
    const value = values[name.trim().toUpperCase()];
    return value ?? (String(fallback || "").trim() || `[${name.trim()}]`);
  });
  const title = (raw, fallback) => (String(raw || "").replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "").match(/^#\s+(.+)$/m) || [, fallback])[1].trim();
  const files = [];
  for (const file of app.vault.getMarkdownFiles().filter(isIncluded)) {
    const raw = await app.vault.read(file);
    const type = fm(raw, "tipo").toLowerCase() === "grupo" ? "group" : "prompt";
    if (type === "prompt" && !/##\s+Prompt\b/i.test(raw) && fm(raw, "tipo").toLowerCase() !== "prompt") continue;
    files.push({ file, raw, type, category: fm(raw, "categoria") || file.path.slice(ROOT.length + 1).split("/")[0], name: title(raw, file.basename) });
  }
  if (!files.length) return notice("No hay prompts registrados.");
  const selected = await quickAddApi.suggester(files.map((item) => `${item.type === "group" ? "Grupo" : "Individual"} · ${item.category} · ${item.name} — ${item.file.path}`), files);
  if (!selected) return;

  let outputs = [];
  if (selected.type === "prompt") {
    let source = body(selected.raw);
    const values = {};
    for (const item of vars(source)) {
      const value = await quickAddApi.inputPrompt(`Valor para ${item.name}`, item.fallback);
      if (value === null || value === undefined) return;
      values[item.name.toUpperCase()] = String(value) || item.fallback;
    }
    outputs = [{ title: selected.name, text: replace(source, values) }];
  } else {
    const section = selected.raw.match(/##\s+Opciones\s*\n([\s\S]*?)(?=\n##\s+|$)/i)?.[1] || "";
    const headings = [...section.matchAll(/^###\s+(.+?)\s*$/gim)];
    const options = headings.map((heading, index) => {
      const end = index + 1 < headings.length ? headings[index + 1].index : section.length;
      const optionBody = section.slice(heading.index + heading[0].length, end).trim();
      const ref = optionBody.match(/<!--\s*prompt-ref:\s*(.+?)\s*-->/i)?.[1].trim();
      const refFile = ref ? files.find((item) => item.file.path === ref) : null;
      return { name: heading[1].trim(), source: refFile ? body(refFile.raw) : optionBody.replace(/<!--[^>]*-->/g, "").trim() };
    });
    if (!options.length) return notice("El grupo no contiene opciones utilizables.");
    const chosenNames = await quickAddApi.inputPrompt(`Métodos a usar, separados por coma.\nDisponibles: ${options.map((item) => item.name).join(", ")}`, options.map((item) => item.name).join(", "));
    if (chosenNames === null || chosenNames === undefined) return;
    const selectedOptions = options.filter((item) => chosenNames.split(",").some((name) => name.trim().toLowerCase() === item.name.toLowerCase()));
    const usable = selectedOptions.length ? selectedOptions : options;
    const values = {};
    const allVars = vars(usable.map((item) => item.source).join("\n"));
    for (const item of allVars) {
      const value = await quickAddApi.inputPrompt(`Valor para ${item.name}`, item.fallback);
      if (value === null || value === undefined) return;
      values[item.name.toUpperCase()] = String(value) || item.fallback;
    }
    outputs = usable.map((item) => ({ title: item.name, text: replace(item.source, values) }));
  }
  try {
    await globalThis.navigator.clipboard.writeText(outputs.map((item) => `${item.title}\n\n${item.text}`).join("\n\n---\n\n"));
  } catch (error) { return notice(`No se pudo copiar: ${error.message}`); }
  if (await quickAddApi.yesNoPrompt("Resultado copiado. ¿Guardar una copia en Historial?")) {
    const folder = `${ROOT}/Historial`;
    if (!app.vault.getAbstractFileByPath(folder)) await app.vault.createFolder(folder);
    const filename = `${new Date().toISOString().replace(/[:.]/g, "-")} - ${selected.name.replace(/[\\/:*?"<>|]/g, "-")}.md`;
    await app.vault.create(`${folder}/${filename}`, outputs.map((item) => `## ${item.title}\n\n${item.text}`).join("\n\n---\n\n"));
  }
  notice(`Resultado copiado: ${selected.name}`);
};
