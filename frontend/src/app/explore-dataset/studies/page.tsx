"use client";

import MetricsOverview from "@/components/explore/MetricsOverview";
import SelectedEntity from "@/components/explore/SelectedEntity";
import StudiesList from "@/components/explore/StudiesList";
import SearchPreview from "@/components/search/SearchPreview";
import { getStudies, type Study } from "@/lib/graphql/studies";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

function StudiesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ids = searchParams.get("ids") ?? undefined;
  const selectedIds = useMemo(() => {
    return ids
      ? ids
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : [];
  }, [ids]);
  const mode = selectedIds.length > 0 ? "selected" : "all";
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadStudies() {
      try {
        setLoading(true);
        const result = await getStudies();

        if (active) {
          setStudies(result);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadStudies();

    return () => {
      active = false;
    };
  }, []);

  const studiesById = useMemo(() => {
    return new Map(studies.map((study) => [study.study_name, study]));
  }, [studies]);

  const selectedStudies = useMemo(() => {
    return selectedIds
      .map((id) => studiesById.get(id))
      .filter((study): study is Study => Boolean(study));
  }, [selectedIds, studiesById]);

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

  function selectStudy(studyId: string) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    const nextSelectedIds = selectedIds.includes(studyId)
      ? selectedIds
      : [...selectedIds, studyId];

    nextSearchParams.set("ids", nextSelectedIds.join(","));

    const nextQueryString = nextSearchParams.toString();
    router.replace(
      nextQueryString ? `${pathname}?${nextQueryString}` : pathname,
    );
  }

  return (
    <section className="space-y-2">
      <SearchPreview
        items={studies}
        loading={loading}
        error={error}
        placeholder="Search by keyword"
        getItemKey={(study) => study.study_name}
        getSearchFields={(study) => [
          study.study_name,
          study.doi,
          study.title,
          study.publication_year,
        ]}
        onSelect={(study) => selectStudy(study.study_name)}
        renderItem={(study) => (
          <div className="flex flex-wrap gap-1 text-sm">
            <p>{study.study_name.split("20")[0].trim()}</p>●
            <p>{study.publication_year ?? "No publication year"}</p>●
            <p className="font-bold">{study.title ?? "No title"}</p>●
            <p>{study.doi ?? "No DOI"}</p>
          </div>
        )}
      />

      {mode === "selected" ? (
        <div>
          <p className="font-bold">Selection</p>
          <div className="flex flex-col gap-2">
            {selectedStudies.map((study) => (
              <SelectedEntity
                key={study.study_name}
                deselect={() => deselectStudy(study.study_name)}
              >
                <p>{study.study_name.split("20")[0].trim()}</p>●
                <p>{study.publication_year ?? "No publication year"}</p>●
                <p className="font-bold">{study.title ?? "No title"}</p>●
                <p>{study.doi ?? "No DOI"}</p>
              </SelectedEntity>
            ))}

            {!loading && !error && selectedStudies.length === 0 && (
              <p>No selected study details found.</p>
            )}
          </div>
        </div>
      ) : null}
      {mode === "all" ? (
        <div>
          <MetricsOverview />
          <StudiesList
            title={"All studies"}
            studies={studies}
            loading={loading}
            error={error}
          />
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
