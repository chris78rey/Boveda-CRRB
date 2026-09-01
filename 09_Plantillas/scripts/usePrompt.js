module.exports = async ({ app, quickAddApi }) => {
  const files = app.vault.getMarkdownFiles().filter((file) => file.path.startsWith("08_Dashboards/Prompts/"));
  if (!files.length) { new Notice("No hay prompts guardados todavía"); return; }
  files.sort((a, b) => a.path.localeCompare(b.path));
  const selected = await quickAddApi.suggester(files.map((file) => file.path.replace("08_Dashboards/Prompts/", "")), files);
  if (!selected) return;
  const content = await app.vault.read(selected);
  const match = content.match(/## Prompt\s*\n([\s\S]*?)(?=\n## |$)/i);
  let prompt = (match ? match[1] : content).trim();
  const placeholders = [...new Set([...prompt.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g)].map((item) => item[1].trim()))];
  for (const placeholder of placeholders) {
    const value = await quickAddApi.inputPrompt(`Valor para ${placeholder}`, "");
    if (value === null || value === undefined) return;
    prompt = prompt.replaceAll(`{{${placeholder}}}`, String(value));
    prompt = prompt.replaceAll(`{{ ${placeholder} }}`, String(value));
  }
  try {
    await navigator.clipboard.writeText(prompt);
    new Notice(`Prompt copiado: ${selected.basename}`);
  } catch (error) {
    new Notice(`No se pudo copiar el prompt: ${error.message}`);
  }
};
