import MetricsOverview from "@/components/explore/MetricsOverview";
import { getGlobalMetrics } from "@/lib/graphql/metrics";
import Link from "next/link";
import { Image } from "@/components/Image";

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
            Overview of structure, scope, and content of the data
          </h2>
        </div>
      </div>
      <div className="flex flex-col sm:grid grid-cols-[70%_auto] gap-6">
        <div className="col-span-1 flex flex-col gap-16.5">
          <div className="flex flex-col gap-6">
            <h3 className="text-3xl font-medium">Longitudinal structure</h3>
            <p className="leading-relaxed">
              The dataset comprises 65-wave survey data collected from full-time
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
              In addition to the approximately 2,000 individuals who completed
              the survey in December 2019 and were invited to all subsequent
              surveys, two refresher samples of 500 individuals each completed
              the surveys in July and October 2020, respectively, and were
              invited to all subsequent surveys. The dataset includes a wide
              range of variables and constructs related to demographics,
              employment, personality, aging, health and well-being, and work
              characteristics.
            </p>
          </div>
        </div>

        <div className="col-span-1 flex flex-col gap-6">
          <div className="flex flex-col gap-6 bg-lmp-gray1 p-6">
            <h3 className="text-3xl font-medium">Key characteristics</h3>
            <ul>
              <li>
                65 measurement points over 5 years, with different time lags,
                including a daily diary study with 11 measurement points
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
            Items that were only measured once or twice were not included in the
            published dataset (except for demographics and employment
            characteristics). Therefore, some items that were used in published
            studies are not accessible in the documentation. However, most items
            can be accessed through the repositories associated with the
            respective publications.
          </p>
        </div>
        <div className="col-span-1 bg-lmp-gray1 p-6 flex flex-col gap-6">
          <h3 className="text-3xl font-medium">What is covered</h3>
          <ul>
            <li>Demographic and employment characteristics</li>
            <li>Personality traits and individual differences</li>
            <li>Aging</li>
            <li>Health and well-being</li>
            <li>Employee attitudes and behaviors</li>
            <li>Work characteristics and work-family life</li>
            <li>COVID-19 related variables</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <h3 className="text-3xl font-medium">Possible usage of the tool</h3>
        <p className="leading-relaxed sm:max-w-[70%]">
          You can use this tool to assess whether the dataset provides the data
          needed to answer a specific question that you may have in mind.
          Additionally, you can use the tool to generate research questions.
          Several potential use cases of the dataset exist:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
          <li>
            Research in industrial and organizational psychology can use the
            dataset to study work characteristics, leadership, employee behavior
            (e.g., performance, proactivity), employee attitudes (e.g., job
            satisfaction), motivation, and well-being over time.
          </li>
          <li>
            Research in health psychology and public health can examine a range
            of health outcomes (physical, mental, social, occupational) and
            their determinants, including short- and long-term as well as
            cumulative effects
          </li>
          <li>
            Research in personality and lifespan development can investigate
            trajectories of personality traits and work experiences over time,
            as well as factors shaping individual development and adaptation.
          </li>
          <li>
            Research in aging and organizational behavior can address
            age-related constructs (e.g., subjective age, aging beliefs,
            retirement intentions) as well as work-related topics such as
            leadership, organizational support, and performance.
          </li>
          <li>
            Research in economics and sociology can use demographic and
            employment data to analyze labor market dynamics, including job
            stability, career mobility, and economic well-being (e.g., income,
            job and life satisfaction).
          </li>
          <li>
            Given that the study spans the pre-, during-, and post-COVID-19
            period, the dataset can be used to study the societal impact of the
            pandemic and evaluate related policy measures.
          </li>
          <li>
            The dataset can further be used in methodological research,
            teaching, and training, including case studies and applied data
            analysis based on its intensive longitudinal design.
          </li>
        </ul>
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
        <div className="col-span-1 flex flex-col gap-6 border border-lmp-text">
          <Image
            src="/assets/explore_screenshot.png"
            alt="Description of the image"
            width={630}
            height={300}
          />
        </div>
      </div>
    </div>
  );
}
