import express from "express";        // Importando o express
import cors from "cors";              // Importando o cors
import dotenv from "dotenv";          // Importando o dotenv

dotenv.config();                      // Configurando o dotenv

const app = express();                // Inicializando o express
app.use(cors());                      // Utilizando o cors
app.use(express.json());              // Utilizando o express.json

app.get("/", (req, res) => {          // Rota raiz
  res.send("API do Micro SaaS de Orçamentos está rodando!");
});

const PORT = process.env.PORT || 5000; // Porta do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
