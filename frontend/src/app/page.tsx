import { Image } from "@/components/Image";

const TEAM_MEMBERS = [
  {
    name: "Dr. Maie Stein",
    imageSrc: "/assets/Team_Maie_Stein.png",
    description:
      "Postdoctoral researcher at the Chair of Work and Organizational Psychology at Leipzig University. Her research focuses on occupational health and well-being, recovery, and ecological sustainability in organizations, using methods such as longitudinal studies, experiments, and experience sampling.",
    contact: "maie.stein@uni-leipzig.de",
  },
  {
    name: "Prof. Dr. Hannes Zacher",
    imageSrc: "/assets/Team_Hannes_Zacher.png",
    description:
      "Professor and Chair of Work and Organizational Psychology at Leipzig University. His research focuses on occupational health and well-being, proactive and adaptive work behavior, aging at work, career development, and environmentally sustainable behavior in organizations.",
    contact: "hannes.zacher@uni-leipzig.de",
  },
  {
    name: "Richard Janzen",
    imageSrc: "/assets/Team_Richard_Janzen.png",
    description:
      "Research associate and doctoral researcher at the Chair of Work and Organizational Psychology at Leipzig University. His work combines research on work, health, stress, and recovery with a strong interest in statistical methods and longitudinal change processes.",
    contact: "richard.janzen@uni-leipzig.de",
  },
  {
    name: "Dr. Cort W. Rudolph",
    imageSrc: "/assets/Team_Cort_Rudolph.png",
    description:
      "Industrial and Organizational Psychologist and Professor of Psychology at Wayne State University in Detroit, MI (USA). His research research focuses broadly on topics ranging from aging workers and lifespan development, to occupational health, employee wellbeing, environmental sustainability, and leadership.",
    contact: null,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-20">
      <div className="flex flex-col sm:grid grid-cols-[70%_auto] gap-4 mb-6">
        <div className="col-span-1 flex flex-col gap-4">
          <h1 className="text-5xl leading-[125%] font-medium text-balance">
            Leipzig Momentum Panel on Worker Characteristics, Experiences, and
            Behavior
          </h1>
          <h2 className="text-xl font-medium">
            A unique longitudinal dataset collected from employees in Germany
            between 2019 and 2024
          </h2>
        </div>
      </div>
      <div className="flex flex-col sm:grid grid-cols-[70%_auto] gap-6">
        <div className="col-span-1 flex flex-col gap-16.5">
          <div className="flex flex-col gap-6">
            <h3 className="text-3xl font-medium">What the project is about</h3>
            <p className="leading-relaxed">
              This project prepares and provides open access to a unique
              longitudinal dataset. It enables researchers to explore its
              structure and evaluate its suitability for their own research
              questions.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <h3 className="text-3xl font-medium">
              What you can do on this website
            </h3>
            <p className="leading-relaxed">
              This website helps researchers explore the structure of the
              dataset, understand its scope and content, and assess whether it
              is suitable for a specific research question. It provides access
              to key information on questions, measurement points, sample sizes,
              and studies based on the data, and supports researchers in making
              an informed decision about which research questions can be
              addressed with the data before accessing it via the download
              function.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <h3 className="text-3xl font-medium">Research background</h3>
            <p className="leading-relaxed">
              The 54-wave was collected from full-time employees in Germany
              between December 2019 and December 2024 as part of a large-scale
              longitudinal online survey study. Data collection was conducted
              within the research project{" "}
              <a
                href="https://projektdatenbank.volkswagenstiftung.de/projekt/0065586"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lmp-text hover:text-lmp-text/70 font-bold transition underline"
              >
                “The Role of Work in the Development of Civilization Diseases”
                at Leipzig University.
              </a>
              <br />
              <br />
              The aim of the study was to investigate links between work
              characteristics, employee experiences and behaviors, and the
              long-term development of physical and mental health. The initial
              study design included four measurement waves separated by three
              months each, but was adapted to monthly assessments from April
              2020 to closely track potential changes in work characteristics
              and employee experiences and behaviors during the COVID-19
              pandemic. Monthly data collection continued beyond the pandemic
              and was complemented by a two-week quantitative “daily diary”
              (i.e., experience sampling) study in August 2022 to capture
              short-term fluctuations in employee experiences and behaviors.
              There was a 6-month interval between measurement waves in December
              2022 and June 2023 due to a temporary funding gap.
              <br />
              <br />
              The longitudinal dataset comprises data collected at 54
              measurement points and includes variables and constructs related
              to demographic, employment, personality, aging, health and
              well-being, and work characteristics, and were assessed using
              established and validated self-report measures. Many constructs
              were assessed across all measurement waves, while additional
              constructs were iteratively added to address emerging research
              questions.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <h3 className="text-3xl font-medium">Why this dataset matters</h3>
            <p className="leading-relaxed">
              The data are exceptional in the social and behavioral sciences for
              several reasons. First, the study is unique due to the large
              number of measurement points over five years, enabling systematic
              analyses of fluctuations and changes in work characteristics as
              well as employee experiences and behaviors. Second, the study
              followed a large and diverse sample of 2,875 employees, with
              relatively low dropout, supporting robust longitudinal analyses.
              Third, the study began before the COVID-19 pandemic, was conducted
              monthly during the pandemic, and followed participants two years
              after the pandemic. It is therefore one of very few databases that
              allows pre- and post-pandemic comparisons. Fourth, the inclusion
              of a two-week experience sampling study in August 2022 captures
              daily fluctuations in employee experiences and behaviors, which
              can be linked to broader longitudinal changes (i.e., measurement
              burst design).
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <h3 className="text-3xl font-medium">Who this project is for</h3>
            <p className="leading-relaxed">
              The data exploration tool is designed for researchers in
              psychology, public health, business administration and management,
              economics, sociology, and related fields as well as for methods
              teaching and simulation. It helps researchers search the dataset
              for information that fits their research questions and to discover
              data that might lead to the development of novel research
              questions. The data can be used to study topics such as health,
              aging, personality development, organizational behavior, and labor
              market dynamics, as well as for teaching and simulation.
            </p>
          </div>
        </div>

        <div className="col-span-1 flex flex-col gap-6">
          <div className="flex flex-col gap-6 bg-lmp-gray1 p-6">
            <h3 className="text-3xl font-medium">Dataset facts</h3>
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
          <div className="flex flex-col gap-6 bg-lmp-gray1 p-6">
            <h3 className="text-3xl font-medium">Project facts</h3>
            <ul>
              <li>Duration: 2025–2027</li>
              <li>Funding: Volkswagen Foundation</li>
              <li>Data collection completed</li>
              <li>5-year longitudinal survey study</li>
            </ul>
          </div>
          <div className="flex flex-col gap-6 bg-lmp-gray1 p-6">
            <h3 className="text-3xl font-medium">Content coverage</h3>
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
          <div className="flex flex-col gap-6 bg-lmp-gray1 p-6">
            <h3 className="text-3xl font-medium">Exploration tool</h3>
            <p className="leading-[175%]">
              The tool supports structured exploration of metadata, enabling
              researchers to assess the suitability of the dataset for their
              purposes and to download the dataset. It does not provide access
              to raw data or support statistical analysis.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <h3 className="text-3xl font-medium">Project team</h3>
        <div className="flex flex-row gap-4 flex-wrap">
          {TEAM_MEMBERS.map(({ name, imageSrc, description, contact }) => (
            <div
              key={name}
              className="bg-lmp-gray1 p-5 flex flex-col gap-2 flex-1"
            >
              <p className="font-bold">{name}</p>
              <Image
                src={imageSrc}
                alt={name}
                className="w-full h-auto min-w-58.75 object-cover"
                width={235}
                height={235}
              />
              <p className="mt-2">
                {description}
                <br />
                <a href={`mailto:${contact}`} className="underline font-bold">
                  {contact}
                </a>
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <h3 className="text-3xl font-medium">Funding</h3>
        <p className="leading-relaxed">
          This project was funded by{" "}
          <a
            href="https://www.volkswagenstiftung.de/en"
            className="underline font-bold"
            target="_blank"
            rel="noopener noreferrer"
          >
            Volkswagen Foundation
          </a>
          . The funding suppported the preparation, documentation, and
          open-access sharing of the dataset, as well as the development of an
          exploration tool that helps other researchers assess the structure and
          suitability of the data for secondary use.
        </p>
        <Image
          src="/assets/logo-vwstiftung-dark1.png"
          alt="Volkswagen Foundation Logo"
          className="w-66.5 h-auto"
          width={266}
          height={52}
        />
      </div>
    </div>
  );
}
