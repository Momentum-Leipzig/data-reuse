import ExploreNavigation from "@/components/explore/ExploreNavigation";
import Link from "next/link";

type ExploreLayoutProps = {
  children: React.ReactNode;
};

export default function ExploreLayout({ children }: ExploreLayoutProps) {
  return (
    <div>
      <ExploreNavigation />
      {children}

      <p className="bg-lmp-gray1 p-6 mt-50 w-fit place-self-center">
        If you notice any errors or inconsistencies in the data or
        documentation, please{" "}
        <Link href="/#project-team" className="font-bold underline">
          contact the project team
        </Link>
        . Thank you!
      </p>
    </div>
  );
}
