import { Image } from "@/components/Image";
import Link from "next/link";

const FOOTER_PAGES = [
  {
    href: "/",
    label: "About the Project",
  },
  {
    href: "/about-dataset/",
    label: "About the Dataset",
  },
  {
    href: "/explore-dataset/",
    label: "Explore the Dataset",
  },
  {
    label: "Download the Dataset",
    href: "https://osf.io/rabzm/overview",
  },
];

const FOOTER_CONTACTS = [
  {
    name: "Dr. Maie Stein",
    email: "maie.stein@uni-leipzig.de",
  },
  {
    name: "Prof. Dr. Hannes Zacher",
    email: "hannes.zacher@uni-leipzig.de",
  },
  {
    name: "Richard Janzen",
    email: "richard.janzen@uni-leipzig.de",
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-lmp-gray3 py-10 px-4 mt-12">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-12">
        <div className="flex flex-row flex-wrap gap-12 justify-between items-center">
          <div className="flex gap-4 items-center">
            <Image
              src="/assets/lmp_logo_dark.svg"
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
          <p className="text-sm text-lmp-text">
            Leipzig University
            <br />
            Wilhelm Wundt Institute of Psychology
            <br />
            Chair of Work and Organizational Psychology
            <br />
          </p>

          <div>
            {FOOTER_PAGES.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-lmp-text hover:text-lmp-text/70 text-sm font-bold cursor-pointer py-2 transition block underline"
              >
                {label}
              </Link>
            ))}
          </div>
          <div>
            <h2 className="text-lmp-text text-sm font-bold mb-4">Contact</h2>
            <div className="flex flex-col gap-4">
              {FOOTER_CONTACTS.map(({ name, email }) => (
                <div key={email}>
                  <p className="text-lmp-text text-sm font-bold m-0">{name}</p>
                  <a
                    href={`mailto:${email}`}
                    className="text-lmp-text hover:text-lmp-text/70 text-sm font-bold cursor-pointer transition block underline"
                  >
                    {email}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-row flex-wrap gap-12 justify-center items-center">
          <Link
            href="/privacy-policy"
            className="text-lmp-text hover:text-lmp-text/70 text-sm font-bold cursor-pointer py-2 transition block underline"
          >
            Privacy Policy
          </Link>
          <Link
            href="/imprint"
            className="text-lmp-text hover:text-lmp-text/70 text-sm font-bold cursor-pointer py-2 transition block underline"
          >
            Imprint
          </Link>
          <div className="flex flex-row items-center gap-3">
            <p>Funded by</p>
            <Image
              src="/assets/logo-vwstiftung-dark1.png"
              alt="Volkswagen Foundation Logo"
              className="w-66.5 h-auto"
              width={266}
              height={52}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
