const { PATHS, tagsFromFile, safeName, wikiLink, ensureFolder, notice } = require("./crrbUtils");
module.exports = async ({ app, quickAddApi, obsidian }) => {
  const rawName = await quickAddApi.inputPrompt("Nombre del prompt"); if (!rawName) return;
  const name = safeName(rawName); const category = safeName(await quickAddApi.inputPrompt("Categoría", "general"));
  const folder = `${PATHS.prompts}/${category}`; await ensureFolder(app, folder); const path = `${folder}/${name}.md`;
  if (app.vault.getAbstractFileByPath(path)) return notice(obsidian, `Ya existe el prompt: ${path}`);
  const parent = app.workspace.getActiveFile(); const tags = [...new Set(["prompt", ...tagsFromFile(app, parent)])]; const base = wikiLink(parent);
  const content = `---\ntags:\n${tags.map((tag) => `  - ${tag}`).join("\n")}\ncategoria: ${category}\nbase: "${base}"\n---\n\n# ${name}\n\nActúa como {{rol|experto}}.\n\n## Contexto\n{{contexto|Describe el contexto}}\n\n## Tarea\n{{tarea|Qué debe resolver}}\n\n## Formato de salida\n{{formato|Lista breve y accionable}}\n`;
  const file = await app.vault.create(path, content); await app.workspace.getLeaf(true).openFile(file); notice(obsidian, `Prompt creado en ${PATHS.prompts}`);
};
