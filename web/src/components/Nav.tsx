import Link from "next/link";

const links = [
  { href: "/", label: "Home", icon: "📊" },
  { href: "/trends", label: "Trends", icon: "📈" },
  { href: "/categories", label: "Categories", icon: "🏷️" },
  { href: "/papers", label: "Papers", icon: "📄" },
  { href: "/about", label: "About", icon: "ℹ️" },
];

export default function Nav() {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-2 text-[color:var(--muted)] transition hover:border-[color:var(--border)] hover:bg-[color:var(--paper-2)] hover:text-[color:var(--ink)]"
        >
          <span>{link.icon}</span>
          <span>{link.label}</span>
        </Link>
      ))}
    </nav>
  );
}
