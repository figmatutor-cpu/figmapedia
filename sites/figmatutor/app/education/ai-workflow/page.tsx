import { HomeNavigation } from "@/components/home/HomeNavigation";
import { AiWorkflowCourse } from "@/components/home/AiWorkflowCourse";
export { aiWorkflowMetadata as metadata } from "@/components/home/ai-workflow-metadata";

export default function AiWorkflowPage() {
  return <><HomeNavigation /><main id="main-content"><AiWorkflowCourse /></main></>;
}
