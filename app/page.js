import HeroSection from "@/components/shadcn-studio/blocks/hero-section-01/hero-section-01"
import Header from "@/components/shadcn-studio/blocks/hero-section-01/header"
import CommunitySection from "@/components/shadcn-studio/blocks/community-section/community-section"

const navigationData = [
  {
    title: "Dashboard",
    href: "/user-dashboard",
  },
  {
    title: "Thesis Groups",
    href: "/thesis-groups",
  },
  {
    title: "Opportunities",
    href: "/opportunities",
  },
  {
    title: "Community",
    href: "#community",
  },
  {
    title: "Admin",
    href: "/admin",
  },
]

const HeroSectionPage = async () => {
  return (
    <div className="relative">
      {/* Header Section */}
      <Header />
      {/* Main Content */}
      <main className="flex flex-col">
        <HeroSection />
        {/* Quick links */}
        <section className="py-6 flex justify-center gap-4">
          <a
            href="/cgp"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            CGP Calculator
          </a>
          <a
            href="/evaluate"
            className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Evaluate
          </a>
        </section>
        <section id="community">
          <CommunitySection />
        </section>
      </main>
    </div>
  )
}

export default HeroSectionPage
