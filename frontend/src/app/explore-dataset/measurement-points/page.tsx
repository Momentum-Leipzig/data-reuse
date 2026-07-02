"use client";

import MetricsOverview from "@/components/explore/MetricsOverview";
import QuestionsByTopic from "@/components/explore/QuestionsByTopic";
import SelectedEntity from "@/components/explore/SelectedEntity";
import WaveParticipantsChart from "@/components/explore/WaveParticipantsChart";
import {
  getGlobalMetrics,
  getMetricsByWaves,
  getMetricsByWavesAnd,
  type Metrics,
} from "@/lib/graphql/metrics";
import {
  getQuestionsByWaves,
  getQuestionsByWavesAnd,
  type TopicGroup,
} from "@/lib/graphql/studies";
import {
  getGlobalWaveParticipants,
  type WaveParticipants,
} from "@/lib/graphql/waves";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

function MeasurementPointsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ids = searchParams.get("ids") ?? undefined;
  const selectedIds = useMemo(
    () =>
      ids
        ? ids
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean)
        : [],
    [ids],
  );

  const [logic, setLogic] = useState<"or" | "and">("and");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [waveData, setWaveData] = useState<WaveParticipants[] | null>(null);
  const [topics, setTopics] = useState<TopicGroup[]>([]);
  const [topicsKey, setTopicsKey] = useState<string>("");
  const [topicsError, setTopicsError] = useState<string | null>(null);

  const currentTopicsKey = selectedIds.join(",") + logic;
  const topicsLoading =
    selectedIds.length > 0 && topicsKey !== currentTopicsKey;

  const waveByName = useMemo(
    () =>
      new Map((waveData ?? []).map((w) => [w.wave, w.month.substring(0, 7)])),
    [waveData],
  );

  const mode = selectedIds.length > 0 ? "selected" : "all";

  useEffect(() => {
    getGlobalWaveParticipants().then(setWaveData);
  }, []);

  useEffect(() => {
    let active = true;
    const fetch =
      selectedIds.length === 0
        ? getGlobalMetrics()
        : logic === "and" && selectedIds.length > 1
          ? getMetricsByWavesAnd(selectedIds)
          : getMetricsByWaves(selectedIds);
    fetch.then((result) => {
      if (active) setMetrics(result);
    });
    return () => {
      active = false;
    };
  }, [selectedIds, logic]);

  useEffect(() => {
    let active = true;
    const fetchFn =
      logic === "and" && selectedIds.length > 1
        ? getQuestionsByWavesAnd
        : getQuestionsByWaves;
    const load =
      selectedIds.length === 0
        ? Promise.resolve<TopicGroup[]>([])
        : fetchFn(selectedIds);
    load
      .then((result) => {
        if (active) {
          setTopics(result);
          setTopicsKey(selectedIds.join(",") + logic);
          setTopicsError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setTopicsError(err instanceof Error ? err.message : "Unknown error");
          setTopicsKey(selectedIds.join(",") + logic);
        }
      });
    return () => {
      active = false;
    };
  }, [selectedIds, logic]);

  function deselectAll() {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("ids");
    setLogic("or");
    const qs = nextSearchParams.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  function toggleWave(wave: string) {
    const nextIds = selectedIds.includes(wave)
      ? selectedIds.filter((id) => id !== wave)
      : [...selectedIds, wave];
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    if (nextIds.length > 0) {
      nextSearchParams.set("ids", nextIds.join(","));
    } else {
      nextSearchParams.delete("ids");
      setLogic("or");
    }
    const qs = nextSearchParams.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <section className="flex flex-col gap-15">
      <div>
        <p className="font-bold">Select one or more Measurement Points</p>
        <WaveParticipantsChart
          data={waveData}
          selectedWaves={selectedIds}
          onWaveToggle={toggleWave}
          headline={" "}
        />
      </div>
      {mode === "selected" && (
        <div className="flex flex-col gap-2 items-start">
          <div className="flex items-center gap-6 flex-wrap">
            <p className="font-bold">Selection</p>
            {selectedIds.length > 1 && (
              <div className="flex rounded-lg border border-lmp-text overflow-hidden text-sm">
                <button
                  onClick={() => setLogic("or")}
                  title="OR – show questions that appear in at least one of the selected measurement points"
                  className={`px-4 py-1.5 transition cursor-pointer ${logic === "or" ? "bg-lmp-text text-white" : "hover:bg-lmp-gray3"}`}
                >
                  OR
                </button>
                <button
                  onClick={() => setLogic("and")}
                  title="AND – show only questions that appear in all of the selected measurement points"
                  className={`px-4 py-1.5 transition cursor-pointer ${logic === "and" ? "bg-lmp-text text-white" : "hover:bg-lmp-gray3"}`}
                >
                  AND
                </button>
              </div>
            )}
            {selectedIds.length > 1 && (
              <button
                onClick={deselectAll}
                className="text-sm underline cursor-pointer hover:text-lmp-gray3"
              >
                Deselect all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {[...selectedIds].sort().map((wave) => (
              <SelectedEntity key={wave} deselect={() => toggleWave(wave)}>
                <span className="font-medium">{wave}</span>
                {waveByName.get(wave) && (
                  <span className="">● {waveByName.get(wave)}</span>
                )}
              </SelectedEntity>
            ))}
          </div>
        </div>
      )}
      <MetricsOverview metrics={metrics} />

      {mode === "selected" && (
        <div className="flex flex-col gap-4">
          {topicsLoading && (
            <div className="flex flex-col gap-4">
              <h2 className="font-semibold text-3xl">
                {selectedIds.length > 1
                  ? `Questions in ${logic === "and" ? "All" : "Any"} of the Selected Measurement Points`
                  : "Questions in the Selected Measurement Point"}{" "}
                by Topic, Construct, and Subfacet
              </h2>
              <p>Loading questions…</p>
            </div>
          )}
          {topicsError && (
            <p className="text-sm text-red-600">Error: {topicsError}</p>
          )}
          {!topicsLoading && !topicsError && (
            <QuestionsByTopic
              topics={topics}
              headline={
                selectedIds.length > 1
                  ? `Questions in ${logic === "and" ? "All" : "Any"} of the Selected Measurement Points by Topic, Construct, and Subfacet`
                  : "Questions in the Selected Measurement Point by Topic, Construct, and Subfacet"
              }
            />
          )}
        </div>
      )}
    </section>
  );
}

export default function MeasurementPointsPage() {
  return (
    <Suspense
      fallback={
        <section>
          <p>Loading...</p>
        </section>
      }
    >
      <MeasurementPointsContent />
    </Suspense>
  );
}
