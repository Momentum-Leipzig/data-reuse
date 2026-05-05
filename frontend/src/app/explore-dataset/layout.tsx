import ExploreNavigation from "@/components/explore/ExploreNavigation";

type ExploreLayoutProps = {
  children: React.ReactNode;
};

export default function ExploreLayout({ children }: ExploreLayoutProps) {
  return (
    <section className="space-y-4">
      <ExploreNavigation />
      {children}
    </section>
  );
}
