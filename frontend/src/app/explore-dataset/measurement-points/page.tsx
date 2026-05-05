"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function MeasurementPointsContent() {
  const searchParams = useSearchParams();
  const ids = searchParams.get("ids") ?? undefined;
  const selectedIds = ids
    ? ids
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  return (
    <section className="space-y-2">
      <p>
        Mode:{" "}
        {selectedIds.length > 0
          ? "some measurement points (1..n)"
          : "all measurement points"}
      </p>
      <p>
        Selected IDs: {selectedIds.length > 0 ? selectedIds.join(", ") : "none"}
      </p>
      <p>
        Example detail link:{" "}
        <Link
          className="underline"
          href="/explore-dataset/measurement-points?ids=m1"
        >
          /explore-dataset/measurement-points?ids=m1
        </Link>
      </p>
    </section>
  );
}

export default function MeasurementPointsPage() {
  return (
    <Suspense
      fallback={
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold">Measurement Points</h1>
          <p>Loading filters...</p>
        </section>
      }
    >
      <MeasurementPointsContent />
    </Suspense>
  );
}
