import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, Eye, EyeOff, Inbox, KeyRound, Ticket } from "lucide-react";
import Button from "../components/ui/Button";
import { Field } from "../components/ui/Controls";
import { useToast } from "../components/ui/Toast";
import { useStore } from "../store/StoreContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { currentUser, login } = useStore();
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  if (currentUser) return <Navigate to={currentUser.role === "agent" ? "/dashboard" : "/my-tickets"} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email) next.email = "Please enter your work email";
    else if (!EMAIL_RE.test(email)) next.email = "That doesn't look like an email address";
    if (password.length < 6) next.password = "Password must be at least 6 characters";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    // fake network delay so the loading state is visible
    setTimeout(() => {
      const ok = login(email);
      setLoading(false);
      if (!ok) setErrors({ form: "We couldn't find an active account with that email." });
      else navigate("/", { replace: true });
    }, 600);
  };

  const fillDemo = (value: string) => {
    setEmail(value);
    setPassword("demo1234");
    setErrors({});
  };

  return (
    <div className="login">
      <section className="login__panel">
        <div className="logo" style={{ padding: 0 }}>
          <span className="logo__mark">
            <Inbox size={19} />
          </span>
          SupportDesk
        </div>
        <h2>Every IT issue, tracked from report to resolution.</h2>
        <p>One place for employees to report problems and for the IT team to solve them. No more calls or WhatsApp messages.</p>
        <div className="login__features">
          <div>
            <span>
              <Ticket size={16} />
            </span>
            Report an issue in under a minute
          </div>
          <div>
            <span>
              <Clock size={16} />
            </span>
            Live status and SLA tracking
          </div>
          <div>
            <span>
              <CheckCircle2 size={16} />
            </span>
            Full history of every fix
          </div>
        </div>
      </section>

      <section className="login__form">
        <form onSubmit={submit} noValidate>
          <h1>Welcome back</h1>
          <div className="sub" style={{ marginBottom: 28 }}>
            Sign in with your company account
          </div>

          {errors.form && (
            <div className="field error" role="alert">
              {errors.form}
            </div>
          )}

          <Field label="Work email" error={errors.email}>
            <input className={`input ${errors.email ? "input--error" : ""}`} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
          </Field>

          <Field label="Password" error={errors.password}>
            <div className="input-icon">
              <input
                className={`input ${errors.password ? "input--error" : ""}`}
                style={{ paddingLeft: 14 }}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <span className="trailing">
                <button type="button" className="icon-btn icon-btn--bare" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((s) => !s)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </div>
          </Field>

          <Button type="submit" size="lg" block loading={loading}>
            Sign in
          </Button>

          <div className="divider">or</div>
          <Button variant="ghost" size="lg" block icon={<KeyRound size={18} />} onClick={() => toast("SSO is not set up in this demo", "error")}>
            Continue with company SSO
          </Button>

          <div className="demo-box">
            <b>Demo accounts</b> (any password with 6+ characters works)
            <button type="button" onClick={() => fillDemo("lina.haddad@company.com")}>
              lina.haddad@company.com <span className="muted">· IT agent</span>
            </button>
            <button type="button" onClick={() => fillDemo("sara.nasser@company.com")}>
              sara.nasser@company.com <span className="muted">· employee</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
