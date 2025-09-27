
import fs from "fs";
import path from "path";
import { connectToDatabase } from "../../../lib/mongodb";
const DB_FILE = path.join(process.cwd(), "data", "db.json");
function ensureLocalDB() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ entries: [] }, null, 2));
}
export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;
  if (method === "PATCH") {
    const updates = req.body;
    const dbconn = await connectToDatabase();
    if (dbconn.fallback) {
      ensureLocalDB();
      const raw = JSON.parse(fs.readFileSync(DB_FILE,"utf8"));
      const idx = raw.entries.findIndex(e => e.id === id);
      if (idx === -1) return res.status(404).json({ error: "not found" });
      raw.entries[idx] = { ...raw.entries[idx], ...updates };
      fs.writeFileSync(DB_FILE, JSON.stringify(raw,null,2));
      return res.status(200).json({ entry: raw.entries[idx] });
    } else {
      const { db } = dbconn;
      await db.collection("entries").updateOne({ id }, { $set: updates });
      const entry = await db.collection("entries").findOne({ id });
      return res.status(200).json({ entry });
    }
  } else if (method === "DELETE") {
    const dbconn = await connectToDatabase();
    if (dbconn.fallback) {
      ensureLocalDB();
      const raw = JSON.parse(fs.readFileSync(DB_FILE,"utf8"));
      const idx = raw.entries.findIndex(e => e.id === id);
      if (idx === -1) return res.status(404).json({ error: "not found" });
      const [removed] = raw.entries.splice(idx,1);
      fs.writeFileSync(DB_FILE, JSON.stringify(raw,null,2));
      return res.status(200).json({ entry: removed });
    } else {
      const { db } = dbconn;
      await db.collection("entries").deleteOne({ id });
      return res.status(200).json({ success: true });
    }
  } else {
    res.setHeader("Allow", ["PATCH","DELETE"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
