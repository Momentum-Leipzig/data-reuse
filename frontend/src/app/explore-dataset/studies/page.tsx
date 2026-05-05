"use client";

import StudiesList from "@/components/explore/StudiesList";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function StudiesContent() {
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
        Selected IDs: {selectedIds.length > 0 ? selectedIds.join(", ") : "none"}
      </p>
      <StudiesList
        title={selectedIds.length > 0 ? "Selected studies" : "All studies"}
        studyNames={selectedIds}
      />
    </section>
  );
}

export default function StudiesPage() {
  return (
    <Suspense
      fallback={
        <section className="space-y-4">
          <p>Loading...</p>
        </section>
      }
    >
      <StudiesContent />
    </Suspense>
  );
}
