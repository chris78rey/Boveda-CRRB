function normalizeTags(value) {
  const values = Array.isArray(value) ? value : [value];
  return values.flatMap((tag) => String(tag || "").split(/[#,]/))
    .map((tag) => tag.trim().replace(/^#/, ""))
    .filter(Boolean);
}

function tagsFrom(file, app) {
  const frontmatter = file ? app.metadataCache.getFileCache(file)?.frontmatter : null;
  return normalizeTags(frontmatter?.tags ?? frontmatter?.tag);
}

function linkFor(file) {
  return file ? `[[${file.path.replace(/\\/g, "/")}]]` : "";
}

module.exports = async (params) => {
  const { app, quickAddApi } = params;
  const source = app.workspace.getActiveFile();
  if (!source) {
    new Notice("Abre primero una nota para procesarla.");
    return;
  }

  const actions = ["Añadir tarea", "Crear nota de seguimiento", "Enlazar página base"];
  const action = await quickAddApi.suggester(actions, actions);
  if (!action) return;

  if (action === "Añadir tarea") {
    const task = String(await quickAddApi.inputPrompt("Tarea relacionada") || "").trim();
    if (!task) return;
    const order = String(await quickAddApi.inputPrompt("Orden", "10") || "10").trim();
    const taskFile = app.vault.getAbstractFileByPath("00_Inbox/Tareas.md");
    if (!taskFile) throw new Error("No existe 00_Inbox/Tareas.md");
    await app.vault.process(taskFile, (content) => {
      const line = `- [ ] [orden :: ${order}] [[${source.basename}]] — ${task}`;
      const marker = "## Pendientes";
      const index = content.indexOf(marker);
      if (index === -1) return `${line}\n${content}`;
      const end = content.indexOf("\n", index);
      return `${content.slice(0, end + 1)}${line}\n${content.slice(end + 1)}`;
    });
    new Notice("Tarea añadida y enlazada a la nota actual.");
    return;
  }

  if (action === "Crear nota de seguimiento") {
    const title = String(await quickAddApi.inputPrompt("Título del seguimiento") || "").trim();
    if (!title) return;
    const folder = "00_Inbox/Seguimientos";
    await app.vault.createFolder(folder).catch(() => {});
    let path = `${folder}/${title}.md`;
    let suffix = 2;
    while (app.vault.getAbstractFileByPath(path)) path = `${folder}/${title} ${suffix++}.md`;
    const tags = [...new Set(["seguimiento", ...tagsFrom(source, app)])];
    const yaml = tags.map((tag) => `  - ${tag}`).join("\n");
    const content = `---\ntipo: seguimiento\nestado: pendiente\ntags:\n${yaml}\n---\n\n# ${title}\n\nPágina base: ${linkFor(source)}\n\n## Notas\n\n`;
    await app.vault.create(path, content);
    await app.workspace.getLeaf(true).openFile(app.vault.getAbstractFileByPath(path));
    new Notice(`Seguimiento creado: ${path}`);
    return;
  }

  if (action === "Enlazar página base") {
    const candidates = app.vault.getMarkdownFiles()
      .filter((file) => file.path !== source.path)
      .sort((a, b) => a.path.localeCompare(b.path));
    const base = await quickAddApi.suggester(
      candidates.map((file) => file.path),
      candidates
    );
    if (!base) return;
    const link = `Página base: ${linkFor(base)}`;
    await app.vault.process(source, (content) => {
      if (/^Página base:\s*\[\[/m.test(content)) return content;
      return `${content.trimEnd()}\n\n${link}\n`;
    });
    new Notice("Enlace a la página base añadido.");
  }
};
