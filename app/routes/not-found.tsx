import { NotFoundPage } from "../components/not-found-page";
import { buildNotFoundMetadata } from "../seo/metadata";
import type { Route } from "./+types/not-found";

export const meta: Route.MetaFunction = () => buildNotFoundMetadata();

export default function NotFound() {
  return <NotFoundPage />;
}
