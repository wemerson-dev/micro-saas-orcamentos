# 🐛 BUG REPORT - PERFIL DE USUÁRIO SOBRESCRITO

## ❌ **PROBLEMA IDENTIFICADO**

**Bug**: Após editar o perfil do usuário, os dados alterados são **sobrescritos** pelos dados originais no próximo login.

## 🔍 **DIAGNÓSTICO TÉCNICO**

### **Arquitetura Problemática Atual**:
```
Frontend (React)
    ↓
AuthContext (Supabase) ← ❌ Dados NÃO atualizados após edição
    ↓
Backend Express ← ✅ Dados corretos salvos aqui
```

### **Fluxo do Bug**:
1. ✅ Usuário edita perfil → `handleSave()` → Salva no **backend Express**
2. ✅ Dados atualizados corretamente no banco/backend
3. ❌ Usuário faz login → `AuthContext` → Pega dados do **Supabase user**
4. ❌ Dados do Supabase (desatualizados) sobrescrevem os dados editados

### **Evidências do Código**:

**1. Perfil salvo no backend Express**:
```typescript
// usuarios/page.tsx - linha ~300
await axios.put(`${apiUrl}/usuario/perfil`, formData, {
  headers: { Authorization: `Bearer ${token}` }
})
// ✅ Dados salvos no backend
```

**2. AuthContext pega dados do Supabase**:
```typescript
// AuthContext.tsx - linha ~40
setUser(session?.user ?? null); 
// ❌ session.user vem do Supabase, não do backend
```

**3. LoadUserData busca do backend**:
```typescript
// usuarios/page.tsx - linha ~150
const response = await axios.get(`${apiUrl}/usuario/perfil`, {
  headers: { Authorization: `Bearer ${token}` }
})
// ✅ Dados corretos vindos do backend
```

## 🔧 **SOLUÇÕES POSSÍVEIS**

### **Opção 1: Sincronizar Supabase com Backend (Recomendada)**
```typescript
// Após salvar no backend, atualizar também o Supabase
const handleSave = async () => {
  // 1. Salvar no backend Express
  await axios.put(`${apiUrl}/usuario/perfil`, formData)
  
  // 2. Sincronizar com Supabase user metadata
  await supabase.auth.updateUser({
    data: {
      nome: formData.nome,
      telefone: formData.telefone,
      // ... outros campos
    }
  })
}
```

### **Opção 2: AuthContext Buscar Dados do Backend**
```typescript
// AuthContext não usar session.user, mas buscar do backend
useEffect(() => {
  if (session?.access_token) {
    // Buscar dados completos do backend
    fetchUserProfile(session.access_token)
  }
}, [session])
```

### **Opção 3: Migrar Completamente para Supabase**
```typescript
// Abandonar backend Express para dados de perfil
// Usar apenas Supabase para tudo
```

## 🎯 **SOLUÇÃO RECOMENDADA**

**Implementar Opção 1**: **Sincronização Bidirecional**

### **Vantagens**:
- ✅ Mantém arquitetura atual
- ✅ Dados sempre sincronizados
- ✅ Funciona tanto com backend quanto com Supabase
- ✅ Compatível com sistema existente

### **Implementação**:
1. **Ao salvar perfil**: Atualizar backend + Supabase
2. **No AuthContext**: Priorizar dados do backend se disponíveis
3. **Fallback**: Usar Supabase se backend não responder

## 📋 **ARQUIVOS AFETADOS**

- ✅ `src/app/(main)/usuarios/page.tsx` - Função `handleSave()`
- ✅ `src/context/AuthContext.tsx` - Lógica de carregamento de dados
- ✅ Possíveis outros componentes que usam dados do usuário

## 🚀 **STATUS**

**Severidade**: 🔴 **Alta** (dados perdidos)  
**Impacto**: 🔴 **Alto** (experiência ruim do usuário)  
**Complexidade**: 🟡 **Média** (sincronização)  

---
**Next Step**: Implementar sincronização bidirecional entre backend e Supabase