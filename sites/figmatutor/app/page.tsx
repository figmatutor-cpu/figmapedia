import { HomeNavigation } from "@/components/home/HomeNavigation";
import { WorkflowHome } from "@/components/home/WorkflowHome";

export default function HomePage() {
  return (
    <>
      <HomeNavigation />
      <main id="main-content"><WorkflowHome /></main>
    </>
  );
}
