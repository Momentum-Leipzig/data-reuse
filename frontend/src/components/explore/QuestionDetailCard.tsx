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
  return (
    <div className="flex flex-col items-start gap-4 border border-lmp-text rounded-2xl p-6">
      {/* Breadcrumb */}
      {context && (context.topic_name || context.construct_name) && (
        <p className="text-sm">
          {[context.topic_name, context.construct_name, context.subfacet_name]
            .filter(Boolean)
            .join(" › ")}
        </p>
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
        <span className="font-bold">{question.item_text ?? "—"}</span>
        {question.reverse_coded && (
          <span className="text-xs text-gray-400 italic self-center">
            (reverse-coded)
          </span>
        )}
      </div>

      {/* Scale + response options */}
      {question.scale_name && (
        <div className="flex flex-col gap-2">
          <p className="text-lg font-medium">Scale</p>
          <p className="text-sm font-medium">
            <span className="font-normal">{question.scale_name}</span>
            {/* {question.scale_type && (
              <span className="ml-2 text-xs text-gray-400">
                ({question.scale_type})
              </span>
            )} */}
          </p>
          {question.response_options.length > 0 && (
            <ol className="flex flex-row gap-1 list-none">
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

      {/* Instrument */}
      {question.instrument_name && (
        <div className="flex flex-col gap-1">
          {/* <p className="text-sm font-medium">Instrument</p>
          <p className="text-sm text-gray-700">{question.instrument_name}</p>
          {intro && <p className="text-sm text-gray-600 italic">{intro}</p>} */}
          {question.instrument_citation && (
            <p className="text-sm">{question.instrument_citation}</p>
          )}
        </div>
      )}

      {/* Studies */}
      {question.studies.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-lg font-medium">
            Used in {question.studies.length} stud
            {question.studies.length === 1 ? "y" : "ies"}
          </p>
          <ul className="flex flex-col items-start gap-2 list-none p-0 m-0">
            {question.studies.map((study) => (
              <Link
                key={study.study_name}
                href={`/explore-dataset/studies?ids=${encodeURIComponent(study.study_name)}`}
                className="rounded-2xl px-4 py-2 bg-lmp-gray3 flex flex-wrap gap-1 cursor-pointer hover:bg-lmp-gray3/70 transition text-sm"
              >
                <p>{study.study_name.split("20")[0].trim()}</p>●
                <p>{study.publication_year ?? "No publication year"}</p>●
                <p className="font-bold">{study.title ?? "No title"}</p>●
                <p>{study.doi ?? "No DOI"}</p>
              </Link>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
