#!/bin/bash

# Colores para la terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}===> Iniciando actualización desde el Template <===${NC}"

# 1. Asegurar que el remoto existe
if ! git remote | grep -q "template"; then
    echo -e "${YELLOW}Configurando el remoto 'template'...${NC}"
    git remote add template git@github.com:pauloconde/tumenuclick-template.git
fi

# 2. Sincronizar cambios del template
echo -e "${BLUE}Haciendo fetch del template...${NC}"
git fetch template

# 3. Preguntar qué archivo o carpeta traer
echo -e "${YELLOW}¿Qué archivo o ruta quieres actualizar? (Ej: src/components/Menu.astro o '.' para todo)${NC}"
read -p "Ruta: " FILE_PATH

# 4. Traer el contenido pero dejarlo "Unstaged"
# Esto permite que VS Code lo detecte como cambios locales
git checkout template/main -- "$FILE_PATH"
git reset "$FILE_PATH"

echo -e "\n${GREEN}✔ Archivos listos.${NC}"
echo -e "-----------------------------------------------------------"
echo -e "INSTRUCCIONES PARA VS CODE:"
echo -e "1. Ve a la pestaña de 'Source Control'."
echo -e "2. Abre el archivo y selecciona las líneas que quieras traer."
echo -e "3. Haz click derecho y selecciona 'Stage Selected Ranges'."
echo -e "4. Ignora o descarta el resto de cambios que no quieras."
echo -e "-----------------------------------------------------------"

# 5. Pausa para intervención manual
read -p "Presiona [Enter] cuando hayas terminado de hacer STAGE en VS Code..."

# 6. Preguntar por el mensaje de commit
echo -e "${YELLOW}¿Qué mensaje quieres para el commit?${NC}"
read -p "Mensaje: " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="feat: backport desde template de $FILE_PATH"
fi

# 7. Confirmar commit y limpiar el resto
git commit -m "$COMMIT_MSG"

echo -e "${BLUE}¿Deseas descartar el resto de cambios que NO seleccionaste en $FILE_PATH? (s/n)${NC}"
read -p "Confirmar: " CLEANUP

if [ "$CLEANUP" = "s" ]; then
    git checkout -- "$FILE_PATH"
    echo -e "${GREEN}✔ Cambios restantes descartados.${NC}"
else
    echo -e "${YELLOW}Los cambios no seleccionados se mantienen en tu working directory.${NC}"
fi

echo -e "${GREEN}===> Proceso completado con éxito para Tu Menú Click <===${NC}"
