"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Image } from "@/components/Image";

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "About the Project" },
    { href: "/about-dataset/", label: "About the Dataset" },
    { href: "/explore-dataset/", label: "Explore the Dataset" },
    {
      label: "Download the Dataset",
      href: "https://osf.io/rabzm/overview",
      isButton: true,
    },
  ];

  return (
    <nav className="py-4 flex justify-between items-center">
      <div className="flex gap-4 items-center">
        <Image
          src="/assets/lmp_logo.svg"
          alt="Leipzig Momentum Panel Logo"
          className="w-15 h-auto"
          width={60}
          height={53}
        />
        <div>
          <h1 className="text-balance text-xl font-bold">
            Leipzig Momentum Panel
          </h1>
          <h3 className="text-base font-bold">
            on Worker Characteristics, Experiences, and Behavior
          </h3>
        </div>
      </div>
      <ul className="flex gap-6 grow justify-end items-center list-none">
        {navItems.map(({ href, label, isButton }) => {
          return (
            <li key={href || label}>
              {isButton ? (
                <Link
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lmp-text hover:text-lmp-text text-sm font-bold bg-lmp-gray3 hover:bg-lmp-gray3/70 px-6 py-3 rounded-3xl cursor-pointer transition"
                >
                  {label}
                </Link>
              ) : (
                <Link
                  href={href}
                  className={`text-lmp-text hover:text-lmp-text/70 text-sm font-bold cursor-pointer py-2 transition ${
                    (
                      href === "/"
                        ? pathname === href
                        : pathname.startsWith(href)
                    )
                      ? "border-b-[5px] border-lmp-green"
                      : ""
                  }`}
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
