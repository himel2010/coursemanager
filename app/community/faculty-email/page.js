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

export default function FacultyEmailPage() {
  return (
    <div>
      <Header navigationData={navigationData} />
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Faculty Communication</h1>
          <p className="text-muted-foreground">Send emails directly to your faculty members from within the app.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Faculty email feature is under development</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">We're building an integrated communication system to connect you with your faculty. This feature will enable you to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
              <li>Send emails directly to course instructors</li>
              <li>Request office hours and consultations</li>
              <li>Submit assignment-related queries</li>
              <li>Track communication history</li>
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
