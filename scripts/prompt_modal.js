const PROMPT_ROOT = "07_Recursos/Prompts";
const { Modal } = require("obsidian");

module.exports = async ({ app }) => {
  const files = app.vault.getMarkdownFiles().filter((file) => file.path.startsWith(`${PROMPT_ROOT}/`));
  if (!files.length) return new Notice("No hay prompts guardados en 07_Recursos/Prompts.");

  const ModalClass = Modal;

  class PromptModal extends ModalClass {
    constructor(app) { super(app); this.files = files; this.selected = null; this.values = {}; }
    async onOpen() {
      this.contentEl.empty(); this.contentEl.addClass("crrb-prompt-modal");
      this.titleEl.setText("Biblioteca interactiva de prompts");
      const box = this.contentEl.createDiv({ cls: "crrb-prompt-form" });
      const select = box.createEl("select");
      select.createEl("option", { text: "Selecciona un prompt" });
      this.files.sort((a, b) => a.path.localeCompare(b.path)).forEach((file, i) => select.createEl("option", { text: file.path.replace(`${PROMPT_ROOT}/`, ""), value: String(i) }));
      const fields = box.createDiv({ cls: "crrb-prompt-fields" });
      const preview = box.createEl("textarea", { cls: "crrb-prompt-preview" }); preview.readOnly = true;
      const actions = box.createDiv({ cls: "crrb-prompt-actions" });
      const copy = actions.createEl("button", { text: "Copiar al portapapeles" });
      const close = actions.createEl("button", { text: "Cerrar" });
      const render = async () => {
        const file = this.selected; if (!file) return;
        const raw = await app.vault.read(file);
        const match = raw.match(/## Prompt\s*\n([\s\S]*?)(?=\n## |$)/i);
        const source = (match ? match[1] : raw).trim();
        const names = [...new Set([...source.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g)].map((m) => m[1].trim()))];
        fields.empty();
        names.forEach((name) => { const row = fields.createDiv({ cls: "crrb-prompt-field" }); row.createEl("label", { text: name }); const input = row.createEl("input", { type: "text" }); input.value = this.values[name] || ""; input.addEventListener("input", () => { this.values[name] = input.value; update(); }); });
        update = () => { let output = source; names.forEach((name) => { output = output.replaceAll(`{{${name}}}`, this.values[name] || `[${name}]`).replaceAll(`{{ ${name} }}`, this.values[name] || `[${name}]`); }); preview.value = output; };
        update();
      };
      let update = () => {};
      select.addEventListener("change", async () => { this.selected = this.files[Number(select.value)]; this.values = {}; await render(); });
      copy.addEventListener("click", async () => { if (!preview.value) return new Notice("Selecciona un prompt y completa sus campos."); await navigator.clipboard.writeText(preview.value); new Notice("Prompt copiado al portapapeles."); });
      close.addEventListener("click", () => this.close());
    }
    onClose() { this.contentEl.empty(); }
  }
  new PromptModal(app).open();
};
