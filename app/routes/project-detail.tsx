import { NotFoundPage } from "../components/not-found-page";
import type { Route } from "./+types/project-detail";

export const meta: Route.MetaFunction = () => [
  { title: "Page not found | Portfolio foundation" },
  { name: "robots", content: "noindex" },
];

export default function ProjectDetail() {
  return <NotFoundPage />;
}
