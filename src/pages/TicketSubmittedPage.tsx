import { Link, useNavigate, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import Button from "../components/ui/Button";
import { useStore } from "../store/StoreContext";

export default function TicketSubmittedPage() {
  const { id } = useParams();
  const { tickets, slaPolicies } = useStore();
  const navigate = useNavigate();
  const ticket = tickets.find((t) => t.id === id);
  const policy = slaPolicies.find((p) => p.priority === ticket?.priority);

  return (
    <div className="card" style={{ maxWidth: 720, margin: "10px auto 0", padding: "40px 40px 34px" }}>
      <div className="done">
        <div className="done__check">
          <Check size={40} />
        </div>
        <h1 style={{ marginTop: 26 }}>Your ticket has been submitted</h1>
        <p className="sub" style={{ maxWidth: 420, margin: "8px auto 0" }}>
          We've notified the IT team. You'll get an email and an in-app notification at every step.
        </p>
        <div className="done__id">{id}</div>
      </div>

      <div style={{ borderTop: "1px solid var(--line)", marginTop: 26, paddingTop: 24 }}>
        <h3>What happens next</h3>
        <div className="next-steps">
          <div className="who">
            <span className="stepper-v__dot stepper-v__dot--done" style={{ width: 30, height: 30 }}>1</span>
            <div>
              <b>Assigned to an agent</b>
              <div className="sub">Within 15 minutes</div>
            </div>
          </div>
          <div className="who">
            <span className="stepper-v__dot stepper-v__dot--now" style={{ width: 30, height: 30 }}>2</span>
            <div>
              <b>First response from IT</b>
              <div className="sub">Within {policy?.firstResponseHours ?? 8} hour(s)</div>
            </div>
          </div>
          <div className="who">
            <span className="stepper-v__dot" style={{ width: 30, height: 30, background: "#94a3b8" }}>3</span>
            <div>
              <b>Issue resolved and confirmed with you</b>
              <div className="sub">Target: {policy?.resolutionHours ?? 24} hours</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 30, justifyContent: "center", flexWrap: "wrap" }}>
        <Link to="/my-tickets">
          <Button variant="ghost">Back to my tickets</Button>
        </Link>
        <Button onClick={() => navigate(`/tickets/${id}`)}>View ticket</Button>
      </div>
    </div>
  );
}
