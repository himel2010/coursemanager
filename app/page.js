import HeroSection from "@/components/shadcn-studio/blocks/hero-section-01/hero-section-01"
import Header from "@/components/shadcn-studio/blocks/hero-section-01/header"
import CommunitySection from "@/components/shadcn-studio/blocks/community-section/community-section"



const HeroSectionPage = async () => {
  return (
    <div className="relative">
      {/* Header Section */}
      <Header />
      {/* Main Content */}
      <main className="flex flex-col">
        <HeroSection />
        <section id="community">
          <CommunitySection />
        </section>
      </main>
    </div>
  )
}

export default HeroSectionPage
