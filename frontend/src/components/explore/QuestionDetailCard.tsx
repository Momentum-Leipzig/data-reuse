import Link from "next/link";
import { FormattedItemText } from "@/lib/formatItemText";
import { Image } from "@/components/Image";
import type { QuestionDetail } from "@/lib/graphql/questions";

type Context = {
  topic_name: string | null;
  construct_name: string | null;
  subfacet_name: string | null;
};

type Props = {
  questions: QuestionDetail[];
  context?: Context;
  onDeselect: (itemName: string) => void;
};

export default function QuestionDetailCard({
  questions,
  context,
  onDeselect,
}: Props) {
  const shared = questions[0];

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
      {shared.instrument_intro && (
        <div>
          <p className="text-sm font-medium">General Introduction</p>
          <p className="text-sm ml-4">{shared.instrument_intro}</p>
        </div>
      )}

      {/* Instruction per wave */}
      {shared.instruction_waves.some((w) => w.instruction_text) && (
        <div>
          <p className="text-sm font-medium">
            Instruction per Measurement Point
          </p>
          <ul className="flex flex-col gap-0 ml-4 list-none">
            {Object.entries(
              shared.instruction_waves
                .filter((w) => w.instruction_text)
                .reduce<Record<string, string[]>>((acc, w) => {
                  const text = w.instruction_text!;
                  (acc[text] ??= []).push(w.wave);
                  return acc;
                }, {}),
            ).map(([text, waves]) => (
              <li key={text} className="text-sm">
                <span className="font-bold">{text}</span>
                <span className="font-mono text-sm ml-2">
                  ({waves.join(" | ")})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Question pills — one per question with individual deselect */}
      <div>
        <p className="text-sm font-medium">
          Question{questions.length > 1 ? "s" : ""}
        </p>

        <div className="flex flex-col gap-2 ml-4">
          {questions.map((question) => (
            <div
              key={question.item_name}
              className="rounded-2xl p-3 bg-lmp-gray3 flex flex-wrap gap-1 cursor-pointer hover:bg-lmp-gray3/70 transition text-sm"
              onClick={() => onDeselect(question.item_name)}
            >
              <Image
                src="/assets/x_circle.svg"
                alt="Deselect"
                width={20}
                height={20}
                className="mr-2 shrink-0"
              />
              <div>
                <span>[{question.item_name}]</span>{" "}
                <span className="font-bold">
                  {question.instruction_id === "SF_12" ? (
                    "[SF12v2 copyright]"
                  ) : (
                    <FormattedItemText text={question.item_text ?? "—"} />
                  )}
                </span>
              </div>
              {question.reverse_coded && (
                <span className="text-xs text-gray-500 self-center">
                  (reverse coded)
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scale + response options */}
      {shared.scale_name && (
        <div>
          <p className="text-sm font-medium">Response Scale</p>
          {shared.response_options.some((opt) => opt.label === null) ? (
            <p className="text-sm ml-4">Free text</p>
          ) : (
            shared.response_options.length > 0 && (
              <ol className="flex flex-row flex-wrap gap-1 list-none">
                {shared.response_options.map((opt) => (
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
            )
          )}
        </div>
      )}

      {/* Instrument Citation / Translation / Comment */}
      {(shared.instrument_citation ||
        shared.instrument_translation ||
        shared.instrument_comment) && (
        <div className="flex flex-col gap-1">
          {shared.instrument_citation && (
            <>
              <p className="text-sm font-medium">Instrument Citation</p>
              <p className="text-sm ml-4">{shared.instrument_citation}</p>
            </>
          )}
          {shared.instrument_translation && (
            <>
              <p className="text-sm font-medium">Instrument Translation</p>
              <p className="text-sm ml-4">{shared.instrument_translation}</p>
            </>
          )}
          {shared.instrument_comment && (
            <>
              <p className="text-sm font-medium">Instrument Comment</p>
              <p className="text-sm ml-4">{shared.instrument_comment}</p>
            </>
          )}
        </div>
      )}

      {/* Studies */}
      {shared.studies.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">
            Used in Stud
            {shared.studies.length === 1 ? "y" : "ies"}
          </p>
          <ul className="flex flex-col items-start gap-2 list-none p-0 m-0 ml-4">
            {shared.studies.map((study) => (
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
