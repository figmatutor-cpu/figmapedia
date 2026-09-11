import { educationTitle, educationDescription, educationFaqs } from "./education-content";

const siteUrl = "https://figmatutor.info/";

export function EducationStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}#organization`,
        name: "Highstand",
        url: siteUrl,
        email: "yiseo@figmatutor.info",
        founder: { "@id": `${siteUrl}#instructor` },
      },
      {
        "@type": "Person",
        "@id": `${siteUrl}#instructor`,
        name: "하이서",
        alternateName: "피그마튜터",
        url: siteUrl,
        worksFor: { "@id": `${siteUrl}#organization` },
        sameAs: ["https://www.instagram.com/figma_tutor", "https://www.youtube.com/@figma_tutor", "https://www.linkedin.com/in/figmatutor"],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        name: "Highstand · 피그마튜터 하이서",
        url: siteUrl,
        description: educationDescription,
        inLanguage: "ko",
        publisher: { "@id": `${siteUrl}#organization` },
      },
      {
        "@type": "Service",
        "@id": `${siteUrl}#education`,
        name: educationTitle,
        description: educationDescription,
        serviceType: "기업 맞춤 AI 교육·컨설팅",
        provider: { "@id": `${siteUrl}#organization` },
        url: `${siteUrl}#programs`,
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}#faq`,
        url: siteUrl,
        inLanguage: "ko",
        isPartOf: { "@id": `${siteUrl}#website` },
        about: { "@id": `${siteUrl}#education` },
        mainEntity: educationFaqs.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
