"use client";

import QuestionsByTopic from "@/components/explore/QuestionsByTopic";
import StudiesList from "@/components/explore/StudiesList";
import { getAllQuestions, type TopicGroup } from "@/lib/graphql/studies";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

function QuestionsContent() {
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

  const [topics, setTopics] = useState<TopicGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const result = await getAllQuestions();
        if (active) {
          setTopics(result);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="flex flex-col gap-12">
      <div className="flex flex-row gap-2">
        <p> Temporary Debug Content: </p>
        <p>
          Mode:{" "}
          {selectedIds.length > 0 ? "some questions (1..n)" : "all questions"}
        </p>
        <p>
          Selected IDs:{" "}
          {selectedIds.length > 0 ? selectedIds.join(", ") : "none"}
        </p>
        <p>
          Example detail link:{" "}
          <Link className="underline" href="/explore-dataset/questions?ids=q1">
            /explore-dataset/questions?ids=age_ST4
          </Link>
        </p>
      </div>

      {mode === "all" ? (
        <div className="flex flex-col gap-12">
          {/* all questions section */}
          <div>
            {loading && (
              <div className="flex flex-col gap-4">
                <h2 className="font-bold text-3xl">
                  Topics, Constructs and Subfacets
                </h2>
                <p>Loading questions…</p>
              </div>
            )}
            {error && <p className="text-red-600">Error: {error}</p>}
            {!loading && !error && (
              <QuestionsByTopic
                topics={topics}
                headline="Topics, Constructs and Subfacets"
              />
            )}
          </div>

          {/* all studies section */}
          <StudiesList title={"The following studies are based on this data"} />
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500">
            Selected IDs: {selectedIds.join(", ")}
          </p>
        </div>
      )}
    </section>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense
      fallback={
        <section className="space-y-4">
          <p>Loading…</p>
        </section>
      }
    >
      <QuestionsContent />
    </Suspense>
  );
}
