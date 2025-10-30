import Link from "next/link";

// This is the content for the RIGHT window when at /dashboard/settings
export default function SettingsPage() {
  return (
    <div>
      <h1 className="font-bold text-3xl">Settings</h1>
      <p>This is the settings page content.</p>

      <nav className="mt-8">
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </nav>
    </div>
  );
}
