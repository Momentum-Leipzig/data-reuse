import type { Metrics } from "@/lib/graphql/metrics";

const METRIC_LABELS: { key: keyof Metrics; label: string }[] = [
  { key: "questions", label: "Number of Questions" },
  { key: "participants", label: "Number of Participants" },
  { key: "measurementPoints", label: "Measurement Points" },
  { key: "dataPoints", label: "Data Points across Measurement Points" },
];

export default function MetricsOverview({
  metrics,
}: {
  metrics: Metrics | null;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {METRIC_LABELS.map(({ key, label }) => (
        <div
          key={key}
          className="rounded-2xl p-4  flex flex-col gap-2 items-center"
        >
          <p className="text-sm font-bold text-lmp-text text-center text-balance">
            {label}
          </p>
          {metrics === null ? (
            <div className="h-16 w-24 rounded-lg bg-lmp-gray1 animate-pulse" />
          ) : (
            <p className="text-6xl">{metrics[key].toLocaleString()}</p>
          )}
        </div>
      ))}
    </div>
  );
}
