import express from "express";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import admin from 'firebase-admin'; // Import Firebase Admin SDK

// === Firebase Admin Initialization ===
const serviceAccount = {
  "type": "service_account",
  "project_id": "artistas-5de5a",
  "private_key_id": "b35da35f451b1a410823ea5b47bf79af7648e9aa",
  "private_key": "-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCwo1wROwTxe47h
m/1qb1M3t2ZyEHVJE2fXnE8RSUV2DHEvUVSAd+uTWR+Cr7uvZIqDCDOokMi8hky4
7FhnG76QLK2zPsdg+brWQyLs/tUD95uVy8YgFG6hZW+l0c+zHeOD6DIUx+zxG9bq
REhfBw8AF+dIsrHD/X9pBqm828rrVC7qjIdt2OnRiNinFtxuscVWa19v0W/BlHE2
1tK4bVG1MS4yMuZz3BNWwXVnPtwn4xwJ9VokZYquG9RMSsNHX5bkBG9w18hoi4vV
ArfArqRF+i2Wi6/KJP5FPdaCcVi/kSF7oQAdbi0wVM5tJYxYkYexeZhuR8aYzi6b
TNnrW3r/AgMBAAECggEAM0hKS4paBg38To3uRf9qJqvtZ0JV+tBSfquX3Qnry7kT
B0zSfrXSRCZE2rlQgTxsZlx0OwVF8k3/alTb2ZuZeNwv1fFtCz+Vue0l766Qg6VY
m2Xc8KVd9SexAXBnn7YWvs4j9BqTNPEDNWJ7rHMtLLbD5DxVFfS8D+7qSrV5NVbw
zL3J1m249tzqff0xpTOi/Ce9aKETprEEX/PL30DCUnecqMpmIwUwknhprQnq/gGz
qlMtPtwYOUkzcNdRCXuvD74ygCEr//xYNAiUU5A8W/CL5+2RUEomhayHf9lgV8Ba
wy+/bRyNQo8u7XuDBOtIfWvpZHCmtDph6bHrKVkSKQKBgQDiVH4MRuDiUsLyhZkA
slAKVh90JsJiG8VlHXheq1QuBVQYCCaYnyZBBiAjs7Oa8vGWrOpGmsZ//DBPBiuy
VNAkYBSmX2gPjk6jFrHgmfrFMxF4BJeYEm6mT6cXi+4wELADl53SSC3HFbguKiHA
Pj1jeKGp1/jcSoRm1r83bQWmTQKBgQDHyzwLO/bCXwkLwEXuwVss817UIAeAZC6P
cWZd8dSswk+K+KtFS4lcFLC1jheIFiL4jDCwBvIpt1Kxog9FrbsE8vlEgmRTBrbO
EkZy2+M+9lHASXsXrd7pYO29pxrsf8ds0kJMsx4cksFPYJ9WuCxue1SeMP6rmICe
h0wBW6jkewKBgFmFVf4BIv4iAh3vHd+ap/IOso48rnIjzeX6zBuV5Mv3K5X901ZW
zMi3ZYr5jzbglRIl/txCZ/VDiNAY/rugtFtO7ZwI7J4KiawUU/MktH2/f09bcaKi
18VMiCjWHjZAw34IQFJmXkT6oEkSPRtPAvUPR9JoLHTlvIz4r9V6d9uZAoGAAoSj
OxkEYSrFeGpx9zJkrcpbdZz5uzqIA7LQMXrszUidrAi6T+NF1e1E1OT3kvWEd1F9
A5ryzmfLGQYL3zrzUnqlfaGPFiTNhQdh7+ypjo+YNC446PF+D77zACLtCfIKV2rG
/yR6yq1m1lNHbtZfaP0Q8fV4ID2J0XWvFY1MMaUCgYEAmmorbs6t0aADeCm7/Mrk
CBSNfJMyAYNfhero1zzJYG5yDovzPWj1ockS6IxsoEqbIRsNnAxawgU/9vgOUOB1
cII7ixhLWZFXD1NqFcyscCTuAIqS2sZVcpYSR2irt2eu/keTTZa+q9y5QIwlceUl
Q0UQ5pwPPkfvWgiFoIchWE0=
-----END PRIVATE KEY-----
", // Note: Escaped newlines
  "client_email": "firebase-adminsdk-fbsvc@artistas-5de5a.iam.gserviceaccount.com",
  "client_id": "111293453815235852730",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40artistas-5de5a.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
} as admin.ServiceAccount; // Cast to the correct type

try {
  if (!admin.apps.length) { // Check if app is already initialized
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin SDK inicializado correctamente.');
  } else {
    console.log('ℹ️ Firebase Admin SDK ya estaba inicializado.');
  }
} catch (error) {
  console.error('❌ Error inicializando Firebase Admin SDK:', error);
  // Decide if you want to exit the process or handle the error differently
  // process.exit(1);
}

// Export the admin instance or Firestore instance if needed elsewhere
export const dbAdmin = admin.firestore(); 
// === End Firebase Admin Initialization ===

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client/dist')));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Consider restricting this in production
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Manejo de errores simple
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).send('Error interno del servidor');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const startServer = async () => {
  try {
    const server = await registerRoutes(app);

    // Setup Vite en desarrollo
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    }

    server.listen(port, '0.0.0.0', () => {
      console.log(`⚡ Servidor iniciado en http://0.0.0.0:${port}`);
      console.log('Ambiente:', process.env.NODE_ENV);
    });

    server.on('error', (error: any) => {
      console.error('Error del servidor:', error);
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
