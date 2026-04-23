import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#09090b] overflow-hidden font-inter antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-[#09090b] relative">
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}
