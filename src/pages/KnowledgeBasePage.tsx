import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppWindow, ChevronRight, KeyRound, Lock, Printer, Settings, Wifi } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SearchInput } from "../components/ui/Controls";
import EmptyState from "../components/ui/EmptyState";
import { articles, topics } from "../data/articles";
import { BookOpen } from "lucide-react";

const ICONS: Record<string, LucideIcon> = { lock: Lock, printer: Printer, wifi: Wifi, app: AppWindow, key: KeyRound, cog: Settings };

export default function KnowledgeBasePage() {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles
      .filter((a) => (!topic || a.topic === topic) && (!q || a.title.toLowerCase().includes(q) || a.intro.toLowerCase().includes(q)))
      .sort((a, b) => b.views - a.views);
  }, [query, topic]);

  const activeTopic = topics.find((t) => t.slug === topic);

  return (
    <>
      <div className="hero">
        <h2>Knowledge base</h2>
        <p>Find quick fixes before you open a ticket. Most issues take under 5 minutes.</p>
        <div className="hero__search">
          <SearchInput value={query} onChange={setQuery} placeholder="Search articles…" />
        </div>
      </div>

      <h3 style={{ marginBottom: 14 }}>Browse by topic</h3>
      <div className="topics">
        {topics.map((t) => {
          const Icon = ICONS[t.icon];
          return (
            <button key={t.slug} className={`card topic ${topic === t.slug ? "topic--on" : ""}`} onClick={() => setTopic(topic === t.slug ? null : t.slug)}>
              <span className="topic__icon" style={{ background: t.soft, color: t.color }}>
                <Icon size={22} />
              </span>
              <span>
                <b style={{ display: "block" }}>{t.title}</b>
                <small>{t.articleCount} articles</small>
              </span>
            </button>
          );
        })}
      </div>

      <div className="card">
        <div className="card__head" style={{ paddingBottom: 12 }}>
          <h3>{activeTopic ? activeTopic.title : query ? "Search results" : "Most helpful articles"}</h3>
          {topic && (
            <button className="btn btn--link" onClick={() => setTopic(null)}>
              Show all topics
            </button>
          )}
        </div>
        {list.length === 0 ? (
          <EmptyState icon={BookOpen} title="No articles found" text="Try different words, or open a ticket and we'll help you." />
        ) : (
          list.map((a, i) => (
            <Link key={a.slug} to={`/knowledge-base/${a.slug}`} className="article-row">
              <span className="ticket-id">{String(i + 1).padStart(2, "0")}</span>
              <div className="article-row__main">
                <b>{a.title}</b>
                <div className="sub">
                  {topics.find((t) => t.slug === a.topic)?.title} · {a.readMinutes} min read
                </div>
              </div>
              <small className="muted">{(a.views / 1000).toFixed(1)}k views</small>
              <ChevronRight size={18} />
            </Link>
          ))
        )}
      </div>
    </>
  );
}
