
import React, { useState } from "react";
export default function AddEntryForm({ season, day, onAdd }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [total, setTotal] = useState(12);
  const [loading, setLoading] = useState(false);
  async function submit(e){ e.preventDefault(); if(!name.trim()) return; setLoading(true);
    await fetch("/api/entries", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ season, day, name: name.trim(), total: Number(total)||12 }) });
    setName(""); setTotal(12); setOpen(false); setLoading(false); if(onAdd) onAdd();
  }
  return (
    <div className="add-entry">
      <button className="add-btn" onClick={()=>setOpen(v=>!v)}>{open ? "Close" : "Add"}</button>
      {open && (
        <form className="form" onSubmit={submit}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Add item name..." />
          <input value={total} onChange={e=>setTotal(e.target.value)} type="number" min="1" />
          <div className="actions">
            <button type="submit" className="save" disabled={loading}>{loading ? "Adding..." : "Add"}</button>
          </div>
        </form>
      )}
      <style jsx>{`
        .add-btn { padding:8px 12px; border-radius:10px; background:transparent; color:var(--text); border:1px solid rgba(255,255,255,0.06); }
        .form{ display:flex; gap:8px; margin-top:10px; align-items:center; }
        input{ padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.04); background:transparent; color:var(--text); }
        input[type="number"]{ width:80px; }
        .save{ padding:8px 12px; border-radius:10px; background:linear-gradient(135deg,#06b6d4,#3b82f6); color:white; border:none; font-weight:700; }
      `}</style>
    </div>
  );
}
