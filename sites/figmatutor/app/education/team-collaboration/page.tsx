import { HomeNavigation } from "@/components/home/HomeNavigation";
import { TeamCollaborationCourse } from "@/components/home/TeamCollaborationCourse";
export { teamCollaborationMetadata as metadata } from "@/components/home/team-collaboration-metadata";

export default function TeamCollaborationPage() {
  return <><HomeNavigation /><main id="main-content"><TeamCollaborationCourse /></main></>;
}
