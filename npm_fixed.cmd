@ECHO OFF
SETLOCAL
SET "NODE_EXE=C:\nvm4w\nodejs\node.exe"
SET "NPM_CLI_JS=C:\nvm4w\nodejs\node_modules\npm\bin\npm-cli.js"
SET "NPM_CONFIG_USERCONFIG=C:\Users\antho\.npmrc"
SET "NPM_CONFIG_GLOBALCONFIG=C:\nvm4w\nodejs\etc\npmrc"
SET "HOME=C:\Users\antho"
SET "USERPROFILE=C:\Users\antho"
SET "APPDATA=C:\Users\antho\AppData\Roaming"
SET "LOCALAPPDATA=C:\Users\antho\AppData\Local"
"%NODE_EXE%" "%NPM_CLI_JS%" %*
