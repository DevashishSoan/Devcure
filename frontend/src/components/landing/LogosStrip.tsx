"use client";

const companies = [
  { name: "Stripe", color: "#635bff" },
  { name: "Vercel", color: "#ffffff" },
  { name: "Linear", color: "#5e6ad2" },
  { name: "Supabase", color: "#3ecf8e" },
  { name: "Railway", color: "#ffffff" },
  { name: "PlanetScale", color: "#ffffff" },
  { name: "Render", color: "#46e3b7" },
  { name: "Fly.io", color: "#8b5cf6" },
];

export const LogosStrip = () => {
  return (
    <section className="border-y border-[var(--border)] py-12 overflow-hidden bg-[var(--void)]">
      <div className="text-center mb-8">
        <span className="text-[11px] font-mono text-[var(--text-dim)] uppercase tracking-[0.2em] font-bold">
          Trusted by developers at
        </span>
      </div>

      <div className="relative flex">
        <div className="animate-marquee flex gap-12 items-center">
          {/* Double the array for seamless looping */}
          {[...companies, ...companies].map((company, i) => (
            <div key={i} className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-sm opacity-60" 
                style={{ backgroundColor: company.color }} 
              />
              <span className="text-[18px] font-bold font-[var(--font-display)] text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition-colors cursor-default">
                {company.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
