
import React, { useEffect, useState } from "react";
const SEASONS = ["Summer","Fall","Winter","Spring"];
export default function SeasonToggle({ season, setSeason }) {
  const [active, setActive] = useState(season);
  useEffect(()=> setActive(season), [season]);
  const click = (s) => {
    setActive(s);
    try { localStorage.setItem("season", s); } catch(e){}
    setSeason(s);
  };
  return (
    <div className="season-toggle">
      {SEASONS.map(s => (
        <button key={s} className={s===active ? "active" : ""} onClick={()=>click(s)}>{s}</button>
      ))}
      <style jsx>{`
        .season-toggle{ display:flex; gap:10px; align-items:center; }
        button{
          padding:8px 14px; border-radius:22px; border:none; background:transparent; color:var(--muted);
          font-weight:700; cursor:pointer; transition:all .14s ease; box-shadow:none;
        }
        button:hover{ transform:translateY(-2px); color:var(--text); background:rgba(255,255,255,0.03); }
        button.active{ background: linear-gradient(135deg,#6d28d9,#7c3aed); color:#fff; box-shadow:0 6px 18px rgba(99,102,241,0.18); }
      `}</style>
    </div>
  );
}
