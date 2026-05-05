"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ExploreNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/explore-dataset/questions", label: "Questions & Constructs" },
    {
      href: "/explore-dataset/measurement-points",
      label: "Measurement Points",
    },
    { href: "/explore-dataset/studies", label: "Studies" },
  ];
  return (
    <nav className="py-4 flex justify-between items-center">
      <h1 className="text-balance text-xl font-bold">Explore the Dataset</h1>
      <ul className="flex space-x-4 grow">
        {navItems.map(({ href, label }) => {
          const isActive = pathname === href || pathname === `${href}/`;

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`text-black hover:text-gray-800 ${isActive ? "font-bold" : ""}`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
