module.exports = async ({ app, quickAddApi }) => {
  const taskFile = app.vault.getAbstractFileByPath("00_Inbox/Tareas.md");
  if (!taskFile) throw new Error("No existe 00_Inbox/Tareas.md");
  const content = await app.vault.read(taskFile);
  const lines = content.split("\n").filter((line) => /^\s*- \[[ xX]\]/.test(line));
  if (!lines.length) { new Notice("No hay tareas para gestionar."); return; }
  const selected = await quickAddApi.suggester(lines, lines);
  if (!selected) return;
  const link = selected.match(/\[\[([^\]|#]+)(?:\|[^\]]+)?\]\]/);
  const target = link ? app.metadataCache.getFirstLinkpathDest(link[1], taskFile.path) : null;
  const action = await quickAddApi.suggester(
    ["Abrir nota de tarea", "Abrir página base", "Marcar completada", "Reabrir tarea"],
    ["open", "base", "done", "reopen"]
  );
  if (!action) return;
  if (action === "open" && target) return app.workspace.getLeaf(true).openFile(target);
  if (action === "base" && target) {
    const base = app.metadataCache.getFileCache(target)?.frontmatter?.base;
    const baseLink = typeof base === "string" ? base.match(/\[\[([^\]|]+)/)?.[1] : null;
    const baseFile = baseLink && app.metadataCache.getFirstLinkpathDest(baseLink, target.path);
    if (baseFile) return app.workspace.getLeaf(true).openFile(baseFile);
    new Notice("La nota no tiene una página base válida."); return;
  }
  await app.vault.process(taskFile, (updated) => {
    const replacement = action === "done" ? selected.replace(/- \[ \]/, "- [x]") : selected.replace(/- \[[xX]\]/, "- [ ]");
    return updated.split("\n").map((line) => line === selected ? replacement : line).join("\n");
  });
  new Notice(action === "done" ? "Tarea completada." : "Tarea reabierta.");
};
