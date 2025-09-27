
import fs from "fs";
import path from "path";
import { connectToDatabase } from "../../../lib/mongodb";
import { v4 as uuidv4 } from "uuid";
const DB_FILE = path.join(process.cwd(), "data", "db.json");
function ensureLocalDB() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ entries: [] }, null, 2));
}
export default async function handler(req, res) {
  const { method } = req;
  if (method === "GET") {
    const { season, day } = req.query;
    const dbconn = await connectToDatabase();
    if (dbconn.fallback) {
      ensureLocalDB();
      const raw = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
      const entries = raw.entries.filter(e => e.season === season && e.day === day);
      return res.status(200).json({ entries });
    } else {
      const { db } = dbconn;
      const entries = await db.collection("entries").find({ season, day }).toArray();
      return res.status(200).json({ entries });
    }
  } else if (method === "POST") {
    const { season, day, name, total } = req.body;
    if (!season || !day || !name) return res.status(400).json({ error: "missing fields" });
    const entry = { id: uuidv4(), season, day, name, total: total || 12, progress: 0, createdAt: new Date().toISOString() };
    const dbconn = await connectToDatabase();
    if (dbconn.fallback) {
      ensureLocalDB();
      const raw = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
      raw.entries.push(entry);
      fs.writeFileSync(DB_FILE, JSON.stringify(raw, null, 2));
      return res.status(201).json({ entry });
    } else {
      const { db } = dbconn;
      await db.collection("entries").insertOne(entry);
      return res.status(201).json({ entry });
    }
  } else {
    res.setHeader("Allow", ["GET","POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
