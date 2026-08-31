/*
 * QuickAdd User Script: restaura solo carpetas faltantes de la bóveda.
 * No borra, mueve ni sobrescribe archivos existentes.
 */
module.exports = async ({ app, obsidian }) => {
  const folders = [
    "00_Inbox",
    "00_Inbox/Notas de tareas",
    "01_Diario",
    "02_Proyectos",
    "02_Proyectos/01_Oficina",
    "02_Proyectos/02_Externos",
    "02_Proyectos/03_Docencia",
    "02_Proyectos/04_Personales",
    "02_Proyectos/99_Cerrados",
    "03_Areas",
    "03_Areas/DBA y Oracle",
    "03_Areas/Docencia",
    "03_Areas/Oficina",
    "03_Areas/Personal",
    "03_Areas/Infraestructura",
    "03_Areas/Infraestructura/Equipos",
    "03_Areas/Infraestructura/Maquinas virtuales",
    "03_Areas/Infraestructura/Redes",
    "03_Areas/Infraestructura/Servicios",
    "03_Areas/Infraestructura/Credenciales",
    "03_Areas/Infraestructura/Certificados",
    "03_Areas/Infraestructura/Licencias",
    "04_Conocimiento",
    "04_Conocimiento/00_Mapas",
    "04_Conocimiento/01_Conceptos",
    "04_Conocimiento/04_Videos",
    "05_Reuniones",
    "06_Personas",
    "07_Recursos",
    "07_Recursos/Adjuntos",
    "07_Recursos/Excalidraw",
    "07_Recursos/Exportaciones",
    "07_Recursos/Prompts",
    "07_Recursos/Prompts/Infraestructura",
    "07_Recursos/Prompts/Oracle",
    "07_Recursos/Prompts/Obsidian",
    "07_Recursos/Prompts/Programacion",
    "07_Recursos/Prompts/Documentacion",
    "07_Recursos/Prompts/Generales",
    "07_Recursos/Prompts/Historial",
    "08_Dashboards",
    "09_Plantillas",
    "99_Archivo",
    "Configuracion"
  ];

  const created = [];
  for (const path of folders) {
    if (!app.vault.getAbstractFileByPath(path)) {
      await app.vault.createFolder(path);
      created.push(path);
    }
  }

  const message = created.length
    ? `Estructura restaurada: ${created.length} carpeta(s) creada(s).`
    : "La estructura ya estaba completa.";
  const NoticeClass = obsidian?.Notice ?? globalThis.Notice;
  if (NoticeClass) new NoticeClass(message);
  console.log({ message, created });
  return created;
};
