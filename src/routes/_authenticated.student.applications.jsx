import { createFileRoute, Link } from "@tanstack/react-router";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Briefcase, Calendar, Info, Loader2 } from "lucide-react";
import { requireStudent } from "@/lib/route-guards";
export const Route = createFileRoute("/_authenticated/student/applications")({
    beforeLoad: requireStudent,
    component: StudentApplicationsPage,
});
function StudentApplicationsPage() {
    const { user } = useAuth();
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    useEffect(() => {
        async function loadApplications() {
            if (!user)
                return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("applications")
                    .select("*, job_post:job_posts(*, company:companies(name, logo_url))")
                    .eq("student_id", user.id)
                    .order("applied_at", { ascending: false });
                if (error)
                    throw error;
                setApps(data || []);
            }
            catch (err) {
                console.error("Error loading applications:", err);
            }
            finally {
                setLoading(false);
            }
        }
        loadApplications();
    }, [user]);
    if (loading) {
        return (<div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>);
    }
    const statusStyles = {
        applied: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        "under review": "bg-orange-500/10 text-orange-500 border-orange-500/20",
        shortlisted: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        selected: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        rejected: "bg-destructive/10 text-destructive border-destructive/20"
    };
    const statusLabels = {
        applied: "Applied",
        "under review": "Under Review",
        shortlisted: "Shortlisted",
        selected: "Selected",
        rejected: "Rejected"
    };

    const COLORS = {
        applied: "#3b82f6", // blue-500
        "under review": "#f97316", // orange-500
        shortlisted: "#a855f7", // purple-500
        selected: "#10b981", // emerald-500
        rejected: "#ef4444" // red-500
    };

    const statsMap = {
        applied: 0,
        "under review": 0,
        shortlisted: 0,
        selected: 0,
        rejected: 0
    };

    apps.forEach(app => {
        if (statsMap[app.status] !== undefined) {
            statsMap[app.status]++;
        } else {
            statsMap[app.status] = 1;
        }
    });

    const chartData = Object.keys(statsMap)
        .filter(key => statsMap[key] > 0)
        .map(key => ({
            name: statusLabels[key] || key,
            value: statsMap[key],
            color: COLORS[key] || "#8884d8"
        }));
    return (<div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground">Monitor the status of your submissions to corporate partners.</p>
      </div>

      {apps.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Application Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={chartData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip formatter={(value, name) => [value, name]} />
                 </PieChart>
               </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="h-full flex flex-col justify-center">
             <CardHeader className="pb-2">
               <CardTitle>Pipeline Breakdown</CardTitle>
               <CardDescription>Track your application conversion across stages.</CardDescription>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                 <div className="flex flex-col justify-center p-3.5 bg-muted/30 rounded-xl border border-border/50 transition-all hover:bg-muted/50">
                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Apps</span>
                   <span className="text-2xl font-black text-foreground">{apps.length}</span>
                 </div>
                 <div className="flex flex-col justify-center p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 transition-all hover:bg-emerald-500/15">
                   <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Selected</span>
                   <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{statsMap.selected || 0}</span>
                 </div>
                 <div className="flex flex-col justify-center p-3.5 bg-purple-500/10 rounded-xl border border-purple-500/20 transition-all hover:bg-purple-500/15">
                   <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">Shortlisted</span>
                   <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{statsMap.shortlisted || 0}</span>
                 </div>
                 <div className="flex flex-col justify-center p-3.5 bg-orange-500/10 rounded-xl border border-orange-500/20 transition-all hover:bg-orange-500/15">
                   <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">Reviewing</span>
                   <span className="text-2xl font-black text-orange-600 dark:text-orange-400">{statsMap["under review"] || 0}</span>
                 </div>
                 <div className="flex flex-col justify-center p-3.5 bg-blue-500/10 rounded-xl border border-blue-500/20 transition-all hover:bg-blue-500/15">
                   <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Applied</span>
                   <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{statsMap.applied || 0}</span>
                 </div>
                 <div className="flex flex-col justify-center p-3.5 bg-destructive/10 rounded-xl border border-destructive/20 transition-all hover:bg-destructive/15">
                   <span className="text-[10px] font-bold text-destructive uppercase tracking-wider mb-1">Rejected</span>
                   <span className="text-2xl font-black text-destructive">{statsMap.rejected || 0}</span>
                 </div>
               </div>
             </CardContent>
          </Card>
        </div>
      )}

      {/* Status filter pills */}
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
         className="border rounded-md px-3 py-2 text-sm"
       >
         <option value="">All</option>
         <option value="applied">Applied</option>
         <option value="under review">Under Review</option>
         <option value="shortlisted">Shortlisted</option>
         <option value="selected">Selected</option>
         <option value="rejected">Rejected</option>
        </select>
      </div>

      {apps.length === 0 ? (<Card className="border-dashed py-12 text-center max-w-xl mx-auto">
          <CardHeader>
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2"/>
            <CardTitle>No submissions yet</CardTitle>
            <CardDescription>You haven't applied to any job postings on the network.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/student/jobs" search={{}}><Button>Find verified jobs</Button></Link>
          </CardContent>
        </Card>) : (<div className="space-y-4 max-w-3xl">
          {apps.filter(a => !statusFilter || a.status === statusFilter).map((app) => (<Card key={app.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 border rounded bg-muted flex items-center justify-center overflow-hidden shrink-0 mt-1">
                      {app.job_post?.company?.logo_url ? (<img src={app.job_post.company.logo_url} alt={app.job_post.company.name} className="h-full w-full object-cover"/>) : (<Briefcase className="h-6 w-6 text-muted-foreground"/>)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{app.job_post?.title}</h3>
                      <p className="text-sm font-semibold text-muted-foreground mt-0.5">
                        {app.job_post?.company?.name}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5"/>
                          Applied: {new Date(app.applied_at).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{app.job_post?.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
                    <span className={`text-xs border px-3 py-1 rounded-full capitalize font-semibold ${statusStyles[app.status] || "bg-muted text-muted-foreground"}`}>
                      {statusLabels[app.status] || app.status}
                    </span>
                  </div>
                </div>

                {app.cover_note && (<div className="mt-4 border-t pt-3 flex gap-2 text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
                    <Info className="h-4 w-4 shrink-0 text-primary mt-0.5"/>
                    <div>
                      <span className="font-semibold block mb-0.5">Your motivation cover note:</span>
                      <p className="italic">"{app.cover_note}"</p>
                    </div>
                  </div>)}
              </CardContent>
            </Card>))}
        </div>)}
    </div>);
}
