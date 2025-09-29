// =============================================================================
// SUPABASE ADMIN CLIENT - Para sincronização de dados entre backend e Supabase
// =============================================================================

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase Admin Client
const supabaseUrl = process.env.SUPABASE_URL || 'https://oxihpwafxypexikipxcw.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Cliente Admin com privilégios elevados
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Sincroniza dados do usuário com Supabase Auth metadata
 */
export async function syncUserMetadata(userId: string, userData: any) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          nome: userData.nome,
          telefone: userData.telefone,
          endereco: userData.endereco,
          bairro: userData.bairro,
          numero: userData.numero,
          cidade: userData.cidade,
          CEP: userData.CEP,
          UF: userData.UF,
          avatar: userData.avatar,
          logo: userData.logo,
        }
      }
    );

    if (error) {
      console.error('Erro ao sincronizar metadata com Supabase:', error);
      return false;
    }

    console.log('Metadata sincronizada com sucesso para usuário:', userId);
    return true;
  } catch (error) {
    console.error('Erro na sincronização com Supabase:', error);
    return false;
  }
}

/**
 * Busca dados do usuário no Supabase Auth
 */
export async function getSupabaseUser(userId: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (error) {
      console.error('Erro ao buscar usuário no Supabase:', error);
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}
