module.exports = async ({ app, quickAddApi }) => {
  const files = app.vault.getMarkdownFiles().filter((file) => file.path.startsWith("08_Dashboards/Prompts/"));
  if (!files.length) { new Notice("No hay prompts guardados todavía"); return; }
  files.sort((a, b) => a.path.localeCompare(b.path));
  const selected = await quickAddApi.suggester(files.map((file) => file.path.replace("08_Dashboards/Prompts/", "")), files);
  if (!selected) return;
  const content = await app.vault.read(selected);
  const match = content.match(/## Prompt\s*\n([\s\S]*?)(?=\n## |$)/i);
  const prompt = (match ? match[1] : content).trim();
  try {
    await navigator.clipboard.writeText(prompt);
    new Notice(`Prompt copiado: ${selected.basename}`);
  } catch (error) {
    new Notice(`No se pudo copiar el prompt: ${error.message}`);
  }
};
