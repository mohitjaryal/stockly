
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-white">
      <Sidebar />

      <div className="min-h-screen pl-64">
        <Topbar />
        <main className="mx-auto w-full max-w-[1600px] p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
