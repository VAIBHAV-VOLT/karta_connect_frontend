import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/company/scholars")({
  component: CompanyScholarsPage,
});

function calculateMatch(studentSkills = [], requiredSkills = []) {
  if (!requiredSkills.length) return 0;

  const student = studentSkills.map((s) => s.toLowerCase());

  let matches = 0;

  requiredSkills.forEach((skill) => {
    if (student.includes(skill.toLowerCase())) {
      matches++;
    }
  });

  return Math.round((matches / requiredSkills.length) * 100);
}

function getMatchColor(match) {
  if (match >= 80) return "text-green-600";

  if (match >= 50) return "text-yellow-600";

  return "text-red-600";
}

function getMatchingSkills(studentSkills = [], requiredSkills = []) {
  return studentSkills.filter((skill) =>
    requiredSkills.some((req) => req.toLowerCase() === skill.toLowerCase()),
  );
}

function CompanyScholarsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [jobPosts, setJobPosts] = useState([]);

  const [selectedPost, setSelectedPost] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [openProfile, setOpenProfile] = useState(false);

  async function loadCompanySkills() {
    const { data, error } = await supabase

      .from("job_posts")

      .select("id,title,required_skills")

      .eq("active", true);

    if (error) return;

    setJobPosts(data || []);

    if (data?.length) {
      setSelectedPost(data[0].id);

      setRequiredSkills(data[0].required_skills || []);
    }
  }

  function handleViewProfile(student) {
    setSelectedStudent(student);

    console.log(student.achievements);

    setOpenProfile(true);
  }

  async function loadStudents() {
    const { data, error } = await supabase.from("student_profiles").select("*");

    if (error) {
      console.log(error);
      return;
    }

    setStudents(data || []);
  }

  useEffect(() => {
    loadStudents();

    loadCompanySkills();
  }, []);

  const universities = [
    ...new Set(students.map((s) => s.university).filter(Boolean)),
  ];

  const courses = [...new Set(students.map((s) => s.course).filter(Boolean))];
  const filtered = students.filter((student) => {
    const value = search.toLowerCase();

    const matchesSearch =
      student.name?.toLowerCase().includes(value) ||
      student.university?.toLowerCase().includes(value) ||
      student.course?.toLowerCase().includes(value) ||
      student.skills?.join(" ").toLowerCase().includes(value);

    const matchesUniversity =
      !selectedUniversity || student.university === selectedUniversity;

    const matchesCourse = !selectedCourse || student.course === selectedCourse;

    return matchesSearch && matchesUniversity && matchesCourse;
  });

  const sortedStudents = [...filtered].sort((a, b) => {
    const matchA = calculateMatch(a.skills, requiredSkills);

    const matchB = calculateMatch(b.skills, requiredSkills);

    return matchB - matchA;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Search Scholars</h1>
      <p className="text-muted-foreground ">
        {sortedStudents.length} scholars found
      </p>

      <input
        type="text"
        placeholder="Search by skills, university or course"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-md p-3"
      />

      <div className="flex gap-4 flex-wrap">
        <select
          value={selectedUniversity}
          onChange={(e) => setSelectedUniversity(e.target.value)}
          className="border rounded-md p-3 bg-background text-foreground"
        >
          <option value="">All Universities</option>

          {universities.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="border rounded-md p-3 bg-background text-foreground"
        >
          <option value="">All Courses</option>

          {courses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={selectedPost}
          onChange={(e) => {
            const post = jobPosts.find((p) => p.id === e.target.value);

            setSelectedPost(e.target.value);

            setRequiredSkills(post?.required_skills || []);
          }}
          className="border rounded-md p-3 bg-background text-foreground"
        >
          <option value="">AI Match For</option>

          {jobPosts

            .filter((post) => post.required_skills?.length)

            .map((post) => (
              <option key={post.id} value={post.id}>
                {post.title}
              </option>
            ))}
        </select>
      </div>

      {sortedStudents.length === 0 && (
        <div className="text-center py-10">
          <h2 className="text-3xl font-bold">No scholars found</h2>

          <p className="text-muted-foreground">Try another filter</p>
        </div>
      )}

      <div className="space-y-4">
        {sortedStudents.map((student) => (
          <div
            key={student.user_id}
            className="
  border
  rounded-xl
  p-5
  shadow-sm
  hover:shadow-lg
  transition-all
  duration-200
  space-y-3
  "
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">👤 {student.name}</h2>

                <p className="text-muted-foreground">🏫 {student.university}</p>
              </div>

              {(() => {
                const match = calculateMatch(student.skills, requiredSkills);

                return (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-blue-600">
                    <span className="text-sm">🤖</span>

                    <div>
                      <p className="text-xs font-semibold text-white">
                        AI Match: {match}%
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex gap-6 flex-wrap text-sm">
              <p>📘 {student.course}</p>

              <p>📅 {student.year_of_study}</p>

              <p>📍 {student.location || "Not specified"}</p>

              <p>🎓 {student.graduation_year || "N/A"}</p>
            </div>

            <div className="flex gap-2 mt-2 flex-wrap">
              {student.skills

                ?.slice(0, 5)

                .map((skill) => (
                  <span
                    key={skill}
                    className="bg-muted px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
            </div>
            {student.skills?.length > 5 && (
              <p className="text-sm text-muted-foreground">
                +{student.skills.length - 5}
                more skills
              </p>
            )}
            <div className="space-y-2">
              <div className="mt-3">
                <div className="mt-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-semibold text-sm">Matching Skills</p>

                    <div className="flex gap-2 flex-wrap">
                      {getMatchingSkills(
                        student.skills,

                        requiredSkills,
                      ).map((skill) => (
                        <span
                          key={skill}
                          className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <hr className="border-muted" />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => handleViewProfile(student)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                View Profile
              </button>

              {student.resume_url && (
                <a
                  href={student.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="
 bg-purple-600
 text-white
 px-4
 py-2
 rounded-md
 "
                >
                  View Resume
                </a>
              )}

              <button className="bg-green-600 text-white px-4 py-2 rounded-md w-32">
                Message
              </button>
            </div>
          </div>
        ))}
      </div>

      {openProfile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-background text-foreground rounded-xl p-6 w-[700px] max-h-[90vh] overflow-y-auto space-y-6 border">
            <div className="border rounded-xl p-5 flex items-center gap-6">
              <img
                src={selectedStudent?.avatar_url || "/default-avatar.png"}
                alt="avatar"
                className="h-28 w-28 rounded-full object-cover border-4 border-blue-500"
              />

              <div className="space-y-2">
                <h2 className="text-3xl font-bold">
                  👤 {selectedStudent?.name}
                </h2>

                <p>
                  📍
                  {selectedStudent?.location || "Not specified"}
                </p>

                <div className="flex gap-3 flex-wrap">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    🏫
                    {selectedStudent?.university}
                  </span>

                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                    📘
                    {selectedStudent?.course}
                  </span>
                </div>
              </div>
            </div>
            <div className="border rounded-xl p-5">
              <h3 className="font-bold text-lg mb-4">
                🎓 Academic Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <p>
                  📅 Year:
                  {selectedStudent?.year_of_study}
                </p>

                <p>
                  🎓 Graduation:
                  {selectedStudent?.graduation_year}
                </p>
              </div>
            </div>
            <div className="border rounded-xl p-5">
              <h3 className="font-bold mb-2">📝 About</h3>

              <p>{selectedStudent?.bio || "No bio added"}</p>
            </div>

            <div className="border rounded-xl p-5">
              <h3 className="font-bold mb-3">📞 Contact Information</h3>

              <div className="space-y-3">
                <div className="border rounded-lg p-3 flex items-center gap-3">
                  <span className="text-2xl">📧</span>

                  <div>
                    <p className="font-semibold">Email</p>

                    <a
                      href={`mailto:${selectedStudent?.email}`}
                      className="text-green-600 hover:underline"
                    >
                      {selectedStudent?.email || "Not provided"}
                    </a>
                  </div>
                </div>

                {selectedStudent?.linkedin_url && (
                  <div className="border rounded-lg p-3 flex items-center gap-3">
                    <span className="text-2xl">💼</span>

                    <div>
                      <p className="font-semibold">LinkedIn</p>

                      <a
                        href={
                          selectedStudent.linkedin_url.startsWith("http")
                            ? selectedStudent.linkedin_url
                            : `https://${selectedStudent.linkedin_url}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View LinkedIn Profile
                      </a>
                    </div>
                  </div>
                )}

                {selectedStudent?.github_url &&
                  selectedStudent.github_url !== "NA" && (
                    <div className="border rounded-lg p-3 flex items-center gap-3">
                      <span className="text-2xl">💻</span>

                      <div>
                        <p className="font-semibold">GitHub</p>

                        <a
                          href={
                            selectedStudent.github_url.startsWith("http")
                              ? selectedStudent.github_url
                              : `https://${selectedStudent.github_url}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-600 hover:underline"
                        >
                          View GitHub Profile
                        </a>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="border rounded-xl p-5">
              <h3 className="font-bold mb-2">🏆 Achievements</h3>

              {(() => {
                let achievements = [];

                try {
                  achievements =
                    typeof selectedStudent?.achievements === "string"
                      ? JSON.parse(selectedStudent.achievements)
                      : selectedStudent?.achievements || [];
                } catch {
                  achievements = [];
                }

                return achievements.length ? (
                  <div className="space-y-3">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="
              border
              rounded-lg
              p-3
            "
                      >
                        <h4 className="font-semibold">
                          🏅 {achievement.title}
                        </h4>

                        <p className="text-muted-foreground">
                          {achievement.description}
                        </p>

                        {achievement.certificateUrl && (
                          <a
                            href={achievement.certificateUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="
                  text-blue-600
                  underline
                "
                          >
                            View Certificate
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No achievements added</p>
                );
              })()}
            </div>
            <div className="border rounded-xl p-5">
              <h3 className="font-bold mb-2">🎯 Extracurricular Activities</h3>

              <p>
                {selectedStudent?.extracurriculars ||
                  "No extracurricular activities added"}
              </p>
            </div>

            <div className="border rounded-xl p-5">
              <h3 className="font-bold mb-2">🛠 Skills</h3>

              <div className="flex gap-2 flex-wrap">
                {selectedStudent?.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="
            bg-muted
            px-2
            py-1
            rounded-md
          "
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="border rounded-xl p-5 flex gap-4 flex-wrap justify-center">
              {selectedStudent?.resume_url && (
                <a
                  href={
                    supabase.storage
                      .from("resumes")
                      .getPublicUrl(selectedStudent.resume_url).data.publicUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="
                            bg-purple-600
                            text-white
                            px-4
                            py-2
                            rounded-md
                          "
                >
                  📄 Resume
                </a>
              )}

              {selectedStudent?.certificate_url && (
                <a
                  href={selectedStudent.certificate_url}
                  target="_blank"
                  rel="noreferrer"
                  className="
          bg-green-600
          text-white
          px-4
          py-2
          rounded-md
        "
                >
                  📜 Certificate
                </a>
              )}

              {selectedStudent?.linkedin_url && (
                <a
                  href={
                    selectedStudent.linkedin_url?.startsWith("http")
                      ? selectedStudent.linkedin_url
                      : `https://${selectedStudent.linkedin_url}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="
          bg-blue-600
          text-white
          px-4
          py-2
          rounded-md
        "
                >
                  LinkedIn
                </a>
              )}
            </div>
            <button
              onClick={() => setOpenProfile(false)}
              className="
      bg-red-600
      text-white
      px-4
      py-2
      rounded-md
    "
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
