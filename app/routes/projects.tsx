import type { Route } from "./+types/projects";

export const meta: Route.MetaFunction = () => [
  { title: "Projects | Portfolio foundation" },
  {
    name: "description",
    content: "The project index foundation.",
  },
  {
    tagName: "link",
    rel: "canonical",
    href: "https://rahuly.in/projects",
  },
];

export default function Projects() {
  return (
    <section aria-labelledby="projects-heading">
      <h1 id="projects-heading">Projects</h1>
      <p>Project content is not part of this foundation milestone.</p>
    </section>
  );
}
