import InternalGuard from "@/components/InternalGuard";
import Dashboard from "./Dashboard";

export default function BuyerExperience() {
  return (
    <InternalGuard allowedRole="buyer">
      <Dashboard />
    </InternalGuard>
  );
}