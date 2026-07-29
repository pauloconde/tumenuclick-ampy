#!/bin/bash

# ================= CONFIGURACIÓN =================
REMOTE_NAME="template"
TEMP_BRANCH="chore/backport-$(date +%s)"
CURRENT_BRANCH=$(git branch --show-current)
DEFAULT_MSG="Refactor: Mejoras importadas desde implementación cliente"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== 🚀 Asistente de Backporting v2 ===${NC}"

# 1. Verificaciones de seguridad
if ! git remote | grep -q "^${REMOTE_NAME}$"; then
    echo -e "${RED}[Error] No tienes configurado el remoto '$REMOTE_NAME'.${NC}"
    exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}[Error] Tienes cambios sin guardar en tu cliente.${NC}"
    echo "Por favor haz commit o stash antes de correr este script."
    exit 1
fi

# 2. Preparación
echo -e "${YELLOW}1. Sincronizando con el template...${NC}"
git fetch $REMOTE_NAME --quiet

echo -e "${YELLOW}2. Creando entorno temporal...${NC}"
git checkout -b $TEMP_BRANCH $REMOTE_NAME/main --quiet

echo -e "${YELLOW}3. Trayendo tus archivos actuales...${NC}"
git checkout $CURRENT_BRANCH . 2>/dev/null
git reset --quiet # Des-stagear todo para selección manual

# 3. Interacción Humana
echo -e "\n${BLUE}=============================================${NC}"
echo -e "${BLUE}   PAUSA PARA SELECCIÓN EN VS CODE           ${NC}"
echo -e "${BLUE}=============================================${NC}"
echo "1. Ve a Source Control."
echo "2. Pasa a STAGED (+) solo lo que quieres enviar al template."
echo "3. Ignora la basura (colores, logos, .env)."
echo -e "${YELLOW}>> Cuando termines, presiona [ENTER] aquí...${NC}"
read -r

# Verificar si se seleccionó algo
if git diff --cached --quiet; then
    echo -e "${RED}No seleccionaste ningún archivo. Cancelando operación.${NC}"
    git checkout $CURRENT_BRANCH --quiet
    git branch -D $TEMP_BRANCH --quiet
    exit 1
fi

# 4. Input del Mensaje de Commit (LO NUEVO)
echo -e "\n${GREEN}Archivos seleccionados.${NC}"
echo -e "${YELLOW}Escribe el mensaje para el commit:${NC}"
echo -e "(Presiona Enter para usar: '${DEFAULT_MSG}')"
read -p "> " USER_MSG

# Usar default si está vacío
FINAL_MSG="${USER_MSG:-$DEFAULT_MSG}"

# 5. Ejecución final
echo -e "${YELLOW}Limpiando basura y enviando...${NC}"

# Borramos lo que no seleccionaste
git checkout . 2>/dev/null
git clean -fd --quiet

# Commit y Push
git commit -m "$FINAL_MSG"
git push $REMOTE_NAME HEAD:main

# 6. Limpieza
echo -e "${YELLOW}Volviendo a casa...${NC}"
git checkout $CURRENT_BRANCH --quiet
git branch -D $TEMP_BRANCH --quiet

echo -e "${GREEN}✅ ¡Listo! Template actualizado con el mensaje:${NC}"
echo -e "   \"$FINAL_MSG\""