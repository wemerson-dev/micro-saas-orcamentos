# 🔍 ANÁLISE - PROBLEMA DE SINCRONIZAÇÃO SUPABASE AUTH + BANCO DE DADOS

## ❌ **PROBLEMAS IDENTIFICADOS**

### **1. Desconexão Entre Supabase Auth e Tabela Usuario**

**Problema**: Usuário autentica pelo Supabase, mas não existe registro na tabela `Usuario` do banco.

```
Supabase Auth (users)     ❌     Tabela Usuario (Prisma)
      ↓                            ↓
   user.sub (UUID)              id (UUID diferente!)
   user.email                   email
   ❌ Sem sincronia           ❌ Não criado automaticamente
```

### **2. Upload de Logo Não Persiste**

**Evidência no código**:
```typescript
// uploadLogo.ts - linha 18
await prisma.usuario.update({
  where: { id: userId }, // ← userId vem do Supabase
  data: { logoPath }
})
// ❌ FALHA: userId do Supabase não existe na tabela Usuario!
```

### **3. PDF Sem Logo**

**Fluxo atual**:
```
gerarPDF() 
  → Busca orcamento.cliente.usuario.logoPath
  → ❌ logoPath é null (nunca foi salvo)
  → PDF gerado sem logo
```

## 🔍 **CAUSA RAIZ**

### **Arquitetura Problemática Atual**:
```
1. Usuário se registra → Supabase Auth ✅
2. Frontend faz login → Token Supabase ✅
3. Frontend chama API backend → Token enviado ✅
4. Backend extrai userId (sub do Supabase) ✅
5. Backend tenta atualizar Usuario table → ❌ FALHA
   → Registro não existe! userId do Supabase ≠ id na tabela
```

## 🎯 **SOLUÇÕES NECESSÁRIAS**

### **Solução 1: Webhook Supabase → Criar Usuário no Banco**
```typescript
// Quando usuário se registra no Supabase
Supabase Auth (onCreate) 
  → Webhook para /api/usuarios/sync
  → Criar registro na tabela Usuario
  → userId = user.sub do Supabase
```

### **Solução 2: Sincronização Manual no Primeiro Login**
```typescript
// No primeiro login, verificar e criar registro
async function ensureUserExists(supabaseId, userData) {
  let usuario = await prisma.usuario.findUnique({ 
    where: { id: supabaseId } 
  })
  
  if (!usuario) {
    usuario = await prisma.usuario.create({
      data: {
        id: supabaseId, // ← USAR ID do Supabase
        nome: userData.name,
        email: userData.email,
        senha: 'SUPABASE_AUTH', // Placeholder
        // ... outros campos
      }
    })
  }
  
  return usuario
}
```

### **Solução 3: Migrar Completamente para Supabase Auth**
```typescript
// Remover tabela Usuario
// Usar apenas Supabase Auth + user_metadata
// Salvar logoPath no Supabase Storage
```

## 📋 **ARQUIVOS AFETADOS**

### **Backend**:
- ✅ `src/controllers/usuario.controller.ts` - Precisa criar usuário se não existe
- ✅ `src/controllers/uploadLogo.ts` - Precisa verificar usuário existe
- ✅ `src/middlewares/auth.middleware.ts` - Já extrai sub correto ✅
- ✅ `src/routes/usuario.routes.ts` - Adicionar rota de sync

### **Frontend**:
- ✅ `src/context/AuthContext.tsx` - Já atualizado ✅
- ✅ `src/app/(main)/usuarios/page.tsx` - Já sincroniza ✅

### **Database**:
- ⚠️ `prisma/schema.prisma` - Pode precisar ajustar constraints

## 🚀 **PRÓXIMOS PASSOS**

1. **Implementar Middleware de Sincronização**
   - Criar função `ensureUserExists()`
   - Chamar em todas requisições autenticadas
   - Criar usuário automaticamente se não existir

2. **Corrigir Upload de Logo**
   - Verificar usuário existe antes de update
   - Criar registro se necessário
   - Retornar erro claro se falhar

3. **Testar Fluxo Completo**
   - Registrar no Supabase
   - Login no sistema
   - Upload de logo
   - Gerar PDF com logo

4. **Adicionar Logs de Debug**
   - Log quando usuário não encontrado
   - Log quando criado automaticamente
   - Log de sincronização

---
**Status**: 🔴 **CRÍTICO** - Logo não persiste, PDF sem logo  
**Impacto**: 🔴 **ALTO** - Funcionalidade core quebrada  
**Prioridade**: 🔴 **URGENTE** - Requer correção imediata