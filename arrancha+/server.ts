import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, runTransaction } from "firebase/database";

// A Vercel costuma executar em UTC. As regras de prazo do quartel seguem o
// horário oficial de Brasília, independentemente do fuso do servidor.
process.env.TZ ||= "America/Sao_Paulo";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDtWsJpYq0ixmdn-kcdVkZy717cYtu6vX4",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "arranchamais1.firebaseapp.com",
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://arranchamais1-default-rtdb.firebaseio.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "arranchamais1",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "arranchamais1.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "1012748557408",
  appId: process.env.FIREBASE_APP_ID || "1:1012748557408:web:ef10fa982dce6300a27705"
};

const firebaseApp = initializeApp(firebaseConfig);
const dbRTDB = getDatabase(firebaseApp);

function cleanTextId(text = ""): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[º°]/g, "").replace(/[^a-z0-9]/g, "");
}

function normalizeReparticao(rep = ""): string {
  const norm = rep.toLowerCase().replace(/°/g, "º").trim();
  if (norm.includes("1º esqd") || norm.includes("1 esqd") || norm.includes("1ºesqd")) return "1º esqd c mec";
  if (norm.includes("2º esqd") || norm.includes("2 esqd") || norm.includes("2ºesqd")) return "2º esqd c mec";
  if (norm.includes("3º esqd") || norm.includes("3 esqd") || norm.includes("3ºesqd")) return "3º esqd c mec";
  if (norm.includes("cap")) return "esqd cap";
  if (norm.includes("fanf")) return "fanfarra";
  if (norm.includes("visit")) return "visitantes";
  return norm;
}

function extractUserPrefixFromIdRegistro(idRegistro = ""): string {
  const match = idRegistro.match(/^(.*)_\d{4}-\d{2}-\d{2}$/);
  return match ? match[1] : idRegistro.split("_")[0];
}

function isSameUser(first: any, second: any): boolean {
  if (!first || !second) return false;
  if (first.id && second.id && first.id === second.id) return true;
  const firstId = cleanTextId(first.id);
  const secondId = cleanTextId(second.id);
  if (firstId && secondId && firstId === secondId) return true;
  const firstLogin = cleanTextId(first.login);
  const secondLogin = cleanTextId(second.login);
  return Boolean(firstLogin && secondLogin && firstLogin === secondLogin);
}

function deduplicateUsers(users: any[]): any[] {
  const result: any[] = [];
  for (const rawUser of users || []) {
    if (!rawUser) continue;
    const user = { ...rawUser, nuc: rawUser.nuc || rawUser.id, nivel: rawUser.nivel || "Militar" };
    const index = result.findIndex(existing => isSameUser(existing, user));
    if (index < 0) result.push(user);
    else {
      const existing = result[index];
      let nivel = user.nivel;
      if (nivel === "Militar" && ["Furriel", "Administrador"].includes(existing.nivel)) nivel = existing.nivel;
      result[index] = { ...existing, ...user, nivel };
    }
  }
  return result;
}

function deduplicateRecords(records: any[]): any[] {
  const byId = new Map<string, any>();
  for (const record of records || []) if (record?.idRegistro) byId.set(record.idRegistro, record);
  return Array.from(byId.values());
}

function valuesAsArray(value: any): any[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value && typeof value === "object") return Object.values(value).filter(Boolean);
  return [];
}

function findUser(users: any[], identity = ""): any | undefined {
  const normalized = cleanTextId(identity);
  return (users || []).find(user => user && (
    user.id === identity || cleanTextId(user.id) === normalized ||
    cleanTextId(user.nuc) === normalized || cleanTextId(user.login) === normalized
  ));
}

function sanitizeUser(user: any): any {
  if (!user) return user;
  const { senha: _senha, ...safeUser } = user;
  return safeUser;
}

// Validação autoritativa: mudar o relógio do celular não contorna o prazo.
function isDateLocked(targetDateStr: string, currentTime = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDateStr)) return true;
  const [year, month, day] = targetDateStr.split("-").map(Number);
  const targetDate = new Date(year, month - 1, day);
  targetDate.setHours(0, 0, 0, 0);
  const today = new Date(currentTime);
  today.setHours(0, 0, 0, 0);
  if (targetDate.getTime() <= today.getTime()) return true;

  const targetDay = targetDate.getDay();
  if ([6, 0, 1].includes(targetDay)) {
    const deadline = new Date(targetDate);
    deadline.setDate(deadline.getDate() - (targetDay === 6 ? 1 : targetDay === 0 ? 2 : 3));
    deadline.setHours(10, 30, 0, 0);
    return currentTime.getTime() >= deadline.getTime();
  }
  const deadline = new Date(targetDate);
  deadline.setDate(deadline.getDate() - 1);
  deadline.setHours(15, 30, 0, 0);
  return currentTime.getTime() >= deadline.getTime();
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT || 3000);
  app.use(express.json({ limit: "15mb" }));

  const dbDirectory = path.join(process.cwd(), "src", "data");
  const dbFile = path.join(dbDirectory, "db.json");
  const emptyDB = { users: [] as any[], records: [] as any[], deletedUsers: [] as string[] };

  const loadLocalDB = () => {
    try {
      if (fs.existsSync(dbFile)) {
        const parsed = JSON.parse(fs.readFileSync(dbFile, "utf8"));
        return {
          users: deduplicateUsers(Array.isArray(parsed.users) ? parsed.users : []),
          records: deduplicateRecords(Array.isArray(parsed.records) ? parsed.records : []),
          deletedUsers: Array.isArray(parsed.deletedUsers) ? parsed.deletedUsers : []
        };
      }
    } catch (error) { console.warn("Não foi possível carregar a cópia local:", error); }
    return { ...emptyDB };
  };

  let memoryDB = loadLocalDB();
  const readDB = () => memoryDB;
  const writeDB = (data: typeof memoryDB) => {
    memoryDB = data;
    if (process.env.NODE_ENV !== "production") {
      try {
        if (!fs.existsSync(dbDirectory)) fs.mkdirSync(dbDirectory, { recursive: true });
        fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), "utf8");
      } catch (error) {
        console.warn("Cópia local não gravada; Firebase segue como fonte oficial.", error);
      }
    }
  };

  const persistUsers = async (users: any[], deletedUsers = readDB().deletedUsers) => {
    const cleanUsers = deduplicateUsers(users);
    await Promise.all([
      set(ref(dbRTDB, "users"), cleanUsers),
      set(ref(dbRTDB, "deletedUsers"), deletedUsers)
    ]);
    writeDB({ ...readDB(), users: cleanUsers, deletedUsers });
    return cleanUsers;
  };

  const patchUser = async (identity: string, updater: (user: any) => any) => {
    const target = findUser(readDB().users, identity);
    if (!target) return undefined;
    const stableKey = cleanTextId(target.id || target.login || target.nuc);
    let savedUser: any;
    await runTransaction(ref(dbRTDB, "users"), currentValue => {
      const currentUsers = deduplicateUsers(valuesAsArray(currentValue));
      const updatedUsers = currentUsers.map(user => {
        if (!isSameUser(user, target)) return user;
        savedUser = updater(user);
        return savedUser;
      });
      return updatedUsers;
    });
    if (!savedUser) return undefined;
    const localUsers = readDB().users.map(user => cleanTextId(user.id || user.login || user.nuc) === stableKey ? savedUser : user);
    writeDB({ ...readDB(), users: deduplicateUsers(localUsers) });
    return savedUser;
  };

  const getCanonicalRecords = async (): Promise<any[]> => {
    try {
      const byIdSnapshot = await get(ref(dbRTDB, "recordsById"));
      let records = byIdSnapshot.exists() ? valuesAsArray(byIdSnapshot.val()) : [];
      if (records.length === 0) {
        const legacySnapshot = await get(ref(dbRTDB, "records"));
        records = legacySnapshot.exists() ? valuesAsArray(legacySnapshot.val()) : [];
      }
      records = deduplicateRecords(records);
      writeDB({ ...readDB(), records });
      return records;
    } catch (error) {
      console.warn("Firebase indisponível; usando última cópia de registros.", error);
      return deduplicateRecords(readDB().records);
    }
  };

  const authenticate = (req: express.Request): any | undefined => {
    const identity = String(req.header("x-arrancha-user") || "");
    const password = String(req.header("x-arrancha-password") || "");
    const user = findUser(readDB().users, identity);
    if (!user || !password || user.senha !== password || user.bloqueado) return undefined;
    return user;
  };
  const requireUser = (req: express.Request, res: express.Response): any | undefined => {
    const user = authenticate(req);
    if (!user) res.status(401).json({ error: "Sessão inválida. Entre novamente." });
    return user;
  };
  const requireAdmin = (req: express.Request, res: express.Response): any | undefined => {
    const user = requireUser(req, res);
    if (user && user.nivel !== "Administrador") {
      res.status(403).json({ error: "Ação exclusiva do Administrador." });
      return undefined;
    }
    return user;
  };

  const syncOnStartup = async () => {
    try {
      const [usersSnapshot, deletedSnapshot, byIdSnapshot, legacySnapshot] = await Promise.all([
        get(ref(dbRTDB, "users")), get(ref(dbRTDB, "deletedUsers")),
        get(ref(dbRTDB, "recordsById")), get(ref(dbRTDB, "records"))
      ]);
      const remoteUsers = usersSnapshot.exists() ? valuesAsArray(usersSnapshot.val()) : [];
      const deletedUsers = deletedSnapshot.exists() ? valuesAsArray(deletedSnapshot.val()).map(String) : readDB().deletedUsers;
      const deletedSet = new Set(deletedUsers.map(cleanTextId));
      const sourceUsers = remoteUsers.length > 0 ? remoteUsers : readDB().users;
      const users = deduplicateUsers(sourceUsers).filter(user =>
        !deletedSet.has(cleanTextId(user.id)) && !deletedSet.has(cleanTextId(user.login))
      );
      let records = byIdSnapshot.exists() ? valuesAsArray(byIdSnapshot.val()) : [];
      if (records.length === 0 && legacySnapshot.exists()) records = valuesAsArray(legacySnapshot.val());
      if (records.length === 0) records = readDB().records;
      records = deduplicateRecords(records);
      writeDB({ users, records, deletedUsers });
      if (!usersSnapshot.exists() && users.length > 0) await set(ref(dbRTDB, "users"), users);
      if (!deletedSnapshot.exists() && deletedUsers.length > 0) await set(ref(dbRTDB, "deletedUsers"), deletedUsers);
      if (!byIdSnapshot.exists() && records.length > 0) {
        await Promise.all(records.map(record => set(ref(dbRTDB, `recordsById/${record.idRegistro}`), record)));
      }
      console.log(`Firebase sincronizado: ${users.length} usuários e ${records.length} registros.`);
    } catch (error) { console.warn("Inicialização sem Firebase; usando cópia local.", error); }
  };

  await syncOnStartup();

  app.get("/api/server-time", (_req, res) => res.json({ now: new Date().toISOString() }));

  app.post("/api/login", async (req, res) => {
    const identifier = String(req.body?.usuario || "").trim();
    const password = String(req.body?.senha || "");
    if (!identifier || !password) return res.status(400).json({ error: "Informe usuário e senha." });
    const normalized = cleanTextId(identifier);
    const exactMatches = readDB().users.filter(user =>
      cleanTextId(user.login) === normalized || cleanTextId(user.id) === normalized || cleanTextId(user.nuc) === normalized
    );
    const candidates = exactMatches.length > 0 ? exactMatches : readDB().users.filter(user => cleanTextId(user.usuario) === normalized);
    if (candidates.length === 0) return res.status(401).json({ error: "Militar não cadastrado." });
    if (candidates.length > 1 && exactMatches.length === 0) {
      return res.status(409).json({ error: "Há mais de um militar com esse nome. Use o login único ou o NUC." });
    }
    const user = candidates.find(candidate => candidate.senha === password);
    if (!user) {
      const identifiable = candidates.length === 1 ? candidates[0] : undefined;
      if (identifiable) {
        const attempts = Number(identifiable.tentativasIncorretas || 0) + 1;
        const blocked = attempts >= 3;
        try {
          await patchUser(identifiable.id, item => ({
            ...item,
            tentativasIncorretas: Number(item.tentativasIncorretas || 0) + 1,
            bloqueado: blocked,
            dataBloqueio: blocked ? new Date().toISOString() : item.dataBloqueio
          }));
        } catch (error) { console.error("Falha ao registrar tentativa:", error); }
        if (blocked) return res.status(423).json({ error: "Conta bloqueada após 3 tentativas. Procure o Administrador." });
      }
      return res.status(401).json({ error: "Senha incorreta." });
    }
    if (user.bloqueado) return res.status(423).json({ error: "Conta bloqueada. Procure o Administrador." });
    let loggedUser = user;
    if (user.tentativasIncorretas) {
      try {
        loggedUser = await patchUser(user.id, item => ({ ...item, tentativasIncorretas: 0, bloqueado: false })) || user;
      } catch (error) { console.error("Falha ao zerar tentativas:", error); }
    }
    return res.json(loggedUser);
  });

  app.get("/api/users", (req, res) => {
    const requester = requireUser(req, res);
    if (!requester) return;
    if (requester.nivel === "Administrador") return res.json(readDB().users);
    if (requester.nivel === "Furriel") {
      return res.json(readDB().users
        .filter(user => normalizeReparticao(user.reparticao) === normalizeReparticao(requester.reparticao))
        .map(user => isSameUser(user, requester) ? user : sanitizeUser(user)));
    }
    return res.json([requester]);
  });

  app.post("/api/users", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const newUser = req.body;
    if (!newUser || Array.isArray(newUser) || !newUser.id || !newUser.usuario) return res.status(400).json({ error: "Cadastro inválido." });
    if (!newUser.login || !newUser.senha || !["Militar", "Furriel", "Administrador"].includes(newUser.nivel)) {
      return res.status(400).json({ error: "Informe login, senha e nível de acesso válidos." });
    }
    if (findUser(readDB().users, newUser.id) || (newUser.login && findUser(readDB().users, newUser.login))) {
      return res.status(409).json({ error: "Já existe usuário com esse ID ou login." });
    }
    const deleted = readDB().deletedUsers.filter(id =>
      ![newUser.id, newUser.login, newUser.usuario].map(cleanTextId).includes(cleanTextId(id)));
    try {
      const users = await persistUsers([...readDB().users, newUser], deleted);
      return res.status(201).json(findUser(users, newUser.id));
    } catch (error) {
      console.error("Falha ao cadastrar:", error);
      return res.status(503).json({ error: "Não foi possível salvar no Firebase." });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    const requester = requireUser(req, res);
    if (!requester) return;
    const target = findUser(readDB().users, req.params.id);
    if (!target) return res.status(404).json({ error: "Usuário não encontrado." });
    const ownProfile = isSameUser(requester, target);
    if (!ownProfile && requester.nivel !== "Administrador") return res.status(403).json({ error: "Sem permissão." });
    const allowedOwnFields = new Set(["senha", "trocarSenhaNoPrimeiroAcesso"]);
    const protectedFields = new Set(["id", "nuc", "login"]);
    const patch: Record<string, any> = {};
    for (const [key, value] of Object.entries(req.body || {})) {
      if (!protectedFields.has(key) && (requester.nivel === "Administrador" || (ownProfile && allowedOwnFields.has(key)))) patch[key] = value;
    }
    if (Object.keys(patch).length === 0) return res.status(400).json({ error: "Nenhum campo permitido." });
    if (target.nivel === "Administrador" && patch.nivel && patch.nivel !== "Administrador" &&
        readDB().users.filter(user => user.nivel === "Administrador").length <= 1) {
      return res.status(409).json({ error: "O sistema precisa manter pelo menos um Administrador." });
    }
    try {
      const savedUser = await patchUser(target.id, user => ({ ...user, ...patch }));
      return res.json(savedUser);
    } catch (error) {
      console.error("Falha ao atualizar:", error);
      return res.status(503).json({ error: "Não foi possível salvar no Firebase." });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const target = findUser(readDB().users, req.params.id);
    if (!target) return res.status(404).json({ error: "Usuário não encontrado." });
    if (target.nivel === "Administrador" && readDB().users.filter(user => user.nivel === "Administrador").length <= 1) {
      return res.status(409).json({ error: "O sistema precisa manter pelo menos um Administrador." });
    }
    const keys = [target.id, target.login, target.usuario].filter(Boolean).map(cleanTextId);
    const deletedUsers = Array.from(new Set([...readDB().deletedUsers, ...keys]));
    try {
      await persistUsers(readDB().users.filter(user => !isSameUser(user, target)), deletedUsers);
      const records = await getCanonicalRecords();
      const prefixes = new Set([cleanTextId(target.id), cleanTextId(target.login)]);
      const toDelete = records.filter(record => prefixes.has(extractUserPrefixFromIdRegistro(record.idRegistro)));
      await Promise.all(toDelete.map(record => set(ref(dbRTDB, `recordsById/${record.idRegistro}`), null)));
      writeDB({ ...readDB(), records: records.filter(record => !toDelete.some(item => item.idRegistro === record.idRegistro)) });
      return res.json({ success: true, deletedId: target.id });
    } catch (error) {
      console.error("Falha ao excluir:", error);
      return res.status(503).json({ error: "Não foi possível concluir a exclusão." });
    }
  });

  app.get("/api/records", async (req, res) => {
    const requester = requireUser(req, res);
    if (!requester) return;
    const records = await getCanonicalRecords();
    if (requester.nivel === "Administrador") return res.json(records);
    if (requester.nivel === "Furriel") return res.json(records.filter(record =>
      normalizeReparticao(record.reparticao) === normalizeReparticao(requester.reparticao)));
    const prefixes = new Set([cleanTextId(requester.id), cleanTextId(requester.login)]);
    return res.json(records.filter(record => prefixes.has(extractUserPrefixFromIdRegistro(record.idRegistro))));
  });

  app.put("/api/records/:userId/:date", async (req, res) => {
    const requester = requireUser(req, res);
    if (!requester) return;
    const target = findUser(readDB().users, req.params.userId);
    if (!target) return res.status(404).json({ error: "Militar não encontrado." });
    if (!isSameUser(requester, target) && requester.nivel !== "Administrador") {
      return res.status(403).json({ error: "Você só pode alterar o próprio arranchamento." });
    }
    if (isDateLocked(req.params.date)) return res.status(409).json({ error: "Prazo encerrado para essa data." });
    const closedSnapshot = await get(ref(dbRTDB, `closures/${req.params.date}`));
    if (closedSnapshot.exists()) return res.status(409).json({ error: "O vale diário desta data já foi fechado." });
    const userPrefix = cleanTextId(target.id || target.login || target.usuario);
    const idRegistro = `${userPrefix}_${req.params.date}`;
    const record = {
      idRegistro, usuario: target.usuario, reparticao: target.reparticao, dataRegistro: req.params.date,
      cafe: Boolean(req.body?.cafe), almoco: Boolean(req.body?.almoco), jantar: Boolean(req.body?.jantar)
    };
    try {
      await runTransaction(ref(dbRTDB, `recordsById/${idRegistro}`), () => record);
      const localRecords = readDB().records.filter(item => item.idRegistro !== idRegistro);
      writeDB({ ...readDB(), records: [...localRecords, record] });
      return res.json(record);
    } catch (error) {
      console.error("Falha ao salvar arranchamento:", error);
      return res.status(503).json({ error: "Não foi possível salvar no Firebase." });
    }
  });

  app.post("/api/records", (_req, res) => res.status(410).json({ error: "Atualize a página. A gravação agora é individual." }));

  app.get("/api/closures/:date", async (req, res) => {
    const requester = requireUser(req, res);
    if (!requester) return;
    if (!["Administrador", "Furriel"].includes(requester.nivel)) return res.status(403).json({ error: "Sem permissão." });
    const snapshot = await get(ref(dbRTDB, `closures/${req.params.date}`));
    if (!snapshot.exists()) return res.status(404).json({ error: "Vale ainda não fechado." });
    const closure = snapshot.val();
    if (requester.nivel === "Furriel") closure.records = valuesAsArray(closure.records).filter((record: any) =>
      normalizeReparticao(record.reparticao) === normalizeReparticao(requester.reparticao));
    return res.json(closure);
  });

  app.post("/api/closures/:date", async (req, res) => {
    const requester = requireAdmin(req, res);
    if (!requester) return;
    if (!isDateLocked(req.params.date)) return res.status(409).json({ error: "Feche o vale somente depois do prazo." });
    const existing = await get(ref(dbRTDB, `closures/${req.params.date}`));
    if (existing.exists()) return res.json(existing.val());
    const records = (await getCanonicalRecords()).filter(record => record.dataRegistro === req.params.date);
    const closure = { date: req.params.date, closedAt: new Date().toISOString(), closedBy: requester.id, records };
    await set(ref(dbRTDB, `closures/${req.params.date}`), closure);
    return res.status(201).json(closure);
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) res.sendFile(indexPath);
      else res.status(404).send("Application index.html not found. Please run build first.");
    });
  }
  if (!process.env.VERCEL) {
    app.listen(port, "0.0.0.0", () => console.log(`Server running on http://0.0.0.0:${port}`));
  }

  return app;
}

const appPromise = startServer();

appPromise.catch(error => {
  console.error("Falha ao iniciar o servidor:", error);
  process.exitCode = 1;
});

const app = await appPromise;

export default app;
