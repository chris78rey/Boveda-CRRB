const { Plugin, TFile, Notice } = require("obsidian");

function normalizeTags(value) {
  const values = Array.isArray(value) ? value : value == null ? [] : [value];
  return values.flatMap((tag) => String(tag).split(/[#,]/))
    .map((tag) => tag.trim().replace(/^#/, ""))
    .filter(Boolean);
}

function tagsFromFile(app, file) {
  const cache = app.metadataCache.getFileCache(file);
  return [...new Set([
    ...normalizeTags(cache?.frontmatter?.tags ?? cache?.frontmatter?.tag),
    ...(cache?.tags ?? []).map((item) => item.tag)
  ])];
}

function linkFor(file) {
  return `[[${file.path.replace(/\\/g, "/")}\|${file.basename}]]`;
}

function sourceLinksTo(app, source, target) {
  const links = app.metadataCache.getFileCache(source)?.links ?? [];
  return links.some((link) => {
    const destination = app.metadataCache.getFirstLinkpathDest(link.link, source.path);
    return destination?.path === target.path;
  });
}

function findIncomingSource(app, target) {
  return app.vault.getMarkdownFiles()
    .filter((file) => file.path !== target.path)
    .find((file) => sourceLinksTo(app, file, target)) ?? null;
}

module.exports = class CrrbOriginContextPlugin extends Plugin {
  async onload() {
    this.registerEvent(this.app.vault.on("create", (file) => {
      if (!(file instanceof TFile) || file.extension !== "md") return;
      if (file.path.startsWith("09_Plantillas/") || file.path.startsWith("99_Archivo/")) return;

      const activeAtCreate = this.app.workspace.getActiveFile();
      window.setTimeout(() => this.applyContext(file, activeAtCreate), 300);
    }));
  }

  async applyContext(target, activeAtCreate) {
    if (!this.app.vault.getAbstractFileByPath(target.path)) return;

    const source = activeAtCreate && activeAtCreate.path !== target.path && sourceLinksTo(this.app, activeAtCreate, target)
      ? activeAtCreate
      : findIncomingSource(this.app, target);
    if (!source) return;

    const sourceTags = tagsFromFile(this.app, source);
    const base = linkFor(source);
    await this.app.fileManager.processFrontMatter(target, (frontmatter) => {
      const existingBase = String(frontmatter.base ?? frontmatter.based_on ?? "").trim();
      if (!existingBase) frontmatter.base = base;

      const existingTags = normalizeTags(frontmatter.tags ?? frontmatter.tag);
      const mergedTags = [...new Set([...existingTags, ...sourceTags])];
      if (mergedTags.length) frontmatter.tags = mergedTags;
    });

    await this.app.vault.process(target, (content) => {
      if (content.includes(base)) return content;
      const suffix = `\n\n> [!info] Origen\n> ${base}\n`;
      return `${content.trimEnd()}${suffix}`;
    });

    new Notice(`Contexto heredado desde ${source.basename}: tags y enlace de origen.`);
  }
};
