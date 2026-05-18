"use client";

import MetricsOverview from "@/components/explore/MetricsOverview";
import SelectedEntity from "@/components/explore/SelectedEntity";
import WaveParticipantsChart from "@/components/explore/WaveParticipantsChart";
import {
  getGlobalMetrics,
  getMetricsByWaves,
  type Metrics,
} from "@/lib/graphql/metrics";
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

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [waveData, setWaveData] = useState<WaveParticipants[] | null>(null);

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
        : getMetricsByWaves(selectedIds);
    fetch.then((result) => {
      if (active) setMetrics(result);
    });
    return () => {
      active = false;
    };
  }, [selectedIds]);

  function toggleWave(wave: string) {
    const nextIds = selectedIds.includes(wave)
      ? selectedIds.filter((id) => id !== wave)
      : [...selectedIds, wave];
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    if (nextIds.length > 0) {
      nextSearchParams.set("ids", nextIds.join(","));
    } else {
      nextSearchParams.delete("ids");
    }
    const qs = nextSearchParams.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <section className="flex flex-col gap-15">
      <WaveParticipantsChart
        data={waveData}
        selectedWaves={selectedIds}
        onWaveToggle={toggleWave}
      />
      {mode === "selected" && (
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-3xl">
            Selected Measurement Points
          </h2>
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
        <div>show questions for selected waves here TODO</div>
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
