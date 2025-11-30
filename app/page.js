import HeroSection from "@/components/shadcn-studio/blocks/hero-section-01/hero-section-01"
import Header from "@/components/shadcn-studio/blocks/hero-section-01/header"

const navigationData = [
  {
    title: "Dashboard",
    href: "/user-dashboard",
  },
  {
    title: "Admin",
    href: "/admin",
  },
]

const HeroSectionPage = () => {
  return (
    <div className="relative">
      {/* Header Section */}
      <Header navigationData={navigationData} />
      {/* Main Content */}
      <main className="flex flex-col">
        <HeroSection />
      </main>
    </div>
  )
}

export default HeroSectionPage
