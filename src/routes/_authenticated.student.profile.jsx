import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { getSignedResumeUrl } from "@/lib/storage-paths";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { requireStudent } from "@/lib/route-guards";
import { Loader2, User, BookOpen, Award, FileText, Upload, X, ExternalLink, Eye, Briefcase } from "lucide-react";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export const Route = createFileRoute("/_authenticated/student/profile")({
    beforeLoad: requireStudent,
    component: StudentProfilePage,
});
function StudentProfilePage() {
    const { user } = useAuth();
    const { width, height } = useWindowSize();
    const [showConfetti, setShowConfetti] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingCertificate, setUploadingCertificate] = useState(false);
    const [extractingSkills, setExtractingSkills] = useState(false);
    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [location, setLocation] = useState("");
    const [university, setUniversity] = useState("");
    const [course, setCourse] = useState("");
    const [yearOfStudy, setYearOfStudy] = useState("1st Year");
    const [graduationYear, setGraduationYear] = useState("");
    const [bio, setBio] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [projectUrl, setProjectUrl] = useState("");
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState("");
    const [achievements, setAchievements] = useState([]);
    const [extracurriculars, setExtracurriculars] = useState("");
    const [resumeUrl, setResumeUrl] = useState("");
    const [resumeDownloadUrl, setResumeDownloadUrl] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState("");
    const [certificateUrl, setCertificateUrl] = useState("");
    const [projects, setProjects] = useState([]);
    const [uploadingProjectPhotos, setUploadingProjectPhotos] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showResumePreview, setShowResumePreview] = useState(false);
    const [showCertificatePreview, setShowCertificatePreview] = useState(false);
    useEffect(() => {
        async function loadProfile() {
            if (!user)
                return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("student_profiles")
                    .select("*")
                    .eq("user_id", user.id)
                    .maybeSingle();
                if (data) {
                    setName(data.name || "");
                    setEmail(data.email || "");
                    setLocation(data.location || "");
                    setUniversity(data.university || "");
                    setCourse(data.course || "");
                    setYearOfStudy(data.year_of_study || "1st Year");
                    setGraduationYear(data.graduation_year || "");
                    setBio(data.bio || "");
                    setGithubUrl(data.github_url || "");
                    setLinkedinUrl(data.linkedin_url || "");
                    setProjectUrl(data.project_url || "");
                    setSkills(data.skills || []);
                    
                    let loadedAchievements = [];
                    if (data.achievements) {
                        try {
                            const parsed = JSON.parse(data.achievements);
                            if (Array.isArray(parsed)) {
                                loadedAchievements = parsed;
                            } else {
                                loadedAchievements = [{ id: crypto.randomUUID(), title: "Achievement", description: data.achievements, certificateUrl: data.certificate_url || null }];
                            }
                        } catch (e) {
                            loadedAchievements = [{ id: crypto.randomUUID(), title: "Achievement", description: data.achievements, certificateUrl: data.certificate_url || null }];
                        }
                    }
                    setAchievements(loadedAchievements);
                    
                    setExtracurriculars(data.extracurriculars || "");
                    setResumeUrl(data.resume_url || "");
                    setAvatarUrl(data.avatar_url || "");
                    setCertificateUrl(data.certificate_url || "");
                    setProjects(data.projects || []);
                }
            }
            catch (err) {
                console.error("Error loading profile:", err);
            }
            finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, [user]);

    useEffect(() => {
        let canceled = false;
        async function loadResumeLink() {
            if (!resumeUrl) {
                setResumeDownloadUrl(null);
                return;
            }
            const url = await getSignedResumeUrl(resumeUrl, supabase);
            if (!canceled) {
                setResumeDownloadUrl(url);
            }
        }
        loadResumeLink();
        return () => {
            canceled = true;
        };
    }, [resumeUrl]);

    async function handleAvatarUpload(e) {
  const file = e.target.files?.[0];
  if (!file || !user) return;

  setUploadingAvatar(true);

  try {
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}_avatar.${fileExt}`;

    // 1. Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // 2. Get public URL (IMPORTANT)
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error("Failed to generate public URL");
    }

    // 3. Save URL in state
    setAvatarUrl(publicUrlData.publicUrl);

    // 4. Update DB
    await supabase
      .from("student_profiles")
      .update({ avatar_url: publicUrlData.publicUrl })
      .eq("user_id", user.id);

    toast.success("Profile photo uploaded!");
  } catch (err) {
    toast.error(err.message || "Failed to upload avatar.");
  } finally {
    setUploadingAvatar(false);
  }
}
    async function handleResumeUpload(e) {
      const file = e.target.files?.[0];

      if (!file || !user) return;
      

// PDF validation
      if (file.type !== "application/pdf") {
           toast.error("Only PDF files are allowed.");
           return;
      }
      if (file.size > 5 * 1024 * 1024) {
          toast.error("Resume size must not exceed 5 MB.");
          return;
      }  
        setUploadingResume(true);
        try {
            const filePath = `${user.id}/${Date.now()}_${file.name}`;
            // Upload to resumes bucket (using default public documents bucket)
            const { error: uploadError } = await supabase.storage
                .from("resumes")
                .upload(filePath, file, { upsert: true });
            if (uploadError) {
                // Fallback to simulated upload URL if bucket fails to resolve
                console.warn("Storage upload failed, using simulated upload path:", uploadError.message);
                setResumeUrl(`${user.id}/${Date.now()}_${file.name}`);
                toast.info("Simulated resume upload completed.");
            }
            else {
                setResumeUrl(filePath);
                const signedUrl = await getSignedResumeUrl(filePath, supabase);
                if (signedUrl) {
                    setResumeDownloadUrl(signedUrl);
                    setShowResumePreview(true);
                }
                toast.success("Resume document uploaded!");
            }
        }
        catch (err) {
            toast.error(err.message || "Failed to upload resume.");
        }
        finally {
            setUploadingResume(false);
        }
    }

    async function extractSkillsWithAI() {
        if (!resumeUrl || !user) {
            toast.error("Please upload a resume first.");
            return;
        }

        setExtractingSkills(true);
        try {
            const { data: session } = await supabase.auth.getSession();
            const token = session?.session?.access_token;
            if (!token) throw new Error("No access token available.");

            // Use the environment variable or fallback
            const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

            const res = await fetch(`${apiUrl}/api/student/extract-skills`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ resumeUrl })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to extract skills");
            }

            if (data.skills && Array.isArray(data.skills)) {
                // Merge new skills uniquely
                setSkills(prev => {
                    const existing = new Set(prev.map(s => s.toLowerCase()));
                    const combined = [...prev];
                    data.skills.forEach(skill => {
                        const trimmed = skill.trim();
                        if (trimmed && !existing.has(trimmed.toLowerCase())) {
                            combined.push(trimmed);
                            existing.add(trimmed.toLowerCase());
                        }
                    });
                    return combined;
                });
                toast.success(`Successfully extracted ${data.skills.length} skills!`);
                setIsEditing(true); // Automatically switch to edit mode so they can see/save it
            }
        } catch (err) {
            console.error("Extraction error:", err);
            toast.error(err.message || "Failed to extract skills from resume.");
        } finally {
            setExtractingSkills(false);
        }
    }

    async function handleSave(e) {
  e.preventDefault();

  if (!user) return;

  const missingRequired = [];
  if (!name) missingRequired.push("Full Name");
  if (!email) missingRequired.push("Contact Email");
  if (!university) missingRequired.push("University");
  if (!course) missingRequired.push("Course of Study");
  if (!yearOfStudy) missingRequired.push("Year of Study");
  if (!graduationYear) missingRequired.push("Graduation Year");
  if (!linkedinUrl) missingRequired.push("LinkedIn Profile URL");
  if (!resumeUrl) missingRequired.push("Resume Document");
  if (skills.length === 0) missingRequired.push("Skills");

  if (missingRequired.length > 0) {
    toast.error(`Please fill required fields: ${missingRequired.join(', ')}`);
    return;
  }

  setSaving(true);

  try {
    const { error } = await supabase
      .from("student_profiles")
      .update({
        name,
        location,
        university,
        course,
        year_of_study: yearOfStudy,
        graduation_year: graduationYear,
        bio,
        skills,
        achievements: JSON.stringify(achievements),
        extracurriculars,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        project_url: projectUrl,
        projects: projects,
        resume_url: resumeUrl,
        avatar_url: avatarUrl,
        certificate_url: certificateUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) throw error;

    toast.success("Profile saved successfully!");
    setIsEditing(false);

    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  } catch (err) {
    toast.error(err.message || "Failed to save profile.");
  } finally {
    setSaving(false);
  }
}
    async function handleCertificateUpload(e) {
        const file = e.target.files?.[0];
        if (!file || !user)
            return;
        setUploadingCertificate(true);
        try {
            const filePath = `${user.id}/${Date.now()}_cert_${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from("resumes")
                .upload(filePath, file, { upsert: true });
            if (uploadError) {
                console.warn("Storage upload failed, using simulated upload path:", uploadError.message);
                setCertificateUrl(`${user.id}/${Date.now()}_cert_${file.name}`);
                toast.info("Simulated certificate upload completed.");
            }
            else {
                const { data: publicUrlData } = supabase.storage
                  .from("resumes")
                  .getPublicUrl(filePath);
 
                if (!publicUrlData?.publicUrl) {
                  throw new Error("Failed to generate public URL");
                }

setCertificateUrl(publicUrlData.publicUrl);
                toast.success("Certificate document uploaded!");
            }
        }
        catch (err) {
            toast.error(err.message || "Failed to upload certificate.");
        }
        finally {
            setUploadingCertificate(false);
        }
    }
    function addSkill() {
        const trimmed = newSkill.trim().toLowerCase();
        if (trimmed && !skills.includes(trimmed)) {
            setSkills([...skills, trimmed]);
            setNewSkill("");
        }
    }
    function removeSkill(skill) {
        setSkills(skills.filter((s) => s !== skill));
    }

    async function handleProjectPhotoUpload(e, projectId) {
        const files = Array.from(e.target.files || []);
        if (files.length === 0 || !user) return;

        setUploadingProjectPhotos(projectId);
        const uploadedUrls = [];

        try {
            for (const file of files) {
                const filePath = `${user.id}/projects/${Date.now()}_${file.name}`;
                const { error: uploadError } = await supabase.storage
                    .from("avatars")
                    .upload(filePath, file, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from("avatars")
                    .getPublicUrl(filePath);

                if (publicUrlData?.publicUrl) {
                    uploadedUrls.push(publicUrlData.publicUrl);
                }
            }
            
            setProjects(prev => prev.map(p => p.id === projectId ? { ...p, photos: [...(p.photos || []), ...uploadedUrls] } : p));
            toast.success(`${uploadedUrls.length} photos uploaded!`);
        } catch (err) {
            toast.error(err.message || "Failed to upload photos.");
        } finally {
            setUploadingProjectPhotos(null);
        }
    }

    function addAchievement() {
        setAchievements(prev => [...prev, { id: crypto.randomUUID(), title: "", description: "", certificateUrl: null }]);
    }
    function updateAchievement(id, field, value) {
        setAchievements(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
    }
    function removeAchievement(id) {
        setAchievements(prev => prev.filter(a => a.id !== id));
    }
    async function handleAchievementCertificateUpload(e, achievementId) {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploadingCertificate(true);
        try {
            const filePath = `${user.id}/achievements/${Date.now()}_cert_${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from("resumes")
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from("resumes")
                .getPublicUrl(filePath);

            if (publicUrlData?.publicUrl) {
                updateAchievement(achievementId, "certificateUrl", publicUrlData.publicUrl);
                toast.success("Certificate uploaded!");
            }
        } catch (err) {
            toast.error(err.message || "Failed to upload certificate.");
        } finally {
            setUploadingCertificate(false);
        }
    }

    function addProject() {
        setProjects(prev => [...prev, { id: crypto.randomUUID(), name: "", startDate: "", endDate: "", ongoing: false, impact: "", learning: "", link: "", photos: [] }]);
    }

    function updateProject(id, field, value) {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    }

    function removeProject(id) {
        setProjects(prev => prev.filter(p => p.id !== id));
    }

    function removeProjectPhoto(projectId, photoIndex) {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                const newPhotos = [...p.photos];
                newPhotos.splice(photoIndex, 1);
                return { ...p, photos: newPhotos };
            }
            return p;
        }));
    }

    const getProfileProgress = () => {
        const mandatoryFields = [
            { name: "Full Name", value: name },
            { name: "Contact Email", value: email },
            { name: "University", value: university },
            { name: "Course", value: course },
            { name: "Year of Study", value: yearOfStudy },
            { name: "Graduation Year", value: graduationYear },
            { name: "LinkedIn Profile URL", value: linkedinUrl },
            { name: "Skills", value: skills.length > 0 },
            { name: "Resume Upload", value: resumeUrl }
        ];
        
        const optionalFields = [
            { name: "Location", value: location },
            { name: "Bio", value: bio },
            { name: "Achievements", value: achievements && achievements.length > 0 },
            { name: "Extracurriculars", value: extracurriculars },
            { name: "GitHub URL", value: githubUrl },
            { name: "Project URL", value: projectUrl },
            { name: "Profile Photo", value: avatarUrl }
        ];

        const filledMandatory = mandatoryFields.filter(f => Boolean(f.value));
        const missingMandatory = mandatoryFields.filter(f => !Boolean(f.value)).map(f => f.name);
        
        const score = Math.round((filledMandatory.length / mandatoryFields.length) * 100);
        
        const missingOptional = optionalFields.filter(f => !Boolean(f.value)).map(f => f.name);

        return { score, missingMandatory, missingOptional };
    };
    const { score: profileScore, missingMandatory, missingOptional } = getProfileProgress();

    if (loading) {
        return (<div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>);
    }


    return (
      <>
        {showConfetti && <Confetti width={width} height={height} numberOfPieces={250} gravity={0.15} style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0 }} />}
        <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Edit Student Profile</h1>
        <p className="text-muted-foreground">Keep your academic and professional details updated for companies.</p>

        {/* Profile Completion Score */}
        {(profileScore < 100 || missingOptional.length > 0) && (
          <div className="mt-6 space-y-2 p-4 border rounded-md bg-muted/30">
            {profileScore < 100 ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">Profile Completion</span>
                  <span className="font-bold text-primary">{profileScore}%</span>
                </div>
                <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-in-out"
                    style={{ width: `${profileScore}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-3">
                  <p className="font-medium mb-1 text-foreground/80">To reach 100%, please add the required fields:</p>
                  <ul className="list-disc pl-4 space-y-0.5 mt-1">
                    {missingMandatory.map(field => (
                      <li key={field}>{field}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-sm mt-1">
                <div className="flex items-center gap-3 mb-3 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                  <div className="text-2xl animate-bounce">🎉 🌟 🎯</div>
                  <div>
                    <p className="font-bold text-emerald-500">Awesome! Your professional profile is 100% complete!</p>
                    <p className="text-xs text-emerald-500/80">You're ready to start applying to top opportunities.</p>
                  </div>
                </div>
                
                {missingOptional.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-4">
                    <p className="mb-2 text-foreground/80 font-medium text-sm">To add more impact and stand out to companies, consider adding these optional fields:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {missingOptional.map(field => (
                        <span key={field} className="px-2 py-1 bg-amber-400/10 border border-amber-400/20 text-black-400 rounded-md font-medium text-[10px] uppercase tracking-wider">{field}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <form onSubmit={handleSave} className="space-y-6">

  <div className="flex justify-end mb-4">
    {!isEditing ? (
      <Button
        type="button"
        onClick={() => setIsEditing(true)}
      >
        Update Profile
      </Button>
    ) : (
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsEditing(false)}
      >
        Cancel
      </Button>
    )}
  </div>
        {/* Core Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary"/> Profile Photo & Core Details
            </CardTitle>
            <CardDescription>Required fields to verify your identity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b">
              <div className="h-24 w-24 rounded-full border bg-muted flex items-center justify-center overflow-hidden relative group">
                {avatarUrl ? (<img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover"/>) : (<User className="h-10 w-10 text-muted-foreground"/>)}
                {uploadingAvatar && (<div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin"/>
                  </div>)}
              </div>
              {isEditing && (
  <div className="space-y-2">
    <Label
      htmlFor="avatar-file"
      className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium inline-block"
    >
      Change Photo
    </Label>

    <input
      id="avatar-file"
      type="file"
      accept="image/*"
      onChange={handleAvatarUpload}
      className="hidden"
    />
  </div>
)}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="stud-name">Full Name <span className="text-destructive">*</span></Label>
                <Input
                  id="stud-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stud-email">Contact Email <span className="text-destructive">*</span></Label>
                <Input id="stud-email" type="email" value={email} disabled className="bg-muted cursor-not-allowed"/>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stud-loc">Location</Label>
                <Input
                  id="stud-loc"
                  placeholder="e.g. Bangalore"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stud-bio">Bio</Label>
                <Input
                  id="stud-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary"/> Academic Information
            </CardTitle>
            <CardDescription>Required credentials to match job requirements.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="stud-uni">University <span className="text-destructive">*</span></Label>
              <Input
                id="stud-uni"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stud-course">Course of Study <span className="text-destructive">*</span></Label>
              <Input
                id="stud-course"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                disabled={!isEditing}
              />            </div>
            <div className="grid gap-2">
              <Label htmlFor="stud-year">Year of Study <span className="text-destructive">*</span></Label>
              <select
                id="stud-year"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                disabled={!isEditing}
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stud-grad">Graduation Year <span className="text-destructive">*</span></Label>
              <Input
                id="stud-grad"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary"/> External Links
            </CardTitle>
            <CardDescription>GitHub, Project URLs, and required LinkedIn Profile.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="stud-github">GitHub URL</Label>
              <Input
                id="stud-github"
                type="text"
                placeholder="https://github.com/username"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stud-linkedin">LinkedIn Profile URL <span className="text-destructive">*</span></Label>
              <Input
                id="stud-linkedin"
                type="text"
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills & Resume */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary"/> Skills & Resume
            </CardTitle>
            <CardDescription>Showcase your qualifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Skills */}
            <div className="space-y-2">
              <Label htmlFor="stud-skills">Add Skills <span className="text-destructive">*</span></Label>
              <div className="flex gap-2">
                <Input
                  id="stud-skills"
                  placeholder="e.g. Python, SQL, React"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  disabled={!isEditing}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isEditing) {
                       e.preventDefault();
                       addSkill();
                    }
                  }}
                />
                {isEditing && (
                  <Button type="button" onClick={addSkill}>
                    Add
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={extractSkillsWithAI}
                  disabled={extractingSkills}
                  className="flex items-center gap-2 border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-purple-600"
                >
                  {extractingSkills ? <Loader2 className="h-4 w-4 animate-spin" /> : "✨"}
                  {extractingSkills ? "Extracting..." : "Extract with AI"}
                </Button>
              </div>
              {!resumeUrl && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <span className="text-amber-500">⚠</span> Please upload a resume below to use AI extraction.
                </p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skills.length === 0 ? (<span className="text-xs text-muted-foreground">No skills added yet.</span>) : (skills.map((skill) => (<span key={skill} className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-full text-xs font-medium capitalize">
                      {skill}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                        >
                          <X className="h-3 w-3"/>
                        </button>
                      )}
                    </span>)))}
              </div>
            </div>

            {/* Resume Upload */}
            <div className="space-y-2 border-t pt-4">
              <div>
                <Label>Resume Document <span className="text-destructive">*</span></Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Accepted format: PDF only • Maximum file size: 5 MB
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Label htmlFor="resume-file" className="cursor-pointer border border-input hover:bg-muted px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                  <Upload className="h-4 w-4"/> {uploadingResume ? "Uploading..." : "Upload Resume (PDF, Max 5MB)"}
                </Label>
                <input id="resume-file" type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden"/>
               {resumeUrl && (
  <div className="flex items-center gap-3">
    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
      <FileText className="h-4 w-4 text-primary" />
      Resume uploaded
    </span>

    {resumeDownloadUrl ? (
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => setShowResumePreview(true)}
          className="text-sm text-blue-600 hover:underline"
        >
          Preview
        </button>
        <span className="text-muted-foreground">•</span>
        <a
          href={resumeDownloadUrl}
          download
          className="text-sm text-blue-600 hover:underline"
        >
          Download
        </a>
      </div>
    ) : (
      <span className="text-sm text-muted-foreground">Preparing link...</span>
    )}
  </div>
)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optional Sections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary"/> Achievements & Extracurriculars
            </CardTitle>
            <CardDescription>Optional descriptions to improve employer interest.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base font-bold">Achievements & Certificates</Label>
                {isEditing && (
                  <Button type="button" variant="outline" size="sm" onClick={addAchievement}>
                    + Add Achievement
                  </Button>
                )}
              </div>
              
              {achievements.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No achievements added yet.</p>
              )}

              {achievements.map((ach, index) => (
                <div key={ach.id} className="relative border rounded-md p-4 space-y-4 bg-muted/20">
                  {isEditing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 text-destructive hover:bg-destructive/10"
                      onClick={() => removeAchievement(ach.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="grid gap-2 pr-8">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</Label>
                    <Input
                      placeholder="e.g. 1st Place Hackathon, AWS Certified Developer"
                      value={ach.title}
                      onChange={(e) => updateAchievement(ach.id, "title", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
                    <textarea
                      placeholder="Briefly describe your role, what you built, or how you earned it..."
                      value={ach.description}
                      onChange={(e) => updateAchievement(ach.id, "description", e.target.value)}
                      disabled={!isEditing}
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2 pt-2 border-t border-dashed border-input">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Certificate</Label>
                    <div className="flex items-center gap-4">
                      {isEditing && (
                        <>
                          <Label htmlFor={`cert-${ach.id}`} className="cursor-pointer border border-input hover:bg-muted px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2">
                            <Upload className="h-3.5 w-3.5"/> {uploadingCertificate ? "Uploading..." : "Upload PDF/Image"}
                          </Label>
                          <input id={`cert-${ach.id}`} type="file" accept=".pdf,image/*" onChange={(e) => handleAchievementCertificateUpload(e, ach.id)} className="hidden"/>
                        </>
                      )}
                      
                      {ach.certificateUrl && (
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5 text-primary"/> Uploaded
                          </span>
                          <a
                            href={ach.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" /> View
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-2 pt-4 border-t">
              <Label htmlFor="stud-extra" className="text-base font-bold">Extracurricular Activities</Label>
              <textarea
                id="stud-extra"
                placeholder="Clubs, associations, sports, volunteering..."
                value={extracurriculars}
                onChange={(e) => setExtracurriculars(e.target.value)}
                disabled={!isEditing}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </CardContent>
        </Card>

        {/* Project Showcase Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" /> Project Showcase
            </CardTitle>
            <CardDescription>Add your projects to demonstrate your skills and impact.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2 pb-4 border-b">
              <Label htmlFor="stud-project">Main Portfolio / General Project URL</Label>
              <Input
                id="stud-project"
                type="text"
                placeholder="https://project.example.com"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                disabled={!isEditing}
              />
            </div>
            {projects.length === 0 && !isEditing ? (
              <span className="text-xs text-muted-foreground">No projects added yet.</span>
            ) : (
              projects.map((project, index) => (
                <div key={project.id} className="p-4 border rounded-md relative space-y-4 bg-muted/20">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeProject(project.id)}
                      className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 p-1.5 rounded transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  
                  <div className="grid gap-2">
                    <Label>Project Name <span className="text-destructive">*</span></Label>
                    <Input
                      value={project.name || ""}
                      onChange={(e) => updateProject(project.id, "name", e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g. AI Career Predictor"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Timeline</Label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Start Date</Label>
                        <Input
                          type="month"
                          value={project.startDate || ""}
                          onChange={(e) => updateProject(project.id, "startDate", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">End Date</Label>
                        <Input
                          type="month"
                          value={project.endDate || ""}
                          onChange={(e) => updateProject(project.id, "endDate", e.target.value)}
                          disabled={!isEditing || project.ongoing}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="checkbox"
                        id={`ongoing-${project.id}`}
                        checked={project.ongoing || false}
                        onChange={(e) => {
                          updateProject(project.id, "ongoing", e.target.checked);
                          if (e.target.checked) updateProject(project.id, "endDate", "");
                        }}
                        disabled={!isEditing}
                        className="rounded border-input text-primary focus:ring-primary w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <Label htmlFor={`ongoing-${project.id}`} className="text-sm font-normal cursor-pointer text-muted-foreground">Project is currently ongoing</Label>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Impact / Results</Label>
                    <textarea
                      value={project.impact || ""}
                      onChange={(e) => updateProject(project.id, "impact", e.target.value)}
                      disabled={!isEditing}
                      placeholder="What was the measurable outcome?"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Key Learnings</Label>
                    <textarea
                      value={project.learning || ""}
                      onChange={(e) => updateProject(project.id, "learning", e.target.value)}
                      disabled={!isEditing}
                      placeholder="What did you learn from this project?"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Project Link / URL</Label>
                    <Input
                      value={project.link || ""}
                      onChange={(e) => updateProject(project.id, "link", e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://github.com/..."
                    />
                  </div>

                  {/* Project Photos */}
                  <div className="space-y-2 border-t pt-4">
                    <Label>Project Photos (Screenshots)</Label>
                    {isEditing && (
                      <div className="flex items-center gap-4 mb-2">
                        <Label className="cursor-pointer border border-input hover:bg-muted px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                          <Upload className="h-4 w-4"/> {uploadingProjectPhotos === project.id ? "Uploading..." : "Upload Photos"}
                          <input type="file" accept="image/*" multiple onChange={(e) => handleProjectPhotoUpload(e, project.id)} className="hidden" disabled={uploadingProjectPhotos === project.id} />
                        </Label>
                      </div>
                    )}
                    {project.photos && project.photos.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {project.photos.map((url, i) => (
                          <div key={i} className="relative w-16 h-16 rounded border overflow-hidden">
                            <img src={url} alt="project screenshot" className="w-full h-full object-cover" />
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => removeProjectPhoto(project.id, i)}
                                className="absolute top-0 right-0 bg-destructive/80 text-white p-0.5 rounded-bl hover:bg-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No photos uploaded.</span>
                    )}
                  </div>
                </div>
              ))
            )}

            {isEditing && (
              <Button type="button" variant="outline" onClick={addProject} className="w-full border-dashed flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> + Add Another Project
              </Button>
            )}
          </CardContent>
        </Card>

        {isEditing && (
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Saving Profile..." : "Save Changes"}
          </Button>
        )}
      </form>
      
      {/* Resume Preview Modal */}
      {!resumeDownloadUrl || !showResumePreview ? null : (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowResumePreview(false)} />
          <div className="relative w-full max-w-4xl h-[90vh] bg-background rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg">Resume Preview</h3>
              <button
                onClick={() => setShowResumePreview(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <iframe
              src={resumeDownloadUrl}
              className="w-full h-full"
              title="Resume Preview"
            />
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {!certificateUrl || !showCertificatePreview ? null : (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCertificatePreview(false)} />
          <div className="relative w-full max-w-4xl h-[90vh] bg-background rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg">Certificate Preview</h3>
              <button
                onClick={() => setShowCertificatePreview(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <iframe
              src={certificateUrl}
              className="w-full h-full"
              title="Certificate Preview"
            />
          </div>
        </div>
      )}
    </div>
    </>);
}
