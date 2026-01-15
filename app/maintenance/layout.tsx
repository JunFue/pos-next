import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Site Under Maintenance",
  description: "We are currently performing scheduled maintenance. Please check back soon.",
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout bypasses the root MainWindow layout
  // by providing its own full-screen container
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
