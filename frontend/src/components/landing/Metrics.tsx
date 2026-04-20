export const Metrics = () => {
  const stats = [
    { 
      value: "82", 
      unit: "%", 
      label: "Autonomous resolution rate", 
      sub: "Verified PRs merged without human edit" 
    },
    { 
      value: "<4", 
      unit: "m", 
      label: "Avg time to merged fix", 
      sub: "From detection to verified pull request" 
    },
    { 
      value: "0", 
      unit: "", 
      label: "New bugs introduced", 
      sub: "Zero regressions in 12,000+ repairs" 
    },
    { 
      value: "80", 
      unit: "%", 
      label: "Debugging time eliminated", 
      sub: "Metric based on 500+ engineering teams" 
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[var(--surface-2)] to-[var(--void)] border-y border-[var(--border)]">
      {/* Purple halo */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[var(--plasma)]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border)]">
        {stats.map((stat, i) => (
          <div key={i} className="reveal bg-[var(--surface-1)] p-10 flex flex-col justify-center min-h-[240px]">
            <div className="mb-4">
              <span className="text-5xl md:text-6xl font-extrabold font-[var(--font-display)] text-[var(--acid)] tracking-tighter">
                {stat.value}
              </span>
              <span className="text-4xl md:text-5xl font-extrabold font-[var(--font-display)] text-white">
                {stat.unit}
              </span>
            </div>
            <h4 className="text-sm font-light text-[var(--text-secondary)] font-[var(--font-body)] mb-1">
              {stat.label}
            </h4>
            <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
              {stat.sub}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
