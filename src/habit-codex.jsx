import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";

const CATEGORIES = [
  { id: "health", label: "Health", color: "#4ade80", icon: "🌿" },
  { id: "mind", label: "Mind", color: "#60a5fa", icon: "🧠" },
  { id: "finance", label: "Finance", color: "#f59e0b", icon: "💰" },
  { id: "social", label: "Social", color: "#f472b6", icon: "🤝" },
  { id: "growth", label: "Growth", color: "#a78bfa", icon: "🚀" },
];

const DEFAULT_HABITS = [
  { id: 1, name: "Morning walk", category: "health", target: 7 },
  { id: 2, name: "Drink 8 glasses of water", category: "health", target: 7 },
  { id: 3, name: "Read 20 mins", category: "mind", target: 7 },
  { id: 4, name: "Meditate", category: "mind", target: 5 },
  { id: 5, name: "Track expenses", category: "finance", target: 7 },
  { id: 6, name: "No impulse buying", category: "finance", target: 7 },
  { id: 7, name: "Call a friend", category: "social", target: 3 },
  { id: 8, name: "Learn something new", category: "growth", target: 5 },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getWeekKey(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

function getMonthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function HabitCodex() {
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [logs, setLogs] = useState({});
  const [view, setView] = useState("weekly");
  const [today] = useState(new Date());
  const [currentWeek] = useState(getWeekKey(new Date()));
  const [newHabit, setNewHabit] = useState({ name: "", category: "health", target: 7 });
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(new Date()));

  useEffect(() => {
    try {
      const savedLogs = localStorage.getItem("habitcodex_logs");
      const savedHabits = localStorage.getItem("habitcodex_habits");
      if (savedLogs) setLogs(JSON.parse(savedLogs));
      if (savedHabits) setHabits(JSON.parse(savedHabits));
    } catch (e) {}
  }, []);

  const saveLogs = (newLogs) => {
    setLogs(newLogs);
    try { localStorage.setItem("habitcodex_logs", JSON.stringify(newLogs)); } catch (e) {}
  };

  const saveHabits = (newHabits) => {
    setHabits(newHabits);
    try { localStorage.setItem("habitcodex_habits", JSON.stringify(newHabits)); } catch (e) {}
  };

  const getWeekDates = (weekKey) => {
    const start = new Date(weekKey);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  };

  const weekDates = getWeekDates(currentWeek);
  const todayStr = today.toISOString().slice(0, 10);

  const toggleLog = (habitId, date) => {
    const key = `${habitId}_${date}`;
    const newLogs = { ...logs, [key]: !logs[key] };
    saveLogs(newLogs);
  };

  const isLogged = (habitId, date) => !!logs[`${habitId}_${date}`];

  const getStreak = (habitId) => {
    let streak = 0;
    const d = new Date(today);
    while (true) {
      const dateStr = d.toISOString().slice(0, 10);
      if (logs[`${habitId}_${dateStr}`]) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return streak;
  };

  const getWeeklyCompletion = (habitId) => {
    return weekDates.filter(date => isLogged(habitId, date)).length;
  };

  const todayCompletions = habits.filter(h => isLogged(h.id, todayStr)).length;
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
    const habit = { ...newHabit, id: Date.now() };
    saveHabits([...habits, habit]);
    setNewHabit({ name: "", category: "health", target: 7 });
    setShowAddHabit(false);
  };

  const deleteHabit = (id) => {
    saveHabits(habits.filter(h => h.id !== id));
  };

  // Monthly view
  const getMonthDays = (monthKey) => {
    const [year, month] = monthKey.split("-").map(Number);
    const days = new Date(year, month, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(year, month - 1, i + 1);
      return d.toISOString().slice(0, 10);
    });
  };
  const monthDays = getMonthDays(selectedMonth);

  const pieData = [
    { name: "Done", value: todayCompletions, color: "#4ade80" },
    { name: "Left", value: habits.length - todayCompletions, color: "#1e293b" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0f1e",
      color: "#e2e8f0",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        borderBottom: "1px solid #1e293b",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>📖</span>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", color: "#fff" }}>Habit Codex</span>
          </div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
            {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["weekly", "monthly", "stats"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              background: view === v ? "#6366f1" : "#1e293b",
              color: view === v ? "#fff" : "#64748b",
              transition: "all 0.2s",
            }}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Top Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Today's Progress", value: `${todayPct}%`, sub: `${todayCompletions}/${habits.length} habits`, color: "#4ade80" },
            { label: "Weekly Average", value: `${weeklyPct}%`, sub: "this week", color: "#60a5fa" },
            { label: "Active Habits", value: habits.length, sub: "being tracked", color: "#f59e0b" },
            { label: "Best Streak", value: Math.max(0, ...habits.map(h => getStreak(h.id))), sub: "days in a row", color: "#f472b6" },
          ].map((stat, i) => (
            <div key={i} style={{
              background: "linear-gradient(135deg, #0f172a, #1e293b)",
              border: "1px solid #1e293b",
              borderRadius: 16,
              padding: "20px 22px",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: stat.color, borderRadius: "16px 16px 0 0" }} />
              <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* WEEKLY VIEW */}
        {view === "weekly" && (
          <div>
            {/* Day header + pie */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 20, marginBottom: 20 }}>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>Weekly Tracker</span>
                  <button onClick={() => setShowAddHabit(!showAddHabit)} style={{
                    background: "#6366f1", color: "#fff", border: "none", borderRadius: 8,
                    padding: "7px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600,
                  }}>+ Add Habit</button>
                </div>

                {showAddHabit && (
                  <div style={{ background: "#1e293b", borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <input
                      placeholder="Habit name..."
                      value={newHabit.name}
                      onChange={e => setNewHabit({ ...newHabit, name: e.target.value })}
                      style={{ flex: 2, minWidth: 160, background: "#0a0f1e", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", padding: "8px 12px", fontSize: 13 }}
                    />
                    <select
                      value={newHabit.category}
                      onChange={e => setNewHabit({ ...newHabit, category: e.target.value })}
                      style={{ flex: 1, minWidth: 120, background: "#0a0f1e", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", padding: "8px 12px", fontSize: 13 }}
                    >
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                    </select>
                    <button onClick={addHabit} style={{ background: "#4ade80", color: "#0a0f1e", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Save</button>
                    <button onClick={() => setShowAddHabit(false)} style={{ background: "#334155", color: "#94a3b8", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>Cancel</button>
                  </div>
                )}

                {/* Day headers */}
                <div style={{ display: "grid", gridTemplateColumns: "200px repeat(7, 1fr) 60px 60px", gap: 4, marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: "#475569" }}>Habit</div>
                  {weekDates.map((date, i) => (
                    <div key={date} style={{
                      fontSize: 11, fontWeight: 700, textAlign: "center",
                      color: date === todayStr ? "#6366f1" : "#64748b",
                      padding: "4px 0",
                    }}>
                      <div>{DAYS[i]}</div>
                      <div style={{ fontSize: 10, fontWeight: 400 }}>{new Date(date + "T12:00:00").getDate()}</div>
                    </div>
                  ))}
                  <div style={{ fontSize: 11, color: "#475569", textAlign: "center" }}>Done</div>
                  <div style={{ fontSize: 11, color: "#475569", textAlign: "center" }}>🔥</div>
                </div>

                {/* Habit rows */}
                {CATEGORIES.map(cat => {
                  const catHabits = habits.filter(h => h.category === cat.id);
                  if (!catHabits.length) return null;
                  return (
                    <div key={cat.id}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: cat.color, marginTop: 12, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {cat.icon} {cat.label}
                      </div>
                      {catHabits.map(habit => {
                        const weekDone = getWeeklyCompletion(habit.id);
                        const streak = getStreak(habit.id);
                        return (
                          <div key={habit.id} style={{
                            display: "grid",
                            gridTemplateColumns: "200px repeat(7, 1fr) 60px 60px",
                            gap: 4,
                            alignItems: "center",
                            padding: "5px 0",
                            borderRadius: 8,
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ fontSize: 12, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{habit.name}</div>
                              <button onClick={() => deleteHabit(habit.id)} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: 11, padding: 0, flexShrink: 0 }}>✕</button>
                            </div>
                            {weekDates.map(date => {
                              const done = isLogged(habit.id, date);
                              const isFuture = date > todayStr;
                              return (
                                <div key={date} style={{ display: "flex", justifyContent: "center" }}>
                                  <button
                                    onClick={() => !isFuture && toggleLog(habit.id, date)}
                                    style={{
                                      width: 28, height: 28, borderRadius: 7,
                                      border: done ? "none" : `1px solid ${date === todayStr ? cat.color + "60" : "#1e293b"}`,
                                      background: done ? cat.color : (date === todayStr ? cat.color + "15" : "transparent"),
                                      cursor: isFuture ? "default" : "pointer",
                                      opacity: isFuture ? 0.3 : 1,
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                      fontSize: 14, transition: "all 0.15s",
                                    }}
                                  >
                                    {done ? <span style={{ color: "#0a0f1e", fontWeight: 800, fontSize: 13 }}>✓</span> : null}
                                  </button>
                                </div>
                              );
                            })}
                            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: weekDone >= habit.target ? "#4ade80" : "#94a3b8" }}>
                              {weekDone}/{habit.target}
                            </div>
                            <div style={{ textAlign: "center", fontSize: 12, color: streak > 0 ? "#f59e0b" : "#334155" }}>
                              {streak > 0 ? `🔥${streak}` : "–"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Today's Pie */}
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 12 }}>Today's Completion</div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ textAlign: "center", marginTop: -20 }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#4ade80" }}>{todayPct}%</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{todayCompletions} of {habits.length}</div>
                </div>

                <div style={{ marginTop: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#94a3b8", marginBottom: 10 }}>By Category</div>
                  {categoryData.map(cat => (
                    <div key={cat.name} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                        <span style={{ color: "#e2e8f0" }}>{cat.name}</span>
                        <span style={{ color: cat.color, fontWeight: 700 }}>{cat.pct}%</span>
                      </div>
                      <div style={{ background: "#1e293b", borderRadius: 4, height: 5, overflow: "hidden" }}>
                        <div style={{ width: `${cat.pct}%`, height: "100%", background: cat.color, borderRadius: 4, transition: "width 0.5s" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MONTHLY VIEW */}
        {view === "monthly" && (
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>Monthly Heatmap</span>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", padding: "8px 12px", fontSize: 13 }}
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const d = new Date(today.getFullYear(), i, 1);
                    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                    return <option key={key} value={key}>{MONTHS[i]} {d.getFullYear()}</option>;
                  })}
                </select>
              </div>
            </div>

            {habits.map(habit => {
              const cat = CATEGORIES.find(c => c.id === habit.category);
              return (
                <div key={habit.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: cat.color }}>{cat.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{habit.name}</span>
                    <span style={{ fontSize: 11, color: "#475569" }}>
                      {monthDays.filter(d => isLogged(habit.id, d)).length}/{monthDays.length} days
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {monthDays.map(date => {
                      const done = isLogged(habit.id, date);
                      const isFuture = date > todayStr;
                      return (
                        <button key={date} onClick={() => !isFuture && toggleLog(habit.id, date)} style={{
                          width: 28, height: 28, borderRadius: 6,
                          background: done ? cat.color : "#1e293b",
                          border: date === todayStr ? `2px solid ${cat.color}` : "1px solid #0f172a",
                          cursor: isFuture ? "default" : "pointer",
                          opacity: isFuture ? 0.3 : 1,
                          fontSize: 11, color: done ? "#0a0f1e" : "#475569", fontWeight: 600,
                          title: date,
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 16 }}>Weekly Completions by Day</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyBarData}>
                  <XAxis dataKey="day" stroke="#475569" fontSize={12} />
                  <YAxis stroke="#475569" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, color: "#e2e8f0" }} />
                  <Bar dataKey="completed" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 16 }}>Category Breakdown</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, pct }) => `${name} ${pct}%`} labelLine={false}>
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, color: "#e2e8f0" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 24, gridColumn: "span 2" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 16 }}>Habit Performance</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                {habits.map(habit => {
                  const cat = CATEGORIES.find(c => c.id === habit.category);
                  const weekDone = getWeeklyCompletion(habit.id);
                  const pct = Math.round((weekDone / 7) * 100);
                  const streak = getStreak(habit.id);
                  return (
                    <div key={habit.id} style={{ background: "#1e293b", borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: cat.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                        {cat.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{habit.name}</div>
                        <div style={{ background: "#0f172a", borderRadius: 4, height: 6, marginBottom: 4 }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: cat.color, borderRadius: 4, transition: "width 0.5s" }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b" }}>
                          <span>{weekDone}/7 this week</span>
                          {streak > 0 && <span style={{ color: "#f59e0b" }}>🔥 {streak} streak</span>}
                        </div>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: cat.color, flexShrink: 0 }}>{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
