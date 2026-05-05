export default function MetricsOverview() {
  const METRICS = [
    {
      label: "Number of Questions",
      value: 5,
    },
    {
      label: "Number of Participants",
      value: 100,
    },
    {
      label: "Measurement Points",
      value: 100,
    },
    {
      label: "Data Points across Measurement Points",
      value: 100,
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {METRICS.map((metric) => (
        <div
          key={metric.label}
          className="rounded-2xl p-4  flex flex-col gap-2 items-center"
        >
          <p className="text-sm font-bold text-lmp-text text-center text-balance">
            {metric.label}
          </p>
          <p className="text-2xl font-bold">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}
