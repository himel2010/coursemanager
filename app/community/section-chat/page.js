import Header from "@/components/shadcn-studio/blocks/hero-section-01/header"

const navigationData = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Dashboard",
    href: "/user-dashboard",
  },
  {
    title: "Admin",
    href: "#",
  },
]

export default function SectionChatPage() {
  return (
    <div>
      <Header navigationData={navigationData} />
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Section Group Chat</h1>
        <p className="text-gray-600 mb-8">Dedicated group chat for each course section to communicate with fellow students.</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-gray-700">Section chat feature is under development. Coming soon...</p>
        </div>
      </div>
    </div>
  )
}
