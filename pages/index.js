import React, { useEffect, useState } from "react";
import SeasonToggle from "../components/SeasonToggle";
import DayColumn from "../components/DayColumn";
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const CURRENT_YEAR = new Date().getFullYear();
export default function Home() {
  const [season, setSeason] = useState("Summer");
  const [year, setYear] = useState(CURRENT_YEAR);
  const [years, setYears] = useState([CURRENT_YEAR]);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    try {
      const savedSeason = localStorage.getItem("season");
      if (savedSeason) setSeason(savedSeason);
      const savedYears = JSON.parse(localStorage.getItem("years") || "null");
      const savedYear = Number(localStorage.getItem("year"));
      if (Array.isArray(savedYears)) {
        const validYears = [...new Set(savedYears.map(Number).filter(Number.isInteger))].sort((a, b) => a - b);
        const availableYears = validYears.length ? validYears : [CURRENT_YEAR];
        setYears(availableYears);
        setYear(availableYears.includes(savedYear) ? savedYear : availableYears[0]);
      }
    } catch (e) {}
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      localStorage.setItem("season", season);
      localStorage.setItem("years", JSON.stringify(years));
      localStorage.setItem("year", String(year));
    } catch (e) {}
  }, [season, year, years, storageReady]);

  const addYear = () => {
    const nextYear = Math.max(CURRENT_YEAR, ...years) + 1;
    setYears([...years, nextYear]);
    setYear(nextYear);
    setSeason("Summer");
  };

  return (
    <div className="container">
      <div className="header">
        <div className="title-area">
          <h1>Seasonal Progress Tracker</h1>
          <p>4 seasons · 7 days each · add items and track progress</p>
        </div>
        <div className="controls">
          <div className="year-controls">
            <label htmlFor="year-select">Year</label>
            <select id="year-select" value={year} onChange={e => setYear(Number(e.target.value))}>
              {years.map(availableYear => <option key={availableYear} value={availableYear}>{availableYear}</option>)}
            </select>
            <button type="button" onClick={addYear}>+ Add year</button>
          </div>
          <SeasonToggle season={season} setSeason={setSeason} />
          <div style={{fontSize:13, color:"var(--muted)"}}>Season: <strong>{season}</strong></div>
        </div>
      </div>
      <main>
        <div className="app-grid" role="list">
          {DAYS.map(day => <DayColumn key={`${year}-${season}-${day}`} year={year} season={season} day={day} />)}
        </div>
      </main>
      <style jsx>{`
        .year-controls{ display:flex; align-items:center; gap:8px; color:var(--muted); font-size:13px; }
        select{ padding:8px 10px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); background:var(--card); color:var(--text); font-weight:700; }
        .year-controls button{ padding:8px 12px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); background:transparent; color:var(--text); font-weight:700; cursor:pointer; }
        .year-controls button:hover{ background:rgba(255,255,255,0.05); }
      `}</style>
    </div>
  );
}
