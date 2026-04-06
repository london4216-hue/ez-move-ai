import InternalGuard from "@/components/InternalGuard";
import Dashboard from "./Dashboard";

export default function SellerExperience() {
  return (
    <InternalGuard allowedRole="seller">
      <Dashboard />
    </InternalGuard>
  );
}