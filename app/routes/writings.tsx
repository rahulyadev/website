import { Link } from "react-router";

import { loadWritingsPageData } from "../content/writings-route-data.server";
import { JsonLd } from "../seo/json-ld";
import { buildPageMetadata } from "../seo/metadata";
import { writingsCollectionStructuredData } from "../seo/structured-data";
import type { Route } from "./+types/writings";

const introduction =
  "Notes on backend systems, application modernization, testing, and the engineering decisions behind maintainable software.";
const emptyState =
  "No writing has been approved for publication yet. The first article will appear here after editorial and confidentiality review.";

function formatWritingDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export async function loader() {
  return loadWritingsPageData();
}

export const meta: Route.MetaFunction = ({ loaderData }) =>
  buildPageMetadata({
    canonicalOrigin: loaderData.canonicalOrigin,
    seo: loaderData.seo,
    openGraphType: "website",
    discoverFeed: true,
  });

export default function Writings({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <JsonLd data={writingsCollectionStructuredData(loaderData)} />
      <section aria-labelledby="writings-heading" className="writings-page">
        <header className="writings-page__header">
          <p className="writings-page__eyebrow">ENGINEERING NOTES</p>
          <h1 id="writings-heading">Writings</h1>
          <p className="writings-page__introduction">{introduction}</p>
        </header>

        {loaderData.items.length === 0 ? (
          <p className="writings-page__empty">{emptyState}</p>
        ) : (
          <ol
            aria-label="Published writings in reverse chronological order"
            className="writings-list"
          >
            {loaderData.items.map((writing) => (
              <li className="writing-row" key={writing.slug}>
                <article className="writing-row__body">
                  <time
                    className="writing-row__date"
                    dateTime={writing.publishedOn}
                  >
                    {formatWritingDate(writing.publishedOn)}
                  </time>
                  <h2>
                    <Link to={`/writings/${writing.slug}`}>
                      {writing.title}
                    </Link>
                  </h2>
                  <p className="writing-row__summary">{writing.summary}</p>
                  <div className="writing-row__meta">
                    <span>{writing.readingTimeMinutes} min read</span>
                    <ul aria-label={`Tags for ${writing.title}`}>
                      {writing.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
