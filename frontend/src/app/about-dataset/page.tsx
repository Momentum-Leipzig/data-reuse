import MetricsOverview from "@/components/explore/MetricsOverview";
import { getGlobalMetrics } from "@/lib/graphql/metrics";
import Link from "next/link";

export default async function AboutDataset() {
  const metrics = await getGlobalMetrics().catch(() => null);
  return (
    <div className="flex flex-col gap-20">
      <div className="flex flex-colsm:grid grid-cols-[70%_auto] gap-4 mb-6">
        <div className="col-span-1 flex flex-col gap-4">
          <h1 className="text-5xl leading-[125%] font-medium text-balance">
            The Dataset
          </h1>
          <h2 className="text-xl font-medium">
            Structure, scope and content at a glance
          </h2>
        </div>
      </div>
      <div className="flex flex-col sm:grid grid-cols-[70%_auto] gap-6">
        <div className="col-span-1 flex flex-col gap-16.5">
          <div className="flex flex-col gap-6">
            <h3 className="text-3xl font-medium">Longitudinal structure</h3>
            <p className="leading-relaxed">
              The dataset comprises 54-wave survey data collected from full-time
              employees in Germany between December 2019 and December 2024. The
              survey study was originally designed with four measurement waves
              separated by three months, but was adapted to monthly assessments
              from April 2020 to capture changes in work characteristics and
              employee experiences and behaviors during the COVID-19 pandemic
              and beyond (with a 6-month gap between December 2022 and June
              2023). We also provide a dataset containing data from a two-week
              daily diary (i.e., experience sampling) study conducted in August
              2022 with participants from the longitudinal study. Participants
              were recruited from a nationally representative panel in Germany.
              The dataset includes a wide range of variables and constructs
              related to demographics, employment, personality, aging, health
              and wellbeing, and work characteristics.
            </p>
          </div>
        </div>

        <div className="col-span-1 flex flex-col gap-6">
          <div className="flex flex-col gap-6 bg-lmp-gray1 p-6">
            <h3 className="text-3xl font-medium">Key characteristics</h3>
            <ul>
              <li>
                54 measurement points over 5 years, with different time lags
              </li>
              <li>
                Data collection covering pre-, during and post-COVID-19 pandemic
                periods
              </li>
              <li>
                Participants recruited from a nationally representative panel in
                Germany
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <MetricsOverview metrics={metrics} />
      </div>

      <div className="flex flex-col sm:grid grid-cols-2 gap-6">
        <div className="col-span-1 bg-lmp-gray1 p-6 flex flex-col gap-6">
          <h3 className="text-3xl font-medium">How the data is structured</h3>
          <p className="leading-relaxed">
            The dataset is organized around questions, constructs, measurement
            points, and participants. Questions are linked to broader constructs
            and assigned to specific measurement points across time. Because
            participation varies across waves and not all questions were
            included at every timepoint, the dataset combines repeated
            structures with changing coverage over the course of the study.
          </p>
        </div>
        <div className="col-span-1 bg-lmp-gray1 p-6 flex flex-col gap-6">
          <h3 className="text-3xl font-medium">What is covered</h3>
          <ul>
            <li>Demographic and employment characteristics</li>
            <li>Personality traits and individual differences</li>
            <li>Aging</li>
            <li>Health and wellbeing</li>
            <li>Employee attitudes and behaviors</li>
            <li>Work characteristics and work-family life</li>
            <li>COVID-19 related variables</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:max-w-[70%]">
        <h3 className="text-3xl font-medium">
          What the exploration tool provides
        </h3>
        <p className="leading-relaxed">
          The tool supports structured exploration of metadata, enabling
          researchers to assess the suitability of the dataset for their
          purposes and to download the dataset. It does not provide access to
          raw data or support statistical analysis.
        </p>
      </div>

      <div className="flex flex-col sm:grid grid-cols-2 gap-6">
        <div className="col-span-1 flex flex-col items-start gap-6">
          <h3 className="text-3xl font-medium">How to explore the dataset</h3>
          <p className="leading-relaxed">
            The exploration tool helps you navigate the dataset from three
            different perspectives. You can search by{" "}
            <Link
              href="/explore-dataset/questions"
              className="font-bold underline"
            >
              questions and constructs
            </Link>
            , inspect
            <Link
              href="/explore-dataset/measurement-points"
              className="font-bold underline"
            >
              {" "}
              measurement points
            </Link>{" "}
            across time, and review{" "}
            <Link
              href="/explore-dataset/studies/"
              className="font-bold underline"
            >
              studies
            </Link>{" "}
            based on the data. The exploration tool helps users assess overlap,
            coverage, and suitability before downloading the full dataset. This
            makes it easier to understand the structure of the dataset and
            evaluate its relevance for your own research before downloading it.
          </p>
          <Link
            href="/explore-dataset/"
            className="text-lmp-text hover:text-lmp-text text-sm font-bold bg-lmp-green hover:bg-lmp-green/70 px-6 py-3 rounded-3xl cursor-pointer transition"
          >
            Explore the Dataset
          </Link>
        </div>
        <div className="col-span-1 bg-lmp-gray1 p-6 flex flex-col gap-6 h-75 border border-lmp-text"></div>
      </div>
    </div>
  );
}
