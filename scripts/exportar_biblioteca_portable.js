/* Exporta la biblioteca reutilizable y sus scripts como ZIP portable. */
const ROOT = "07_Recursos/Prompts";
const SCRIPT_PATHS = [
  "scripts/prompt_modal.js",
  "scripts/copiar_prompt.js",
  "scripts/crear_categoria_prompt.js",
  "scripts/export_import_prompts.js",
  "scripts/exportar_biblioteca_portable.js",
];

module.exports = async ({ app }) => {
  const notice = (message) => {
    if (typeof globalThis.Notice === "function") new globalThis.Notice(message);
  };
  const encoder = new TextEncoder();
  const u16 = (value) => new Uint8Array([value & 255, (value >>> 8) & 255]);
  const u32 = (value) => new Uint8Array([value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255]);
  const join = (parts) => {
    const size = parts.reduce((total, part) => total + part.length, 0);
    const result = new Uint8Array(size);
    let offset = 0;
    parts.forEach((part) => { result.set(part, offset); offset += part.length; });
    return result;
  };
  const crcTable = (() => {
    const table = [];
    for (let n = 0; n < 256; n += 1) {
      let value = n;
      for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      table[n] = value >>> 0;
    }
    return table;
  })();
  const crc32 = (bytes) => {
    let value = 0xffffffff;
    bytes.forEach((byte) => { value = crcTable[(value ^ byte) & 255] ^ (value >>> 8); });
    return (value ^ 0xffffffff) >>> 0;
  };
  const dosDate = (date) => ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  const dosTime = (date) => (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const files = [];
  const addFile = async (path, archivePath = path) => {
    const file = app.vault.getAbstractFileByPath(path);
    if (!file) throw new Error(`No existe el archivo requerido: ${path}`);
    files.push({ name: archivePath, data: encoder.encode(await app.vault.read(file)) });
  };

  const instructions = `# Biblioteca de Prompts portable

## Instalacion

1. Abre la otra carpeta como una boveda de Obsidian.
2. Instala y habilita el complemento comunitario QuickAdd.
3. Copia la carpeta scripts/ en la raiz de la boveda.
4. Copia 07_Recursos/Prompts/ conservando exactamente esa ruta.
5. En QuickAdd crea una macro llamada "Biblioteca interactiva de prompts".
6. Agrega un UserScript con la ruta scripts/prompt_modal.js.
7. Ejecuta la macro y prueba escribir varias letras en el buscador.

## Accesos opcionales

- scripts/copiar_prompt.js: acceso rapido para copiar prompts.
- scripts/crear_categoria_prompt.js: crea categorias desde QuickAdd.
- scripts/export_import_prompts.js: importa o exporta prompts en JSON.
- scripts/exportar_biblioteca_portable.js: genera este ZIP desde QuickAdd.

## Que se incluye

- Prompts individuales y grupos en Markdown.
- Referencias prompt-ref con sus rutas originales.
- Scripts de la biblioteca y esta guia.
- No se incluyen Resultados, Historial ni Exportaciones anteriores.

## Requisitos

Solo se necesita Obsidian y QuickAdd. Dataview, Templater, Tasks, Excalidraw y Graphify no son necesarios para esta biblioteca.

## Nota sobre grupos

No cambies la ruta 07_Recursos/Prompts/ ni los nombres de archivos referenciados por prompt-ref. Si cambias la ruta, debes actualizar esas referencias.
`;
  files.push({ name: "INSTRUCCIONES-BIBLIOTECA-PROMPTS.md", data: encoder.encode(instructions) });
  for (const path of SCRIPT_PATHS) await addFile(path);
  const promptFiles = app.vault.getMarkdownFiles()
    .filter((file) => file.path.startsWith(`${ROOT}/`))
    .filter((file) => !/(^|\/)(Resultados|Historial|Exportaciones)(\/|$)/i.test(file.path))
    .filter((file) => file.basename.toLowerCase() !== "readme")
    .sort((a, b) => a.path.localeCompare(b.path, "es"));
  for (const file of promptFiles) await addFile(file.path);
  await addFile(`${ROOT}/README.md`);

  const now = new Date();
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  files.forEach((file) => {
    const name = encoder.encode(file.name);
    const checksum = crc32(file.data);
    const size = file.data.length;
    localParts.push(join([u32(0x04034b50), u16(20), u16(0x800), u16(0), u16(dosTime(now)), u16(dosDate(now)), u32(checksum), u32(size), u32(size), u16(name.length), u16(0), name, file.data]));
    centralParts.push(join([u32(0x02014b50), u16(20), u16(20), u16(0x800), u16(0), u16(dosTime(now)), u16(dosDate(now)), u32(checksum), u32(size), u32(size), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name]));
    offset += localParts[localParts.length - 1].length;
  });
  const central = join(centralParts);
  const local = join(localParts);
  const end = join([u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(central.length), u32(local.length), u16(0)]);
  const blob = new Blob([join([local, central, end])], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `biblioteca-prompts-portable-${now.toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  notice(`ZIP generado: ${files.length} archivos. Revisa Descargas.`);
};
