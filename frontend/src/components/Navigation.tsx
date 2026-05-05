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
      <ul className="flex space-x-4 grow">
        {navItems.map(({ href, label, buttonAction }) => {
          return (
            <li key={href || label}>
              {buttonAction ? (
                <button
                  onClick={buttonAction}
                  className="text-black hover:text-gray-800"
                >
                  {label}
                </button>
              ) : (
                <Link
                  href={href}
                  className={`text-black hover:text-gray-800 ${
                    pathname === href ? "font-bold" : ""
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
