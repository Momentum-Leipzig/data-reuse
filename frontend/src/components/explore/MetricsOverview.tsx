import type { Metrics } from "@/lib/graphql/metrics";

const FALLBACK_METRICS: Metrics = {
  questions: 679,
  participants: 2875,
  measurementPoints: 65,
  dataPoints: 17831986,
};

const METRIC_LABELS: { key: keyof Metrics; label: string }[] = [
  { key: "questions", label: "Number of Questions" },
  { key: "participants", label: "Number of Participants" },
  { key: "measurementPoints", label: "Measurement Points" },
  { key: "dataPoints", label: "Data Points across Measurement Points" },
];

function formatMetric(value: number): string {
  return value.toLocaleString("de-DE");
}

export default function MetricsOverview({
  metrics,
}: {
  metrics: Metrics | null | undefined;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-4">
      {METRIC_LABELS.map(({ key, label }) => {
        const fallback = FALLBACK_METRICS[key];
        const loaded = metrics?.[key];
        const value = loaded != null && loaded !== fallback ? loaded : fallback;
        return (
          <div
            key={key}
            className="rounded-2xl px-4  flex flex-col gap-2 items-center"
          >
            <p className="text-sm font-bold text-lmp-text text-center text-balance">
              {label}
            </p>
            <p className="text-6xl">{formatMetric(value)}</p>
          </div>
        );
      })}
    </div>
  );
}
