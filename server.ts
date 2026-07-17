import express from "express";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  const DB_DIR = path.join(process.cwd(), "src", "data");
  const DB_FILE = path.join(DB_DIR, "db.json");

  // Default initial seed data matching storage.ts
  const DEFAULT_DB = {
    users: [
      {
        id: "marcos_simas",
        usuario: "Marcos Simas",
        reparticao: "Esqd Cmdo Apoio",
        senha: "123",
        nivel: "Administrador",
        graduacao: "1º Ten"
      },
      {
        id: "carlos_silva",
        usuario: "Carlos Silva",
        reparticao: "1º Esqd",
        senha: "123",
        nivel: "Furriel",
        graduacao: "Cb"
      },
      {
        id: "sd_gomes",
        usuario: "Sd Gomes",
        reparticao: "2º Esqd",
        senha: "123",
        nivel: "Militar",
        graduacao: "Sd"
      },
      {
        id: "sd_santos",
        usuario: "Sd Santos",
        reparticao: "Fanfarra",
        senha: "123",
        nivel: "Militar",
        graduacao: "Sd"
      }
    ],
    records: [] as any[]
  };

  // Ensure database directory exists and database file is initialized
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    // Generate dates relative to today
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    
    DEFAULT_DB.records = [
      {
        idRegistro: "marcos_simas_" + today,
        usuario: "Marcos Simas",
        reparticao: "Oficiais",
        dataRegistro: today,
        cafe: true,
        almoco: true,
        jantar: true
      },
      {
        idRegistro: "carlos_silva_" + today,
        usuario: "Carlos Silva",
        reparticao: "St/Sgt",
        dataRegistro: today,
        cafe: true,
        almoco: true,
        jantar: false
      },
      {
        idRegistro: "sd_gomes_" + today,
        usuario: "Sd Gomes",
        reparticao: "2º Esqd",
        dataRegistro: today,
        cafe: false,
        almoco: true,
        jantar: true
      },
      {
        idRegistro: "marcos_simas_" + tomorrow,
        usuario: "Marcos Simas",
        reparticao: "Oficiais",
        dataRegistro: tomorrow,
        cafe: true,
        almoco: true,
        jantar: false
      },
      {
        idRegistro: "sd_santos_" + tomorrow,
        usuario: "Sd Santos",
        reparticao: "Fanfarra",
        dataRegistro: tomorrow,
        cafe: true,
        almoco: true,
        jantar: true
      }
    ];
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
  }

  // Helper function to read/write DB
  const readDB = () => {
    try {
      if (fs.existsSync(DB_FILE)) {
        return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
      }
    } catch (e) {
      console.error("Error reading database", e);
    }
    return DEFAULT_DB;
  };

  const writeDB = (data: any) => {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
    } catch (e) {
      console.error("Error writing database", e);
    }
  };

  // API Routes
  app.get("/api/users", (req, res) => {
    const db = readDB();
    res.json(db.users || []);
  });

  app.post("/api/users", (req, res) => {
    const newUsers = req.body;
    if (Array.isArray(newUsers)) {
      const db = readDB();
      db.users = newUsers;
      writeDB(db);
      res.json({ success: true, count: newUsers.length });
    } else {
      res.status(400).json({ error: "Body must be an array of users" });
    }
  });

  app.get("/api/records", (req, res) => {
    const db = readDB();
    res.json(db.records || []);
  });

  app.post("/api/records", (req, res) => {
    const newRecords = req.body;
    if (Array.isArray(newRecords)) {
      const db = readDB();
      db.records = newRecords;
      writeDB(db);
      res.json({ success: true, count: newRecords.length });
    } else {
      res.status(400).json({ error: "Body must be an array of records" });
    }
  });

  // Vite development vs production asset handling
  const isProd = process.env.NODE_ENV === "production" || fs.existsSync(path.join(process.cwd(), "dist", "index.html"));

  if (!isProd) {
    console.log("Iniciando em modo de DESENVOLVIMENTO (Vite middleware)...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Iniciando em modo de PRODUÇÃO (servindo arquivos estáticos de /dist)...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
