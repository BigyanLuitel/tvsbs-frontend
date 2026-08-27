// app/teacher/page.tsx
import LogoutButton from "@/app/components/LogOutButton";

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Teacher Dashboard
        </h1>
        <LogoutButton />
      </div>
      <p className="mt-2 text-gray-600">Welcome, Teacher.</p>
    </div>
  );
}
