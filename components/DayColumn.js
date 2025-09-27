
import React from "react";
import EntryItem from "./EntryItem";
import AddEntryForm from "./AddEntryForm";
import useSWR from "swr";
const fetcher = (url) => fetch(url).then(r => r.json());
export default function DayColumn({ season, day }) {
  const { data, mutate } = useSWR(`/api/entries?season=${encodeURIComponent(season)}&day=${encodeURIComponent(day)}`, fetcher);
  const entries = (data && data.entries) || [];
  return (
    <div className="day-column" role="region" aria-label={day}>
      <div className="day-header">
        <h3>{day}</h3>
        <AddEntryForm season={season} day={day} onAdd={() => mutate()} />
      </div>
      <div className="entries">
        {entries.length === 0 ? <div className="empty">No entries yet — add one 👇</div> :
          entries.map(e => <EntryItem key={e.id} entry={e} onChange={() => mutate()} />)
        }
      </div>
      <style jsx>{`
        .day-header{ display:flex; justify-content:space-between; align-items:center; gap:12px; }
        .entries{ display:flex; flex-direction:column; gap:12px; margin-top:8px; }
        .empty{ color:var(--muted); padding:14px; border-radius:8px; border:1px dashed rgba(255,255,255,0.03); background: rgba(255,255,255,0.01); text-align:center; }
      `}</style>
    </div>
  );
}
