import Sidebar from "@/components/Sidebar";
import { NeuralWeb } from "@/components/landing/NeuralWeb";
import { CureGlare } from "@/components/landing/CureGlare";
import NeuralFluidityBackground from "@/components/NeuralFluidityBackground";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden font-sans antialiased relative">
      {/* Neural Environment Layer */}
      <div className="fixed inset-0 z-0">
        <NeuralFluidityBackground />
      </div>
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <NeuralWeb />
      </div>
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <CureGlare />
      </div>

      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}
