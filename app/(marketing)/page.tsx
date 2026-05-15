import type { Metadata } from "next";
import { HeroSection } from "@/components/marketing/hero";
import { FeaturesSection } from "@/components/marketing/features";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { TestimonialsSection } from "@/components/marketing/testimonials";
import { CtaSection } from "@/components/marketing/cta";

export const metadata: Metadata = {
  title: "Zeal 2 Up — AI-Powered Student Wellness Platform",
  description:
    "AI-powered student counselling, psychological assessment, and behavioural evaluation for colleges and universities.",
  openGraph: {
    title: "Zeal 2 Up — AI-Powered Student Wellness Platform",
    description:
      "AI-powered student counselling and psychological assessment for colleges and universities.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Zeal 2 Up",
            description:
              "AI-powered student counselling, psychological assessment, and behavioural evaluation platform for colleges and universities.",
            applicationCategory: "HealthApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+91-97902-05149",
              email: "zealcatalyst.zeca@gmail.com",
              contactType: "customer support",
            },
          }),
        }}
      />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
