/* UserScript autónomo: no usa require("obsidian") ni prompt()/confirm(). */
module.exports = async ({ app, quickAddApi }) => {
  const notify = (message) => {
    if (typeof globalThis.Notice === "function") new globalThis.Notice(message);
  };
  const raw = await quickAddApi.inputPrompt("Nombre de la nueva categoría");
  if (raw === null || raw === undefined) return;
  const name = String(raw)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9áéíóúñü]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  if (!name) return notify("Escribe un nombre válido.");
  const folder = `07_Recursos/Prompts/${name}`;
  if (app.vault.getAbstractFileByPath(folder)) return notify(`La categoría ya existe: ${name}`);
  await app.vault.createFolder(folder);
  notify(`Categoría creada: ${name}`);
};
