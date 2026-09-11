function orderOf(line) {
  const match = line.match(/\[orden\s*::\s*(-?\d+(?:\.\d+)?)\]/i);
  return match ? Number(match[1]) : Number.NEGATIVE_INFINITY;
}

function insertTaskSorted(content, line) {
  const marker = "## Pendientes";
  const markerIndex = content.indexOf(marker);
  if (markerIndex === -1) return `${content.trimEnd()}\n${line}\n`;
  const bodyStart = content.indexOf("\n", markerIndex);
  if (bodyStart === -1) return `${content}\n${line}\n`;
  const before = content.slice(0, bodyStart + 1);
  const rest = content.slice(bodyStart + 1);
  const lines = rest.split("\n");
  const firstTask = lines.findIndex((item) => /^\s*- \[[ xX]\]/.test(item));
  if (firstTask === -1) return `${before}${rest.trimEnd()}\n${line}\n`;
  let end = firstTask;
  while (end < lines.length && /^\s*- \[[ xX]\]/.test(lines[end])) end += 1;
  const tasks = lines.slice(firstTask, end);
  const tail = lines.slice(0, firstTask).concat(lines.slice(end));
  tasks.push(line);
  tasks.sort((a, b) => orderOf(b) - orderOf(a));
  return before + tail.slice(0, firstTask).join("\n") + (firstTask ? "\n" : "") + tasks.join("\n") + "\n" + tail.slice(firstTask).join("\n");
}

module.exports = async ({ app, quickAddApi }) => {
  const name = String(await quickAddApi.inputPrompt("Nombre de la tarea") || "").trim().toUpperCase();
  if (!name) return;
  const priority = await quickAddApi.suggester(
    ["Sin prioridad", "🔺", "⏫", "🔼", "🔽", "⏬"],
    ["", "🔺", "⏫", "🔼", "🔽", "⏬"]
  );
  if (priority === null) return;
  const order = String(await quickAddApi.inputPrompt("Orden numérico", "10") || "10").trim();
  const start = String(await quickAddApi.inputPrompt("Fecha de inicio AAAA-MM-DD (opcional)") || "").trim();
  const due = String(await quickAddApi.inputPrompt("Fecha tope AAAA-MM-DD (opcional)") || "").trim();
  const details = [
    `[[${name}]]`, priority, due ? `📅 ${due}` : "",
    start ? `🛫 ${start}` : "", `➕ ${window.moment().format("YYYY-MM-DD")}`
  ].filter(Boolean).join(" ");
  const taskFile = app.vault.getAbstractFileByPath("00_Inbox/Tareas.md");
  if (!taskFile) throw new Error("No existe 00_Inbox/Tareas.md");
  await app.vault.process(taskFile, (content) => insertTaskSorted(content, `- [ ] ${details}`));
  new Notice("Tarea añadida y ordenada por orden descendente.");
};
