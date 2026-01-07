import Link from "next/link"

export default function SupportSection() {
    return (
        <section id="support" className="bg-white py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <h2 className="text-2xl font-semibold text-gray-900">Support</h2>
                    <p className="mt-2 text-sm text-gray-600 sm:mt-0">Choose a support option below.</p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Link
                        href="/support/personal-monitoring"
                        className="block rounded-lg border border-gray-200 p-6 hover:shadow-sm"
                    >
                        <h3 className="text-lg font-medium text-gray-900">Personal Monitoring</h3>
                        <p className="mt-2 text-sm text-gray-600">Track your progress and receive personalised alerts.</p>
                    </Link>

                    <Link
                        href="/support/consultation-hour"
                        className="block rounded-lg border border-gray-200 p-6 hover:shadow-sm"
                    >
                        <h3 className="text-lg font-medium text-gray-900">Consultation Hour</h3>
                        <p className="mt-2 text-sm text-gray-600">Book a consultation or view available office hours.</p>
                    </Link>
                </div>
            </div>
        </section>
    )
}
