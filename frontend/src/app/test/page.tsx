/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

export default function TestPage() {
  const [data, setData] = useState<any>(null);
  const [errors, setErrors] = useState<any>(null);

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ studies { study_name title doi } }" }),
    })
      .then((res) => res.json())
      .then(({ data, errors }) => {
        setData(data);
        setErrors(errors);
      });
  }, []);

  if (errors) {
    return (
      <pre style={{ color: "red" }}>{JSON.stringify(errors, null, 2)}</pre>
    );
  }

  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <h1 className="mb-3">GraphQL Query Test</h1>
      <ul>
        {data.studies.map((study: any) => (
          <li key={study.study_name}>
            {study.study_name} - {study.title} - {study.doi}
          </li>
        ))}
      </ul>
    </div>
  );
}
