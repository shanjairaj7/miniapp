import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/trends", label: "Trends" },
  { href: "/categories", label: "Categories" },
  { href: "/papers", label: "Papers" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  return (
    <nav className="flex items-center gap-1 text-sm font-medium">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-md border border-transparent px-2.5 py-1 text-[color:var(--muted)] transition hover:border-[color:var(--border)] hover:bg-[color:var(--paper-2)] hover:text-[color:var(--ink)]"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
