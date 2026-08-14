import type { Route } from "./+types/writings";

export const meta: Route.MetaFunction = () => [
  { title: "Writings | Portfolio foundation" },
  {
    name: "description",
    content: "The writing index foundation.",
  },
  {
    tagName: "link",
    rel: "canonical",
    href: "https://rahuly.in/writings",
  },
];

export default function Writings() {
  return (
    <section aria-labelledby="writings-heading">
      <h1 id="writings-heading">Writings</h1>
      <p>Writing content is not part of this foundation milestone.</p>
    </section>
  );
}
