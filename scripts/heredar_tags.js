/* Templater user function: devuelve los tags de la nota activa/origen. */
module.exports = async (tp) => {
  const vaultApp = tp?.app ?? globalThis.app;
  const activeFile = tp?.config?.active_file ?? vaultApp?.workspace?.getActiveFile?.();
  const cache = activeFile && vaultApp?.metadataCache ? vaultApp.metadataCache.getFileCache(activeFile) : null;
  const frontmatterTags = cache?.frontmatter?.tags ?? cache?.frontmatter?.tag ?? [];
  const tags = [
    ...(Array.isArray(frontmatterTags) ? frontmatterTags : [frontmatterTags]),
    ...(cache?.tags ?? []).map((item) => item.tag)
  ].flatMap((tag) => String(tag ?? "").split(/[#,]/))
    .map((tag) => tag.trim().replace(/^#/, ""))
    .filter(Boolean);
  return [...new Set(tags)].filter(Boolean);
};
