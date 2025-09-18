import { Helmet } from "react-helmet-async";
import ConjunctionTable from "@/components/dashboard/ConjunctionTable";

export default function ConjunctionsPage() {
  return (
    <main className="container py-8">
      <Helmet>
        <title>Conjunctions – Orbital Guardian</title>
        <meta name="description" content="Review upcoming conjunctions, miss distances, and risk scores." />
        <link rel="canonical" href="/conjunctions" />
      </Helmet>
      <h1 className="mb-4 text-3xl font-heading">Conjunctions</h1>
      <ConjunctionTable />
    </main>
  );
}
