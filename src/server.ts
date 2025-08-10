import express from "express";        // Importando o express
import cors from "cors";              // Importando o cors
import path from "path";
import 'dotenv/config';
import usuarioRoutes from "./routes/usuario.routes"; // Importando as rotas de usuário
import clienteRoutes from "./routes/cliente.routes"; // Importando as rotas de cliente
import  orcamentoRoutes  from "./routes/orcamentos.routes"; // Importando as rotas de orçamento

const app = express();                // Inicializando o express
app.use(cors());                      // Utilizando o cors
app.use(express.json());              // Utilizando o express.json

// Servir arquivos estáticos da pasta de uploads para uso público (ex.: logos)
const uploadsDir = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsDir));

app.use("/usuario", usuarioRoutes);   // Utilizando as rotas de usuário
app.use("/cliente", clienteRoutes);   // Utilizando as rotas de cliente
app.use("/orcamento", orcamentoRoutes); // Utilizando as rotas de orçamento

app.get("/", (req, res) => {          // Rota raiz
  res.send("API do Micro SaaS de Orçamentos está rodando!");
});

const PORT = process.env.PORT || 5000; // Porta do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
