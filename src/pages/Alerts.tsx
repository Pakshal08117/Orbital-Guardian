import { Helmet } from "react-helmet-async";
import AlertsPanel from "@/components/dashboard/AlertsPanel";

export default function AlertsPage() {
  return (
    <main className="container py-8">
      <Helmet>
        <title>Alerts – Orbital Guardian</title>
        <meta name="description" content="Monitor real-time high-risk collision alerts in Orbital Guardian." />
        <link rel="canonical" href="/alerts" />
      </Helmet>
      <h1 className="mb-4 text-3xl font-heading">Alerts</h1>
      <div className="max-w-2xl">
        <AlertsPanel />
      </div>
    </main>
  );
}
