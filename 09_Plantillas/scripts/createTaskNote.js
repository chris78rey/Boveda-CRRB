const { PATHS, tagsFromFile, safeName, wikiLink, ensureFolder, notice } = require("./crrbUtils");
module.exports = async ({ app, quickAddApi, obsidian }) => {
  const rawName = await quickAddApi.inputPrompt("Nombre de la tarea"); if (!rawName) return;
  const name = safeName(rawName); const order = String(await quickAddApi.inputPrompt("Orden", "10") || "10").trim();
  const priority = await quickAddApi.suggester(["Sin prioridad", "Alta", "Media", "Baja"], ["", "🔺", "🔼", "🔽"]); if (priority === null) return;
  const parent = app.workspace.getActiveFile(); const tags = [...new Set(["tarea", ...tagsFromFile(app, parent)])];
  await ensureFolder(app, PATHS.taskNotes); let path = `${PATHS.taskNotes}/${name}.md`; let suffix = 2;
  while (app.vault.getAbstractFileByPath(path)) path = `${PATHS.taskNotes}/${name} ${suffix++}.md`;
  const base = wikiLink(parent); const note = `---\ntipo: tarea\nestado: pendiente\ntags:\n${tags.map((tag) => `  - ${tag}`).join("\n")}\nbase: "${base}"\n---\n\n# ${name}\n\n> [!abstract] Página base\n> ${base || "Sin página base"}\n\n## Contexto\n\n## Próximos pasos\n`;
  const file = await app.vault.create(path, note); const taskFile = app.vault.getAbstractFileByPath(PATHS.taskIndex);
  if (!taskFile) throw new Error(`No existe ${PATHS.taskIndex}`);
  await app.vault.append(taskFile, `\n- [ ] [orden :: ${order}] [[${file.path}|${name}]] ${priority || ""}`);
  await app.workspace.getLeaf(true).openFile(file); notice(obsidian, `Tarea creada y añadida a ${PATHS.taskIndex}`);
};
