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

export default function GroupProjectsPage() {
  return (
    <div>
      <Header navigationData={navigationData} />
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Group Projects</h1>
          <p className="text-muted-foreground">Create shared spaces for collaborative group projects with dedicated inbox for group members.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Group projects feature is under development</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">We're building a comprehensive project collaboration platform. This feature will include:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
              <li>Create and manage group project spaces</li>
              <li>Invite team members to collaborate</li>
              <li>Dedicated inbox for group communications</li>
              <li>File sharing and document management</li>
              <li>Project timeline and milestone tracking</li>
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
