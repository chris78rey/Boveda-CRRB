/* Templater user function: obtiene la nota desde la que se creó la nueva nota. */
module.exports = async (tp) => {
  const vaultApp = tp?.app ?? globalThis.app;
  const targetPath = tp?.file?.path?.(true) ?? "";
  const active = tp?.config?.active_file;
  const workspaceFile = vaultApp?.workspace?.getActiveFile?.();
  const source = [active, workspaceFile]
    .find((file) => file?.path && file.path !== targetPath) ?? null;

  if (!source) return "";
  return `[[${source.path.replace(/\\/g, "/")}\|${source.basename}]]`;
};
