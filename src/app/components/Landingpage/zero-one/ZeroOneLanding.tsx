import { AboutSection } from "./AboutSection";
import { ApplySection } from "./ApplySection";
import { FAQSection } from "./FAQSection";
import { HeroSection } from "./HeroSection";
import { InfrastructureSection } from "./InfrastructureSection";
import { LandingFooter } from "./LandingFooter";
import { LandingNav } from "./LandingNav";
import { LogisticsBanner } from "./LogisticsBanner";
import { OrganizersSection } from "./OrganizersSection";
import { PartnerCTASection } from "./PartnerCTASection";
import { PartnersSection } from "./PartnersSection";
import { PeopleSection } from "./PeopleSection";
import { ProgrammeSection } from "./ProgrammeSection";
import { TracksSection } from "./TracksSection";

export function ZeroOneLanding() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#0055FF]/30 selection:text-white">
      <LandingNav />
      <main className="pt-16">
        <LogisticsBanner />
        <HeroSection />
        <AboutSection />
        <ProgrammeSection />
        <ApplySection />
        <TracksSection />
        <PeopleSection />
        <InfrastructureSection />
        <PartnersSection />
        <PartnerCTASection />
        <OrganizersSection />
        <FAQSection />
        <LandingFooter />
      </main>
    </div>
  );
}
