@echo off
setlocal EnableExtensions
cd /d "%~dp0"

where curl.exe >nul 2>&1
if errorlevel 1 (
  echo ERROR: Windows no encontro curl.exe.
  echo Se requiere Windows 10 o posterior, o la edicion completa de la boveda.
  pause
  exit /b 1
)

if not exist ".obsidian\plugins" mkdir ".obsidian\plugins"

call :plugin "table-editor-obsidian" "tgrosinger/advanced-tables-obsidian" "0.23.2"
if errorlevel 1 goto :failed
call :plugin_nostyle "calendar" "liamcain/obsidian-calendar-plugin" "1.5.10"
if errorlevel 1 goto :failed
call :plugin "dataview" "blacksmithgu/obsidian-dataview" "0.5.70"
if errorlevel 1 goto :failed
call :plugin "obsidian-excalidraw-plugin" "zsviczian/obsidian-excalidraw-plugin" "2.26.4"
if errorlevel 1 goto :failed
call :plugin "obsidian-kanban" "obsidian-community/obsidian-kanban" "2.0.51"
if errorlevel 1 goto :failed
call :plugin "obsidian-map-view" "esm7/obsidian-map-view" "6.1.4"
if errorlevel 1 goto :failed
call :plugin "obsidian-pandoc" "oliverbalfour/obsidian-pandoc" "0.4.1"
if errorlevel 1 goto :failed
call :plugin "quickadd" "chhoumann/quickadd" "2.23.0"
if errorlevel 1 goto :failed
call :plugin "recent-files-obsidian" "tgrosinger/recent-files-obsidian" "1.7.10"
if errorlevel 1 goto :failed
call :plugin "obsidian-tasks-plugin" "obsidian-tasks-group/obsidian-tasks" "8.4.0"
if errorlevel 1 goto :failed
call :plugin "templater-obsidian" "silentvoid13/Templater" "2.25.0"
if errorlevel 1 goto :failed
call :plugin "ytranscript" "lstrzepek/obsidian-yt-transcript" "1.4.0"
if errorlevel 1 goto :failed

echo.
echo Instalacion completada. Ya se puede abrir Boveda-CRRB en Obsidian.
pause
exit /b 0

:plugin
set "PLUGIN_ID=%~1"
set "PLUGIN_REPO=%~2"
set "PLUGIN_VERSION=%~3"
call :prepare
if errorlevel 1 exit /b 1
call :download "main.js"
if errorlevel 1 exit /b 1
call :download "manifest.json"
if errorlevel 1 exit /b 1
call :download "styles.css"
exit /b %errorlevel%

:plugin_nostyle
set "PLUGIN_ID=%~1"
set "PLUGIN_REPO=%~2"
set "PLUGIN_VERSION=%~3"
call :prepare
if errorlevel 1 exit /b 1
call :download "main.js"
if errorlevel 1 exit /b 1
call :download "manifest.json"
exit /b %errorlevel%

:prepare
echo Instalando %PLUGIN_ID% %PLUGIN_VERSION%...
if not exist ".obsidian\plugins\%PLUGIN_ID%" mkdir ".obsidian\plugins\%PLUGIN_ID%"
exit /b %errorlevel%

:download
set "PLUGIN_FILE=%~1"
curl.exe --fail --location --retry 2 --silent --show-error --output ".obsidian\plugins\%PLUGIN_ID%\%PLUGIN_FILE%" "https://github.com/%PLUGIN_REPO%/releases/download/%PLUGIN_VERSION%/%PLUGIN_FILE%"
exit /b %errorlevel%

:failed
echo.
echo ERROR: No se pudieron descargar todos los complementos.
echo Revise la conexion o utilice la edicion completa de la boveda.
pause
exit /b 1
