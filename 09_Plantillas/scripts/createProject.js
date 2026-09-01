function cleanName(value) {
  return String(value || "").trim().replace(/[\\/:*?"<>|#^[\]]/g, "-").replace(/\s+/g, " ");
}

function yamlValue(value) {
  return String(value || "").replace(/"/g, '\\"');
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

async function ensureFolder(vault, folder) {
  const parts = folder.split("/");
  let current = "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!vault.getAbstractFileByPath(current)) await vault.createFolder(current);
  }
}

module.exports = async ({ app, quickAddApi }) => {
  const name = cleanName(await quickAddApi.inputPrompt("Nombre del proyecto"));
  if (!name) return;

  const ambito = await quickAddApi.suggester(
    ["Oficina", "Externo", "Docencia", "Personal"],
    ["oficina", "externo", "docencia", "personal"]
  );
  if (!ambito) return;

  const area = String(await quickAddApi.inputPrompt("Área relacionada", "") || "").trim();
  const limite = String(await quickAddApi.inputPrompt("Fecha límite (AAAA-MM-DD)", "") || "").trim();
  const roots = {
    oficina: "02_Proyectos/01_Oficina",
    externo: "02_Proyectos/02_Externos",
    docencia: "02_Proyectos/03_Docencia",
    personal: "02_Proyectos/04_Personales"
  };
  const folder = `${roots[ambito]}/${name}`;
  await ensureFolder(app.vault, folder);

  const parent = app.workspace.getActiveFile();
  const tags = [...new Set(["proyecto", ambito, ...tagsFrom(parent, app)])];
  const tagYaml = tags.map((tag) => `  - ${tag}`).join("\n");
  const parentLink = parent ? `\nPágina base: [[${parent.path.replace(/\\/g, "/")}]]\n` : "";
  const note = `---\ntipo: proyecto\nestado: activo\nambito: ${ambito}\narea: "${yamlValue(area)}"\nfecha_creacion: ${window.moment().format("YYYY-MM-DD")}\nfecha_inicio: ${window.moment().format("YYYY-MM-DD")}\nfecha_limite: ${limite}\nprogreso: 0\nsiguiente_accion: ""\nresponsable: ""\ncliente: ""\ntags:\n${tagYaml}\n---\n\n# ${name}\n${parentLink}\n## Objetivo\n\n## Alcance\n\n## Próximas acciones\n- [ ] Definir la siguiente acción\n\n## Notas\n`;

  let path = `${folder}/${name}.md`;
  let suffix = 2;
  while (app.vault.getAbstractFileByPath(path)) path = `${folder}/${name} ${suffix++}.md`;
  await app.vault.create(path, note);
  await app.workspace.getLeaf(true).openFile(app.vault.getAbstractFileByPath(path));
  new Notice(`Proyecto creado: ${path}`);
};
