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

export default function FacultyEmailPage() {
  return (
    <div>
      <Header navigationData={navigationData} />
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Faculty Communication</h1>
        <p className="text-gray-600 mb-8">Send emails directly to your faculty members from within the app.</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-gray-700">Faculty email feature is under development. Coming soon...</p>
        </div>
      </div>
    </div>
  )
}
