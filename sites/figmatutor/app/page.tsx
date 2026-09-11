import { HomeNavigation } from "@/components/home/HomeNavigation";
import { WorkflowHome } from "@/components/home/WorkflowHome";
import { EducationStructuredData } from "@/components/home/EducationStructuredData";

export default function HomePage() {
  return (
    <>
      <EducationStructuredData />
      <HomeNavigation />
      <main id="main-content"><WorkflowHome /></main>
    </>
  );
}
