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

// Types & Data Structures
interface KanbanCard {
  id: string;
  title: string;
  subtitle: string;
  company: string;
  type: string;
  date: string;
  status: "applied" | "shortlisted" | "interview" | "offer" | "completed";
}

interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  deadline: string;
  category: "applications" | "skills" | "networking" | "projects";
}

interface Skill {
  name: string;
  category: string;
  addedDate: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  matches: number;
}

interface ResumeVersion {
  version: string;
  date: string;
  highlight: string;
  description: string;
  skills: string[];
}

function StudentProgressPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [activityFilter, setActivityFilter] = useState<"30d" | "3m" | "1y">("30d");

  // Modals & Popovers state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // 1. Kanban Board State (Section 4)
  const [kanbanCards, setKanbanCards] = useState<KanbanCard[]>([
    { id: "kb-1", title: "Google Internship", subtitle: "Software Engineering Intern", company: "Google", type: "Internship", date: "10 Jun 2026", status: "applied" },
    { id: "kb-2", title: "UNICEF Research Program", subtitle: "Data Science Fellowship", company: "UNICEF", type: "Fellowship", date: "08 Jun 2026", status: "applied" },
    { id: "kb-3", title: "Deloitte Analyst Program", subtitle: "Tech Advisory Analyst", company: "Deloitte", type: "Full-Time", date: "01 Jun 2026", status: "shortlisted" },
    { id: "kb-4", title: "EY Consulting Internship", subtitle: "Strategy & Transactions Intern", company: "EY", type: "Internship", date: "28 May 2026", status: "shortlisted" },
    { id: "kb-5", title: "Bellurbis Software Internship", subtitle: "Frontend React Developer", company: "Bellurbis", type: "Internship", date: "24 May 2026", status: "interview" },
    { id: "kb-6", title: "Amazon SDE Internship", subtitle: "Software Development Engineer Intern", company: "Amazon", type: "Internship", date: "15 May 2026", status: "offer" },
    { id: "kb-7", title: "AI Research Fellowship", subtitle: "NLP Scholar", company: "Karta Foundation", type: "Fellowship", date: "10 Apr 2026", status: "completed" },
  ]);

  // 2. Career Goals State (Section 6)
  const [goals, setGoals] = useState<Goal[]>([
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
    category: "applications" as any
  });
  // Skills from Database
  const { user } = useAuth();
  const [skills, setSkills] = useState<string[]>([]);

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
  const skillsData: Skill[] = [
    { name: "React.js", category: "Frontend", addedDate: "12 May 2026", level: "Intermediate", matches: 28 },
    { name: "Machine Learning", category: "Data Science", addedDate: "20 Apr 2026", level: "Advanced", matches: 15 },
    { name: "Python", category: "Programming", addedDate: "05 Mar 2026", level: "Expert", matches: 42 },
    { name: "Financial Modelling", category: "Finance", addedDate: "18 Feb 2026", level: "Intermediate", matches: 8 },
    { name: "Leadership", category: "Soft Skills", addedDate: "10 Jan 2026", level: "Advanced", matches: 31 },
    { name: "Data Analysis", category: "Data Science", addedDate: "22 Mar 2026", level: "Advanced", matches: 22 },
    { name: "Communication", category: "Soft Skills", addedDate: "15 Jan 2026", level: "Expert", matches: 50 },
    { name: "Node.js", category: "Backend", addedDate: "29 May 2026", level: "Beginner", matches: 19 },
  ];

  // Resume Versions (Section 5)
  const resumeVersions: ResumeVersion[] = [
    { version: "Version 5", date: "15 May 2026", highlight: "Added AI Projects", description: "Updated experience with AI Research Fellowship details and NLP models project.", skills: ["Python", "PyTorch", "NLP", "Machine Learning"] },
    { version: "Version 4", date: "20 Apr 2026", highlight: "Added Internship Experience", description: "Incorporated Bellurbis Frontend development internship achievements and React details.", skills: ["React.js", "Tailwind CSS", "JavaScript", "TypeScript"] },
    { version: "Version 3", date: "05 Mar 2026", highlight: "Added Certifications", description: "Added Coursera Machine Learning and Financial Modelling credentials.", skills: ["Python", "Financial Analysis", "Machine Learning"] },
  ];

  // Activity Overview Chart Data based on selected filter (Section 3)
  const activityChartData = {
    "30d": [
      { name: "Posts Created", count: 14 },
      { name: "Connections Made", count: 23 },
      { name: "Applications Submitted", count: 8 },
      { name: "Profile Updates", count: 5 },
    ],
    "3m": [
      { name: "Posts Created", count: 38 },
      { name: "Connections Made", count: 65 },
      { name: "Applications Submitted", count: 24 },
      { name: "Profile Updates", count: 12 },
    ],
    "1y": [
      { name: "Posts Created", count: 120 },
      { name: "Connections Made", count: 210 },
      { name: "Applications Submitted", count: 78 },
      { name: "Profile Updates", count: 32 },
    ],
  };

  const activityStats = {
    "30d": { posts: 14, connections: 23, apps: 8, updates: 5, trends: { posts: "+12%", connections: "+18%", apps: "+25%", updates: "+66%" } },
    "3m": { posts: 38, connections: 65, apps: 24, updates: 12, trends: { posts: "+8%", connections: "+14%", apps: "+19%", updates: "+20%" } },
    "1y": { posts: 120, connections: 210, apps: 78, updates: 32, trends: { posts: "+45%", connections: "+32%", apps: "+52%", updates: "+15%" } },
  };

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
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData("text/plain", cardId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: KanbanCard["status"]) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text/plain");

    // Update card status
    setKanbanCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, status: targetStatus, date: "Today" } : c))
    );

    const movedCard = kanbanCards.find(c => c.id === cardId);
    if (movedCard) {
      toast.success(`Moved "${movedCard.title}" to ${targetStatus.toUpperCase()}`);
    }
  };

  const moveCard = (cardId: string, targetStatus: KanbanCard["status"]) => {
    setKanbanCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, status: targetStatus, date: "Today" } : c))
    );
    toast.success("Opportunity column updated successfully");
  };

  // Goal updates
  const adjustGoalProgress = (goalId: string, amount: number) => {
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

  const addNewGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim()) {
      toast.error("Please enter a goal title.");
      return;
    }
    const created: Goal = {
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
    <div className="space-y-8 animate-in fade-in duration-500 bg-background text-foreground p-6 md:p-8 rounded-2xl border border-border/30 shadow-lg -mx-6 md:-mx-8 my-0 min-h-[calc(100vh-3rem)] relative overflow-x-hidden overflow-y-auto">

      {/* Visual background lights for glassmorphism glow effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[160px] pointer-events-none" />

      {/* ----------------- PAGE HEADER & TOP ACTIONS ----------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/60 pb-6 relative z-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
            My Progress
          </h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base font-medium">
            Track your professional growth, achievements, opportunities, and career journey.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleShareProgress}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" /> Share Progress
          </Button>
          <Button
            onClick={handleExportPDF}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <FileDown className="h-4 w-4 text-slate-950" /> Export PDF Report
          </Button>
        </div>
      </div>

      {/* ----------------- SECTION 1: OVERVIEW METRICS ----------------- */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 overflow-x-auto relative z-10">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profile Completion</CardTitle>
            <Star className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="overflow-hidden">
            <div className="grid grid-cols-[auto_1fr] gap-4 items-center">
              <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" strokeWidth="6" className="stroke-slate-800 fill-none" />
                  <circle cx="40" cy="40" r="34" strokeWidth="6" className="stroke-amber-400 fill-none" strokeDasharray={213.6} strokeDashoffset={32} strokeLinecap="round" />
                </svg>
                <span className="absolute text-base font-bold leading-none">85%</span>
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Plus className="h-3 w-3" />
                  5% this month
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Skills Added</CardTitle>
            <GraduationCap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{skills.length} Skills</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
                <Plus className="h-3 w-3 inline" />4 this month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">12 Active</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-amber-400" /> 1 interview pending
              </span>
            </div>
          </CardContent>
        </Card>

        <Card id="goals-achieved-card" className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Goals Achieved</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {(() => {
              const completedGoals = goals.filter(g => g.current >= g.target);
              const completed = completedGoals.length;
              const total = goals.length;
              const percent = total ? Math.round((completed / total) * 100) : 0;
              return (
                <>
                  <div className="text-3xl font-black text-foreground">{completed}/{total}</div>
                  <div className="mt-3">
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex relative">
                      <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-full transition-all duration-500" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="flex justify-between items-center mt-1.5">
                      <span className="text-[10px] text-slate-500 font-bold">{percent}% COMPLETED</span>
                      <span className="text-[10px] text-amber-400 font-bold">{total - completed} IN PROGRESS</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* ----------------- SECTION 2 & SECTION 9: CHART & SUMMARY ROW ----------------- */}
      <div className="grid gap-6 lg:grid-cols-3 relative z-10">
        <div className="lg:col-span-2 bg-gradient-to-b from-slate-900/40 to-slate-950/60 backdrop-blur-xl border border-slate-850 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100">Skill Growth Journey</h2>
                <p className="text-xs text-slate-400 mt-0.5">Visualize your cumulative skill acquisition history.</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 text-[11px] text-slate-400 font-bold flex gap-2">
                <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-200">2026 Cumulative</span>
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
          <div className="mt-6 border-t border-slate-800/60 pt-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recently Added Skills</h4>
            <div className="flex flex-wrap gap-2">
              {skillsData.map((sk) => (
                <button
                  key={sk.name}
                  onClick={() => setSelectedSkill(selectedSkill?.name === sk.name ? null : sk)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-300 flex items-center gap-1.5 ${selectedSkill?.name === sk.name ? "bg-amber-400/20 border-amber-400 text-amber-300" : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/60"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  {sk.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-slate-900/40 to-slate-950/60 backdrop-blur-xl border border-slate-850 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Personal Growth Summary</h2>
            <p className="text-xs text-slate-400 mt-0.5">A comprehensive assessment of your career readiness.</p>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative w-40 h-28 flex items-end justify-center overflow-hidden">
                <svg className="w-40 h-40 absolute left-3 top-0">
                  <defs>
                    <linearGradient id="radialGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#E2B13C" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                  <path d="M 12 80 A 68 68 0 0 1 148 80" className="stroke-slate-800 fill-none" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 12 80 A 68 68 0 0 1 148 80" className="stroke-amber-400 fill-none" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${Math.PI * 68}`} strokeDashoffset={`${Math.PI * 68 * (1 - 0.87)}`} />
                </svg>
                <div className="absolute left-1/2 top-[65%] -translate-x-1/2 -translate-y-1/2 text-center z-10">
                  <span className="text-3xl font-black text-slate-100">87</span>
                  <span className="text-slate-500 text-xs font-bold block">GROWTH SCORE</span>
                </div>
              </div>
              <div className="mt-2 text-center">
                <span className="text-xs font-bold px-3 py-1 bg-amber-400/10 text-amber-400 rounded-full border border-amber-400/25">Career Readiness: Advanced</span>
              </div>
            </div>
          </div>
          <div className="space-y-4 border-t border-slate-800/60 pt-4">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Top Strengths</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {["Problem Solving", "Leadership", "Machine Learning", "Communication"].map((str) => (
                  <span key={str} className="text-xs px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md font-medium">{str}</span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Improvement Areas</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {["Public Speaking", "Cloud Technologies"].map((imp) => (
                  <span key={imp} className="text-xs px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md font-medium">{imp}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- SECTION 3: ACTIVITY ANALYTICS ----------------- */}
      <div className="bg-gradient-to-b from-slate-900/40 to-slate-950/60 backdrop-blur-xl border border-slate-850 rounded-2xl p-6 shadow-xl relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Activity Overview</h2>
            <p className="text-xs text-slate-400 mt-0.5">Comparative analytics of your platform contributions and actions.</p>
          </div>
          <div>
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value as any)}
              className="bg-slate-900/90 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:border-amber-400 transition-colors"
            >
              <option value="30d">Last 30 Days</option>
              <option value="3m">Last 3 Months</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3 items-center">
          <div className="md:col-span-2 h-64">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={activityChartData[activityFilter]} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                    {activityChartData[activityFilter].map((entry, index) => {
                      const colors = ["#E2B13C", "#3b82f6", "#10b981", "#8b5cf6"];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="space-y-4 bg-slate-950/40 border border-slate-800/60 p-5 rounded-2xl">
            <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pb-1 border-b border-slate-800">Activity Metrics Breakdown</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Posts Created</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-bold text-[#E2B13C]">{activityStats[activityFilter].posts}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">{activityStats[activityFilter].trends.posts}</span>
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Connections Made</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-bold text-blue-400">{activityStats[activityFilter].connections}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">{activityStats[activityFilter].trends.connections}</span>
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Applications</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-bold text-emerald-400">{activityStats[activityFilter].apps}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">{activityStats[activityFilter].trends.apps}</span>
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Profile Updates</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-bold text-purple-400">{activityStats[activityFilter].updates}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">{activityStats[activityFilter].trends.updates}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- SECTION 4: OPPORTUNITY PROGRESS TRACKER (KANBAN) ----------------- */}
      <div className="bg-gradient-to-b from-slate-900/40 to-slate-950/60 backdrop-blur-xl border border-slate-850 rounded-2xl p-6 shadow-xl relative z-10">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Opportunity Journey</h2>
          <p className="text-xs text-slate-400 mt-0.5">Drag and drop cards or select actions to update application stages.</p>
        </div>
        <div className="grid gap-4 mt-6 overflow-x-auto grid-cols-5 min-w-[950px] pb-4">
          {(["applied", "shortlisted", "interview", "offer", "completed"] as const).map((status) => {
            const columnsInfo = {
              applied: { title: "Applied", border: "border-slate-800", text: "text-blue-400", bg: "bg-blue-400/5", badge: "bg-blue-400/10" },
              shortlisted: { title: "Shortlisted", border: "border-slate-800", text: "text-amber-400", bg: "bg-amber-400/5", badge: "bg-amber-400/10" },
              interview: { title: "Interview Requested", border: "border-slate-800", text: "text-purple-400", bg: "bg-purple-400/5", badge: "bg-purple-400/10" },
              offer: { title: "Offer Received", border: "border-emerald-500/20", text: "text-emerald-400", bg: "bg-emerald-400/5", badge: "bg-emerald-400/10" },
              completed: { title: "Completed", border: "border-slate-850", text: "text-slate-400", bg: "bg-slate-800/5", badge: "bg-slate-700/10" }
            }[status];

            const colCards = kanbanCards.filter((c) => c.status === status);

            return (
              <div
                key={status}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
                className={`flex flex-col min-h-[350px] rounded-xl border ${columnsInfo.border} bg-slate-900/10 backdrop-blur-sm p-3 transition-colors duration-200`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/50 mb-3">
                  <span className={`text-xs font-black uppercase tracking-wider ${columnsInfo.text}`}>{columnsInfo.title}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${columnsInfo.text} ${columnsInfo.badge}`}>{colCards.length}</span>
                </div>
                <div className="flex-1 space-y-3">
                  {colCards.map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card.id)}
                      className="group relative bg-slate-900/90 border border-slate-800 hover:border-amber-400/30 rounded-xl p-3.5 shadow-md hover:shadow-lg transition-all duration-300 cursor-grab active:cursor-grabbing hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{card.company}</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded-md">{card.type}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 mt-1.5 group-hover:text-[#E2B13C] transition-colors">{card.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium line-clamp-1">{card.subtitle}</p>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/50">
                        <span className="text-[9px] text-slate-500 font-medium flex items-center gap-1"><Calendar className="h-3 w-3" /> {card.date}</span>
                        <div className="relative group/actions">
                          <button className="text-[9px] font-bold text-amber-400 hover:underline px-1.5 py-0.5 bg-amber-400/10 rounded">Stage</button>
                          <div className="hidden group-hover/actions:flex flex-col absolute bottom-full right-0 bg-slate-950 border border-slate-800 rounded-lg shadow-xl p-1 z-30 w-32 space-y-0.5 text-left">
                            {(["applied", "shortlisted", "interview", "offer", "completed"] as const).map((opt) => (
                              <button key={opt} onClick={() => moveCard(card.id, opt)} className="text-[10px] px-2 py-1 hover:bg-slate-900 rounded font-bold text-slate-300 text-left capitalize">Move to {opt}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {colCards.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-28 border border-dashed border-slate-800 rounded-xl p-4 text-center">
                      <AlertCircle className="h-5 w-5 text-slate-600 mb-1" />
                      <span className="text-[10px] text-slate-500 font-semibold">Drag cards here</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ----------------- SECTION 5 & SECTION 6: RESUME & GOALS ROW ----------------- */}
      <div className="grid gap-6 md:grid-cols-2 relative z-10">
        <div className="bg-gradient-to-b from-slate-900/40 to-slate-950/60 backdrop-blur-xl border border-slate-850 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Resume Evolution</h2>
              <p className="text-xs text-slate-400 mt-0.5">Track your resume modifications and download history.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-amber-400"><Award className="h-5 w-5" /></div>
          </div>
          <div className="relative border-l border-slate-800 ml-4 space-y-6">
            {resumeVersions.map((item, idx) => (
              <div key={item.version} className="relative pl-6">
                <div className={`absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full border-2 bg-slate-950 flex items-center justify-center ${idx === 0 ? "border-[#E2B13C] shadow-lg shadow-amber-400/20" : "border-slate-700"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? "bg-[#E2B13C]" : "bg-slate-600"}`} />
                </div>
                <div className="bg-slate-900/50 border border-slate-800 hover:border-slate-750 p-4 rounded-xl transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-black text-slate-200">{item.version}</span>
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><Calendar className="h-3 w-3" /> {item.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-amber-400">{item.highlight}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium leading-relaxed">{item.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {item.skills.map(sk => <span key={sk} className="text-[9px] px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 rounded">{sk}</span>)}
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800/40">
                    <button onClick={() => toast.success(`Viewing ${item.version} resume details`)} className="text-[10px] font-bold text-slate-300 hover:text-slate-100 flex items-center gap-1 hover:underline"><Eye className="h-3.5 w-3.5" /> View</button>
                    <button onClick={() => toast.success(`Downloading ${item.version} PDF...`)} className="text-[10px] font-bold text-slate-300 hover:text-slate-100 flex items-center gap-1 hover:underline"><FileDown className="h-3.5 w-3.5" /> Download</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-b from-slate-900/40 to-slate-950/60 backdrop-blur-xl border border-slate-850 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-100">My Career Goals</h2>
                <p className="text-xs text-slate-400 mt-0.5">Set, adjust progress, and hit milestones.</p>
              </div>
              <button
                onClick={() => setIsGoalModalOpen(true)}
                className="bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/20 rounded-xl px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Create Goal
              </button>
            </div>
            <div className="space-y-4">
              {goals.map((goal) => {
                const percent = Math.round((goal.current / goal.target) * 100);
                const isCompleted = goal.current >= goal.target;
                return (
                  <div key={goal.id} className="bg-slate-900/40 border border-slate-800/80 p-3.5 rounded-xl hover:border-slate-700/60 transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isCompleted ? <div className="bg-emerald-500/10 p-1 rounded-md text-emerald-400"><Check className="h-3.5 w-3.5" /></div> : <div className="bg-amber-500/10 p-1 rounded-md text-amber-400"><Clock className="h-3.5 w-3.5" /></div>}
                        <h4 className={`text-xs font-bold ${isCompleted ? "text-slate-400 line-through" : "text-slate-200"}`}>{goal.title}</h4>
                      </div>
                      {isCompleted ? <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-black">COMPLETED</span> : <span className="text-[10px] text-slate-400 font-bold">{goal.current}/{goal.target} {goal.unit}</span>}
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden flex">
                      <div className={`h-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-amber-400 to-amber-600"}`} style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800/40">
                      <span className="text-[9px] text-slate-500 font-bold">DEADLINE: {goal.deadline}</span>
                      {!isCompleted && (
                        <div className="flex gap-1">
                          <button onClick={() => adjustGoalProgress(goal.id, -1)} className="bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-slate-200 h-6 w-6 rounded border border-slate-800 flex items-center justify-center">-</button>
                          <button onClick={() => adjustGoalProgress(goal.id, 1)} className="bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-slate-200 h-6 w-6 rounded border border-slate-800 flex items-center justify-center font-bold">+</button>
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
      <div className="bg-gradient-to-br from-amber-500/10 via-slate-900/40 to-slate-950/60 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 shadow-xl relative z-10">
        <div className="flex items-center gap-3 pb-6">
          <div className="bg-amber-400/20 p-2 rounded-xl"><Sparkles className="h-6 w-6 text-amber-400" /></div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">AI Growth Insights</h2>
            <p className="text-xs text-slate-400 mt-0.5">Automated recommendations based on your activity and goals.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aiInsights.map(insight => (
            <div key={insight.id} className="bg-slate-900/80 border border-slate-800 hover:border-amber-400/40 p-4 rounded-xl transition-all duration-300">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 mb-2 block">{insight.category} Insight</span>
              <p className="text-xs text-slate-300 mb-4 font-medium">{insight.text}</p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
                <span className="text-[10px] font-bold text-emerald-400">{insight.impact}</span>
                <button className="text-[10px] font-bold text-slate-200 hover:text-amber-400 transition-colors flex items-center gap-1">{insight.action} <ArrowRight className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ----------------- CREATE GOAL MODAL ----------------- */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden relative">
            <div className="flex items-center justify-between p-4 border-b border-slate-800/60 bg-slate-900/50">
              <h3 className="font-bold text-slate-100 flex items-center gap-2"><Target className="h-4 w-4 text-amber-400" /> Create Career Goal</h3>
              <button onClick={() => setIsGoalModalOpen(false)} className="text-slate-400 hover:text-slate-200"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={addNewGoal} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">Goal Title</label>
                <input required type="text" value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} placeholder="e.g. Apply to 10 Jobs" className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Target Amount</label>
                  <input required type="number" min="1" value={newGoal.target} onChange={e => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 1 })} className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Unit (e.g. apps, %)</label>
                  <input required type="text" value={newGoal.unit} onChange={e => setNewGoal({ ...newGoal, unit: e.target.value })} className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">Deadline</label>
                <input required type="date" value={newGoal.deadline} onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })} className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <div className="pt-4 border-t border-slate-800/60 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsGoalModalOpen(false)} className="text-slate-400 hover:text-slate-200 hover:bg-slate-900">Cancel</Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5">Save Goal</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
