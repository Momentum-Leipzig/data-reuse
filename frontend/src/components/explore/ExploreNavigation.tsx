"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ExploreNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/explore-dataset/questions", label: "by Questions & Constructs" },
    {
      href: "/explore-dataset/measurement-points",
      label: "by Measurement Points",
    },
    { href: "/explore-dataset/studies", label: "by Studies" },
  ];
  return (
    <nav className="pt-4 pb-10 flex justify-start items-center gap-4">
      <h1 className="text-balance text-3xl font-bold mr-8">
        Explore the Dataset
      </h1>
      {navItems.map(({ href, label }) => {
        const isActive = pathname === href || pathname === `${href}/`;

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`text-lmp-text font-bold px-6 py-2 rounded-4xl cursor-pointer transition ${isActive ? "bg-lmp-green hover:bg-lmp-green/70 " : "bg-lmp-gray1 hover:bg-lmp-green/70 "}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
