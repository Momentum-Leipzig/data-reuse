"use client";

import MetricsOverview from "@/components/explore/MetricsOverview";
import QuestionsByTopic from "@/components/explore/QuestionsByTopic";
import SelectedEntity from "@/components/explore/SelectedEntity";
import StudiesList from "@/components/explore/StudiesList";
import SearchPreview from "@/components/search/SearchPreview";
import {
  getAllQuestions,
  getStudiesByQuestions,
  type Question,
  type Study,
  type TopicGroup,
} from "@/lib/graphql/studies";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

function QuestionsContent() {
  const router = useRouter();
  const pathname = usePathname();
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

  const [studiesByQuestions, setStudiesByQuestions] = useState<Study[]>([]);
  const [studiesLoading, setStudiesLoading] = useState(false);
  const [studiesError, setStudiesError] = useState<string | null>(null);

  const allQuestions = useMemo(() => {
    return topics.flatMap((topic) =>
      topic.constructs.flatMap((construct) =>
        construct.subfacets.flatMap((subfacet) => subfacet.questions),
      ),
    );
  }, [topics]);

  const questionsWithContext = useMemo(() => {
    return topics.flatMap((topic) =>
      topic.constructs.flatMap((construct) =>
        construct.subfacets.flatMap((subfacet) =>
          subfacet.questions.map((q) => ({
            ...q,
            topic_name: topic.topic_name,
            construct_name: construct.construct_name,
            subfacet_name: subfacet.subfacet_name,
          })),
        ),
      ),
    );
  }, [topics]);

  const questionsById = useMemo(() => {
    return new Map(allQuestions.map((q) => [q.item_name, q]));
  }, [allQuestions]);

  const selectedQuestions = useMemo(() => {
    return selectedIds
      .map((id) => questionsById.get(id))
      .filter((q): q is Question => Boolean(q));
  }, [selectedIds, questionsById]);

  function selectQuestion(itemName: string) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    const nextSelectedIds = selectedIds.includes(itemName)
      ? selectedIds
      : [...selectedIds, itemName];
    nextSearchParams.set("ids", nextSelectedIds.join(","));
    const nextQueryString = nextSearchParams.toString();
    router.replace(
      nextQueryString ? `${pathname}?${nextQueryString}` : pathname,
    );
  }

  function deselectQuestion(itemName: string) {
    const nextSelectedIds = selectedIds.filter((id) => id !== itemName);
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (nextSelectedIds.length > 0) {
      nextSearchParams.set("ids", nextSelectedIds.join(","));
    } else {
      nextSearchParams.delete("ids");
    }

    const nextQueryString = nextSearchParams.toString();
    router.replace(
      nextQueryString ? `${pathname}?${nextQueryString}` : pathname,
    );
  }

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

  useEffect(() => {
    if (selectedIds.length === 0) {
      setStudiesByQuestions([]);
      return;
    }

    let active = true;

    async function loadStudies() {
      try {
        setStudiesLoading(true);
        const result = await getStudiesByQuestions(selectedIds);
        if (active) {
          setStudiesByQuestions(result);
          setStudiesError(null);
        }
      } catch (err) {
        if (active) {
          setStudiesError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (active) setStudiesLoading(false);
      }
    }

    loadStudies();
    return () => {
      active = false;
    };
  }, [selectedIds]);

  return (
    <section className="flex flex-col gap-12">
      <SearchPreview
        items={questionsWithContext}
        loading={loading}
        error={error}
        placeholder="Search by keyword or ID"
        getItemKey={(q) => `${q.item_name}-${q.item_language}`}
        getSearchFields={(q) => [
          q.item_name,
          q.item_text,
          q.item_language,
          q.topic_name,
          q.construct_name,
          q.subfacet_name,
        ]}
        onSelect={(q) => selectQuestion(q.item_name)}
        renderItem={(q) => (
          <div className="flex flex-col gap-0.5 text-sm">
            <p className="text-xs text-gray-600">
              {q.topic_name}
              {q.construct_name ? ` › ${q.construct_name}` : ""}
              {q.subfacet_name ? ` › ${q.subfacet_name}` : ""}
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-mono text-xs text-gray-600">
                [{q.item_name}]
              </span>
              <span className="font-medium">{q.item_text ?? "No text"}</span>
            </div>
          </div>
        )}
      />

      {mode === "all" ? (
        <div className="flex flex-col gap-15">
          <MetricsOverview />

          <div className="mb-4 w-full h-75 bg-lmp-gray1 flex items-center justify-center">
            Chart
          </div>

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
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-2">
            <p className="font-bold">Selection</p>
            <div className="flex flex-col gap-2">
              {selectedQuestions.map((question) => (
                <SelectedEntity
                  key={question.item_name}
                  deselect={() => deselectQuestion(question.item_name)}
                >
                  <p>[{question.item_name}]</p>
                  <p className="font-bold">{question.item_text ?? "No text"}</p>
                </SelectedEntity>
              ))}

              {!loading && !error && selectedQuestions.length === 0 && (
                <p>No selected question details found.</p>
              )}
            </div>
          </div>
          <MetricsOverview />
          <div className="mb-4 w-full h-75 bg-lmp-gray1 flex items-center justify-center">
            Chart
          </div>

          <div>
            <h2 className="font-semibold text-3xl">
              Details on the selected question
              {selectedQuestions.length > 0 ? `s` : ""}
            </h2>
          </div>
          <div>
            all questions listed again or just highlighting the topics /
            constructs / subfacets
          </div>
          <StudiesList
            title={`Studies using ${selectedQuestions.length > 1 ? "any of" : ""} the selected question${selectedQuestions.length > 1 ? "s" : ""}`}
            studies={studiesByQuestions}
            loading={studiesLoading}
            error={studiesError}
          />
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
