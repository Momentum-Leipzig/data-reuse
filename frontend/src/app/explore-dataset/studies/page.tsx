"use client";

import MetricsOverview from "@/components/explore/MetricsOverview";
import SelectedEntity from "@/components/explore/SelectedEntity";
import StudiesList from "@/components/explore/StudiesList";
import StudyDetailCard from "@/components/explore/StudyDetailCard";
import WaveParticipantsChart from "@/components/explore/WaveParticipantsChart";
import SearchPreview from "@/components/search/SearchPreview";
import {
  getStudies,
  getStudyQuestions,
  type Study,
  type TopicGroup,
} from "@/lib/graphql/studies";
import {
  getGlobalMetrics,
  getMetricsByStudies,
  getMetricsByStudiesAnd,
  type Metrics,
} from "@/lib/graphql/metrics";
import {
  getGlobalWaveParticipants,
  getWaveParticipantsByStudies,
  getWaveParticipantsByStudiesAnd,
  type WaveParticipants,
} from "@/lib/graphql/waves";
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
  const [logic, setLogic] = useState<"or" | "and">("or");
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [questionsByStudy, setQuestionsByStudy] = useState<
    Record<string, TopicGroup[]>
  >({});
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [waveData, setWaveData] = useState<WaveParticipants[] | null>(null);
  const [globalWaveData, setGlobalWaveData] = useState<
    WaveParticipants[] | undefined
  >(undefined);

  console.log("Selected study IDs:", selectedIds);
  console.log("questionsByStudy:", questionsByStudy);

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

  // Fetch global wave data once — used to keep the Y axis stable when filtering.
  useEffect(() => {
    getGlobalWaveParticipants().then(setGlobalWaveData);
  }, []);

  // Re-fetch metrics and wave data whenever the selection or logic mode changes.
  useEffect(() => {
    if (selectedIds.length === 0) {
      getGlobalMetrics().then(setMetrics);
      getGlobalWaveParticipants().then(setWaveData);
      return;
    }
    setMetrics(null);
    setWaveData(null);
    const fetchMetrics =
      logic === "and" && selectedIds.length > 1
        ? getMetricsByStudiesAnd
        : getMetricsByStudies;
    const fetchWaves =
      logic === "and" && selectedIds.length > 1
        ? getWaveParticipantsByStudiesAnd
        : getWaveParticipantsByStudies;
    fetchMetrics(selectedIds).then(setMetrics);
    fetchWaves(selectedIds).then(setWaveData);
  }, [selectedIds, logic]);

  useEffect(() => {
    if (selectedIds.length === 0) {
      setQuestionsByStudy({});
      return;
    }

    let active = true;

    async function loadQuestions() {
      try {
        setQuestionsLoading(true);
        const results = await Promise.all(
          selectedIds.map((id) =>
            getStudyQuestions(id).then((topics) => ({ id, topics })),
          ),
        );
        if (active) {
          const map: Record<string, TopicGroup[]> = {};
          for (const { id, topics } of results) {
            map[id] = topics;
          }
          setQuestionsByStudy(map);
          setQuestionsError(null);
        }
      } catch (err) {
        if (active) {
          setQuestionsError(
            err instanceof Error ? err.message : "Unknown error",
          );
        }
      } finally {
        if (active) setQuestionsLoading(false);
      }
    }

    loadQuestions();
    return () => {
      active = false;
    };
  }, [selectedIds]);

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
      setLogic("or");
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
    <section className="flex flex-col gap-15">
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
            <p className="font-bold">{study.title ?? "No title"}</p>
          </div>
        )}
      />

      {mode === "selected" ? (
        <div className="flex flex-col gap-15">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-6 flex-wrap">
              <p className="font-bold">Selection</p>
              {selectedIds.length > 1 && (
                <div className="flex rounded-lg border border-lmp-text overflow-hidden text-sm">
                  <button
                    onClick={() => setLogic("or")}
                    title="OR – count participants who answered questions in at least one of the selected studies"
                    className={`px-4 py-1.5 transition cursor-pointer ${logic === "or" ? "bg-lmp-text text-white" : "hover:bg-lmp-gray3"}`}
                  >
                    OR
                  </button>
                  <button
                    onClick={() => setLogic("and")}
                    title="AND – count participants who answered questions in all of the selected studies"
                    className={`px-4 py-1.5 transition cursor-pointer ${logic === "and" ? "bg-lmp-text text-white" : "hover:bg-lmp-gray3"}`}
                  >
                    AND
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {selectedStudies.map((study) => (
                <SelectedEntity
                  key={study.study_name}
                  deselect={() => deselectStudy(study.study_name)}
                >
                  <div>
                    <span className="mr-1">
                      {study.study_name.split("20")[0].trim()}
                    </span>
                    ●
                    <span className="ml-1 mr-1">
                      {study.publication_year ?? "No publication year"}
                    </span>
                    ●
                    <span className="ml-1 mr-1 font-bold">
                      {study.title ?? "No title"}
                    </span>
                  </div>
                </SelectedEntity>
              ))}

              {!loading && !error && selectedStudies.length === 0 && (
                <p>No selected study details found.</p>
              )}
            </div>
          </div>
          <MetricsOverview metrics={metrics} />
          <WaveParticipantsChart
            data={waveData}
            globalData={globalWaveData}
            headline={`Participants per Measurement Point that Answered Questions ${
                selectedStudies.length > 1
                  ? logic === "and"
                    ? "in All of the Selected Studies"
                    : "in Any of the Selected Studies"
                  : "in the Selected Study"
              }`}
          />

          {/* Study detail cards */}
          <div className="flex flex-col gap-6">
            <h2 className="font-semibold text-3xl">
              Selected Stud{selectedStudies.length > 1 ? "ies" : "y"}
            </h2>
            {selectedStudies.map((study) => (
              <StudyDetailCard
                key={study.study_name}
                study={study}
                onDeselect={() => deselectStudy(study.study_name)}
                topics={questionsByStudy[study.study_name]}
                topicsLoading={questionsLoading}
                topicsError={questionsError}
              />
            ))}
          </div>

          {/* all studies */}
          <StudiesList
            title={"All Studies"}
            studies={studies}
            loading={loading}
            error={error}
            selectedStudyIds={selectedIds}
          />
        </div>
      ) : null}
      {mode === "all" ? (
        <div className="flex flex-col gap-15">
          <MetricsOverview metrics={metrics} />
          <WaveParticipantsChart data={waveData} globalData={globalWaveData} />
          <StudiesList
            title={"All Studies"}
            studies={studies}
            loading={loading}
            error={error}
            selectedStudyIds={selectedIds}
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
        <section>
          <p>Loading...</p>
        </section>
      }
    >
      <StudiesContent />
    </Suspense>
  );
}
