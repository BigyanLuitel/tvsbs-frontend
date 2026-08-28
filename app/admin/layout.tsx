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
        { label: "Students", href: "/admin/students" },
        { label: "Teachers", href: "/admin/teachers" },
        { label: "Attendance", href: "/admin/attendance" },
        { label: "Fees", href: "/admin/fees" },
        { label: "Reports", href: "/admin/reports" },
      ]}
    >
      {children}
    </DashboardLayout>
  );
}
