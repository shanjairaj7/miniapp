import Link from "next/link";

const links = [
  { href: "/", label: "Frontier Feed" },
  { href: "/trends", label: "Trends" },
  { href: "/categories", label: "Categories" },
  { href: "/papers", label: "Papers" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  return (
    <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-[color:var(--muted)]">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-full border border-transparent px-2 py-1 transition hover:border-[color:var(--border)] hover:bg-[color:var(--paper-2)] hover:text-[color:var(--ink)]"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
