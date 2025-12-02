import Header from "@/components/shadcn-studio/blocks/hero-section-01/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Section Group Chat</h1>
          <p className="text-muted-foreground">Dedicated group chat for each course section to communicate with fellow students.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Section chat feature is under development</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">We're building a robust group chat system for your course sections. This feature will allow you to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
              <li>Connect with classmates in your section</li>
              <li>Share resources and study materials</li>
              <li>Discuss course content in real-time</li>
              <li>Coordinate group study sessions</li>
            </ul>
            <Button asChild variant="outline">
              <a href="/">← Back to Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
