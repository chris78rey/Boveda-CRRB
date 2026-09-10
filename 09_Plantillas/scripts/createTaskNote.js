const PATHS = { taskNotes: "00_Inbox/Notas de tareas", taskIndex: "00_Inbox/Tareas.md" };
function normalizeTags(value) { return (Array.isArray(value) ? value : value == null ? [] : [value]).flatMap((tag) => String(tag).split(",")).map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean); }
function tagsFromFile(app, file) { const cache = file && app.metadataCache.getFileCache(file); return [...new Set([...normalizeTags(cache?.frontmatter?.tags), ...(cache?.tags ?? []).map((item) => String(item.tag).replace(/^#/, ""))])]; }
function safeName(value) { return String(value || "Sin nombre").trim().replace(/[\\/:*?"<>|#]/g, "-").replace(/\s+/g, " "); }
function wikiLink(file) { return file ? `[[${file.path}|${file.basename}]]` : ""; }
async function ensureFolder(app, folder) { let current = ""; for (const part of folder.split("/")) { current = current ? `${current}/${part}` : part; if (!app.vault.getAbstractFileByPath(current)) await app.vault.createFolder(current); } }
function orderOf(line) { const match = line.match(/\[orden\s*::\s*(-?\d+(?:\.\d+)?)\]/i); return match ? Number(match[1]) : Number.NEGATIVE_INFINITY; }
function insertTaskSorted(content, line) {
  const markerIndex = content.indexOf("## Pendientes");
  if (markerIndex === -1) return `${content.trimEnd()}\n${line}\n`;
  const bodyStart = content.indexOf("\n", markerIndex); if (bodyStart === -1) return `${content}\n${line}\n`;
  const before = content.slice(0, bodyStart + 1); const lines = content.slice(bodyStart + 1).split("\n");
  const firstTask = lines.findIndex((item) => /^\s*- \[[ xX]\]/.test(item));
  if (firstTask === -1) return `${before}${lines.join("\n").trimEnd()}\n${line}\n`;
  let end = firstTask; while (end < lines.length && /^\s*- \[[ xX]\]/.test(lines[end])) end++;
  const tasks = lines.slice(firstTask, end); tasks.push(line); tasks.sort((a, b) => orderOf(b) - orderOf(a));
  return before + lines.slice(0, firstTask).join("\n") + (firstTask ? "\n" : "") + tasks.join("\n") + "\n" + lines.slice(end).join("\n");
}
function notice(obsidian, message) { const NoticeClass = obsidian?.Notice ?? globalThis.Notice; if (NoticeClass) new NoticeClass(message); }
module.exports = async ({ app, quickAddApi, obsidian }) => {
  const rawName = await quickAddApi.inputPrompt("Nombre de la tarea"); if (!rawName) return;
  const name = safeName(rawName).toUpperCase(); const order = String(await quickAddApi.inputPrompt("Orden", "10") || "10").trim();
  const priority = await quickAddApi.suggester(["Sin prioridad", "Alta", "Media", "Baja"], ["", "🔺", "🔼", "🔽"]); if (priority === null) return;
  const startDate = String(await quickAddApi.inputPrompt("Fecha de inicio AAAA-MM-DD (opcional)") || "").trim();
  const dueDate = String(await quickAddApi.inputPrompt("Fecha tope AAAA-MM-DD (opcional)") || "").trim();
  const parent = app.workspace.getActiveFile(); const tags = [...new Set(["tarea", ...tagsFromFile(app, parent)])];
  await ensureFolder(app, PATHS.taskNotes); let path = `${PATHS.taskNotes}/${name}.md`; let suffix = 2;
  while (app.vault.getAbstractFileByPath(path)) path = `${PATHS.taskNotes}/${name} ${suffix++}.md`;
  const base = wikiLink(parent); const returnLink = base ? `← Volver a la página base: ${base}` : "← Volver a la página base";
  const note = `---\ntipo: tarea\nestado: pendiente\ntags:\n${tags.map((tag) => `  - ${tag}`).join("\n")}\nbase: "${base}"\n---\n\n# ${name}\n\n${returnLink}\n\n> [!info] Estado\n> 🟡 Pendiente · ${priority || "Sin prioridad"} · Orden ${order}\n\n> [!abstract] Página base\n> ${base || "Sin página base"}\n\n## Próxima acción\n- [ ] \n\n## Contexto\n\n## Notas\n\n## Registro\n`;
  const file = await app.vault.create(path, note); const taskFile = app.vault.getAbstractFileByPath(PATHS.taskIndex);
  if (!taskFile) throw new Error(`No existe ${PATHS.taskIndex}`);
  const dates = [startDate ? `🛫 ${startDate}` : "", dueDate ? `📅 ${dueDate}` : "", `➕ ${window.moment().format("YYYY-MM-DD")}`].filter(Boolean).join(" ");
  await app.vault.process(taskFile, (content) => insertTaskSorted(content, `- [ ] [orden :: ${order}] [[${file.path}|${name}]] ${priority || ""} ${dates}`.trim()));
  await app.workspace.getLeaf(true).openFile(taskFile, { state: { mode: "preview" }, active: true });
  notice(obsidian, `Tarea creada, ordenada y mostrada en modo lectura.`);
};
