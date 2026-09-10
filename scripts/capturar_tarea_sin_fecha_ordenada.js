function orderOf(line) {
  const match = line.match(/\[orden\s*::\s*(-?\d+(?:\.\d+)?)\]/i);
  return match ? Number(match[1]) : Number.NEGATIVE_INFINITY;
}

function insertTaskSorted(content, line) {
  const markerIndex = content.indexOf("## Pendientes");
  if (markerIndex === -1) return `${content.trimEnd()}\n${line}\n`;
  const bodyStart = content.indexOf("\n", markerIndex);
  if (bodyStart === -1) return `${content}\n${line}\n`;
  const before = content.slice(0, bodyStart + 1);
  const lines = content.slice(bodyStart + 1).split("\n");
  const firstTask = lines.findIndex((item) => /^\s*- \[[ xX]\]/.test(item));
  if (firstTask === -1) return `${before}${lines.join("\n").trimEnd()}\n${line}\n`;
  let end = firstTask;
  while (end < lines.length && /^\s*- \[[ xX]\]/.test(lines[end])) end += 1;
  const tasks = lines.slice(firstTask, end);
  const leading = lines.slice(0, firstTask);
  const trailing = lines.slice(end);
  tasks.push(line);
  tasks.sort((a, b) => orderOf(b) - orderOf(a));
  return before + leading.join("\n") + (leading.length ? "\n" : "") + tasks.join("\n") + "\n" + trailing.join("\n");
}

module.exports = async ({ app, quickAddApi }) => {
  const name = String(await quickAddApi.inputPrompt("Nombre de la tarea") || "").trim();
  if (!name) return;
  const priority = await quickAddApi.suggester(
    ["Sin prioridad", "🔺", "⏫", "🔼", "🔽", "⏬"],
    ["", "🔺", "⏫", "🔼", "🔽", "⏬"]
  );
  if (priority === null) return;
  const order = String(await quickAddApi.inputPrompt("Orden numérico", "10") || "10").trim();
  const details = [
    `[[${name}]]`, priority, `[orden :: ${order}]`
  ].filter(Boolean).join(" ");
  const taskFile = app.vault.getAbstractFileByPath("00_Inbox/Tareas.md");
  if (!taskFile) throw new Error("No existe 00_Inbox/Tareas.md");
  await app.vault.process(taskFile, (content) => insertTaskSorted(content, `- [ ] ${details}`));
  new Notice("Tarea sin fecha añadida y ordenada por orden descendente.");
};
