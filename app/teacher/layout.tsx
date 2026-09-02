// app/teacher/layout.tsx
import DashboardLayout from "@/app/components/DashboardLayout";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      title="TVSBS Teacher"
      links={[
        { label: "My Classes", href: "/teacher/classes" },
        { label: "Attendance", href: "/teacher/attendance" },
        { label: "Results", href: "/teacher/results" },
        { label: "Assignments", href: "/teacher/assignments" },
        { label: "Question Paper", href: "/teacher/question-paper" },
      ]}
    >
      {children}
    </DashboardLayout>
  );
}
