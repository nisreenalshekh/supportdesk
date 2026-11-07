import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, ThumbsDown, ThumbsUp } from "lucide-react";
import Breadcrumbs from "../components/ui/Breadcrumbs";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { useToast } from "../components/ui/Toast";
import { articles, topics } from "../data/articles";

export default function ArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [voted, setVoted] = useState(false);
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="card">
        <EmptyState icon={BookOpen} title="Article not found" text="It may have been moved or removed." action={<Button onClick={() => navigate("/knowledge-base")}>Back to knowledge base</Button>} />
      </div>
    );
  }

  const topic = topics.find((t) => t.slug === article.topic);
  const categoryForTopic = { accounts: "accounts", printers: "hardware", network: "network", software: "software", access: "access", hardware: "hardware" }[article.topic] ?? "other";

  return (
    <div className="article">
      <Breadcrumbs trail={[{ label: "Knowledge base", to: "/knowledge-base" }]} current={topic?.title ?? "Article"} />
      <h1>{article.title}</h1>
      <p className="sub">
        {article.readMinutes} min read · {(article.views / 1000).toFixed(1)}k views
      </p>

      <div className="card card__body" style={{ marginTop: 20, padding: 28 }}>
        <p>{article.intro}</p>
        <ol>
          {article.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <div className="helpful">
          <b>Was this helpful?</b>
          <Button
            variant="ghost"
            size="sm"
            icon={<ThumbsUp size={15} />}
            disabled={voted}
            onClick={() => {
              setVoted(true);
              toast("Thanks for your feedback");
            }}
          >
            Yes
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<ThumbsDown size={15} />}
            disabled={voted}
            onClick={() => {
              setVoted(true);
              toast("Thanks, we'll improve this article");
            }}
          >
            No
          </Button>
        </div>
      </div>

      <div className="card cta">
        <div>
          <b>Still stuck?</b>
          <div className="sub">Open a ticket and the IT team will take it from here.</div>
        </div>
        <Button onClick={() => navigate(`/tickets/new?category=${categoryForTopic}&subject=${encodeURIComponent(article.title)}`)}>Open a ticket</Button>
      </div>
    </div>
  );
}
