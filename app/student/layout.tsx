// app/student/layout.tsx
import DashboardLayout from "@/app/components/DashboardLayout";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      title="TVSBS Student"
      links={[
        { label: "Attendance", href: "/student/attendance" },
        { label: "Results", href: "/student/results" },
        { label: "Fees", href: "/student/fees" },
        { label: "Library", href: "/student/assistance" },
      ]}
    >
      {children}
    </DashboardLayout>
  );
}
