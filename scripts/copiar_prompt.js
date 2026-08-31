/*
 * QuickAdd User Script: selecciona un prompt, completa sus placeholders y
 * copia el resultado al portapapeles del sistema.
 * Placeholders: {{nombre}} o {{nombre|valor por defecto}}
 */
module.exports = async ({ app, quickAddApi, obsidian }) => {
  const files = app.vault.getMarkdownFiles()
    .filter((file) => file.path.startsWith("07_Recursos/Prompts/") && !file.path.includes("/Historial/") && file.basename !== "README")
    .sort((a, b) => a.path.localeCompare(b.path));

  const NoticeClass = obsidian?.Notice ?? globalThis.Notice;
  if (!files.length) {
    if (NoticeClass) new NoticeClass("No hay prompts registrados.");
    return;
  }

  const selected = await quickAddApi.suggester(
    files.map((file) => file.path.replace("07_Recursos/Prompts/", "")),
    files,
  );
  if (!selected) return;

  let content = await app.vault.read(selected);
  content = content.replace(/^---\n[\s\S]*?\n---\n?/, "").trim();
  const placeholders = [...content.matchAll(/\{\{([^{}|]+?)(?:\|([^{}]*))?\}\}/g)]
    .map((match) => ({ name: match[1].trim(), fallback: match[2]?.trim() ?? "" }))
    .filter((item, index, all) => all.findIndex((candidate) => candidate.name === item.name) === index);

  const values = {};
  for (const placeholder of placeholders) {
    const value = await quickAddApi.inputPrompt(`Valor para ${placeholder.name}`, placeholder.fallback);
    if (value === null || value === undefined) return;
    values[placeholder.name] = value || placeholder.fallback;
  }

  const result = content.replace(/\{\{([^{}|]+?)(?:\|([^{}]*))?\}\}/g, (_match, name, fallback) => (
    values[name.trim()] ?? fallback?.trim() ?? ""
  ));

  if (!globalThis.navigator?.clipboard?.writeText) {
    throw new Error("El portapapeles del sistema no está disponible en este contexto de Obsidian.");
  }
  await navigator.clipboard.writeText(result);

  if (await quickAddApi.yesNoPrompt("Prompt copiado. ¿Guardar una copia completada en Historial?")) {
    const folder = "07_Recursos/Prompts/Historial";
    if (!app.vault.getAbstractFileByPath(folder)) await app.vault.createFolder(folder);
    const stamp = window.moment().format("YYYY-MM-DD HH-mm-ss");
    const safeName = selected.basename.replace(/[\\/:*?"<>|]/g, "-");
    await app.vault.create(`${folder}/${stamp} - ${safeName}.md`, result);
  }

  if (NoticeClass) new NoticeClass(`Prompt copiado: ${selected.basename}`);
};
