const { insertTaskSorted } = require("../09_Plantillas/scripts/taskIndex");

module.exports = async ({ app, quickAddApi }) => {
  const name = String(await quickAddApi.inputPrompt("Nombre de la tarea") || "").trim();
  if (!name) return;
  const priority = await quickAddApi.suggester(
    ["Sin prioridad", "🔺", "⏫", "🔼", "🔽", "⏬"],
    ["", "🔺", "⏫", "🔼", "🔽", "⏬"]
  );
  if (priority === null) return;
  const order = String(await quickAddApi.inputPrompt("Orden numérico", "10") || "10").trim();
  const due = String(await quickAddApi.inputPrompt("Fecha límite AAAA-MM-DD (opcional)") || "").trim();
  const scope = String(await quickAddApi.inputPrompt("Ámbito (opcional)") || "").trim();
  const details = [
    `[[${name}]]`, priority, due ? `📅 ${due}` : "",
    `[orden :: ${order}]`, scope ? `[ambito:: ${scope}]` : "",
    `➕ ${window.moment().format("YYYY-MM-DD")}`
  ].filter(Boolean).join(" ");
  const taskFile = app.vault.getAbstractFileByPath("00_Inbox/Tareas.md");
  if (!taskFile) throw new Error("No existe 00_Inbox/Tareas.md");
  await app.vault.process(taskFile, (content) => insertTaskSorted(content, `- [ ] ${details}`));
  new Notice("Tarea añadida y ordenada por orden descendente.");
};
