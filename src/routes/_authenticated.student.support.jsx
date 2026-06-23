import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquareWarning, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/student/support")({
  head: () => ({ meta: [{ title: "Support — Karta Connect" }] }),
  component: StudentSupportPage,
});

function StudentSupportPage() {
  const { user, role } = useAuth();
  const [issueType, setIssueType] = useState("bug_report");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please provide a description of your issue.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("moderation_issues").insert({
        reporter_id: user.id,
        reporter_email: user.email,
        reporter_role: role || "student",
        issue_type: issueType,
        description: description,
      });

      if (error) throw error;

      toast.success("Your report has been submitted successfully!");
      setIsSuccess(true);
      setDescription("");
      
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error(error.message || "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Support & Moderation</h1>
        <p className="text-muted-foreground">Report bugs, query issues, or flag inappropriate content. Our moderation team reviews these daily.</p>
      </div>

      <Card>
        <CardContent className="p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <MessageSquareWarning className="w-64 h-64 text-muted-foreground rotate-12" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                Issue Type
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                disabled={isSubmitting}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              >
                <option value="bug_report">🐛 Bug Report</option>
                <option value="user_report">👤 Report a User</option>
                <option value="content_violation">🚩 Content Violation</option>
                <option value="other">💬 General Query / Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                placeholder="Please provide as much detail as possible..."
                className="w-full min-h-[200px] border rounded-md px-3 py-2 text-sm bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button
                type="submit"
                disabled={isSubmitting || !description.trim() || isSuccess}
                className={isSuccess ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin text-xl">⟳</span> Submitting...
                  </span>
                ) : isSuccess ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Submitted
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" /> Submit Report
                  </span>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Submitting as <span className="font-bold">{user?.email}</span>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
