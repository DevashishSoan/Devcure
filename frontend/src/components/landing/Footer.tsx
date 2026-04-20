import Link from "next/link";
import { GithubIcon, TwitterIcon, DiscordIcon } from "./Icons";

export const Footer = () => {
  const columns = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "Changelog", href: "#" },
        { name: "Roadmap", href: "#" },
        { name: "Status", href: "#" }
      ]
    },
    {
      title: "Developers",
      links: [
        { name: "Docs", href: "#" },
        { name: "API Reference", href: "#" },
        { name: "GitHub", href: "#" },
        { name: "Examples", href: "#" },
        { name: "Blog", href: "#" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "#" },
        { name: "Contact", href: "#" },
        { name: "Privacy", href: "#" },
        { name: "Terms", href: "#" },
        { name: "Security", href: "#" }
      ]
    }
  ];

  return (
    <footer className="bg-[var(--void)] border-t border-[var(--border)] pt-20 pb-10">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
        {/* Brand Column */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[var(--acid)] to-[var(--plasma)]" />
            <span className="text-xl font-bold font-[var(--font-display)] text-white">DevCure</span>
          </div>
          <p className="text-[var(--text-secondary)] font-light text-sm max-w-xs mb-8 leading-relaxed">
            The premium autonomous repair platform for engineering teams that value stability at speed.
          </p>
          <div className="flex gap-5">
            <Link href="#" className="text-[var(--text-muted)] hover:text-[var(--acid)] transition-colors"><GithubIcon className="w-[18px] h-[18px]" /></Link>
            <Link href="#" className="text-[var(--text-muted)] hover:text-[var(--acid)] transition-colors"><TwitterIcon className="w-[18px] h-[18px]" /></Link>
            <Link href="#" className="text-[var(--text-muted)] hover:text-[var(--acid)] transition-colors"><DiscordIcon className="w-[18px] h-[18px]" /></Link>
          </div>
        </div>

        {/* Links Columns */}
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-[0.2em] font-black mb-8">
              {col.title}
            </h4>
            <div className="flex flex-col gap-4">
              {col.links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-light text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1200px] mx-auto px-6 pt-10 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest">
          © 2026 DevCure Inc. All rights reserved.
        </div>
        <div className="flex gap-8">
          <Link href="#" className="text-[10px] font-mono text-[var(--text-dim)] hover:text-[var(--text-secondary)] uppercase tracking-widest">Security</Link>
          <Link href="#" className="text-[10px] font-mono text-[var(--text-dim)] hover:text-[var(--text-secondary)] uppercase tracking-widest">Privacy</Link>
          <Link href="#" className="text-[10px] font-mono text-[var(--text-dim)] hover:text-[var(--text-secondary)] uppercase tracking-widest">Terms</Link>
        </div>
      </div>
    </footer>
  );
};
