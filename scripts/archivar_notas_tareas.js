/* Archiva solo las notas enlazadas desde Tareas.md. Nunca modifica Tareas.md. */
module.exports = async ({ app, obsidian }) => {
  const sourceFolder = "00_Inbox/Notas de tareas";
  const archiveFolder = "99_Archivo/Notas de tareas";
  const tasksPath = "00_Inbox/Tareas.md";
  const manifestPath = `${archiveFolder}/.archivo-notas-tareas.json`;
  const tasksFile = app.vault.getAbstractFileByPath(tasksPath);
  if (!tasksFile) throw new Error(`No existe ${tasksPath}`);

  const content = await app.vault.read(tasksFile);
  const links = [...content.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g)]
    .map((match) => match[1].trim())
    .filter((link, index, all) => all.indexOf(link) === index);
  const files = links.map((link) => app.metadataCache.getFirstLinkpathDest(link, tasksPath))
    .filter((file) => file?.path?.startsWith(`${sourceFolder}/`) && file.extension === "md");
  if (!files.length) {
    const NoticeClass = obsidian?.Notice ?? globalThis.Notice;
    if (NoticeClass) new NoticeClass("No hay notas enlazadas para archivar.");
    return [];
  }

  if (!app.vault.getAbstractFileByPath(archiveFolder)) await app.vault.createFolder(archiveFolder);
  const manifestFile = app.vault.getAbstractFileByPath(manifestPath);
  const manifest = manifestFile ? JSON.parse(await app.vault.read(manifestFile)) : { batches: [] };
  const moved = [];
  const skipped = [];
  for (const file of files) {
    const originalPath = file.path;
    const target = `${archiveFolder}/${file.name}`;
    if (app.vault.getAbstractFileByPath(target)) {
      skipped.push(file.path);
      continue;
    }
    await app.vault.rename(file, target);
    moved.push({ original: originalPath, archived: target });
  }

  const movedNames = new Set(moved.map((item) => item.original.replace(`${sourceFolder}/`, "").replace(/\.md$/, "")));
  const taskEdits = [];
  const updatedContent = content.split("\n").filter((line, index) => {
    const shouldHide = links.some((link) => movedNames.has(link.replace(/\.md$/, "")) && line.includes(`[[${link}`));
    if (!shouldHide) return true;
    taskEdits.push({ original: line, index });
    return false;
  }).join("\n");
  if (taskEdits.length) await app.vault.modify(tasksFile, updatedContent);

  manifest.batches.push({ timestamp: new Date().toISOString(), moved, skipped, taskEdits, reversedAt: null });
  const serialized = JSON.stringify(manifest, null, 2);
  if (manifestFile) await app.vault.modify(manifestFile, serialized);
  else await app.vault.create(manifestPath, serialized);

  const NoticeClass = obsidian?.Notice ?? globalThis.Notice;
  if (NoticeClass) new NoticeClass(`Notas archivadas: ${moved.length}. Omitidas: ${skipped.length}.`);
  return moved;
};
