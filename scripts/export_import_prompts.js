const ROOT = "07_Recursos/Prompts";
module.exports = async ({ app }) => {
  const files = app.vault.getMarkdownFiles().filter(f => f.path.startsWith(ROOT + "/") && f.basename.toLowerCase() !== "readme");
  const action = await new Promise(resolve => {
    const box = document.body.createDiv(); box.style.cssText = "position:fixed;inset:0;z-index:10000;background:#26323888;display:flex;align-items:center;justify-content:center";
    const p = box.createDiv(); p.style.cssText = "background:#f5f0e7;padding:24px;border-radius:16px;min-width:320px"; p.createEl("h2", {text:"Portabilidad de prompts"}); p.createEl("p", {text:"Elige qué deseas hacer:"});
    ["Exportar biblioteca", "Importar biblioteca", "Cancelar"].forEach(t => { const b=p.createEl("button",{text:t}); b.style.cssText="display:block;width:100%;margin:8px 0;padding:12px"; b.onclick=()=>{box.remove();resolve(t)}; });
  });
  if (action === "Exportar biblioteca") { const items=[]; for (const f of files) items.push({path:f.path,content:await app.vault.read(f)}); const folder="07_Recursos/Prompts/Exportaciones"; if(!app.vault.getAbstractFileByPath(folder)) await app.vault.createFolder(folder); const name=`${folder}/prompts-${new Date().toISOString().slice(0,10)}.json`; await app.vault.create(name,JSON.stringify({version:1,exportedAt:new Date().toISOString(),items},null,2)); new Notice(`Exportación guardada en ${name}`); }
  if (action === "Importar biblioteca") { const input=document.createElement("input"); input.type="file"; input.accept=".json"; input.onchange=async()=>{try{const data=JSON.parse(await input.files[0].text());let n=0;for(const item of data.items||[]){if(!item.path.startsWith(ROOT+"/"))continue;const old=app.vault.getAbstractFileByPath(item.path);if(old) await app.vault.modify(old,item.content); else {const parts=item.path.split("/");let dir="";for(let i=0;i<parts.length-1;i++){dir=dir?dir+"/"+parts[i]:parts[i];if(!app.vault.getAbstractFileByPath(dir))await app.vault.createFolder(dir)}await app.vault.create(item.path,item.content)}n++}new Notice(`Importados ${n} prompts`)}catch(e){new Notice(`Importación inválida: ${e.message}`)}}; input.click(); }
};
