/* Templater user function: devuelve los tags de la nota activa/origen. */
module.exports = async (tp) => {
  const activeFile = tp?.config?.active_file;
  const vaultApp = tp?.app ?? globalThis.app;
  const cache = activeFile && vaultApp?.metadataCache ? vaultApp.metadataCache.getFileCache(activeFile) : null;
  const tags = cache?.tags?.map((item) => item.tag.replace(/^#/, "")) ?? [];
  return [...new Set(tags)].filter(Boolean);
};
