export default function CommunitySection() {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Community & Collaboration</h2>
          <p className="text-lg text-gray-600">Stay connected with your peers and faculty</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Section Group Chat */}
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">Section Group Chat</h3>
            <p className="text-gray-600 mb-4">Dedicated group chat for each course section to communicate with fellow students.</p>
            <a href="/community/section-chat" className="text-blue-600 hover:underline font-medium">
              Access Chat →
            </a>
          </div>

          {/* Faculty Email */}
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">✉️</div>
            <h3 className="text-xl font-semibold mb-2">Faculty Communication</h3>
            <p className="text-gray-600 mb-4">Send emails directly to your faculty members from within the app.</p>
            <a href="/community/faculty-email" className="text-blue-600 hover:underline font-medium">
              Send Email →
            </a>
          </div>

          {/* Group Projects */}
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Group Projects</h3>
            <p className="text-gray-600 mb-4">Create shared spaces for collaborative group projects with dedicated inbox.</p>
            <a href="/community/group-projects" className="text-blue-600 hover:underline font-medium">
              Create/Join Project →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
