import MainWindow from "../components/window-layouts/MainWindow";
import { ViewProvider } from "../components/window-layouts/ViewContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewProvider>
      {/* Pass the 'children' prop to MainWindow */}
      <MainWindow>{children}</MainWindow>
    </ViewProvider>
  );
}
