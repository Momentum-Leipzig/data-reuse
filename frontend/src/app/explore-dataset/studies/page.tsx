"use client";

import MetricsOverview from "@/components/explore/MetricsOverview";
import SelectedEntity from "@/components/explore/SelectedEntity";
import StudiesList from "@/components/explore/StudiesList";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function StudiesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ids = searchParams.get("ids") ?? undefined;
  const selectedIds = ids
    ? ids
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];
  const mode = selectedIds.length > 0 ? "selected" : "all";

  function deselectStudy(studyId: string) {
    const nextSelectedIds = selectedIds.filter((id) => id !== studyId);
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (nextSelectedIds.length > 0) {
      nextSearchParams.set("ids", nextSelectedIds.join(","));
    } else {
      nextSearchParams.delete("ids");
    }

    const nextQueryString = nextSearchParams.toString();
    router.replace(
      nextQueryString ? `${pathname}?${nextQueryString}` : pathname,
    );
  }

  return (
    <section className="space-y-2">
      {mode === "selected" ? (
        <div>
          <p className="font-bold">Selection</p>
          <div className="flex flex-col gap-2">
            {selectedIds.map((id) => (
              <SelectedEntity key={id} deselect={() => deselectStudy(id)}>
                {/* <p>{study.study_name.split("20")[0].trim()}</p>●
              <p>{study.publication_year ?? "No publication year"}</p>●
              <p className="font-bold">{study.title ?? "No title"}</p>●
              <p>{study.doi ?? "No DOI"}</p> */}
                {id} {/* TODO: fetch and display study details here */}
              </SelectedEntity>
            ))}
          </div>
        </div>
      ) : null}
      {mode === "all" ? (
        <div>
          <MetricsOverview />
          <StudiesList title={"All studies"} />
        </div>
      ) : null}
    </section>
  );
}

export default function StudiesPage() {
  return (
    <Suspense
      fallback={
        <section className="space-y-4">
          <p>Loading...</p>
        </section>
      }
    >
      <StudiesContent />
    </Suspense>
  );
}
