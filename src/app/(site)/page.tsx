import type { Metadata } from "next";
import { Dining } from "@/components/home/Dining";
import { Everyday } from "@/components/home/Everyday";
import { Family, Support } from "@/components/home/Calm";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { Hero } from "@/components/home/Hero";
import { Invitation } from "@/components/home/Invitation";
import { Journey } from "@/components/home/Journey";
import { Outdoors } from "@/components/home/Outdoors";
import { Rooms } from "@/components/home/Rooms";
import type { Chapter } from "@/components/home/types";
import { Welcome } from "@/components/home/Welcome";
import { INQUIRY_HREF } from "@/components/site/links";
import { getAccommodations, getGallery, getHomePage, getInquirySettings, getPage, getSiteSettings } from "@/content";
import "@/components/home/home.css";
import { shareImage } from "@/components/page/page";
import { JsonLd, absolute, orgId } from "@/components/site/JsonLd";

export async function generateMetadata(): Promise<Metadata> {
  const [home, site] = await Promise.all([getHomePage(), getSiteSettings()]);
  const seo = home.seo ?? site.defaultSeo;
  const hero = home.chapters?.find((c) => c.key === "arrival")?.image;
  return {
    title: seo?.title ?? site.name,
    description: seo?.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      siteName: site.name ?? undefined,
      title: seo?.socialTitle ?? seo?.title ?? undefined,
      description: seo?.socialDescription ?? seo?.description ?? undefined,
      images: shareImage(seo?.image, hero),
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function HomePage() {
  const [home, site, inquiry, suites, gallery, ourHome, lifestyle, dining] = await Promise.all([
    getHomePage(), getSiteSettings(), getInquirySettings(), getAccommodations(), getGallery(),
    getPage("our-home"), getPage("lifestyle"), getPage("dining"),
  ]);
  const ch = (key: string): Chapter => home.chapters?.find((c) => c.key === key) ?? {};
  const ohSection = (key: string) => ourHome?.sections?.find((s) => s.key === key);
  const first = (t?: string | null) => (t ?? "").split(/(?<=\.) /)[0];
  const visit = { label: home.cta?.label ?? "Arrange a visit", href: INQUIRY_HREF };
  const commons = ohSection("commons");

  return (
    <>
      <JsonLd data={{
        "@graph": [
          { "@type": "Organization", "@id": orgId(), name: site.name, url: absolute("/"), description: site.description ?? undefined, logo: site.logo?.src ?? undefined },
          { "@type": "WebSite", "@id": absolute("/#website"), name: site.name, url: absolute("/"), publisher: { "@id": orgId() } },
        ],
      }} />
      <Hero
        headline={home.headline ?? ""}
        intro={home.intro ?? ""}
        image={ch("arrival").image}
        primary={visit}
        secondary={{ label: ch("surroundings").cta?.label ?? "Explore our home", href: "#home-journey" }}
      />
      <Welcome chapter={ch("introduction")} />
      <Journey
        scenes={[
          { heading: ch("surroundings").heading ?? "", body: ch("surroundings").body?.[0] ?? "", image: ch("surroundings").image },
          { heading: ch("entrance").heading ?? "", body: ch("entrance").body?.[1] ?? "", image: ch("entrance").image },
          { heading: commons?.heading ?? "", body: first(commons?.body?.[0]), image: commons?.image },
        ]}
        cta={ch("surroundings").cta?.href ? { label: ch("surroundings").cta!.label ?? "", href: ch("surroundings").cta!.href! } : undefined}
      />
      <Rooms
        chapter={ch("spaces")}
        rooms={suites.map((s) => ({ title: s.title ?? "", summary: s.summary ?? "", features: s.features ?? [], image: s.image }))}
        cta={ch("spaces").cta?.href ? { label: ch("spaces").cta!.label ?? "", href: ch("spaces").cta!.href! } : undefined}
        visit={visit}
      />
      <Everyday
        chapter={ch("everyday")}
        images={[ch("everyday").image, ...["interests", "contribute", "rhythm"].map((k) => lifestyle?.sections?.find((s) => s.key === k)?.image)]}
      />
      <Dining chapter={ch("dining")} detail={dining?.sections?.find((s) => s.key === "kitchen")?.image} />
      <Support chapter={ch("support")} />
      <Outdoors chapter={ch("outdoors")} from={ch("outdoors").image} to={ohSection("shore")?.image} />
      <Family chapter={ch("family")} />
      <GalleryPreview chapter={ch("gallery")} images={gallery.filter((g) => g.category !== "accommodations").map((g) => g.images?.at(-1)).filter(Boolean).slice(0, 6)} />
      <Invitation
        chapter={ch("invitation")}
        phone={site.phone}
        steps={inquiry.nextSteps ?? []}
        settings={{ heading: inquiry.heading ?? "", intro: inquiry.intro ?? "", successMessage: inquiry.successMessage ?? "", errorMessage: inquiry.errorMessage ?? "", interestOptions: inquiry.interestOptions ?? [] }}
      />
    </>
  );
}
