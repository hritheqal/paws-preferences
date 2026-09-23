import { useEffect, useMemo, useState } from "react";
import "./styles.css";
import type { Cat } from "./types";
import { loadCats } from "./services/cataas";
import CardStack from "./components/CardStack";

type Decision = "like" | "dislike";
type HistoryItem = { cat: Cat; decision: Decision };

export default function App() {
  const [allCats, setAllCats] = useState<Cat[]>([]);
  const [remaining, setRemaining] = useState<Cat[]>([]);
  const [liked, setLiked] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const cats = await loadCats(15);
      setAllCats(cats);
      setRemaining(cats);
      setLiked([]);
      setHistory([]);
      setLoading(false);
    })();
  }, []);

  const done = !loading && remaining.length === 0;

  const tagSummary = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of liked) {
      for (const t of c.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [liked]);

  function onDecision(cat: Cat, decision: Decision) {
    setRemaining((prev) => prev.slice(1));
    setHistory((prev) => [{ cat, decision }, ...prev]);

    if (decision === "like") {
      setLiked((prev) => [cat, ...prev]);
    }
  }

  function undo() {
    setHistory((prev) => {
      const last = prev[0];
      if (!last) return prev;

      
      setRemaining((r) => [last.cat, ...r]);

      
      if (last.decision === "like") {
        setLiked((l) => l.filter((c) => c.id !== last.cat.id));
      }

      return prev.slice(1);
    });
  }

  function restart() {
    setRemaining(allCats);
    setLiked([]);
    setHistory([]);
  }

  function restart() {
  setRemaining(allCats);
  setLiked([]);
  setHistory([]);
}

function exportPreferences() {
  if (liked.length === 0) return;

  const header = ["cat_id", "tags", "image_url"];

  const rows = liked.map((cat) => [
    cat.id,
    (cat.tags ?? []).join("|"),
    cat.imageUrl,
  ]);

  const csvContent = [
    header.join(","),
    ...rows.map((row) =>
      row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "paws-preferences.csv";

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

  const currentIndex = allCats.length - remaining.length + 1;
  const total = Math.max(allCats.length, 1);
  const progressPct = (currentIndex / total) * 100;

  
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (loading) return;
      if (done) return;

      const top = remaining[0];
      if (!top) return;

      if (e.key === "ArrowRight") onDecision(top, "like");
      else if (e.key === "ArrowLeft") onDecision(top, "dislike");
      else if (e.key === "Backspace" || e.key.toLowerCase() === "u") undo();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [remaining, loading, done]);

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbarInner">
          <div className="titleBlock">
            <h1>Paws & Preferences</h1>
            <p className="subtitle">Swipe right to like, left to skip</p>
          </div>

          <div className="topActions">
            {!loading && !done && (
              <>
                <button
                  className="undoBtn"
                  onClick={undo}
                  disabled={history.length === 0}
                  title="Undo (Backspace / U)"
                >
                  Undo
                </button>

                <div className="progressPill">
                  {currentIndex}/{allCats.length}
                </div>
              </>
            )}
          </div>
        </div>

        {!loading && !done && (
          <div className="progressTrack">
            <div className="progressFill" style={{ width: `${progressPct}%` }} />
          </div>
        )}
      </header>

      <main className="main">
        <div className="mainInner">
          {loading && <p className="hint">Loading cats…</p>}

          {!loading && !done && (
            <CardStack cats={remaining} onDecision={onDecision} />
          )}

          {done && (
            <div className="summary">
              <h2>Summary</h2>
              <p>
                You liked <b>{liked.length}</b> out of <b>{allCats.length}</b>.
              </p>

              {tagSummary.length > 0 && (
                <p className="tags">
                  Top tags:{" "}
                  {tagSummary.map(([t, n]) => (
                    <span key={t} className="tag">
                      {t} ({n})
                    </span>
                  ))}
                </p>
              )}

             <div className="summaryActions">
  <button className="restart" onClick={restart}>
    Restart
  </button>

  <button
    className="exportBtn"
    onClick={exportPreferences}
    disabled={liked.length === 0}
  >
    Export Likes (.csv)
  </button>
</div>

              <div className="grid">
                {liked.map((c) => (
                  <a
                    key={c.id}
                    className="thumb"
                    href={c.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src={c.imageUrl} alt="Liked cat" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">Images from Cataas</footer>
    </div>
  );
}
