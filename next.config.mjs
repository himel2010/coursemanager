/** @type {import('next').NextConfig} */
const nextConfig = {
	async rewrites() {
		return [
			// Legacy quiz generator paths
			{ source: '/api/quiz-generate', destination: '/api/quiz' },
			{ source: '/api/quiz-generate/:path*', destination: '/api/quiz/:path*' },
			// Old nested route variant
			{ source: '/api/quizzes/generate', destination: '/api/quiz' },
		];
	},
};

export default nextConfig;
