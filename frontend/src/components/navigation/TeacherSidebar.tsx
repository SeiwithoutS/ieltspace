import AdminSidebar from "./AdminSidebar";

const sections: Partial<Record<string, string>> = {
  TeacherHome: "home",
  TeacherQueue: "grading",
  TeacherGrade: "grading",
  TeacherHistory: "exams",
  StaffProfile: "profile",
};

export default function TeacherSidebar() {
  const page = location.hash.slice(1);
  return <AdminSidebar teacher active={sections[page] ?? "none"} />;
}
