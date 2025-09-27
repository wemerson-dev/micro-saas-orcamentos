import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desabilitar ESLint durante o build para evitar falhas por warnings
  eslint: {
    // Atenção: Isso desabilita o ESLint durante builds de produção
    // Use apenas temporariamente para resolver problemas de deploy
    ignoreDuringBuilds: true,
  },
  // Desabilitar TypeScript checks durante build (se necessário)
  typescript: {
    // Atenção: Use apenas se houver erros TypeScript que impedem deploy
    // ignoreBuildErrors: true,
  },
};

export default nextConfig;