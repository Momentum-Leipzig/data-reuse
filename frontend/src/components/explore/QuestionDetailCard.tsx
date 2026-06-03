import Link from "next/link";
import { Image } from "@/components/Image";
import type { QuestionDetail } from "@/lib/graphql/questions";

type Context = {
  topic_name: string | null;
  construct_name: string | null;
  subfacet_name: string | null;
};

type Props = {
  question: QuestionDetail;
  context?: Context;
  onDeselect: () => void;
};

export default function QuestionDetailCard({
  question,
  context,
  onDeselect,
}: Props) {
  console.log("Rendering QuestionDetailCard with question:", question);
  return (
    <div className="flex flex-col items-start gap-4 border border-lmp-text rounded-2xl p-6">
      {/* Breadcrumb */}
      {context && (context.topic_name || context.construct_name) && (
        <p className="text-base">
          {[context.topic_name, context.construct_name, context.subfacet_name]
            .filter(Boolean)
            .join(" › ")}
        </p>
      )}

      {/* Instrument general intro */}
      {question.instrument_intro && (
        <div>
          <p className="text-sm font-medium">General Introduction</p>
          <p className="text-sm ml-4">{question.instrument_intro}</p>
        </div>
      )}

      {/* Question ID + text — styled like SelectedEntity, with deselect */}
      <div
        className="rounded-2xl p-3 bg-lmp-gray3 flex flex-wrap gap-1 cursor-pointer hover:bg-lmp-gray3/70 transition text-sm"
        onClick={onDeselect}
      >
        <Image
          src="/assets/x_circle.svg"
          alt="Deselect"
          width={20}
          height={20}
          className="mr-2 shrink-0"
        />
        <span className="font-mono text-gray-500">[{question.item_name}]</span>
        <span className="font-bold">
          {question.instruction_id === "SF_12"
            ? "[SF12v2 copyright]"
            : (question.item_text ?? "—")}
        </span>
      </div>
      {question.reverse_coded && (
        <div>
          <p className="text-sm font-medium">Reverse Coded</p>
          <p className="text-sm ml-4">
            {question.reverse_coded ? "Yes" : "No"}
          </p>
        </div>
      )}

      {/* Scale + response options */}
      {question.scale_name && (
        <div>
          <p className="text-sm font-medium">Response Scale</p>
          {question.response_options.length > 0 && (
            <ol className="flex flex-row flex-wrap gap-1 list-none">
              {question.response_options.map((opt) => (
                <li key={opt.option_id} className="flex gap-1 text-sm">
                  {opt.numeric_value !== null && (
                    <span className="font-mono w-6 text-right shrink-0">
                      {opt.numeric_value}
                    </span>
                  )}
                  <span>= {opt.label}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Instrument Citation / Translation / Comment */}
      {(question.instrument_citation ||
        question.instrument_translation ||
        question.instrument_comment) && (
        <div className="flex flex-col gap-1">
          {question.instrument_citation && (
            <>
              <p className="text-sm font-medium">Instrument Citation</p>
              <p className="text-sm ml-4">{question.instrument_citation}</p>
            </>
          )}
          {question.instrument_translation && (
            <>
              <p className="text-sm font-medium">Instrument Translation</p>
              <p className="text-sm ml-4">{question.instrument_translation}</p>
            </>
          )}
          {question.instrument_comment && (
            <>
              <p className="text-sm font-medium">Instrument Comment</p>
              <p className="text-sm ml-4">{question.instrument_comment}</p>
            </>
          )}
        </div>
      )}

      {/* Studies */}
      {question.studies.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">
            Used in {question.studies.length} Stud
            {question.studies.length === 1 ? "y" : "ies"}
          </p>
          <ul className="flex flex-col items-start gap-2 list-none p-0 m-0 ml-4">
            {question.studies.map((study) => (
              <Link
                key={study.study_name}
                href={`/explore-dataset/studies?ids=${encodeURIComponent(study.study_name)}`}
                className="rounded-2xl px-4 py-2 bg-lmp-gray3 flex flex-wrap gap-1 cursor-pointer hover:bg-lmp-gray3/70 transition text-sm"
              >
                <p>{study.study_name.split("20")[0].trim()}</p>●
                <p>{study.publication_year ?? "No publication year"}</p>●
                <p className="font-bold">{study.title ?? "No title"}</p>
              </Link>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
