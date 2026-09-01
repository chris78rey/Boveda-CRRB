function cleanName(value) {
  return String(value || "").trim().replace(/[\\/:*?"<>|#^[\]]/g, "-").replace(/\s+/g, " ");
}

function tagsFrom(file, app) {
  if (!file) return [];
  const fm = app.metadataCache.getFileCache(file)?.frontmatter || {};
  const raw = fm.tags ?? fm.tag ?? [];
  return (Array.isArray(raw) ? raw : [raw]).flatMap((tag) => String(tag).split(/[#,]/))
    .map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean);
}

async function ensureFolder(vault, folder) {
  let current = "";
  for (const part of folder.split("/")) {
    current = current ? `${current}/${part}` : part;
    if (!vault.getAbstractFileByPath(current)) await vault.createFolder(current);
  }
}

module.exports = async ({ app, quickAddApi }) => {
  const name = cleanName(await quickAddApi.inputPrompt("Nombre del prompt"));
  if (!name) return;
  const category = await quickAddApi.suggester(
    ["Trabajo", "Escritura", "Análisis", "Programación", "Estudio", "Personal"],
    ["trabajo", "escritura", "analisis", "programacion", "estudio", "personal"]
  );
  if (!category) return;
  const folder = `08_Dashboards/Prompts/${category}`;
  await ensureFolder(app.vault, folder);
  const parent = app.workspace.getActiveFile();
  const tags = [...new Set(["prompt", category, ...tagsFrom(parent, app)])];
  const tagYaml = tags.map((tag) => `  - ${tag}`).join("\n");
  const base = parent ? `\nPágina base: [[${parent.path.replace(/\\/g, "/")}]]\n` : "";
  const today = window.moment().format("YYYY-MM-DD");
  const note = `---\ntipo: prompt\nestado: borrador\ncategoria: ${category}\nfecha_creacion: ${today}\nultima_prueba: ""\nmodelo: ""\nfavorito: false\ntags:\n${tagYaml}\n---\n\n# ${name}\n${base}\n## Prompt\n\nActúa como [rol].\n\nObjetivo: [qué necesito conseguir].\n\nContexto:\n[Información relevante]\n\nRestricciones:\n- [Regla o límite]\n\nFormato de respuesta:\n[Formato esperado]\n\n## Variables\n- [variable]: [valor]\n\n## Resultado y mejoras\n\n`;
  let path = `${folder}/${name}.md`;
  let suffix = 2;
  while (app.vault.getAbstractFileByPath(path)) path = `${folder}/${name} ${suffix++}.md`;
  await app.vault.create(path, note);
  await app.workspace.getLeaf(true).openFile(app.vault.getAbstractFileByPath(path));
  new Notice(`Prompt creado: ${path}`);
};
