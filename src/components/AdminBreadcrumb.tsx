"use client";

import Link from "next/link";
import { LuChevronRight } from "react-icons/lu";

interface Crumb {
  label: string;
  href?: string;
}

interface AdminBreadcrumbProps {
  items: Crumb[];
}

export default function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  return (
    <nav className="mb-4 flex items-center gap-1.5 text-xs text-foreground/55">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="uppercase tracking-[0.18em] text-foreground/55 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="uppercase tracking-[0.18em] text-foreground/85">
                {item.label}
              </span>
            )}
            {!isLast && <LuChevronRight className="h-3 w-3 text-foreground/30" />}
          </span>
        );
      })}
    </nav>
  );
}
