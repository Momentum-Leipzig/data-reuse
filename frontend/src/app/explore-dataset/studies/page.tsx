"use client";

import Link from "next/link";
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
        Mode: {selectedIds.length > 0 ? "some studies (1..n)" : "all studies"}
      </p>
      <p>
        Selected IDs: {selectedIds.length > 0 ? selectedIds.join(", ") : "none"}
      </p>
      <p>
        Example detail link:{" "}
        <Link className="underline" href="/explore-dataset/studies?ids=s1">
          /explore-dataset/studies?ids=s1
        </Link>
      </p>
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
