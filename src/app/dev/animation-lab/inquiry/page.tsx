import Image from "next/image";
import { getHomePage, getInquirySettings } from "@/content";
import { photo } from "@/content/photos";
import { Inquiry } from "@/components/inquiry/Inquiry";
import { devOnly } from "../dev-only";

export default async function InquiryPage() {
  devOnly();
  const [settings, home] = await Promise.all([getInquirySettings(), getHomePage()]);
  const invitation = home.chapters?.find((c) => c.key === "invitation");
  const p = photo("outdoors-chairs-dock");
  return (
    <main className="relative min-h-[calc(100svh-3.5rem)]">
      <div className="stage absolute inset-0">
        <Image src={p.src} alt={p.alt} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: `${p.focal.x * 100}% ${p.focal.y * 100}%` }} />
      </div>
      <div className="relative px-4 py-10 sm:px-8 lg:px-12 lg:py-16">
        <div className="iq-intro surface-dark max-w-[40rem] bg-midnight p-6 text-white sm:p-10">
          <h1 className="text-h1 font-semibold">{invitation?.heading}</h1>
          <p className="mt-5 text-lead text-lavender">{invitation?.body?.[0]}</p>
        </div>
        <div className="mt-6">
          <Inquiry settings={{ heading: settings.heading ?? "", intro: settings.intro ?? "", successMessage: settings.successMessage ?? "", errorMessage: settings.errorMessage ?? "", interestOptions: settings.interestOptions ?? [] }} />
        </div>
      </div>
    </main>
  );
}
