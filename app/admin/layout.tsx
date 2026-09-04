import DashboardLayout from "@/app/components/DashboardLayout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      title="TVSBS Admin"
      links={[
        {
          label: "Students",
          href: "/admin/students",
          children: [
            { label: "All Students", href: "/admin/students" },
            { label: "Add Student", href: "/admin/students/add" },
          ],
        },
        {
          label: "Teachers",
          href: "/admin/teachers",
          children: [
            { label: "All Teachers", href: "/admin/teachers" },
            { label: "Add Teacher", href: "/admin/teachers/add" },
          ],
        },
        {
          label: "Academics",
          href: "/admin/academics",
          children: [
            { label: "Classes", href: "/admin/academics/classes" },
            { label: "Subjects", href: "/admin/academics/subjects" },
          ],
        },
        { label: "Attendance", href: "/admin/attendance" },
        {
          label: "Fees",
          href: "/admin/fees",
          children: [
            { label: "Categories", href: "/admin/fees/categories" },
            { label: "Structures", href: "/admin/fees/structures" },
            { label: "Invoices", href: "/admin/fees/invoices" },
            {
              label: "Student Assignments",
              href: "/admin/fees/student-assignments",
            },
          ],
        },
        {
          label: "Library",
          href: "/admin/library",
          children: [
            { label: "Books", href: "/admin/library/books" },
            { label: "Circulation", href: "/admin/library/circulations" },
          ],
        },
        { label: "Results", href: "/admin/results" },
        { label: "Reports", href: "/admin/reports" },
      ]}
    >
      {children}
    </DashboardLayout>
  );
}
