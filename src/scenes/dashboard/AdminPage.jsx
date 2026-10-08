import DashboardOverview from "./DashboardOverview";
import ResourcePage from "./ResourcePage";

export default function AdminPage({ page }) {
  if (page === "dashboard") return <DashboardOverview />;
  return <ResourcePage page={page} />;
}
