const { PATHS, tagsFromFile, safeName, wikiLink, ensureFolder, notice } = require("./crrbUtils");
module.exports = async ({ app, quickAddApi, obsidian }) => {
  const rawName = await quickAddApi.inputPrompt("Nombre del proyecto"); if (!rawName) return;
  const name = safeName(rawName); const area = safeName(await quickAddApi.inputPrompt("Área", "General"));
  const folder = `${PATHS.projects}/${area}/${name}`; await ensureFolder(app, folder); const path = `${folder}/${name}.md`;
  if (app.vault.getAbstractFileByPath(path)) return notice(obsidian, `Ya existe el proyecto: ${path}`);
  const parent = app.workspace.getActiveFile(); const tags = [...new Set(["proyecto", ...tagsFromFile(app, parent)])]; const base = wikiLink(parent);
  const content = `---\ntags:\n${tags.map((tag) => `  - ${tag}`).join("\n")}\nestado: activo\narea: ${area}\nbase: "${base}"\n---\n\n# ${name}\n\n> [!abstract] Página base\n> ${base || "Sin página base"}\n\n## Objetivo\n\n## Siguiente acción\n- [ ] \n\n## Notas\n`;
  const file = await app.vault.create(path, content); await app.workspace.getLeaf(true).openFile(file); notice(obsidian, `Proyecto creado: ${path}`);
};
