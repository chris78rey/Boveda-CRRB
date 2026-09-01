function normalizeTags(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((tag) => String(tag).split(/[#,]/))
    .map((tag) => tag.trim().replace(/^#/, ""))
    .filter(Boolean);
}

module.exports = async function inheritTags(tp, ownTags = []) {
  const tags = new Set(normalizeTags(ownTags));
  const active = app.workspace.getActiveFile();
  const target = tp.file.path(true);
  if (active && active.path !== target) {
    const cache = app.metadataCache.getFileCache(active);
    normalizeTags(cache?.frontmatter?.tags).forEach((tag) => tags.add(tag));
  }
  const folder = target.includes("/") ? target.slice(0, target.lastIndexOf("/")) : "";
  const base = app.vault.getMarkdownFiles()
    .filter((file) => file.path.startsWith(folder ? `${folder}/` : "") && file.path !== target)
    .sort((a, b) => a.path.length - b.path.length)
    .find((file) => /\u00edndice|\u00e1rea|dashboard|proyecto/i.test(file.basename));
  if (base) {
    const cache = app.metadataCache.getFileCache(base);
    normalizeTags(cache?.frontmatter?.tags).forEach((tag) => tags.add(tag));
  }
  return [...tags].map((tag) => `  - ${tag}`).join("\n");
};
