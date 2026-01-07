import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function CommunitySection() {
  return (
    <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Community & Collaboration
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Stay connected with your peers and faculty
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
          {/* Community Channels */}
          <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-4">💬</div>
              <CardTitle>Community Channels</CardTitle>
              <CardDescription>Dedicated communication space</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <p className="text-sm text-muted-foreground mb-6">
                Create and manage dedicated channels for your course sections to
                communicate with fellow students.
              </p>
              <Button asChild variant="default" className="w-full">
                <a href="/community/channels">Access Channels →</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-4">🆘</div>
              <CardTitle>Help</CardTitle>
              <CardDescription>
                Post course-specific problems you face and get help from peers.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <p className="text-sm text-muted-foreground mb-6"></p>
              <Button asChild variant="default" className="w-full">
                <a href="/user/help">Help →</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
