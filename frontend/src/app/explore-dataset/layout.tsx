import ExploreNavigation from "@/components/explore/ExploreNavigation";

type ExploreLayoutProps = {
  children: React.ReactNode;
};

export default function ExploreLayout({ children }: ExploreLayoutProps) {
  return (
    <div>
      <ExploreNavigation />
      {children}
    </div>
  );
}
