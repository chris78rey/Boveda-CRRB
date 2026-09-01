const PATHS = Object.freeze({ taskNotes: "00_Inbox/Notas de tareas", taskIndex: "00_Inbox/Tareas.md", prompts: "07_Recursos/Prompts", projects: "02_Proyectos" });
const asArray = (value) => Array.isArray(value) ? value : value == null ? [] : [value];
function normalizeTags(value) { return asArray(value).flatMap((tag) => String(tag).split(",")).map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean); }
function tagsFromFile(app, file) { const cache = file && app.metadataCache.getFileCache(file); return [...new Set([...normalizeTags(cache?.frontmatter?.tags), ...(cache?.tags ?? []).map((item) => String(item.tag).replace(/^#/, ""))])]; }
function safeName(value, fallback = "Sin nombre") { return String(value || fallback).trim().replace(/[\\/:*?"<>|#]/g, "-").replace(/\s+/g, " "); }
function wikiLink(file) { return file ? `[[${file.path}|${file.basename}]]` : ""; }
async function ensureFolder(app, folder) { let current = ""; for (const part of folder.split("/")) { current = current ? `${current}/${part}` : part; if (!app.vault.getAbstractFileByPath(current)) await app.vault.createFolder(current); } }
function notice(obsidian, message) { const NoticeClass = obsidian?.Notice ?? globalThis.Notice; if (NoticeClass) new NoticeClass(message); }
module.exports = { PATHS, normalizeTags, tagsFromFile, safeName, wikiLink, ensureFolder, notice };
