"use client";

import StudiesList from "@/components/explore/StudiesList";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function QuestionsContent() {
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
        {selectedIds.length > 0 ? "some questions (1..n)" : "all questions"}
      </p>
      <p>
        Selected IDs: {selectedIds.length > 0 ? selectedIds.join(", ") : "none"}
      </p>
      <p>
        Example detail link:{" "}
        <Link className="underline" href="/explore-dataset/questions?ids=q1">
          /explore-dataset/questions?ids=q1
        </Link>
      </p>

      <StudiesList title={"The following studies are based on this data"} />
    </section>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense
      fallback={
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold">Questions</h1>
          <p>Loading filters...</p>
        </section>
      }
    >
      <QuestionsContent />
    </Suspense>
  );
}
