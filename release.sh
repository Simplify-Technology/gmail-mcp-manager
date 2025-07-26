#!/bin/bash

set -e

# ===============================
# ✅ Carrega variáveis do .env
# ===============================
if [[ -f .env ]]; then
  echo "🔐 Carregando variáveis do .env..."
  export $(grep -v '^#' .env | grep -E '^[A-Z_]+=' | xargs)
fi

# ===============================
# ✅ Pré-requisitos
# ===============================
echo "📦 Iniciando processo de release do pacote NPM..."

if ! command -v jq &> /dev/null; then
  echo "❌ Requer 'jq'. Instale com: brew install jq (macOS) ou sudo apt install jq (Linux)"
  exit 1
fi

if [[ -z "$OPENAI_API_KEY" ]]; then
  echo "❌ Variável OPENAI_API_KEY não encontrada no ambiente ou no .env"
  exit 1
fi

# ===============================
# ✅ Geração de commit com LLM
# ===============================
if [[ -n $(git status --porcelain) ]]; then
  echo ""
  echo "📝 Alterações não commitadas detectadas:"
  git status --short

  echo ""
  echo "🔍 Gerando mensagem de commit com base no diff..."

  git add -A

  # ⚠️ Limita o tamanho do diff (máx. 4000 caracteres) e escapa corretamente
  RAW_DIFF=$(git diff --cached -U0 | head -c 4000)
  DIFF=$(jq -Rn --arg diff "$RAW_DIFF" '$diff')

  # Chamada à API da OpenAI com JSON válido
  RESPONSE=$(curl -s https://api.openai.com/v1/chat/completions \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"model\": \"gpt-4\",
      \"temperature\": 0.3,
      \"messages\": [
        {
          \"role\": \"system\",
          \"content\": \"Você é um assistente experiente em Git que escreve mensagens de commit no padrão Conventional Commits, como 'feat:', 'fix:', 'refactor:', etc. Seja direto, sem firulas.\"
        },
        {
          \"role\": \"user\",
          \"content\": $DIFF
        }
      ]
    }")

  COMMIT_MSG=$(echo "$RESPONSE" | jq -r '.choices[0].message.content // empty')

  # ❌ Se vazio ou null, aborta com log completo
  if [[ -z "$COMMIT_MSG" || "$COMMIT_MSG" == "null" ]]; then
    echo "❌ Erro: a IA não gerou uma mensagem válida."
    echo "📡 Resposta da API:"
    echo "$RESPONSE"
    exit 1
  fi

  echo ""
  echo "💬 Sugestão da IA: $COMMIT_MSG"
  read -p "✅ Deseja usar essa mensagem e comitar? (s/N) " confirm_commit

  if [[ "$confirm_commit" =~ ^[sSyY]$ ]]; then
    git commit -m "$COMMIT_MSG"
    echo "✅ Commit efetuado."
  else
    echo "❌ Commit cancelado pelo usuário."
    exit 1
  fi
else
  echo "✅ Nenhuma alteração não commitada detectada."
fi

# ===============================
# 🔢 Escolher tipo de versão
# ===============================
echo ""
echo "🔢 Qual tipo de versão deseja publicar?"
echo "1) patch (ex: 1.3.3 → 1.3.4)"
echo "2) minor (ex: 1.3.3 → 1.4.0)"
echo "3) major (ex: 1.3.3 → 2.0.0)"
read -p "Digite o número da opção desejada: " versao

case "$versao" in
  1) bump="patch" ;;
  2) bump="minor" ;;
  3) bump="major" ;;
  *) echo "❌ Opção inválida."; exit 1 ;;
esac

# ===============================
# 🆙 Atualizar versão
# ===============================
echo ""
echo "📦 Atualizando versão: $bump"
npm version "$bump"

# ===============================
# 🛠 Build
# ===============================
echo ""
echo "🔧 Compilando projeto..."
npm run build

# ===============================
# 🔍 Validar binário principal
# ===============================
BIN_ENTRY=$(jq -r '.bin["gmail-mcp-manager"]' package.json)
if [ "$BIN_ENTRY" != "dist/mcp-server.js" ]; then
  echo "⚠️ Binário principal incorreto. Esperado: dist/mcp-server.js"
  echo "Corrija em: package.json > bin"
  exit 1
fi

# ===============================
# 🚀 Publicar no NPM
# ===============================
echo ""
echo "🚀 Publicando no NPM..."
npm publish --access public

# ===============================
# 🔖 Commit e tag da versão
# ===============================
VERSAO_TAG=$(jq -r .version package.json)
echo ""
echo "📌 Commit de versão e tag v$VERSAO_TAG"
git add .
git commit -m "release: v$VERSAO_TAG"
git tag "v$VERSAO_TAG"
git push origin main --tags

echo ""
echo "🎉 Release finalizado com sucesso! v$VERSAO_TAG publicado!"