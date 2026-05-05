"use client";

import { getStudies, type Study } from "@/lib/graphql/studies";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type StudiesListProps = {
  title?: string;
  studyNames?: string[];
};

export default function StudiesList({
  title = "All studies",
  studyNames,
}: StudiesListProps) {
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

  const visibleStudies = useMemo(() => {
    if (!studyNames || studyNames.length === 0) {
      return studies;
    }

    const selectedNames = new Set(studyNames);
    return studies.filter((study) => selectedNames.has(study.study_name));
  }, [studies, studyNames]);

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">{title}</h2>

      {loading && <p>Loading studies...</p>}
      {error && <p className="text-red-700">Error: {error}</p>}

      {!loading && !error && visibleStudies.length === 0 && (
        <p>No studies found.</p>
      )}

      {!loading && !error && visibleStudies.length > 0 && (
        <ul className="space-y-2">
          {visibleStudies.map((study) => (
            <Link
              href={`/explore-dataset/studies?ids=${study.study_name}`}
              key={study.study_name}
              className="rounded-2xl p-3 bg-lmp-gray3 flex flex-wrap gap-1 cursor-pointer hover:bg-lmp-gray3/70 transition text-sm"
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
