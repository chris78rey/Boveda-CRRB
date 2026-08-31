/* Revierte la última operación de archivado sin sobrescribir notas existentes. */
module.exports = async ({ app, obsidian }) => {
  const manifestPath = "99_Archivo/Notas de tareas/.archivo-notas-tareas.json";
  const manifestFile = app.vault.getAbstractFileByPath(manifestPath);
  if (!manifestFile) throw new Error("No existe un registro de archivado para revertir.");
  const manifest = JSON.parse(await app.vault.read(manifestFile));
  const batch = [...manifest.batches].reverse().find((item) => !item.reversedAt);
  if (!batch) throw new Error("No hay operaciones de archivado pendientes de reversar.");

  const restored = [];
  const skipped = [];
  for (const item of batch.moved) {
    const source = app.vault.getAbstractFileByPath(item.archived);
    if (!source) {
      skipped.push(item.archived);
      continue;
    }
    if (app.vault.getAbstractFileByPath(item.original)) {
      skipped.push(item.original);
      continue;
    }
    await app.vault.rename(source, item.original);
    restored.push(item.original);
  }

  const tasksFile = app.vault.getAbstractFileByPath("00_Inbox/Tareas.md");
  const taskEdits = batch.taskEdits ?? [];
  let taskContent = tasksFile ? await app.vault.read(tasksFile) : "";
  const taskRestoreSkipped = [];
  for (const edit of taskEdits) {
    if (taskContent.includes(edit.original)) continue;
    const lines = taskContent.split("\n");
    lines.splice(Math.min(edit.index ?? lines.length, lines.length), 0, edit.original);
    taskContent = lines.join("\n");
  }
  if (tasksFile && taskContent !== await app.vault.read(tasksFile)) await app.vault.modify(tasksFile, taskContent);
  batch.reversedAt = new Date().toISOString();
  batch.restored = restored;
  batch.reverseSkipped = skipped;
  batch.taskRestoreSkipped = taskRestoreSkipped;
  await app.vault.modify(manifestFile, JSON.stringify(manifest, null, 2));
  const NoticeClass = obsidian?.Notice ?? globalThis.Notice;
  if (NoticeClass) new NoticeClass(`Notas restauradas: ${restored.length}. Omitidas: ${skipped.length}.`);
  return restored;
};
