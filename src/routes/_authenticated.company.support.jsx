import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/company/support")({
  component: CompanySupportPage,
});

function CompanySupportPage() {
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [reports, setReports] = useState([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadReports() {
    const { data: authData } = await supabase.auth.getUser();

    const user = authData.user;

    if (!user) return;

    const { data, error } = await supabase
      .from("moderation_issues")
      .select("*")
      .eq("reporter_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.log(error);

      return;
    }

    setReports(data || []);
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function handleSubmit() {
    if (!issueType || !description.trim()) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    const { data } = await supabase.auth.getUser();

    const user = data.user;

    if (!user) {
      setLoading(false);

      return;
    }

    const { error } = await supabase.from("moderation_issues").insert({
      reporter_id: user.id,
      reporter_email: user.email,
      reporter_role: "company",
      issue_type: issueType,
      description,
    });

    setLoading(false);

    if (error) {
      console.log(error);

      alert("Failed to submit report");

      return;
    }
    setSuccess(true);

    setIssueType("");

    setDescription("");

    loadReports();

    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div>
        <div>
          <h1 className="text-3xl font-bold">🛟 Help & Support</h1>

          <p className="text-muted-foreground mt-2">
            Experiencing a problem while using Karta Connect? Send a report to
            the admin team and we'll review it.
          </p>
        </div>
      </div>

      {/* Card */}

      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
        {/* Issue Type */}

        <div className="space-y-2">
          <label className="font-medium">Issue Type</label>
          <select
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            className="
    w-full
    rounded-md
    border
    border-border
    bg-background
    text-foreground
    p-3
  "
          >
            <option value="">Select issue type</option>

            <option value="bug_report">Bug Report</option>

            <option value="user_report">User Report</option>

            <option value="content_violation">Content Violation</option>

            <option value="other">Other</option>
          </select>
        </div>

        {/* Description */}

        <div className="space-y-2">
          <label className="font-medium">Description</label>

          <textarea
            rows={6}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border p-3"
            placeholder="Describe your issue in detail..."
          />

          <p className="text-sm text-muted-foreground text-right">
            {description.length}/500
          </p>
        </div>

        {/* Button */}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="
    rounded-md
    bg-primary
    px-5
    py-2
    text-primary-foreground
    hover:opacity-90
    disabled:opacity-50
  "
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>

        {success && (
          <div className="rounded-md border border-green-500 bg-green-100 p-3 text-green-700">
            ✅ Report submitted successfully.
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">📋 My Reports</h2>

        {reports.length === 0 ? (
          <p className="text-muted-foreground">No reports submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="
            border
            rounded-lg
            p-4
            flex
            justify-between
            items-center
          "
              >
                <div>
                  <p className="font-semibold">
                    {report.issue_type
                      .replaceAll("_", " ")
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {report.description}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className={`
    font-medium
    ${
      report.status === "open"
        ? "text-yellow-500"
        : report.status === "resolved"
          ? "text-green-500"
          : "text-blue-500"
    }
  `}
                  >
                    {report.status}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
