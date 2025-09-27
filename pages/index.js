
import React, { useEffect, useState } from "react";
import SeasonToggle from "../components/SeasonToggle";
import DayColumn from "../components/DayColumn";
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
export default function Home() {
  const [season, setSeason] = useState("Summer");
  useEffect(()=>{ try{ const s = localStorage.getItem("season"); if(s) setSeason(s); }catch(e){} },[]);
  useEffect(()=>{ try{ localStorage.setItem("season", season); }catch(e){} },[season]);
  return (
    <div className="container">
      <div className="header">
        <div className="title-area">
          <h1>Seasonal Progress Tracker</h1>
          <p>4 seasons · 7 days each · add items and track progress</p>
        </div>
        <div className="controls">
          <SeasonToggle season={season} setSeason={setSeason} />
          <div style={{fontSize:13, color:"var(--muted)"}}>Season: <strong>{season}</strong></div>
        </div>
      </div>
      <main>
        <div className="app-grid" role="list">
          {DAYS.map(day => <DayColumn key={day} season={season} day={day} />)}
        </div>
      </main>
    </div>
  );
}
