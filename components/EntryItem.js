
import React, { useState } from "react";
export default function EntryItem({ entry, onChange }) {
  const [progress, setProgress] = useState(entry.progress || 0);
  const [total, setTotal] = useState(entry.total || 12);
  const [editingTotal, setEditingTotal] = useState(false);
  const patch = async (updates) => {
    await fetch(`/api/entries/${entry.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify(updates) });
    if(onChange) onChange();
  };
const inc = () => {
  if (Number(progress) < Number(total)) {
    const next = Number(progress) + 1;
    setProgress(next);
    patch({ progress: next });
  }
};
  const dec = () => { const next = Math.max(0, Number(progress)-1); setProgress(next); patch({ progress: next }); };
  const setNewTotal = async ()=>{ setEditingTotal(false); await patch({ total: Number(total)||1 }); };
  const remove = async ()=>{ if(!confirm("Delete this entry?")) return; await fetch(`/api/entries/${entry.id}`, { method:"DELETE" }); if(onChange) onChange(); };
  const pct = Math.round((Number(progress) / Math.max(1, Number(total))) * 100);
  return (
    <div className="entry-row">
      <div className="entry-left">
        <div className="name">{entry.name}</div>
        <div className="progress-wrap">
          <div className="meta">{progress} / {total} • {pct}%</div>
          <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}}/></div>
        </div>
      </div>
      <div className="entry-actions">
        <button className="small" onClick={dec}>−</button>
        <button className="small primary" onClick={inc}>+</button>
        {editingTotal ? (
          <>
            <input type="number" value={total} onChange={e=>setTotal(e.target.value)} min="1" />
            <button className="small" onClick={setNewTotal}>Set</button>
          </>
        ) : (
          <>
            <button className="small" onClick={()=>setEditingTotal(true)}>Set total</button>
            <button className="small danger" onClick={remove}>Delete</button>
          </>
        )}
      </div>
      <style jsx>{`
        .entry-row{ display:flex; gap:12px; align-items:center; justify-content:space-between; padding:12px; border-radius:10px; background: rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.03); }
        .entry-left{ flex:1; }
        .name{ font-weight:700; color:var(--text); }
        .meta{ font-size:13px; color:var(--muted); margin-top:6px; }
        .progress-wrap{ margin-top:6px; }
        .progress-bar{ height:8px; background: rgba(255,255,255,0.04); border-radius:999px; overflow:hidden; margin-top:6px; }
        .progress-fill{ height:100%; background: linear-gradient(90deg,#06b6d4,#3b82f6); width:0%; transition:width .18s ease; }
        .entry-actions{ display:flex; gap:8px; align-items:center; }
        button.small{ padding:8px 10px; border-radius:8px; border:none; background:transparent; color:var(--text); cursor:pointer; font-weight:700; }
        button.primary{ background: linear-gradient(90deg,#06b6d4,#3b82f6); color:white; }
        button.danger{ background: linear-gradient(90deg,#ef4444,#dc2626); color:white; }
        input{ width:72px; padding:6px 8px; border-radius:8px; border:1px solid rgba(255,255,255,0.04); background:transparent; color:var(--text); }
      `}</style>
    </div>
  );
}
