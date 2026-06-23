import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { requireAdmin } from "@/lib/route-guards";
import { authenticatedFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, Flag, Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/moderation")({
  beforeLoad: requireAdmin,
  component: AdminModerationPage,
});

function AdminModerationPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [updating, setUpdating] = useState(false);

  // Form states for the dialog
  const [adminNotes, setAdminNotes] = useState("");
  const [updateStatus, setUpdateStatus] = useState("open");

  async function loadIssues() {
    setLoading(true);
    try {
      const data = await authenticatedFetch("/api/admin/moderation-issues");
      setIssues(data || []);
    } catch (err) {
      toast.error("Failed to load moderation issues.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIssues();
  }, []);

  const filteredIssues = issues.filter(issue => 
    statusFilter === "all" ? true : issue.status === statusFilter
  );

  function handleOpenDialog(issue) {
    setSelectedIssue(issue);
    setAdminNotes(issue.admin_notes || "");
    setUpdateStatus(issue.status || "open");
    setIsDialogOpen(true);
  }

  async function handleUpdateIssue() {
    if (!selectedIssue) return;
    setUpdating(true);
    try {
      await authenticatedFetch(`/api/admin/moderation-issues/${selectedIssue.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: updateStatus,
          admin_notes: adminNotes
        })
      });
      toast.success("Issue updated successfully!");
      setIsDialogOpen(false);
      loadIssues();
    } catch (err) {
      toast.error("Failed to update issue.");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      resolved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    };
    return (
      <span className={`text-xs border px-2 py-0.5 rounded-full capitalize font-medium flex items-center gap-1.5 w-fit ${styles[status] || styles.open}`}>
        {getStatusIcon(status)}
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-primary" /> Moderation Panel
          </h1>
          <p className="text-muted-foreground font-medium">Review and resolve issues reported by students and companies.</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="status-filter" className="text-sm font-medium">Filter by Status:</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Issues" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Issues</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredIssues.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Flag className="h-8 w-8 text-muted-foreground/50" />
              <p>No issues found matching the selected filter.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reported Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell>
                      <div className="font-medium">{issue.reporter_email}</div>
                      <div className="text-xs text-muted-foreground capitalize">{issue.reporter_role || 'User'}</div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize font-medium text-sm">
                        {issue.issue_type?.replace(/_/g, ' ') || 'General Issue'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(issue.created_at), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(issue.status || 'open')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(issue)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-primary" />
              Issue Details
            </DialogTitle>
            <DialogDescription>
              Review the reported issue and update its status.
            </DialogDescription>
          </DialogHeader>

          {selectedIssue && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Reporter Email</span>
                  <p className="font-medium">{selectedIssue.reporter_email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Role</span>
                  <p className="font-medium capitalize">{selectedIssue.reporter_role || 'Unknown'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Issue Type</span>
                  <p className="font-medium capitalize">{selectedIssue.issue_type?.replace(/_/g, ' ') || 'Unknown'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Date Reported</span>
                  <p className="font-medium">{format(new Date(selectedIssue.created_at), 'MMM d, yyyy')}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Description</span>
                <div className="p-4 bg-muted/50 rounded-md text-sm whitespace-pre-wrap border">
                  {selectedIssue.description}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Update Status</Label>
                  <Select value={updateStatus} onValueChange={setUpdateStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Admin Notes (Internal)</Label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Add notes about how this issue was handled..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateIssue} disabled={updating}>
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
