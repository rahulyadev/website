import { data, Link } from "react-router";

import { NotFoundPage } from "../components/not-found-page";
import { ArticleContent } from "../components/writings/article-content";
import { ArticleTableOfContents } from "../components/writings/article-table-of-contents";
import { loadWritingDetailPageData } from "../content/writings-route-data.server";
import { JsonLd } from "../seo/json-ld";
import { buildNotFoundMetadata, buildPageMetadata } from "../seo/metadata";
import {
  articleBreadcrumbStructuredData,
  articleStructuredData,
} from "../seo/structured-data";
import type { Route } from "./+types/writing-detail";

function formatWritingDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export async function loader({
  params,
}: {
  readonly params: { readonly slug?: string | undefined };
}) {
  const lookup = await loadWritingDetailPageData(params.slug ?? "");
  return lookup.kind === "not-found" ? data(lookup, { status: 404 }) : lookup;
}

export async function clientLoader({
  params,
  serverLoader,
}: Route.ClientLoaderArgs) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(params.slug)) {
    return { kind: "not-found" as const, requestedSlug: params.slug };
  }

  try {
    return await serverLoader();
  } catch {
    return { kind: "not-found" as const, requestedSlug: params.slug };
  }
}

function writingMeta(
  loaderData: Route.MetaArgs["loaderData"] | undefined,
): ReturnType<Route.MetaFunction> {
  if (loaderData === undefined || loaderData.kind === "not-found") {
    return buildNotFoundMetadata();
  }

  const { canonicalOrigin, writing } = loaderData.data;
  return buildPageMetadata({
    canonicalOrigin,
    seo: writing.seo,
    openGraphType: "article",
    discoverFeed: true,
    article: {
      publishedOn: writing.publishedOn,
      ...(writing.updatedOn === undefined
        ? {}
        : { updatedOn: writing.updatedOn }),
      tags: writing.tags,
    },
  });
}

export const meta: Route.MetaFunction = ({ loaderData }) =>
  writingMeta(loaderData);

function WritingNavigation({
  pageData,
}: {
  readonly pageData: Extract<
    Route.ComponentProps["loaderData"],
    { readonly kind: "found" }
  >["data"];
}) {
  return (
    <nav aria-label="More writings" className="writing-detail__navigation">
      <div className="writing-detail__siblings">
        {pageData.newerWriting === undefined ? (
          <span />
        ) : (
          <Link to={pageData.newerWriting.path}>
            <span>← Newer writing</span>
            <strong>{pageData.newerWriting.title}</strong>
          </Link>
        )}
        {pageData.olderWriting === undefined ? (
          <span />
        ) : (
          <Link to={pageData.olderWriting.path}>
            <span>Older writing →</span>
            <strong>{pageData.olderWriting.title}</strong>
          </Link>
        )}
      </div>
      <Link className="writing-detail__all-link" to="/writings">
        Back to writings
      </Link>
    </nav>
  );
}

export default function WritingDetail({ loaderData }: Route.ComponentProps) {
  if (loaderData.kind === "not-found") {
    return <NotFoundPage />;
  }

  const pageData = loaderData.data;
  const { writing } = pageData;
  const showTableOfContents = writing.article.tableOfContents.length >= 3;

  return (
    <>
      <JsonLd data={articleStructuredData(pageData)} />
      <JsonLd data={articleBreadcrumbStructuredData(pageData)} />
      <article className="writing-detail">
        <nav aria-label="Breadcrumb" className="writing-breadcrumbs">
          <ol>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/writings">Writings</Link>
            </li>
            <li aria-current="page">{writing.title}</li>
          </ol>
        </nav>

        <header className="writing-detail__header">
          <p className="writing-detail__eyebrow">ENGINEERING NOTE</p>
          <h1>{writing.title}</h1>
          <p className="writing-detail__summary">{writing.summary}</p>
          <div className="writing-detail__byline">By Rahul Yadav</div>
          <dl className="writing-detail__metadata">
            <div>
              <dt>Published</dt>
              <dd>
                <time dateTime={writing.publishedOn}>
                  {formatWritingDate(writing.publishedOn)}
                </time>
              </dd>
            </div>
            {writing.updatedOn === undefined ? null : (
              <div>
                <dt>Updated</dt>
                <dd>
                  <time dateTime={writing.updatedOn}>
                    {formatWritingDate(writing.updatedOn)}
                  </time>
                </dd>
              </div>
            )}
            <div>
              <dt>Reading time</dt>
              <dd>{writing.readingTimeMinutes} minutes</dd>
            </div>
          </dl>
          <ul aria-label="Article tags" className="writing-tags">
            {writing.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </header>

        {showTableOfContents ? (
          <ArticleTableOfContents items={writing.article.tableOfContents} />
        ) : null}

        <ArticleContent blocks={writing.article.blocks} />

        {pageData.relatedWritings.length === 0 ? null : (
          <aside
            aria-labelledby="related-writings-heading"
            className="related-writings"
          >
            <h2 id="related-writings-heading">Related writings</h2>
            <ul>
              {pageData.relatedWritings.map((related) => (
                <li key={related.path}>
                  <Link to={related.path}>{related.title}</Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <WritingNavigation pageData={pageData} />
      </article>
    </>
  );
}
