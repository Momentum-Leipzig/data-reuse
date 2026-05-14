"use client";

import { getStudies, type Study } from "@/lib/graphql/studies";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type StudiesListProps = {
  title?: string;
  studyNames?: string[];
  studies?: Study[];
  loading?: boolean;
  error?: string | null;
};

export default function StudiesList({
  title = "All studies",
  studyNames,
  studies: externalStudies,
  loading: externalLoading,
  error: externalError,
}: StudiesListProps) {
  const [internalStudies, setInternalStudies] = useState<Study[]>([]);
  const [internalLoading, setInternalLoading] = useState(
    externalStudies ? false : true,
  );
  const [internalError, setInternalError] = useState<string | null>(null);

  const studies = externalStudies ?? internalStudies;
  const loading = externalLoading ?? internalLoading;
  const error = externalError ?? internalError;

  useEffect(() => {
    if (externalStudies) {
      return;
    }

    let active = true;

    async function loadStudies() {
      try {
        setInternalLoading(true);
        const result = await getStudies();

        if (active) {
          setInternalStudies(result);
          setInternalError(null);
        }
      } catch (err) {
        if (active) {
          setInternalError(
            err instanceof Error ? err.message : "Unknown error",
          );
        }
      } finally {
        if (active) {
          setInternalLoading(false);
        }
      }
    }

    loadStudies();

    return () => {
      active = false;
    };
  }, [externalStudies]);

  const visibleStudies = useMemo(() => {
    if (!studyNames || studyNames.length === 0) {
      return studies;
    }

    const selectedNames = new Set(studyNames);
    return studies.filter((study) => selectedNames.has(study.study_name));
  }, [studies, studyNames]);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-3xl font-semibold">{title}</h2>

      {loading && <p>Loading studies...</p>}
      {error && <p className="text-red-700">Error: {error}</p>}

      {!loading && !error && visibleStudies.length === 0 && (
        <p>No studies found.</p>
      )}

      {!loading && !error && visibleStudies.length > 0 && (
        <ul className="flex flex-col items-start gap-2 m-0 p-0 list-none">
          {visibleStudies.map((study) => (
            <Link
              href={`/explore-dataset/studies?ids=${encodeURIComponent(study.study_name)}`}
              key={study.study_name}
              className="rounded-2xl px-4 py-2 bg-lmp-gray3 flex flex-wrap gap-1 cursor-pointer hover:bg-lmp-gray3/70 transition text-sm"
            >
              <p>{study.study_name.split("20")[0].trim()}</p>●
              <p>{study.publication_year ?? "No publication year"}</p>●
              <p className="font-bold">{study.title ?? "No title"}</p>●
              <p>{study.doi ?? "No DOI"}</p>
            </Link>
          ))}
        </ul>
      )}
    </section>
  );
}
