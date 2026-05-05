"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  function downloadDataset() {
    // Implement the logic to download the dataset here
    console.log("Downloading dataset...");
  }

  const navItems = [
    { href: "/", label: "About the Project" },
    { href: "/about-dataset/", label: "About the Dataset" },
    { href: "/explore-dataset/", label: "Explore the Dataset" },
    {
      label: "Download the Dataset",
      buttonAction: () => downloadDataset(),
    },
  ];

  return (
    <nav className="py-4 flex justify-between items-center">
      <div>
        <h1 className="text-balance text-xl font-bold">
          Leipzig Momentum Panel
        </h1>
        <h3 className="text-base font-bold">
          on Worker Characteristics, Experiences, and Behavior
        </h3>
      </div>
      <ul className="flex space-x-4 grow justify-end items-center">
        {navItems.map(({ href, label, buttonAction }) => {
          return (
            <li key={href || label}>
              {buttonAction ? (
                <button
                  onClick={buttonAction}
                  className="text-lmp-text hover:text-lmp-text font-bold bg-lmp-gray3 hover:bg-lmp-gray3/70 px-5 py-2 rounded-4xl cursor-pointer transition"
                >
                  {label}
                </button>
              ) : (
                <Link
                  href={href}
                  className={`text-lmp-text hover:text-lmp-text/70 font-bold cursor-pointer py-2 transition ${
                    (
                      href === "/"
                        ? pathname === href
                        : pathname.startsWith(href)
                    )
                      ? "border-b-3 border-lmp-green"
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
