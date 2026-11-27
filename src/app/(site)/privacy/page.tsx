import { DocumentPage } from "@/components/page/DocumentPage";
import { loadPage, pageMetadata } from "@/components/page/page";

export const generateMetadata = () => pageMetadata("privacy");

export default async function Page() {
  const { page } = await loadPage("privacy");
  return <DocumentPage page={page} sections={page.sections ?? []} />;
}
