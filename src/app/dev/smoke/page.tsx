import { notFound } from "next/navigation";
import { getSiteSettings } from "@/content";

// Development-only foundation check. Not part of the site design.
export default async function SmokePage() {
  if (process.env.NODE_ENV === "production") notFound();
  const site = await getSiteSettings();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">{site.name}</h1>
      <p data-testid="smoke">Foundation OK · content source: {site.phone}</p>
    </main>
  );
}
