import { ThemeChange } from "@/components/ThemeChange";
import SignOutButton from "../components/SignOutButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-5">
      <h1 className="text-4xl font-bold mb-8">Course Manager</h1>
      <p className="text-xl">Setup Complete! 🎉</p>
      <a
        href="/api/test"
        className="mt-4 text-blue-500 hover:underline"
        target="_blank"
      >
        Test Database Connection
      </a>
      <ThemeChange />
      <SignOutButton />
    </main>
  );
}
