import fs from "fs";
import path from "path";
import { connectToDatabase } from "../../../lib/mongodb";
import { v4 as uuidv4 } from "uuid";
const DB_FILE = path.join(process.cwd(), "data", "db.json");
const CURRENT_YEAR = new Date().getFullYear();
function ensureLocalDB() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ entries: [] }, null, 2));
}
export default async function handler(req, res) {
  const { method } = req;
  if (method === "GET") {
    const { season, day } = req.query;
    const year = Number(req.query.year || CURRENT_YEAR);
    if (!Number.isInteger(year)) return res.status(400).json({ error: "invalid year" });
    const startDate = new Date(Date.UTC(year, 0, 1)).toISOString();
    const endDate = new Date(Date.UTC(year + 1, 0, 1)).toISOString();
    const dbconn = await connectToDatabase();
    if (dbconn.fallback) {
      ensureLocalDB();
      const raw = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
      const entries = raw.entries.filter(e => e.season === season && e.day === day && Number(e.year ?? e.createdAt?.slice(0, 4) ?? CURRENT_YEAR) === year);
      return res.status(200).json({ entries });
    } else {
      const { db } = dbconn;
      const yearConditions = [
        { year },
        { year: { $exists: false }, createdAt: { $gte: startDate, $lt: endDate } }
      ];
      if (year === CURRENT_YEAR) yearConditions.push({ year: { $exists: false }, createdAt: { $exists: false } });
      const entries = await db.collection("entries").find({ season, day, $or: yearConditions }).toArray();
      return res.status(200).json({ entries });
    }
  } else if (method === "POST") {
    const { year, season, day, name, total } = req.body;
    const entryYear = Number(year || CURRENT_YEAR);
    if (!season || !day || !name || !Number.isInteger(entryYear)) return res.status(400).json({ error: "missing or invalid fields" });
    const entry = { id: uuidv4(), year: entryYear, season, day, name, total: total || 12, progress: 0, createdAt: new Date().toISOString() };
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
