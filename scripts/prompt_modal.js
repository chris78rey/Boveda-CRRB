/*
 * Biblioteca visual de prompts para QuickAdd.
 *
 * El archivo es autónomo a propósito: QuickAdd no siempre resuelve módulos
 * locales ni require("obsidian"). Toda la persistencia pasa por app.vault y
 * toda la interfaz se construye con DOM nativo.
 */
const ROOT = "07_Recursos/Prompts";
const RESULT_ROOT = `${ROOT}/Resultados`;

module.exports = async ({ app }) => {
  const notice = (message) => {
    if (typeof globalThis.Notice === "function") new globalThis.Notice(message);
  };

  const slug = (value, fallback = "sin-nombre") => String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9áéíóúñü]+/gi, "-")
    .replace(/^-+|-+$/g, "") || fallback;

  const safeSegment = (value, fallback = "sin-nombre") => String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^\.+|\.+$/g, "") || fallback;

  const keyOf = (name) => String(name || "").trim().toUpperCase();
  const fileCategory = (file) => file.path.slice(ROOT.length + 1).split("/")[0] || "sin categoria";
  const isPromptPath = (path) => path.startsWith(`${ROOT}/`)
    && !/(^|\/)(README|Historial|Resultados)(\/|$)/i.test(path);

  const frontmatter = (raw, field) => {
    const match = String(raw || "").match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) return "";
    const line = match[1].match(new RegExp(`^${field}\\s*:\\s*["']?([^"'\\n]+?)["']?\\s*$`, "im"));
    return line ? line[1].trim() : "";
  };

  const stripFrontmatter = (raw) => String(raw || "").replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "");
  const promptBody = (raw) => {
    const match = String(raw || "").match(/##\s+Prompt\s*\n([\s\S]*?)(?=\n##\s+|$)/i);
    return (match ? match[1] : stripFrontmatter(raw)).trim();
  };

  const placeholderInfo = (source) => {
    const result = [];
    const seen = new Set();
    for (const match of String(source || "").matchAll(/\{\{\s*([^{}|]+?)(?:\|([^{}]*))?\s*\}\}/g)) {
      const name = match[1].trim();
      const key = keyOf(name);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push({ name, key, fallback: (match[2] || "").trim() });
    }
    return result;
  };

  const replacePlaceholders = (source, values) => String(source || "").replace(
    /\{\{\s*([^{}|]+?)(?:\|([^{}]*))?\s*\}\}/g,
    (_match, name, fallback) => {
      const key = keyOf(name);
      if (Object.prototype.hasOwnProperty.call(values, key)) return values[key];
      return String(fallback || "").trim() || `[${String(name).trim()}]`;
    },
  );

  const titleFromRaw = (raw, fallback) => {
    const match = stripFrontmatter(raw).match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : fallback;
  };

  const parseShared = (raw) => {
    const section = String(raw || "").match(/##\s+Placeholders compartidos\s*\n([\s\S]*?)(?=\n##\s+|$)/i);
    if (!section) return [];
    return [...section[1].matchAll(/(?:^|\n)\s*[-*]\s*`?([^`\n]+?)`?\s*$/g)]
      .map((match) => match[1].trim())
      .filter(Boolean);
  };

  const parseGroup = (raw, fallbackName) => {
    const sectionMatch = String(raw || "").match(/##\s+Opciones\s*\n([\s\S]*?)(?=\n##\s+|$)/i);
    const section = sectionMatch ? sectionMatch[1] : "";
    const headings = [...section.matchAll(/^###\s+(.+?)\s*$/gim)];
    const options = headings.map((heading, index) => {
      const start = heading.index + heading[0].length;
      const end = index + 1 < headings.length ? headings[index + 1].index : section.length;
      const body = section.slice(start, end).trim();
      const refMatch = body.match(/<!--\s*prompt-ref:\s*(.+?)\s*-->/i);
      return {
        id: `${keyOf(heading[1])}:${refMatch ? refMatch[1].trim() : "inline"}`,
        name: heading[1].trim(),
        refPath: refMatch ? refMatch[1].trim() : "",
        instructions: body
          .replace(/<!--\s*prompt-ref:[\s\S]*?-->/gi, "")
          .replace(/<!--\s*prompt-option:[\s\S]*?-->/gi, "")
          .trim(),
      };
    });
    const allNames = options.flatMap((option) => placeholderInfo(option.instructions).map((item) => item.name));
    const repeated = [...new Set(allNames.filter((name, index) => allNames.findIndex((item) => keyOf(item) === keyOf(name)) !== index))];
    return {
      name: titleFromRaw(raw, fallbackName),
      shared: [...new Set([...parseShared(raw), ...repeated])],
      options,
    };
  };

  const loadEntries = async () => {
    const entries = [];
    for (const file of app.vault.getMarkdownFiles()) {
      if (!isPromptPath(file.path) || file.basename.toLowerCase() === "readme") continue;
      const raw = await app.vault.read(file);
      const type = frontmatter(raw, "tipo").toLowerCase() === "grupo" ? "group" : "prompt";
      if (type === "prompt" && !/##\s+Prompt\b/i.test(raw) && frontmatter(raw, "tipo").toLowerCase() !== "prompt") continue;
      entries.push({
        file,
        path: file.path,
        raw,
        type,
        category: frontmatter(raw, "categoria") || fileCategory(file),
        name: titleFromRaw(raw, file.basename),
        body: type === "prompt" ? promptBody(raw) : "",
        group: type === "group" ? parseGroup(raw, file.basename) : null,
      });
    }
    return entries.sort((a, b) => a.name.localeCompare(b.name, "es"));
  };

  const ensureFolder = async (folder) => {
    const parts = folder.split("/");
    let current = "";
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      if (!app.vault.getAbstractFileByPath(current)) await app.vault.createFolder(current);
    }
  };

  const timestamp = () => new Date().toISOString().replace(/[:.]/g, "-").replace("T", " ").replace("Z", "");
  const deleteCode = (entry) => {
    let hash = 0;
    for (const character of entry.path) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
    return String(hash % 1000000).padStart(6, "0");
  };
  const askDeleteConfirmation = (record, code) => new Promise((resolve) => {
    const layer = el("div", "", "crrb-prompt-dialog-layer");
    const dialog = el("div", "", "crrb-prompt-dialog");
    const input = el("input"); input.type = "text"; input.inputMode = "numeric"; input.maxLength = 6; input.autocomplete = "off"; input.spellcheck = false; input.placeholder = "Escribe manualmente el código de 6 dígitos"; input.style.width = "100%";
    input.addEventListener("paste", (event) => event.preventDefault());
    input.addEventListener("drop", (event) => event.preventDefault());
    input.addEventListener("dragover", (event) => event.preventDefault());
    input.addEventListener("beforeinput", (event) => {
      if (event.inputType === "insertFromPaste" || event.inputType === "insertFromDrop") event.preventDefault();
    });
    input.addEventListener("contextmenu", (event) => event.preventDefault());
    input.addEventListener("keydown", (event) => {
      const editingKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Home", "End", "Tab"];
      if (!editingKeys.includes(event.key) && !/^[0-9]$/.test(event.key)) event.preventDefault();
    });
    const actions = el("div", "", "crrb-prompt-actions");
    const remove = button("Confirmar eliminación", "crrb-danger"); const cancel = button("Cancelar", "crrb-quiet");
    dialog.append(el("h3", "Eliminar prompt"), el("p", `Para mover “${record.name}” al respaldo, escribe este código: ${code}`), input, el("p", "El archivo se conservará en una carpeta de respaldo recuperable.", "crrb-prompt-muted"), actions);
    actions.append(remove, cancel); layer.appendChild(dialog); overlay.appendChild(layer); input.focus();
    const finish = (value) => { layer.remove(); resolve(value); };
    remove.onclick = () => finish(input.value.trim() === code);
    cancel.onclick = () => finish(false);
  });
  const showPromptModal = (title, text) => {
    const layer = el("div", "", "crrb-prompt-dialog-layer");
    const dialog = el("div", "", "crrb-prompt-dialog");
    const area = el("textarea", text, "crrb-prompt-preview"); area.readOnly = true; area.rows = 22;
    const actions = el("div", "", "crrb-prompt-actions"); const copy = button("Copiar prompt", "crrb-primary"); const close = button("Cerrar", "crrb-quiet");
    dialog.append(el("h3", title), area, actions); actions.append(copy, close); layer.appendChild(dialog); overlay.appendChild(layer);
    copy.onclick = async () => { try { await copyText(text); notice("Prompt copiado al portapapeles."); } catch (error) { notice(error.message); } };
    close.onclick = () => layer.remove();
    area.focus();
  };
  const deleteRecord = async (record) => {
    const code = deleteCode(record);
    const confirmed = await askDeleteConfirmation(record, code);
    if (!confirmed) { notice("Código incorrecto o eliminación cancelada. No se eliminó nada."); return; }
    try {
      const archive = `99_Archivo/Prompts-eliminados/${timestamp()}`;
      await ensureFolder(archive);
      await app.fileManager.renameFile(record.file, `${archive}/${record.file.name}`);
      selected = null;
      entries = await loadEntries();
      detail.replaceChildren(el("p", "Selecciona un prompt para ver sus detalles.", "crrb-prompt-empty"));
      renderLibrary();
      notice("Prompt movido al respaldo. Puedes recuperarlo desde 99_Archivo/Prompts-eliminados.");
    } catch (error) { notice(`No se pudo eliminar: ${error.message}`); }
  };
  const copyText = async (value) => {
    if (!globalThis.navigator?.clipboard?.writeText) throw new Error("El portapapeles no está disponible en Obsidian.");
    await globalThis.navigator.clipboard.writeText(value);
  };

  const style = document.createElement("style");
  style.textContent = `
    .crrb-prompt-overlay, .crrb-prompt-overlay * { box-sizing: border-box; }
    .crrb-prompt-overlay { font-family: Arial, Verdana, sans-serif; letter-spacing: .01em; }
    .crrb-prompt-panel { width: min(1500px, 98vw); height: 96vh; max-height: 96vh; overflow: auto; background: #f7f2e8; color: #263238; border: 2px solid #b9c9c1; border-radius: 20px; padding: 28px; box-shadow: 0 20px 70px #16202a66; }
    .crrb-prompt-panel h2 { margin: 0 0 8px; font-size: 1.65rem; color: #23433d; }
    .crrb-prompt-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; position: sticky; top: -28px; z-index: 3; padding: 2px 0 12px; background: #f7f2e8; }
    .crrb-prompt-heading button { flex: 0 0 auto; min-height: 40px; padding: 8px 13px; }
    .crrb-prompt-panel h3 { margin: 22px 0 10px; color: #31574f; font-size: 1.2rem; }
    .crrb-prompt-muted { color: #52645f; margin-top: 0; line-height: 1.55; }
    .crrb-prompt-toolbar, .crrb-prompt-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .crrb-prompt-toolbar { padding: 14px; background: #e6eee9; border-radius: 14px; }
    .crrb-prompt-overlay select, .crrb-prompt-overlay input, .crrb-prompt-overlay textarea { font: inherit; border: 1px solid #9db3aa; border-radius: 9px; background: #fffdf8; color: #263238; padding: 10px 12px; }
    .crrb-prompt-overlay input, .crrb-prompt-overlay select { min-height: 44px; }
    .crrb-prompt-overlay input:focus, .crrb-prompt-overlay select:focus, .crrb-prompt-overlay textarea:focus, .crrb-prompt-overlay button:focus { outline: 3px solid #d39a55; outline-offset: 2px; }
    .crrb-prompt-overlay textarea { width: 100%; line-height: 1.55; resize: vertical; }
    .crrb-prompt-toolbar select { min-width: 170px; }
    .crrb-prompt-search { flex: 1 1 230px; }
    .crrb-prompt-overlay button { font: inherit; font-weight: 600; color: #23433d; background: #d5e5de; border: 1px solid #9db9ad; border-radius: 10px; padding: 10px 15px; min-height: 44px; cursor: pointer; }
    .crrb-prompt-overlay button:hover { background: #c1d9cf; }
    .crrb-prompt-overlay button.crrb-primary { background: #547d70; color: #fffdf8; border-color: #466b60; }
    .crrb-prompt-overlay button.crrb-primary:hover { background: #41675c; }
    .crrb-prompt-overlay button.crrb-quiet { background: #f7f2e8; }
    .crrb-prompt-overlay button.crrb-danger { background: #f3d6cf; color: #7b3027; border-color: #c98f83; }
    .crrb-prompt-overlay button.crrb-danger:hover { background: #e9bdb3; }
    .crrb-prompt-list { display: flex; flex-direction: column; gap: 10px; margin-top: 18px; }
    .crrb-prompt-card { width: 100%; text-align: left; min-height: 86px; height: auto; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 7px; padding: 14px 18px !important; background: #fffdf8 !important; border-color: #b6c8bf !important; line-height: 1.35; }
    .crrb-prompt-card strong { font-size: 1.08rem; }
    .crrb-prompt-card small { color: #52645f; font-weight: normal; line-height: 1.35; overflow-wrap: anywhere; }
    .crrb-prompt-detail { margin-top: 22px; padding: 20px; border: 1px solid #b8c9c1; border-radius: 16px; background: #edf3ee; }
    .crrb-prompt-field { margin: 14px 0; }
    .crrb-prompt-field label { display: block; font-weight: 700; margin-bottom: 6px; }
    .crrb-prompt-preview { min-height: 180px; background: #fffdf8 !important; }
    .crrb-prompt-option-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
    .crrb-prompt-option { width: 100%; height: auto; min-height: 90px; text-align: left; white-space: normal !important; overflow-wrap: anywhere; word-break: normal; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 7px; padding: 14px !important; background: #fffdf8 !important; line-height: 1.35; }
    .crrb-prompt-option.is-selected { background: #b9d6c9 !important; border: 3px solid #547d70 !important; }
    .crrb-prompt-option span { display: block; max-width: 100%; font-size: 1.08rem; white-space: normal !important; overflow-wrap: anywhere; line-height: 1.3; }
    .crrb-prompt-option small { display: block; max-width: 100%; white-space: normal !important; overflow-wrap: anywhere; line-height: 1.3; }
    .crrb-prompt-output { margin-top: 14px; padding: 14px; background: #fffdf8; border: 1px solid #c4d2cb; border-radius: 12px; }
    .crrb-prompt-output-header { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
    .crrb-prompt-output-header button { min-height: 36px; padding: 7px 11px; }
    .crrb-prompt-dialog-layer { position: fixed; inset: 0; z-index: 2; display: flex; align-items: center; justify-content: center; padding: 18px; background: #26323866; }
    .crrb-prompt-dialog { width: min(1280px, 96vw); max-height: 94vh; overflow: auto; background: #f7f2e8; border: 2px solid #b9c9c1; border-radius: 18px; padding: 28px; box-shadow: 0 18px 60px #16202a66; }
    .crrb-prompt-dialog h3 { margin-top: 0; }
    .crrb-prompt-type { display: flex; gap: 12px; margin: 12px 0 18px; }
    .crrb-prompt-type button { flex: 1; font-size: 1.1rem; min-height: 54px; }
    .crrb-prompt-type button.is-active { background: #547d70; color: white; }
    .crrb-prompt-editor-row { display: grid; grid-template-columns: minmax(150px, 1fr) auto; gap: 10px; align-items: end; }
    .crrb-prompt-editor-option { padding: 14px; margin: 12px 0; border: 1px solid #bdcec5; border-radius: 12px; background: #edf3ee; }
    .crrb-prompt-editor-option .remove { float: right; min-height: 34px; padding: 6px 10px; }
    .crrb-prompt-chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 8px; min-height: 28px; }
    .crrb-prompt-chip { display: inline-block; padding: 5px 9px; border-radius: 999px; background: #d8e8df; color: #31574f; font-size: .92rem; }
    .crrb-prompt-check-card { display: flex; gap: 9px; align-items: flex-start; padding: 11px; margin: 7px 0; border: 1px solid #c1d0c8; border-radius: 10px; background: #fffdf8; }
    .crrb-prompt-check-card input { min-width: 20px; min-height: 20px; margin-top: 2px; }
    .crrb-prompt-empty { padding: 18px; color: #52645f; background: #edf3ee; border-radius: 12px; }
    @media (max-width: 650px) { .crrb-prompt-panel { padding: 18px; } .crrb-prompt-editor-row { grid-template-columns: 1fr; } }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement("div");
  overlay.className = "crrb-prompt-overlay";
  Object.assign(overlay.style, { position: "fixed", inset: "0", zIndex: "10000", background: "#26323888", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" });
  const panel = document.createElement("div");
  panel.className = "crrb-prompt-panel";
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  const el = (tag, text = "", className = "") => {
    const node = document.createElement(tag);
    if (text !== "") node.textContent = String(text);
    if (className) node.className = className;
    return node;
  };
  const button = (text, className = "") => { const node = el("button", text, className); node.type = "button"; return node; };
  const field = (parent, labelText, value = "", rows = 3) => {
    const wrap = el("div", "", "crrb-prompt-field");
    const label = el("label", labelText);
    const input = el("textarea");
    input.rows = rows;
    input.value = value;
    input.setAttribute("aria-label", labelText);
    wrap.append(label, input);
    parent.appendChild(wrap);
    return input;
  };
  const compactField = (parent, labelText, value = "") => {
    const wrap = el("div", "", "crrb-prompt-field crrb-prompt-compact-field");
    const label = el("label", labelText); const input = el("input");
    input.value = value; input.setAttribute("aria-label", labelText); wrap.append(label, input); parent.appendChild(wrap); return input;
  };
  const addChips = (parent, source) => {
    const box = el("div", "", "crrb-prompt-chips");
    const found = placeholderInfo(source);
    if (found.length) found.forEach((item) => box.appendChild(el("span", `{{${item.name}}}`, "crrb-prompt-chip")));
    else box.appendChild(el("span", "No se detectaron placeholders todavía."));
    parent.appendChild(box);
  };

  let entries = await loadEntries();
  let selected = null;
  const values = {};
  const groupState = { selected: new Set(), sharedValues: {}, extraValues: {}, reuseShared: true };

  const categories = () => [...new Set(entries.map((entry) => entry.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  const showSimpleDialog = (title, labelText, initial = "", multiline = false) => new Promise((resolve) => {
    const layer = el("div", "", "crrb-prompt-dialog-layer");
    const dialog = el("div", "", "crrb-prompt-dialog");
    const body = el("div");
    const input = el(multiline ? "textarea" : "input");
    input.value = initial;
    input.setAttribute("aria-label", labelText);
    if (multiline) input.rows = 6;
    const actions = el("div", "", "crrb-prompt-actions");
    const ok = button("Aceptar", "crrb-primary");
    const cancel = button("Cancelar", "crrb-quiet");
    body.append(el("label", labelText), input);
    actions.append(ok, cancel);
    dialog.append(el("h3", title), body, actions);
    layer.appendChild(dialog);
    overlay.appendChild(layer);
    input.focus();
    ok.onclick = () => { layer.remove(); resolve(input.value.trim()); };
    cancel.onclick = () => { layer.remove(); resolve(null); };
  });

  const createCategory = async (initial = "") => {
    const raw = await showSimpleDialog("Nueva categoría", "Nombre de la categoría", initial);
    if (!raw) return null;
    const category = slug(raw, "");
    if (!category) { notice("Escribe un nombre válido para la categoría."); return null; }
    const folder = `${ROOT}/${category}`;
    if (app.vault.getAbstractFileByPath(folder)) { notice(`La categoría ya existe: ${category}`); return category; }
    await ensureFolder(folder);
    entries = await loadEntries();
    notice(`Categoría creada: ${category}`);
    return category;
  };

  const saveIndividual = async ({ file, raw, name, category, instructions }) => {
    const folder = `${ROOT}/${category}`;
    await ensureFolder(folder);
    const newPath = `${folder}/${safeSegment(name)}.md`;
    if (!file || file.path !== newPath) {
      if (app.vault.getAbstractFileByPath(newPath)) throw new Error(`Ya existe un elemento en ${newPath}.`);
    }
    let fm = raw?.match(/^---\s*\n[\s\S]*?\n---\s*\n?/)?.[0] || "---\ntipo: prompt\ntags:\n  - prompt\n---\n";
    if (!/^tipo\s*:/im.test(fm)) fm = fm.replace(/^---\n/, "---\ntipo: prompt\n");
    if (/^tipo\s*:/im.test(fm)) fm = fm.replace(/^tipo\s*:.+$/im, "tipo: prompt");
    if (/^categoria\s*:/im.test(fm)) fm = fm.replace(/^categoria\s*:.+$/im, `categoria: ${category}`);
    else fm = fm.replace(/^---\n/, `---\ncategoria: ${category}\n`);
    const content = `${fm}\n# ${name.trim()}\n\n## Prompt\n${instructions.trim()}\n`;
    let savedFile;
    if (file && file.path !== newPath) {
      await app.vault.modify(file, content);
      await app.vault.rename(file, newPath);
      savedFile = app.vault.getAbstractFileByPath(newPath);
    } else if (file) {
      await app.vault.modify(file, content);
      savedFile = file;
    } else savedFile = await app.vault.create(newPath, content);
    return savedFile;
  };

  const saveGroup = async ({ file, raw, name, category, shared, options }) => {
    const folder = `${ROOT}/${category}`;
    await ensureFolder(folder);
    const newPath = `${folder}/${safeSegment(name)}.md`;
    if (!file || file.path !== newPath) {
      if (app.vault.getAbstractFileByPath(newPath)) throw new Error(`Ya existe un elemento en ${newPath}.`);
    }
    let header = raw?.match(/^---\s*\n[\s\S]*?\n---\s*\n?/)?.[0] || "---\ntipo: grupo\ntags:\n  - prompt\n  - grupo\n---\n";
    if (/^tipo\s*:/im.test(header)) header = header.replace(/^tipo\s*:.+$/im, "tipo: grupo");
    else header = header.replace(/^---\n/, "---\ntipo: grupo\n");
    if (/^categoria\s*:/im.test(header)) header = header.replace(/^categoria\s*:.+$/im, `categoria: ${category}`);
    else header = header.replace(/^---\n/, `---\ncategoria: ${category}\n`);
    const sharedBlock = shared.length ? `\n## Placeholders compartidos\n\n${shared.map((item) => `- \`${item}\``).join("\n")}\n` : "";
    const optionsBlock = options.map((option) => option.refPath
      ? `\n### ${option.name}\n<!-- prompt-ref: ${option.refPath} -->\n`
      : `\n### ${option.name}\n<!-- prompt-option: inline -->\n${option.instructions.trim()}\n`).join("");
    const content = `${header}\n# ${name.trim()}\n${sharedBlock}\n## Opciones\n${optionsBlock}`;
    let savedFile;
    if (file && file.path !== newPath) {
      await app.vault.modify(file, content);
      await app.vault.rename(file, newPath);
      savedFile = app.vault.getAbstractFileByPath(newPath);
    } else if (file) {
      await app.vault.modify(file, content);
      savedFile = file;
    } else savedFile = await app.vault.create(newPath, content);
    return savedFile;
  };

  const chooseElementType = () => new Promise((resolve) => {
    const layer = el("div", "", "crrb-prompt-dialog-layer");
    const dialog = el("div", "", "crrb-prompt-dialog");
    const choices = el("div", "", "crrb-prompt-type");
    const individual = button("Prompt individual", "crrb-primary");
    const group = button("Grupo de prompts", "crrb-primary");
    const cancel = button("Cancelar", "crrb-quiet");
    dialog.append(el("h3", "¿Qué deseas crear?"), el("p", "Elige el tipo para mostrarte solamente los campos que necesitas.", "crrb-prompt-muted"), choices, cancel);
    choices.append(individual, group); layer.appendChild(dialog); overlay.appendChild(layer);
    const finish = (value) => { layer.remove(); resolve(value); };
    individual.onclick = () => finish("prompt"); group.onclick = () => finish("group"); cancel.onclick = () => finish(null);
  });

  const openEditor = async (record = null) => {
    let creationType = record?.type || null;
    if (!record) { creationType = await chooseElementType(); if (!creationType) return; }
    const state = {
      type: creationType || "prompt",
      name: record?.name || "",
      category: record?.category || categories()[0] || "general",
      instructions: record?.body || "",
      reused: new Set(record?.type === "group" ? record.group.options.filter((item) => item.refPath).map((item) => item.refPath) : []),
      options: record?.type === "group" ? record.group.options.filter((item) => !item.refPath).map((item) => ({ name: item.name, instructions: item.instructions })) : [],
      shared: new Set(record?.type === "group" ? record.group.shared.map(keyOf) : []),
    };
    const layer = el("div", "", "crrb-prompt-dialog-layer");
    const dialog = el("div", "", "crrb-prompt-dialog");
    const content = el("div");
    const actions = el("div", "", "crrb-prompt-actions");
    const save = button(record ? "Guardar cambios" : "Crear elemento", "crrb-primary");
    const cancel = button("Cancelar", "crrb-quiet");
    actions.append(save, cancel);
    dialog.append(el("h3", record ? "Modificar elemento" : "Crear prompt o grupo"), content, actions);
    layer.appendChild(dialog);
    overlay.appendChild(layer);

    const renderEditor = () => {
      content.replaceChildren();
      const typeTitle = el("label", "Tipo de elemento");
      const typeButtons = el("div", "", "crrb-prompt-type");
      const individual = button("Individual");
      const group = button("Grupo");
      individual.classList.toggle("is-active", state.type === "prompt");
      group.classList.toggle("is-active", state.type === "group");
      typeButtons.append(individual, group);
      if (record) content.append(typeTitle, typeButtons);
      individual.onclick = () => { state.type = "prompt"; renderEditor(); };
      group.onclick = () => { state.type = "group"; renderEditor(); };

      const nameWrap = el("div", "", "crrb-prompt-field");
      nameWrap.appendChild(el("label", state.type === "group" ? "Nombre del grupo" : "Nombre del prompt"));
      const nameInput = el("input"); nameInput.value = state.name; nameInput.style.width = "100%";
      nameInput.oninput = () => { state.name = nameInput.value; };
      nameWrap.appendChild(nameInput);
      content.appendChild(nameWrap);

      const categoryWrap = el("div", "", "crrb-prompt-field");
      categoryWrap.appendChild(el("label", "Categoría"));
      const categoryRow = el("div", "", "crrb-prompt-editor-row");
      const categorySelect = el("select");
      const knownCategories = [...new Set([...categories(), state.category].filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
      knownCategories.forEach((item) => categorySelect.appendChild(el("option", item)));
      categorySelect.value = state.category;
      categorySelect.onchange = () => { state.category = categorySelect.value; renderEditor(); };
      const addCategory = button("＋ Nueva categoría");
      addCategory.onclick = async () => { const category = await createCategory(); if (category) { state.category = category; renderEditor(); } };
      categoryRow.append(categorySelect, addCategory); categoryWrap.appendChild(categoryRow); content.appendChild(categoryWrap);

      if (state.type === "prompt") {
        const instructions = field(content, "Instrucciones", state.instructions, 12);
        instructions.placeholder = "Escribe aquí las instrucciones. Usa {{TEMA}}, {{CONTEXTO}} o {{OBJETIVO}}.";
        const chipBox = el("div");
        instructions.oninput = () => { state.instructions = instructions.value; chipBox.replaceChildren(); addChips(chipBox, state.instructions); };
        content.append(el("label", "Placeholders detectados"), chipBox); addChips(chipBox, state.instructions);
        return;
      }

      content.append(el("h3", "Opciones del grupo"));
      content.append(el("p", "Selecciona opciones existentes o agrega nuevas. El grupo conservará cada relación en este mismo archivo.", "crrb-prompt-muted"));
      const existing = entries.filter((entry) => entry.type === "prompt" && entry.category === state.category && entry.file.path !== record?.file.path);
      if (existing.length) {
        content.appendChild(el("strong", "Opciones existentes reutilizables"));
        existing.forEach((entry) => {
          const row = el("label", "", "crrb-prompt-check-card");
          const check = el("input"); check.type = "checkbox"; check.checked = state.reused.has(entry.path);
          check.onchange = () => { if (check.checked) state.reused.add(entry.path); else state.reused.delete(entry.path); renderEditor(); };
          row.append(check, el("span", `${entry.name} · ${entry.path}`)); content.appendChild(row);
        });
      } else content.appendChild(el("p", "No hay prompts individuales en esta categoría todavía.", "crrb-prompt-muted"));
      const addOption = button("＋ Agregar opción"); addOption.onclick = () => { state.options.push({ name: "", instructions: "" }); renderEditor(); };
      content.appendChild(addOption);
      state.options.forEach((option, index) => {
        const box = el("div", "", "crrb-prompt-editor-option");
        const remove = button("Quitar", "remove crrb-quiet"); remove.onclick = () => { state.options.splice(index, 1); renderEditor(); };
        box.appendChild(remove);
        const optionName = field(box, "Nombre visible de la opción", option.name, 1); optionName.oninput = () => { option.name = optionName.value; renderShared(); };
        const optionInstructions = field(box, "Instrucciones de la opción", option.instructions, 7); optionInstructions.placeholder = "Usa placeholders propios o compartidos, por ejemplo {{TEMA}}."; optionInstructions.oninput = () => { option.instructions = optionInstructions.value; renderShared(); };
        box.appendChild(el("label", "Placeholders detectados")); addChips(box, option.instructions); content.appendChild(box);
      });
      content.append(el("h3", "Placeholders compartidos"), el("p", "Marca los que se completarán una sola vez y se reutilizarán en varias opciones.", "crrb-prompt-muted"));
      const sharedBox = el("div"); content.appendChild(sharedBox);
      const renderShared = () => {
        const sources = [...state.options.map((item) => item.instructions), ...[...state.reused].map((path) => entries.find((entry) => entry.path === path)?.body || "")];
        const all = [...new Map(sources.flatMap((source) => placeholderInfo(source)).map((item) => [item.key, item])).values()];
        const repeated = all.filter((item) => sources.filter((source) => placeholderInfo(source).some((candidate) => candidate.key === item.key)).length > 1);
        const candidates = [...new Map([...repeated, ...all.filter((item) => state.shared.has(item.key))].map((item) => [item.key, item])).values()];
        sharedBox.replaceChildren();
        if (!candidates.length) { sharedBox.appendChild(el("p", "Los placeholders aparecerán aquí al agregar instrucciones.")); return; }
        candidates.forEach((item) => {
          const row = el("label", "", "crrb-prompt-check-card"); const check = el("input"); check.type = "checkbox"; check.checked = state.shared.has(item.key); check.onchange = () => { if (check.checked) state.shared.add(item.key); else state.shared.delete(item.key); renderShared(); };
          row.append(check, el("span", `{{${item.name}}}`)); sharedBox.appendChild(row);
        });
      };
      renderShared();
    };

    cancel.onclick = () => layer.remove();
    save.onclick = async () => {
      const name = state.name.trim();
      const category = slug(state.category, "general");
      if (!name) return notice("Escribe un nombre.");
      try {
        if (state.type === "prompt") {
          if (!state.instructions.trim()) return notice("Escribe las instrucciones del prompt.");
          await saveIndividual({ file: record?.file, raw: record?.raw, name, category, instructions: state.instructions });
        } else {
          const options = state.options.filter((item) => item.name.trim() && item.instructions.trim()).map((item) => ({ name: item.name.trim(), instructions: item.instructions.trim(), refPath: "" }));
          for (const path of state.reused) {
            const entry = entries.find((item) => item.path === path);
            if (entry) options.push({ name: entry.name, instructions: "", refPath: entry.path });
          }
          if (!options.length) return notice("Agrega o reutiliza al menos una opción.");
          const sourceText = options.map((item) => item.instructions || entries.find((entry) => entry.path === item.refPath)?.body || "").join("\n");
          const shared = [...state.shared].map((key) => placeholderInfo(sourceText).find((item) => item.key === key)?.name || key);
          await saveGroup({ file: record?.file, raw: record?.raw, name, category, shared, options });
        }
        layer.remove(); entries = await loadEntries(); selected = entries.find((item) => item.path === (record?.file?.path || `${ROOT}/${category}/${safeSegment(name)}.md`)) || null; renderLibrary(); notice("Guardado correctamente.");
      } catch (error) { notice(`No se pudo guardar: ${error.message}`); }
    };
    renderEditor();
  };

  const openResult = async (title, outputs) => {
    try {
      await ensureFolder(RESULT_ROOT);
      const file = await app.vault.create(`${RESULT_ROOT}/${timestamp()} - ${safeSegment(title)}.md`, `# Resultado: ${title}\n\n${outputs.map((item) => `## ${item.title}\n\n${item.text}`).join("\n\n---\n\n")}\n`);
      await app.workspace.getLeaf(true).openFile(file);
      notice("Resultado abierto en una nota.");
    } catch (error) { notice(`No se pudo abrir el resultado: ${error.message}`); }
  };

  const renderPromptDetail = (record, detail) => {
    detail.replaceChildren();
    const identity = el("div", "", "crrb-prompt-output-header"); identity.append(el("h3", `${record.name} · ${record.category}`)); const deleteButton = button("Eliminar prompt", "crrb-danger"); identity.appendChild(deleteButton); detail.append(identity, el("p", `Archivo: ${record.path} · Código: ${deleteCode(record)}`, "crrb-prompt-muted"));
    deleteButton.onclick = () => deleteRecord(record);
    const detected = placeholderInfo(record.body);
    if (detected.length) {
      detail.appendChild(el("h3", "Completa los placeholders"));
      detected.forEach((item) => { const input = compactField(detail, `{{${item.name}}}`, values[item.key] || ""); input.placeholder = item.fallback || `Escribe el valor de ${item.name}`; input.oninput = () => { values[item.key] = input.value; renderPromptPreview(); }; });
    } else detail.appendChild(el("p", "Este prompt no tiene placeholders detectados.", "crrb-prompt-muted"));
    const preview = el("textarea", "", "crrb-prompt-preview"); preview.readOnly = true; preview.rows = 10; detail.append(el("h3", "Vista previa"), preview);
    const actions = el("div", "", "crrb-prompt-actions"); const copy = button("Copiar resultado", "crrb-primary"); const open = button("Abrir resultado en una nota"); const modify = button("Modificar prompt"); actions.append(copy, open, modify); detail.appendChild(actions);
    const renderPromptPreview = () => { preview.value = replacePlaceholders(record.body, values); };
    renderPromptPreview();
    copy.onclick = async () => { try { await copyText(preview.value); notice("Resultado copiado al portapapeles."); } catch (error) { notice(error.message); } };
    open.onclick = () => openResult(record.name, [{ title: record.name, text: preview.value }]);
    modify.onclick = () => openEditor(record);
  };

  const renderGroupDetail = async (record, detail) => {
    detail.replaceChildren();
    const group = record.group;
    const sourceFor = (option) => option.refPath ? entries.find((entry) => entry.path === option.refPath)?.body || "" : option.instructions;
    const sources = group.options.map(sourceFor);
    const identity = el("div", "", "crrb-prompt-output-header"); identity.append(el("h3", `${group.name} · ${record.category}`)); const deleteButton = button("Eliminar grupo", "crrb-danger"); identity.appendChild(deleteButton); detail.append(identity, el("p", `Entidad relacionada: ${record.path} · Código: ${deleteCode(record)}`, "crrb-prompt-muted"));
    deleteButton.onclick = () => deleteRecord(record);
    if (!group.options.length) { detail.appendChild(el("p", "Este grupo no contiene opciones utilizables.", "crrb-prompt-empty")); return; }
    groupState.selected = new Set(); groupState.sharedValues = {}; groupState.extraValues = {}; groupState.reuseShared = true;
    const shared = [...new Map(group.shared.map((name) => [keyOf(name), name])).values()];
    const sharedBox = el("div"); detail.append(el("h3", "Datos compartidos"), sharedBox);
    shared.forEach((name) => { const input = compactField(sharedBox, `{{${name}}}`, ""); input.placeholder = `Valor compartido para ${name}`; input.oninput = () => { groupState.sharedValues[keyOf(name)] = input.value; renderGroupPreview(); }; });
    const reuseRow = el("label", "", "crrb-prompt-check-card"); const reuse = el("input"); reuse.type = "checkbox"; reuse.checked = true; reuse.onchange = () => { groupState.reuseShared = reuse.checked; renderGroupFields(); renderGroupPreview(); }; reuseRow.append(reuse, el("span", "Reutilizar los valores compartidos en todas las opciones seleccionadas")); sharedBox.appendChild(reuseRow);
    detail.appendChild(el("h3", "Selecciona uno o varios métodos"));
    const optionGrid = el("div", "", "crrb-prompt-option-grid"); detail.appendChild(optionGrid);
    group.options.forEach((option, index) => { const card = button(""); card.className = "crrb-prompt-option"; card.append(el("span", option.name), el("small", "Seleccionar este método")); card.onclick = () => { groupState.selected = new Set([index]); [...optionGrid.children].forEach((item, itemIndex) => item.classList.toggle("is-selected", itemIndex === index)); renderGroupFields(); renderGroupPreview(); }; optionGrid.appendChild(card); });
    const fieldsBox = el("div"); const previewsBox = el("div"); detail.append(fieldsBox, previewsBox);
    const renderGroupFields = () => {
      fieldsBox.replaceChildren();
      const additional = [...new Map([...groupState.selected].flatMap((index) => placeholderInfo(sources[index])).filter((item) => !shared.some((name) => keyOf(name) === item.key)).map((item) => [item.key, item])).values()];
      if (additional.length) { fieldsBox.appendChild(el("h3", "Placeholders adicionales")); additional.forEach((item) => { const input = compactField(fieldsBox, `{{${item.name}}}`, groupState.extraValues[item.key] || ""); input.placeholder = `Solo necesario para los métodos seleccionados: ${item.name}`; input.oninput = () => { groupState.extraValues[item.key] = input.value; renderGroupPreview(); }; }); }
      if (!groupState.reuseShared && groupState.selected.size && shared.length) { fieldsBox.appendChild(el("h3", "Datos compartidos por método")); [...groupState.selected].forEach((index) => shared.forEach((name) => { const key = `${index}:${keyOf(name)}`; const input = compactField(fieldsBox, `${group.options[index].name} · {{${name}}}`, groupState.extraValues[key] || ""); input.oninput = () => { groupState.extraValues[key] = input.value; renderGroupPreview(); }; })); }
    };
    const renderGroupPreview = () => {
      previewsBox.replaceChildren();
      if (!groupState.selected.size) { previewsBox.appendChild(el("p", "Selecciona al menos un método para ver su vista previa.", "crrb-prompt-empty")); return; }
      const outputs = [...groupState.selected].map((index) => { const local = { ...groupState.extraValues }; shared.forEach((name) => { const key = keyOf(name); local[key] = groupState.reuseShared ? groupState.sharedValues[key] || "" : groupState.extraValues[`${index}:${key}`] || ""; }); return { title: group.options[index].name, text: replacePlaceholders(sources[index], local) }; });
      outputs.forEach((output) => { const box = el("div", "", "crrb-prompt-output"); const header = el("div", "", "crrb-prompt-output-header"); header.appendChild(el("strong", output.title)); const view = button("Ver prompt completo", "crrb-primary"); view.onclick = () => showPromptModal(output.title, output.text); header.appendChild(view); const area = el("textarea", "", "crrb-prompt-preview"); area.readOnly = true; area.rows = 5; area.value = output.text; box.append(header, area); previewsBox.appendChild(box); });
      const actions = el("div", "", "crrb-prompt-actions"); const copyAll = button("Copiar todos", "crrb-primary"); const open = button("Abrir todos en una nota"); const modify = button("Modificar grupo"); actions.append(copyAll, open, modify); previewsBox.appendChild(actions);
      copyAll.onclick = async () => { try { await copyText(outputs.map((item) => `${item.title}\n\n${item.text}`).join("\n\n---\n\n")); notice("Todos los resultados fueron copiados."); } catch (error) { notice(error.message); } }; open.onclick = () => openResult(group.name, outputs); modify.onclick = () => openEditor(record);
    };
    renderGroupFields(); renderGroupPreview();
  };

  const list = el("div", "", "crrb-prompt-list");
  const detail = el("div", "", "crrb-prompt-detail");
  const category = el("select");
  const type = el("select");
  const search = el("input", "", "crrb-prompt-search"); search.placeholder = "Buscar por nombre o archivo...";
  const renderCategoryOptions = () => { const old = category.value; const all = el("option", "Todas las categorías"); all.value = ""; category.replaceChildren(all); categories().forEach((item) => { const option = el("option", item); option.value = item; category.appendChild(option); }); category.value = categories().includes(old) ? old : ""; };
  const close = button("Cerrar", "crrb-quiet"); close.style.marginTop = "18px"; close.onclick = () => { overlay.remove(); style.remove(); };
  const refreshLibrary = async () => { entries = await loadEntries(); if (selected && !entries.some((entry) => entry.path === selected.path)) selected = null; renderLibrary(); notice("Biblioteca actualizada."); };
  const renderLibrary = () => {
    panel.replaceChildren();
    const heading = el("div", "", "crrb-prompt-heading"); heading.append(el("h2", "Biblioteca visual de prompts")); const closeTop = button("× Cerrar", "crrb-quiet"); closeTop.onclick = close.onclick; heading.appendChild(closeTop); panel.append(heading, el("p", "Selecciona un prompt individual o un grupo, completa sus datos y revisa la vista previa antes de copiar.", "crrb-prompt-muted"));
    const toolbar = el("div", "", "crrb-prompt-toolbar");
    renderCategoryOptions(); const oldType = type.value; const allTypes = el("option", "Todos los tipos"); allTypes.value = ""; const individualType = el("option", "Individuales"); individualType.value = "Individuales"; const groupType = el("option", "Grupos"); groupType.value = "Grupos"; type.replaceChildren(allTypes, individualType, groupType); type.value = ["", "Individuales", "Grupos"].includes(oldType) ? oldType : "";
    const addCategory = button("＋ Nueva categoría"); const create = button("＋ Crear prompt o grupo", "crrb-primary"); const refresh = button("↻ Actualizar");
    toolbar.append(el("label", "Categoría"), category, el("label", "Tipo"), type, search, refresh, addCategory, create); panel.appendChild(toolbar);
    const filtered = entries.filter((entry) => (!category.value || entry.category === category.value) && (!type.value || (type.value === "Individuales" ? entry.type === "prompt" : entry.type === "group")) && (!search.value || `${entry.name} ${entry.path}`.toLowerCase().includes(search.value.toLowerCase())));
    if (!filtered.length) list.replaceChildren(el("p", "No hay elementos que coincidan con el filtro.", "crrb-prompt-empty"));
    else { list.replaceChildren(); filtered.forEach((entry) => { const card = button(""); card.className = "crrb-prompt-card"; const title = el("div", "", "crrb-prompt-output-header"); title.append(el("strong", entry.name)); const codeButton = button(`Código ${deleteCode(entry)}`); codeButton.onclick = async (event) => { event.stopPropagation(); try { await copyText(deleteCode(entry)); notice(`Código ${deleteCode(entry)} copiado.`); } catch (error) { notice(error.message); } }; title.appendChild(codeButton); card.append(title, el("small", `${entry.type === "group" ? "Grupo" : "Individual"} · ${entry.category}`), el("small", entry.path)); card.onclick = () => { selected = entry; Object.keys(values).forEach((key) => delete values[key]); if (entry.type === "group") renderGroupDetail(entry, detail); else renderPromptDetail(entry, detail); }; list.appendChild(card); }); }
    panel.append(list, detail, close);
    if (selected && entries.some((entry) => entry.path === selected.path)) { const current = entries.find((entry) => entry.path === selected.path); if (current.type === "group") renderGroupDetail(current, detail); else renderPromptDetail(current, detail); }
    category.onchange = renderLibrary; type.onchange = renderLibrary; search.oninput = renderLibrary;
    addCategory.onclick = async () => { await createCategory(); renderLibrary(); };
    refresh.onclick = refreshLibrary;
    create.onclick = () => openEditor();
  };
  renderLibrary();
};
