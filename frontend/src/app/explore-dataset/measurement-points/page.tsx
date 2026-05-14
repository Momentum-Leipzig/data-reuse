"use client";

import MetricsOverview from "@/components/explore/MetricsOverview";
import WaveParticipantsChart from "@/components/explore/WaveParticipantsChart";
import { getGlobalMetrics, type Metrics } from "@/lib/graphql/metrics";
import {
  getGlobalWaveParticipants,
  type WaveParticipants,
} from "@/lib/graphql/waves";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

function MeasurementPointsContent() {
  const searchParams = useSearchParams();
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
  const mode = selectedIds.length > 0 ? "selected" : "all";

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [waveData, setWaveData] = useState<WaveParticipants[] | null>(null);

  useEffect(() => {
    getGlobalMetrics().then(setMetrics);
    getGlobalWaveParticipants().then(setWaveData);
  }, []);

  return (
    <section className="flex flex-col gap-12">
      <MetricsOverview metrics={metrics} />
      <WaveParticipantsChart data={waveData} />
    </section>
  );
}

export default function MeasurementPointsPage() {
  return (
    <Suspense
      fallback={
        <section className="space-y-4">
          <p>Loading...</p>
        </section>
      }
    >
      <MeasurementPointsContent />
    </Suspense>
  );
}
