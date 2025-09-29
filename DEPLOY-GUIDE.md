# 🚀 GUIA COMPLETO DE DEPLOY NA VERCEL

## 📋 PRÉ-REQUISITOS

### 1. Obter Service Role Key do Supabase
1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Settings** → **API**
3. Copie a **service_role key** (ATENÇÃO: Esta é uma chave sensível!)

### 2. Instalar Dependências Localmente
```bash
# Na raiz do projeto
npm install

# No frontend
cd frontend
npm install
```

## 🛠️ CONFIGURAÇÃO DO PROJETO

### Opção 1: Deploy via Vercel CLI (Recomendado)

1. **Instale o Vercel CLI:**
```bash
npm i -g vercel
```

2. **Configure as variáveis de ambiente:**
```bash
vercel env add DATABASE_URL
vercel env add DIRECT_URL
vercel env add JWT_SECRET
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_API_URL
```

3. **Deploy:**
```bash
vercel --prod
```

### Opção 2: Deploy via GitHub + Vercel Dashboard

1. **Faça push do código para o GitHub:**
```bash
git add .
git commit -m "fix: sincronização Supabase e configuração Vercel"
git push origin main
```

2. **No Vercel Dashboard:**
   - Importe o projeto do GitHub
   - Configure as seguintes variáveis de ambiente:

#### Variáveis do Backend:
```
DATABASE_URL=postgresql://postgres.oxihpwafxypexikipxcw:4Ejfeei%3FVQ5%26u%40u@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.oxihpwafxypexikipxcw:4Ejfeei%3FVQ5%26u%40u@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
JWT_SECRET=MINHACHAVESECRETA
SUPABASE_URL=https://oxihpwafxypexikipxcw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[SUA_SERVICE_ROLE_KEY_AQUI]
```

#### Variáveis do Frontend:
```
NEXT_PUBLIC_SUPABASE_URL=https://oxihpwafxypexikipxcw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94aWhwd2FmeHlwZXhpa2lweGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjI3ODQsImV4cCI6MjA3MzY5ODc4NH0.HY_HvFO8k5CbY36rwq_u8ZiAtKgO4Y9qwjycXJD8Dp0
NEXT_PUBLIC_API_URL=https://[SEU_DOMINIO_VERCEL].vercel.app/api
```

## 🏗️ ARQUITETURA DO DEPLOY

### Estrutura Monorepo
```
micro-saas-orcamentos/
├── frontend/          → Next.js (Vercel)
├── src/              → Backend API (Serverless Functions)
├── prisma/           → Schema do banco
├── vercel.json       → Configuração de deploy
└── package.json      → Scripts e dependências
```

### Rotas Configuradas
- `/` → Frontend Next.js
- `/api/*` → Backend Express (Serverless)
- `/uploads/*` → Arquivos estáticos

## 🔄 MIGRAÇÃO DO BANCO DE DADOS

Após o primeiro deploy, execute:

```bash
# Via terminal local
npx prisma migrate deploy

# Ou adicione ao script de build
"vercel-build": "prisma generate && prisma migrate deploy && tsc"
```

## ✅ CHECKLIST DE VERIFICAÇÃO

### Antes do Deploy:
- [ ] Service Role Key do Supabase obtida
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Código commitado no GitHub
- [ ] Testes locais funcionando

### Após o Deploy:
- [ ] Frontend acessível
- [ ] API respondendo em `/api`
- [ ] Login funcionando
- [ ] Edição de perfil salvando corretamente
- [ ] Dados persistindo após relogin

## 🐛 SOLUÇÃO DO BUG DE PERFIL

### O que foi corrigido:
1. **Sincronização Supabase:** Adicionado `syncUserMetadata` no backend
2. **AuthContext:** Implementado `refreshUserData` para atualizar dados
3. **Página de Perfil:** Chama `refreshUserData` após salvar

### Como funciona agora:
1. Usuário edita perfil
2. Backend salva no PostgreSQL (Prisma)
3. Backend sincroniza com Supabase Auth metadata
4. Frontend atualiza contexto local
5. Dados persistem corretamente

## 🚨 TROUBLESHOOTING

### Erro: "Module not found"
```bash
npm install
npm run build
```

### Erro: "Database connection failed"
- Verifique DATABASE_URL nas variáveis de ambiente
- Certifique-se que o IP da Vercel está permitido no Supabase

### Erro: "Unauthorized" ao editar perfil
- Verifique JWT_SECRET
- Confirme que SUPABASE_SERVICE_ROLE_KEY está correta

### Frontend não conecta com API
- Atualize NEXT_PUBLIC_API_URL para o domínio da Vercel
- Exemplo: `https://seu-projeto.vercel.app/api`

## 📝 NOTAS IMPORTANTES

1. **Segurança:** NUNCA commite a SERVICE_ROLE_KEY no código
2. **Performance:** Use ISR/SSG no Next.js quando possível
3. **Monitoramento:** Ative Analytics na Vercel
4. **Backup:** Configure backups automáticos no Supabase

## 🔗 LINKS ÚTEIS

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://app.supabase.com)
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Prisma](https://www.prisma.io/docs)

## 📞 SUPORTE

Em caso de problemas:
1. Verifique os logs na Vercel (Functions tab)
2. Consulte logs do Supabase
3. Teste localmente com as mesmas variáveis de ambiente

---
**Última atualização:** Janeiro 2025
**Versão:** 1.0.0
