function cleanName(value) {
  return String(value || "").trim().replace(/[\\/:*?"<>|#^[\]]/g, "-").replace(/\s+/g, " ");
}

function tagsFrom(file, app) {
  if (!file) return [];
  const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter || {};
  const raw = frontmatter.tags ?? frontmatter.tag ?? [];
  const values = Array.isArray(raw) ? raw : [raw];
  return values.flatMap((tag) => String(tag).split(/[#,]/))
    .map((tag) => tag.trim().replace(/^#/, ""))
    .filter(Boolean);
}

module.exports = async (params) => {
  const { app, quickAddApi } = params;
  const name = cleanName(await quickAddApi.inputPrompt("Nombre de la tarea"));
  if (!name) return;

  const order = String(await quickAddApi.inputPrompt("Orden", "10") || "10").trim();
  const priorities = ["", "🔺", "⏫", "🔽", "⏬"];
  const priority = await quickAddApi.suggester(
    ["Sin prioridad", "🔺 urgente", "⏫ alta", "🔽 baja", "⏬ muy baja"],
    priorities
  );

  const parent = app.workspace.getActiveFile();
  const inherited = [...new Set(["tarea", ...tagsFrom(parent, app)])];
  const folder = "00_Inbox/Notas de tareas";
  await app.vault.createFolder(folder).catch(() => {});

  let filename = `${name}.md`;
  let path = `${folder}/${filename}`;
  let suffix = 2;
  while (app.vault.getAbstractFileByPath(path)) {
    filename = `${name} ${suffix++}.md`;
    path = `${folder}/${filename}`;
  }

  const yamlTags = inherited.map((tag) => `  - ${tag}`).join("\n");
  const parentLink = parent ? `\nPágina base: [[${parent.path.replace(/\\/g, "/")}]]\n` : "";
  const note = `---\ntipo: tarea\nestado: pendiente\ntags:\n${yamlTags}\n---\n\n# ${name}\n${parentLink}\n## Contexto\n\n## Próximos pasos\n`;
  await app.vault.create(path, note);

  const taskLine = `- [ ] [orden :: ${order}] [[${name}]] ${priority || ""}`.replace(/ +$/, "");
  const taskFile = app.vault.getAbstractFileByPath("00_Inbox/Tareas.md");
  if (!taskFile) throw new Error("No existe 00_Inbox/Tareas.md");
  await app.vault.process(taskFile, (content) => {
    const marker = "## Pendientes";
    const index = content.indexOf(marker);
    if (index === -1) return `${taskLine}\n${content}`;
    const end = content.indexOf("\n", index);
    return `${content.slice(0, end + 1)}${taskLine}\n${content.slice(end + 1)}`;
  });

  await app.workspace.getLeaf(true).openFile(app.vault.getAbstractFileByPath(path));
  new Notice(`Tarea creada: ${path}`);
};
