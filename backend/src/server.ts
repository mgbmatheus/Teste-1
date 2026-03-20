import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { initDatabase } from './database/connection.js';
import municipioRoutes from './routes/municipio.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', municipioRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
  await initDatabase();
  app.listen(config.port, () => {
    console.log(`[iPax] Backend rodando na porta ${config.port}`);
    console.log(`[iPax] API Key configurada: ${config.anthropicApiKey ? 'Sim' : 'Não'}`);
  });
}

start().catch(console.error);
