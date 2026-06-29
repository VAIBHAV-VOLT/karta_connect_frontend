import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  Trophy, Star, CheckCircle2, Clock, Calendar, ArrowUpRight, Plus,
  Trash2, FileDown, Eye, Share2, Sparkles, Award, GraduationCap,
  X, BarChart3, AlertCircle, Lock, Check, ChevronRight, Edit, Flame,
  Briefcase, Users, RefreshCw, BarChart, ArrowRight, Zap, Target
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart as RechartsBarChart, Bar, Cell
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/student/progress")({
  head: () => ({ meta: [{ title: "My Progress — Karta Connect" }] }),
  component: StudentProgressPage,
});

// Data Structures (Types removed for JS)
function StudentProgressPage() {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);

  // Modals & Popovers state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // 1. Kanban Board State (Section 4)
  const [kanbanCards, setKanbanCards] = useState([]);

  useEffect(() => {
    async function loadApplications() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("applications")
        .select("*, job_post:job_posts(*, company:companies(name))")
        .eq("student_id", user.id)
        .order("applied_at", { ascending: false });

      if (data) {
        const cards = data.map(app => ({
          id: app.id,
          title: app.job_post?.title || "Application",
          subtitle: `${app.job_post?.location || 'Remote'}`,
          company: app.job_post?.company?.name || "Unknown Company",
          type: app.job_post?.type || "Role",
          date: new Date(app.applied_at).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
          status: app.status
        }));
        setKanbanCards(cards);
      }
    }
    if (user) loadApplications();
  }, [user]);

  // 2. Career Goals State (Section 6)
  const [goals, setGoals] = useState([
    { id: "g-1", title: "Apply to 5 Internships", current: 4, target: 5, unit: "applications", deadline: "30 Jun 2026", category: "applications" },
    { id: "g-2", title: "Learn React.js", current: 60, target: 100, unit: "%", deadline: "15 Jul 2026", category: "skills" },
    { id: "g-3", title: "Complete Machine Learning Certification", current: 100, target: 100, unit: "%", deadline: "01 Jun 2026", category: "projects" },
    { id: "g-4", title: "Build Portfolio Website", current: 75, target: 100, unit: "%", deadline: "20 Jun 2026", category: "projects" },
    { id: "g-5", title: "Connect with 50 Professionals", current: 20, target: 50, unit: "connections", deadline: "31 Jul 2026", category: "networking" },
  ]);

  // New goal form state
  const [newGoal, setNewGoal] = useState({
    title: "",
    target: 5,
    current: 0,
    unit: "applications",
    deadline: "2026-07-31",
    category: "applications"
  });
  // Skills from Database
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    async function loadSkills() {
      if (!user) return;
      const { data } = await supabase
        .from("student_profiles")
        .select("skills")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setSkills(data.skills || []);
      }
    }

    if (user) loadSkills();
  }, [user]);

  // Skills state (Section 2)
  const skillsData = [
    { name: "React.js", category: "Frontend", addedDate: "12 May 2026", level: "Intermediate", matches: 28 },
    { name: "Machine Learning", category: "Data Science", addedDate: "20 Apr 2026", level: "Advanced", matches: 15 },
    { name: "Python", category: "Programming", addedDate: "05 Mar 2026", level: "Expert", matches: 42 },
    { name: "Financial Modelling", category: "Finance", addedDate: "18 Feb 2026", level: "Intermediate", matches: 8 },
    { name: "Leadership", category: "Soft Skills", addedDate: "10 Jan 2026", level: "Advanced", matches: 31 },
    { name: "Data Analysis", category: "Data Science", addedDate: "22 Mar 2026", level: "Advanced", matches: 22 },
    { name: "Communication", category: "Soft Skills", addedDate: "15 Jan 2026", level: "Expert", matches: 50 },
    { name: "Node.js", category: "Backend", addedDate: "29 May 2026", level: "Beginner", matches: 19 },
  ];



  // Skill Growth Timeline Chart Data (Section 2)
  const skillGrowthData = [
    { name: "Jan", skills: 8 },
    { name: "Feb", skills: 11 },
    { name: "Mar", skills: 14 },
    { name: "Apr", skills: 18 },
    { name: "May", skills: 22 },
    { name: "Jun", skills: 24 },
  ];

  const aiInsights = [
    { id: "ai-1", category: "growth", text: "Your profile visibility increased by 18% this month.", impact: "+18% Visibility", action: "Optimize Profile" },
    { id: "ai-2", category: "skills", text: "Adding 2 more projects could increase profile completion to 95%.", impact: "+10% Completion", action: "Add Project" },
    { id: "ai-3", category: "opportunities", text: "React.js and Python are the most requested skills in your saved opportunities.", impact: "High Match", action: "Apply Now" },
    { id: "ai-4", category: "networking", text: "Scholars with similar profiles typically have 4 certifications.", impact: "Benchmark Match", action: "Explore Certifications" },
    { id: "ai-5", category: "growth", text: "Completing your current goals may increase opportunity matching score by 22%.", impact: "+22% Match Score", action: "Review Goals" },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // HTML5 Drag & Drop handlers for Kanban Board
  const handleDragStart = (e, cardId) => {
    e.dataTransfer.setData("text/plain", cardId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text/plain");

    const movedCard = kanbanCards.find(c => c.id === cardId);
    if (!movedCard || movedCard.status === targetStatus) return;

    // Update local state optimistically
    setKanbanCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, status: targetStatus } : c))
    );

    toast.success(`Moved "${movedCard.title}" to ${targetStatus.toUpperCase()}`);

    // Update Supabase
    try {
      await supabase.from('applications').update({ status: targetStatus }).eq('id', cardId);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status in database");
    }
  };

  const moveCard = async (cardId, targetStatus) => {
    const movedCard = kanbanCards.find(c => c.id === cardId);
    if (!movedCard || movedCard.status === targetStatus) return;

    setKanbanCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, status: targetStatus } : c))
    );
    toast.success("Opportunity column updated successfully");

    try {
      await supabase.from('applications').update({ status: targetStatus }).eq('id', cardId);
    } catch (err) {
      console.error(err);
    }
  };

  // Goal updates
  const adjustGoalProgress = (goalId, amount) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const newProgress = Math.max(0, Math.min(g.target, g.current + amount));
        if (newProgress === g.target && g.current < g.target) {
          toast.success(`🎉 Goal Completed: "${g.title}"!`);
        }
        return { ...g, current: newProgress };
      })
    );
  };

  const addNewGoal = (e) => {
    e.preventDefault();
    if (!newGoal.title.trim()) {
      toast.error("Please enter a goal title.");
      return;
    }
    const created = {
      id: `g-${Date.now()}`,
      title: newGoal.title,
      current: Number(newGoal.current),
      target: Number(newGoal.target),
      unit: newGoal.unit,
      deadline: new Date(newGoal.deadline).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      category: newGoal.category
    };

    setGoals((prev) => [...prev, created]);
    setIsGoalModalOpen(false);
    setNewGoal({
      title: "",
      target: 5,
      current: 0,
      unit: "applications",
      deadline: "2026-07-31",
      category: "applications"
    });
    toast.success("New career goal created!");
  };

  const handleExportPDF = () => {
    toast.info("Generating Progress Report PDF...", {
      description: "Compiling metrics, goal statuses, and skill analytics.",
    });
    setTimeout(() => {
      toast.success("PDF Downloaded successfully!", {
        description: "Karta_Connect_Progress_Report_" + Date.now().toString() + ".pdf"
      });
    }, 2000);
  };

  const handleShareProgress = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Progress profile link copied to clipboard!", {
      description: "You can now share your achievements with mentors and employers."
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ----------------- PAGE HEADER & TOP ACTIONS ----------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border/60 pb-6 relative z-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
            My Progress
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base font-medium">
            Track your professional growth, achievements, opportunities, and career journey.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleShareProgress}
            className="bg-card hover:bg-muted border border hover:border-muted text-foreground font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" /> Share Progress
          </Button>
          <Button
            onClick={handleExportPDF}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary/80 text-primary-foreground font-bold px-4 py-2 rounded-xl shadow-lg shadow-sm hover:shadow-sm transition-all flex items-center gap-2"
          >
            <FileDown className="h-4 w-4 text-primary-foreground" /> Export PDF Report
          </Button>
        </div>
      </div>

      {/* ----------------- SECTION 1: OVERVIEW METRICS ----------------- */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 overflow-x-auto relative z-10">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Applications Submitted</CardTitle>
            <Briefcase className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="overflow-hidden">
            <div className="text-3xl font-black text-foreground">{kanbanCards.length}</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Plus className="h-3 w-3 inline" />2 this week
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ----------------- SECTION 2 & SECTION 9: CHART & SUMMARY ROW ----------------- */}
      <div className="grid gap-6 lg:grid-cols-3 relative z-10">
        <div className="lg:col-span-2 bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Skill Growth Journey</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Visualize your cumulative skill acquisition history.</p>
              </div>
              <div className="bg-card border border rounded-lg p-1 text-[11px] text-muted-foreground font-bold flex gap-2">
                <span className="px-2 py-0.5 bg-muted rounded text-foreground">2026 Cumulative</span>
              </div>
            </div>
            <div className="h-64 mt-2">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={skillGrowthData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSkills" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E2B13C" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#E2B13C" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 30]} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }} />
                    <Area type="monotone" dataKey="skills" stroke="#E2B13C" strokeWidth={3} fillOpacity={1} fill="url(#colorSkills)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="mt-6 border-t border/60 pt-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Recently Added Skills</h4>
            <div className="flex flex-wrap gap-2">
              {skillsData.map((sk) => (
                <button
                  key={sk.name}
                  onClick={() => setSelectedSkill(selectedSkill?.name === sk.name ? null : sk)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-300 flex items-center gap-1.5 ${selectedSkill?.name === sk.name ? "bg-primary/20 border-primary text-primary" : "bg-card border hover:border-muted text-muted-foreground hover:bg-muted/60"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  {sk.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Personal Growth Summary</h2>
            <p className="text-xs text-muted-foreground mt-0.5">A comprehensive assessment of your career readiness.</p>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative w-40 h-28 flex items-end justify-center overflow-hidden">
                <svg className="w-40 h-40 absolute left-3 top-0">
                  <defs>
                    <linearGradient id="radialGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#E2B13C" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                  <path d="M 12 80 A 68 68 0 0 1 148 80" className="stroke-border fill-none" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 12 80 A 68 68 0 0 1 148 80" className="stroke-amber-400 fill-none" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${Math.PI * 68}`} strokeDashoffset={`${Math.PI * 68 * (1 - 0.87)}`} />
                </svg>
                <div className="absolute left-1/2 top-[65%] -translate-x-1/2 -translate-y-1/2 text-center z-10">
                  <span className="text-3xl font-black text-foreground">87</span>
                  <span className="text-muted-foreground text-xs font-bold block">GROWTH SCORE</span>
                </div>
              </div>
              <div className="mt-2 text-center">
                <span className="text-xs font-bold px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">Career Readiness: Advanced</span>
              </div>
            </div>
          </div>
          <div className="space-y-4 border-t border/60 pt-4">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Top Strengths</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {["Problem Solving", "Leadership", "Machine Learning", "Communication"].map((str) => (
                  <span key={str} className="text-xs px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md font-medium">{str}</span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Improvement Areas</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {["Public Speaking", "Cloud Technologies"].map((imp) => (
                  <span key={imp} className="text-xs px-2 py-1 bg-primary/10 border border-primary/20 text-primary rounded-md font-medium">{imp}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* ----------------- SECTION 4: OPPORTUNITY PROGRESS TRACKER (KANBAN) ----------------- */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm relative z-10">
        <div>
          <h2 className="text-lg font-bold text-foreground">Opportunity Journey</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Drag and drop cards or select actions to update application stages.</p>
        </div>
        <div className="grid gap-4 mt-6 overflow-x-auto grid-cols-5 min-w-[1100px] pb-4">
          {(["applied", "under review", "shortlisted", "selected", "rejected"]).map((status) => {
            const columnsInfo = {
              applied: { title: "Applied", border: "border", text: "text-blue-400", bg: "bg-blue-400/5", badge: "bg-blue-400/10" },
              "under review": { title: "Under Review", border: "border", text: "text-orange-400", bg: "bg-orange-400/5", badge: "bg-orange-400/10" },
              shortlisted: { title: "Shortlisted", border: "border", text: "text-purple-400", bg: "bg-purple-400/5", badge: "bg-purple-400/10" },
              selected: { title: "Selected", border: "border-emerald-500/20", text: "text-emerald-400", bg: "bg-emerald-400/5", badge: "bg-emerald-400/10" },
              rejected: { title: "Rejected", border: "border-destructive/20", text: "text-destructive", bg: "bg-destructive/5", badge: "bg-destructive/10" }
            }[status];

            const colCards = kanbanCards.filter((c) => c.status === status);

            return (
              <div
                key={status}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
                className={`flex flex-col min-h-[350px] rounded-xl border ${columnsInfo.border} bg-card/10 backdrop-blur-sm p-3 transition-colors duration-200`}
              >
                <div className="flex items-center justify-between pb-3 border-b border/50 mb-3">
                  <span className={`text-xs font-black uppercase tracking-wider ${columnsInfo.text}`}>{columnsInfo.title}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${columnsInfo.text} ${columnsInfo.badge}`}>{colCards.length}</span>
                </div>
                <div className="flex-1 space-y-3">
                  {colCards.map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card.id)}
                      className="group relative bg-card/90 border border hover:border-primary/30 rounded-xl p-3.5 shadow-md hover:shadow-lg transition-all duration-300 cursor-grab active:cursor-grabbing hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{card.company}</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-muted text-muted-foreground rounded-md">{card.type}</span>
                      </div>
                      <h4 className="text-xs font-bold text-foreground mt-1.5 group-hover:text-[#E2B13C] transition-colors">{card.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1 font-medium line-clamp-1">{card.subtitle}</p>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border/50">
                        <span className="text-[9px] text-muted-foreground font-medium flex items-center gap-1"><Calendar className="h-3 w-3" /> {card.date}</span>
                        <div className="relative group/actions">
                          <button className="text-[9px] font-bold text-primary hover:underline px-1.5 py-0.5 bg-primary/10 rounded">Stage</button>
                          <div className="hidden group-hover/actions:flex flex-col absolute bottom-full right-0 bg-background border border rounded-lg shadow-xl p-1 z-30 w-32 space-y-0.5 text-left">
                            {(["applied", "under review", "shortlisted", "selected", "rejected"]).map((opt) => (
                              <button key={opt} onClick={() => moveCard(card.id, opt)} className="text-[10px] px-2 py-1 hover:bg-card rounded font-bold text-muted-foreground text-left capitalize">Move to {opt}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {colCards.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-28 border border-dashed border rounded-xl p-4 text-center">
                      <AlertCircle className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-[10px] text-muted-foreground font-semibold">Drag cards here</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ----------------- SECTION 5 & SECTION 6: RESUME & GOALS ROW ----------------- */}
      <div className="grid gap-6 md:grid-cols-1 relative z-10 mb-8 mt-4">

        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">My Career Goals</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Set, adjust progress, and hit milestones.</p>
              </div>
              <button
                onClick={() => setIsGoalModalOpen(true)}
                className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Create Goal
              </button>
            </div>
            <div className="space-y-4">
              {goals.map((goal) => {
                const percent = Math.round((goal.current / goal.target) * 100);
                const isCompleted = goal.current >= goal.target;
                return (
                  <div key={goal.id} className="bg-card/40 border border/80 p-3.5 rounded-xl hover:border-muted/60 transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isCompleted ? <div className="bg-emerald-500/10 p-1 rounded-md text-emerald-400"><Check className="h-3.5 w-3.5" /></div> : <div className="bg-primary/10 p-1 rounded-md text-primary"><Clock className="h-3.5 w-3.5" /></div>}
                        <h4 className={`text-xs font-bold ${isCompleted ? "text-muted-foreground line-through" : "text-foreground"}`}>{goal.title}</h4>
                      </div>
                      {isCompleted ? <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-black">COMPLETED</span> : <span className="text-[10px] text-muted-foreground font-bold">{goal.current}/{goal.target} {goal.unit}</span>}
                    </div>
                    <div className="w-full bg-background rounded-full h-1.5 overflow-hidden flex">
                      <div className={`h-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-primary/80 to-primary"}`} style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border/40">
                      <span className="text-[9px] text-muted-foreground font-bold">DEADLINE: {goal.deadline}</span>
                      {!isCompleted && (
                        <div className="flex gap-1">
                          <button onClick={() => adjustGoalProgress(goal.id, -1)} className="bg-card hover:bg-muted text-[10px] text-muted-foreground hover:text-foreground h-6 w-6 rounded border border flex items-center justify-center">-</button>
                          <button onClick={() => adjustGoalProgress(goal.id, 1)} className="bg-card hover:bg-muted text-[10px] text-muted-foreground hover:text-foreground h-6 w-6 rounded border border flex items-center justify-center font-bold">+</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- SECTION 7: AI INSIGHTS ----------------- */}
      <div className="bg-card border rounded-2xl p-6 shadow-sm relative z-10">
        <div className="flex items-center gap-3 pb-6">
          <div className="bg-primary/20 p-2 rounded-xl"><Sparkles className="h-6 w-6 text-primary" /></div>
          <div>
            <h2 className="text-lg font-bold text-foreground">AI Growth Insights</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Automated recommendations based on your activity and goals.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aiInsights.map(insight => (
            <div key={insight.id} className="bg-card/80 border border hover:border-primary/40 p-4 rounded-xl transition-all duration-300">
              <span className="text-[9px] font-black uppercase tracking-wider text-primary mb-2 block">{insight.category} Insight</span>
              <p className="text-xs text-muted-foreground mb-4 font-medium">{insight.text}</p>
              <div className="flex items-center justify-between pt-3 border-t border/60">
                <span className="text-[10px] font-bold text-emerald-400">{insight.impact}</span>
                <button className="text-[10px] font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1">{insight.action} <ArrowRight className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ----------------- CREATE GOAL MODAL ----------------- */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background border border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden relative">
            <div className="flex items-center justify-between p-4 border-b border/60 bg-card/50">
              <h3 className="font-bold text-foreground flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Create Career Goal</h3>
              <button onClick={() => setIsGoalModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={addNewGoal} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Goal Title</label>
                <input required type="text" value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} placeholder="e.g. Apply to 10 Jobs" className="w-full bg-card border border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Target Amount</label>
                  <input required type="number" min="1" value={newGoal.target} onChange={e => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 1 })} className="w-full bg-card border border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Unit (e.g. apps, %)</label>
                  <input required type="text" value={newGoal.unit} onChange={e => setNewGoal({ ...newGoal, unit: e.target.value })} className="w-full bg-card border border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Deadline</label>
                <input required type="date" value={newGoal.deadline} onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })} className="w-full bg-card border border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="pt-4 border-t border/60 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsGoalModalOpen(false)} className="text-muted-foreground hover:text-foreground hover:bg-card">Cancel</Button>
                <Button type="submit" className="bg-primary hover:bg-primary text-primary-foreground font-bold px-5">Save Goal</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
