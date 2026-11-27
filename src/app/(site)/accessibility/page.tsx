import { DocumentPage } from "@/components/page/DocumentPage";
import { loadPage, pageMetadata } from "@/components/page/page";

export const generateMetadata = () => pageMetadata("accessibility");

export default async function Page() {
  const { page } = await loadPage("accessibility");
  return <DocumentPage page={page} sections={page.sections ?? []} />;
}
