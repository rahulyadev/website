import type { Route } from "./+types/home";

export const meta: Route.MetaFunction = () => [
  { title: "Portfolio foundation" },
  {
    name: "description",
    content: "The technical foundation for the portfolio.",
  },
  { tagName: "link", rel: "canonical", href: "https://rahuly.in/" },
];

export default function Home() {
  return (
    <section aria-labelledby="home-heading">
      <h1 id="home-heading">Portfolio foundation</h1>
      <p>Verified portfolio content will be added in a later milestone.</p>
    </section>
  );
}
