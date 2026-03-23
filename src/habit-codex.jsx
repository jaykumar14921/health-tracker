import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";

// ── Supabase ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://vpuehbtcvjskzjbmwcrb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdWVoYnRjdmpza3pqYm13Y3JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNjI3MTcsImV4cCI6MjA4OTgzODcxN30.5Du7MnkPxRk-xFZ9Heuby7aWYzCF7mi1subD_Q0Jrbo";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "health", label: "Health", color: "#4ade80", icon: "🌿" },
  { id: "mind", label: "Mind", color: "#60a5fa", icon: "🧠" },
  { id: "finance", label: "Finance", color: "#f59e0b", icon: "💰" },
  { id: "social", label: "Social", color: "#f472b6", icon: "🤝" },
  { id: "growth", label: "Growth", color: "#a78bfa", icon: "🚀" },
];

const DEFAULT_HABITS = [
  { id: "h1", name: "Morning walk", category: "health", target: 7 },
  { id: "h2", name: "Drink 8 glasses of water", category: "health", target: 7 },
  { id: "h3", name: "Read 20 mins", category: "mind", target: 7 },
  { id: "h4", name: "Meditate", category: "mind", target: 5 },
  { id: "h5", name: "Track expenses", category: "finance", target: 7 },
  { id: "h6", name: "No impulse buying", category: "finance", target: 7 },
  { id: "h7", name: "Call a friend", category: "social", target: 3 },
  { id: "h8", name: "Learn something new", category: "growth", target: 5 },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d.toISOString().slice(0, 10);
}
function getWeekDates(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart + "T12:00:00");
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}
function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
function getMonthDays(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  return Array.from({ length: new Date(y, m, 0).getDate() }, (_, i) =>
    new Date(y, m - 1, i + 1).toISOString().slice(0, 10)
  );
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://healthtracker-wine-five.vercel.app" },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0f1e",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Cambria', 'Georgia', serif",
    }}>
      {/* Background blobs */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "10%", left: "15%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #4ade8015, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "10%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, #60a5fa15, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", width: 500, height: 500, transform: "translate(-50%,-50%)", borderRadius: "50%", background: "radial-gradient(circle, #a78bfa08, transparent 70%)" }} />
      </div>

      <div style={{
        background: "linear-gradient(145deg, #0f172a, #1a1f35)",
        border: "1px solid #1e293b",
        borderRadius: 24,
        padding: "52px 44px",
        width: "100%", maxWidth: 420,
        textAlign: "center",
        boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>📖</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: "0 0 6px", letterSpacing: "-1px" }}>Health Tracker</h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 40px" }}>Track your health. Build your life.</p>

        <button onClick={handleGoogle} disabled={loading} style={{
          width: "100%", padding: "14px 20px",
          background: loading ? "#1e293b" : "#fff",
          border: "none", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          fontSize: 15, fontWeight: 700, color: "#1a1a1a",
          transition: "all 0.2s", boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
          fontFamily: "'Cambria', 'Georgia', serif",
        }}>
          {loading ? (
            <span style={{ color: "#64748b" }}>Connecting...</span>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {error && <p style={{ color: "#f87171", fontSize: 13, marginTop: 16 }}>{error}</p>}

        <p style={{ fontSize: 12, color: "#334155", marginTop: 28, lineHeight: 1.6 }}>
          Your data is securely stored in the cloud and synced across all your devices.
        </p>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function HabitCodex() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [logs, setLogs] = useState({});
  const [view, setView] = useState("weekly");
  const [today] = useState(new Date().toISOString().slice(0, 10));
  const [currentWeek] = useState(getWeekStart());
  const [newHabit, setNewHabit] = useState({ name: "", category: "health", target: 7 });
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey());
  const [syncing, setSyncing] = useState(false);

  const weekDates = getWeekDates(currentWeek);

  // ── Auth listener ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Load data from Supabase ──
  const loadData = useCallback(async (userId) => {
    setSyncing(true);
    const { data, error } = await supabase
      .from("habit_data")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data && !error) {
      if (data.habits) setHabits(data.habits);
      if (data.logs) setLogs(data.logs);
    }
    setSyncing(false);
  }, []);

  useEffect(() => {
    if (session?.user?.id) loadData(session.user.id);
  }, [session, loadData]);

  // ── Save data to Supabase ──
  const saveData = useCallback(async (newHabits, newLogs) => {
    if (!session?.user?.id) return;
    setSyncing(true);
    await supabase.from("habit_data").upsert({
      user_id: session.user.id,
      habits: newHabits,
      logs: newLogs,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    setSyncing(false);
  }, [session]);

  const updateHabits = (newHabits) => { setHabits(newHabits); saveData(newHabits, logs); };
  const updateLogs = (newLogs) => { setLogs(newLogs); saveData(habits, newLogs); };

  const toggleLog = (habitId, date) => {
    const key = `${habitId}_${date}`;
    updateLogs({ ...logs, [key]: !logs[key] });
  };

  const isLogged = (habitId, date) => !!logs[`${habitId}_${date}`];

  const getStreak = (habitId) => {
    let streak = 0;
    const d = new Date(today);
    while (true) {
      const dateStr = d.toISOString().slice(0, 10);
      if (logs[`${habitId}_${dateStr}`]) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  };

  const getWeeklyCompletion = (habitId) => weekDates.filter(date => isLogged(habitId, date)).length;

  const todayCompletions = habits.filter(h => isLogged(h.id, today)).length;
  const todayPct = habits.length > 0 ? Math.round((todayCompletions / habits.length) * 100) : 0;
  const weeklyPct = habits.length > 0
    ? Math.round((habits.reduce((sum, h) => sum + getWeeklyCompletion(h.id), 0) / (habits.length * 7)) * 100)
    : 0;

  const categoryData = CATEGORIES.map(cat => {
    const catHabits = habits.filter(h => h.category === cat.id);
    if (!catHabits.length) return null;
    const total = catHabits.length * 7;
    const done = catHabits.reduce((s, h) => s + getWeeklyCompletion(h.id), 0);
    return { name: cat.label, value: done, total, pct: Math.round((done / total) * 100), color: cat.color };
  }).filter(Boolean);

  const weeklyBarData = weekDates.map((date, i) => ({
    day: DAYS[i],
    completed: habits.filter(h => isLogged(h.id, date)).length,
    total: habits.length,
  }));

  const addHabit = () => {
    if (!newHabit.name.trim()) return;
    const habit = { ...newHabit, id: `h_${Date.now()}` };
    updateHabits([...habits, habit]);
    setNewHabit({ name: "", category: "health", target: 7 });
    setShowAddHabit(false);
  };

  const deleteHabit = (id) => updateHabits(habits.filter(h => h.id !== id));

  const pieData = [
    { name: "Done", value: todayCompletions, color: "#4ade80" },
    { name: "Left", value: habits.length - todayCompletions, color: "#1e293b" },
  ];

  const monthDays = getMonthDays(selectedMonth);

  // ── Overall stats (all time) ──
  const allDates = Object.keys(logs).map(k => k.split("_").slice(1).join("_")).filter(Boolean);
  const uniqueDates = [...new Set(allDates)];
  const totalLoggedDays = uniqueDates.filter(d => habits.some(h => isLogged(h.id, d))).length;
  const totalCompletions = Object.values(logs).filter(Boolean).length;
  const bestStreak = Math.max(0, ...habits.map(h => getStreak(h.id)));
  const overallPct = habits.length > 0 && uniqueDates.length > 0
    ? Math.round((totalCompletions / (habits.length * Math.max(uniqueDates.length, 1))) * 100)
    : 0;

  const signOut = async () => { await supabase.auth.signOut(); };

  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#4ade80", fontSize: 16, fontFamily: "'Cambria','Georgia',serif" }}>Loading...</div>
    </div>
  );

  if (!session) return <LoginScreen />;

  const user = session.user;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "#e2e8f0", fontFamily: "'Cambria','Georgia',serif" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        borderBottom: "1px solid #1e293b",
        padding: "16px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26 }}>📖</span>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Habit Codex</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {["weekly", "monthly", "stats"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 12, textTransform: "capitalize",
              background: view === v ? "#6366f1" : "#1e293b",
              color: view === v ? "#fff" : "#64748b", transition: "all 0.2s",
              fontFamily: "'Cambria','Georgia',serif",
            }}>{v}</button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {syncing && <span style={{ fontSize: 11, color: "#4ade80", animation: "pulse 1s infinite" }}>● Saving...</span>}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {user.user_metadata?.avatar_url && (
              <img src={user.user_metadata.avatar_url} alt="avatar" style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid #4ade80" }} />
            )}
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{user.user_metadata?.full_name || user.email}</span>
          </div>
          <button onClick={signOut} style={{ background: "#1e293b", border: "1px solid #334155", color: "#64748b", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontFamily: "'Cambria','Georgia',serif" }}>Sign out</button>
        </div>
      </div>

      <div style={{ padding: "20px 28px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Overall Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
          {[
            { label: "Today's Progress", value: `${todayPct}%`, sub: `${todayCompletions}/${habits.length} habits`, color: "#4ade80" },
            { label: "Weekly Average", value: `${weeklyPct}%`, sub: "this week", color: "#60a5fa" },
            { label: "All-Time Completions", value: totalCompletions, sub: `across ${totalLoggedDays} days`, color: "#f59e0b" },
            { label: "Best Streak", value: `${bestStreak}d`, sub: "days in a row", color: "#f472b6" },
          ].map((s, i) => (
            <div key={i} style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", border: "1px solid #1e293b", borderRadius: 14, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color }} />
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* WEEKLY VIEW */}
        {view === "weekly" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 18 }}>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "18px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>Weekly Tracker</span>
                <button onClick={() => setShowAddHabit(!showAddHabit)} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Cambria','Georgia',serif" }}>+ Add Habit</button>
              </div>

              {showAddHabit && (
                <div style={{ background: "#1e293b", borderRadius: 12, padding: 14, marginBottom: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input placeholder="Habit name..." value={newHabit.name} onChange={e => setNewHabit({ ...newHabit, name: e.target.value })}
                    style={{ flex: 2, minWidth: 140, background: "#0a0f1e", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", padding: "7px 11px", fontSize: 13, outline: "none", fontFamily: "'Cambria','Georgia',serif" }} />
                  <select value={newHabit.category} onChange={e => setNewHabit({ ...newHabit, category: e.target.value })}
                    style={{ flex: 1, minWidth: 110, background: "#0a0f1e", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", padding: "7px 11px", fontSize: 13, fontFamily: "'Cambria','Georgia',serif" }}>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                  <button onClick={addHabit} style={{ background: "#4ade80", color: "#0a0f1e", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "'Cambria','Georgia',serif" }}>Save</button>
                  <button onClick={() => setShowAddHabit(false)} style={{ background: "#334155", color: "#94a3b8", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13, fontFamily: "'Cambria','Georgia',serif" }}>Cancel</button>
                </div>
              )}

              {/* Day headers */}
              <div style={{ display: "grid", gridTemplateColumns: "190px repeat(7, 1fr) 55px 55px", gap: 4, marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: "#475569" }}>Habit</div>
                {weekDates.map((date, i) => (
                  <div key={date} style={{ fontSize: 10, fontWeight: 700, textAlign: "center", color: date === today ? "#6366f1" : "#64748b" }}>
                    <div>{DAYS[i]}</div>
                    <div style={{ fontWeight: 400 }}>{new Date(date + "T12:00:00").getDate()}</div>
                  </div>
                ))}
                <div style={{ fontSize: 10, color: "#475569", textAlign: "center" }}>Done</div>
                <div style={{ fontSize: 10, color: "#475569", textAlign: "center" }}>🔥</div>
              </div>

              {CATEGORIES.map(cat => {
                const catHabits = habits.filter(h => h.category === cat.id);
                if (!catHabits.length) return null;
                return (
                  <div key={cat.id}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: cat.color, marginTop: 10, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px" }}>{cat.icon} {cat.label}</div>
                    {catHabits.map(habit => {
                      const weekDone = getWeeklyCompletion(habit.id);
                      const streak = getStreak(habit.id);
                      return (
                        <div key={habit.id} style={{ display: "grid", gridTemplateColumns: "190px repeat(7, 1fr) 55px 55px", gap: 4, alignItems: "center", padding: "4px 0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontSize: 12, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{habit.name}</span>
                            <button onClick={() => deleteHabit(habit.id)} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: 11, padding: 0, flexShrink: 0 }}>✕</button>
                          </div>
                          {weekDates.map(date => {
                            const done = isLogged(habit.id, date);
                            const isFuture = date > today;
                            return (
                              <div key={date} style={{ display: "flex", justifyContent: "center" }}>
                                <button onClick={() => !isFuture && toggleLog(habit.id, date)} style={{
                                  width: 26, height: 26, borderRadius: 7,
                                  border: done ? "none" : `1px solid ${date === today ? cat.color + "60" : "#1e293b"}`,
                                  background: done ? cat.color : (date === today ? cat.color + "15" : "transparent"),
                                  cursor: isFuture ? "default" : "pointer", opacity: isFuture ? 0.3 : 1,
                                  display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
                                }}>
                                  {done && <span style={{ color: "#0a0f1e", fontWeight: 800, fontSize: 12 }}>✓</span>}
                                </button>
                              </div>
                            );
                          })}
                          <div style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: weekDone >= habit.target ? "#4ade80" : "#94a3b8" }}>{weekDone}/{habit.target}</div>
                          <div style={{ textAlign: "center", fontSize: 11, color: streak > 0 ? "#f59e0b" : "#334155" }}>{streak > 0 ? `🔥${streak}` : "–"}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Pie + category bars */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", marginBottom: 10 }}>Today's Completion</div>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={46} outerRadius={65} dataKey="value" startAngle={90} endAngle={-270}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ textAlign: "center", marginTop: -16 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#4ade80" }}>{todayPct}%</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{todayCompletions} of {habits.length}</div>
              </div>
              <div style={{ marginTop: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>By Category</div>
                {categoryData.map(cat => (
                  <div key={cat.name} style={{ marginBottom: 7 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                      <span style={{ color: "#e2e8f0" }}>{cat.name}</span>
                      <span style={{ color: cat.color, fontWeight: 700 }}>{cat.pct}%</span>
                    </div>
                    <div style={{ background: "#1e293b", borderRadius: 4, height: 5 }}>
                      <div style={{ width: `${cat.pct}%`, height: "100%", background: cat.color, borderRadius: 4, transition: "width 0.5s" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MONTHLY VIEW */}
        {view === "monthly" && (
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>Monthly Heatmap</span>
              <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", padding: "7px 11px", fontSize: 12, fontFamily: "'Cambria','Georgia',serif" }}>
                {Array.from({ length: 12 }, (_, i) => {
                  const d = new Date(new Date().getFullYear(), i, 1);
                  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                  return <option key={key} value={key}>{MONTHS[i]} {d.getFullYear()}</option>;
                })}
              </select>
            </div>
            {habits.map(habit => {
              const cat = CATEGORIES.find(c => c.id === habit.category);
              const monthDone = monthDays.filter(d => isLogged(habit.id, d)).length;
              return (
                <div key={habit.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: cat.color }}>{cat.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{habit.name}</span>
                    <span style={{ fontSize: 11, color: "#475569" }}>{monthDone}/{monthDays.length} days</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {monthDays.map(date => {
                      const done = isLogged(habit.id, date);
                      const isFuture = date > today;
                      return (
                        <button key={date} onClick={() => !isFuture && toggleLog(habit.id, date)} style={{
                          width: 26, height: 26, borderRadius: 5,
                          background: done ? cat.color : "#1e293b",
                          border: date === today ? `2px solid ${cat.color}` : "1px solid #0f172a",
                          cursor: isFuture ? "default" : "pointer", opacity: isFuture ? 0.3 : 1,
                          fontSize: 10, color: done ? "#0a0f1e" : "#475569", fontWeight: 600,
                        }}>
                          {new Date(date + "T12:00:00").getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* STATS VIEW */}
        {view === "stats" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 22 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 14 }}>Weekly Completions by Day</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyBarData}>
                  <XAxis dataKey="day" stroke="#475569" fontSize={12} />
                  <YAxis stroke="#475569" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, color: "#e2e8f0", fontFamily: "'Cambria','Georgia',serif" }} />
                  <Bar dataKey="completed" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 22 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 14 }}>Category Breakdown</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, color: "#e2e8f0", fontFamily: "'Cambria','Georgia',serif" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* All time stats */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 22, gridColumn: "span 2" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 16 }}>All-Time Habit Performance</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                {habits.map(habit => {
                  const cat = CATEGORIES.find(c => c.id === habit.category);
                  const allTimeDone = Object.keys(logs).filter(k => k.startsWith(`${habit.id}_`) && logs[k]).length;
                  const streak = getStreak(habit.id);
                  const weekDone = getWeeklyCompletion(habit.id);
                  const weekPct = Math.round((weekDone / 7) * 100);
                  return (
                    <div key={habit.id} style={{ background: "#1e293b", borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: cat.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{cat.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{habit.name}</div>
                        <div style={{ background: "#0f172a", borderRadius: 4, height: 5, marginBottom: 4 }}>
                          <div style={{ width: `${weekPct}%`, height: "100%", background: cat.color, borderRadius: 4 }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b" }}>
                          <span>{weekDone}/7 this week</span>
                          <span style={{ color: "#94a3b8" }}>✅ {allTimeDone} total</span>
                          {streak > 0 && <span style={{ color: "#f59e0b" }}>🔥{streak}</span>}
                        </div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: cat.color, flexShrink: 0 }}>{weekPct}%</div>
                    </div>
                  );
                })}
              </div>

              {/* Overall summary */}
              <div style={{ marginTop: 20, padding: 16, background: "#1e293b", borderRadius: 12, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, textAlign: "center" }}>
                {[
                  { label: "Total Check-ins", value: totalCompletions, color: "#4ade80" },
                  { label: "Active Days", value: totalLoggedDays, color: "#60a5fa" },
                  { label: "Overall Rate", value: `${overallPct}%`, color: "#f59e0b" },
                  { label: "Best Streak", value: `${bestStreak}d`, color: "#f472b6" },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
