@echo off

REM Cambia al directorio donde está tu proyecto
cd /d "%~dp0\..\proyecto_impulso"

REM Verifica si el archivo package.json está presente
IF EXIST "package.json" (
  REM Inicia la aplicación React.js con Electron
  start npm run electron-react

  REM Cambia al directorio del backend (si es necesario)
  cd backend

  REM Inicia el servidor Node.js
  start node server.js
) ELSE (
  REM Muestra un mensaje de error si no se encuentra package.json
  echo Error: El archivo package.json no se encontró en "%~dp0\..\proyecto_impulso"
  pause
)

