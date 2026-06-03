export type SeoSection = {
  heading: string;
  paragraphs: readonly string[];
};

export type RelatedLink = {
  label: string;
  href: string;
};

export type ServicePageData = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  keywordFocus: string;
  intro: string;
  secondaryKeywords: readonly string[];
  sections: readonly SeoSection[];
  relatedLinks: readonly RelatedLink[];
  ctaLabel: string;
};

export type BlogPostData = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  keywordFocus: string;
  intro: string;
  sections: readonly SeoSection[];
  relatedLinks: readonly RelatedLink[];
};

export type CaseStudyData = {
  title: string;
  summary: string;
  outcome: string;
  services: readonly RelatedLink[];
};

export const servicePages: readonly ServicePageData[] = [
  {
    slug: "web-app-development",
    title: "Web Application Development Agency",
    seoTitle: "Web Application Development Agency for Startups",
    description:
      "Hylith designs and ships web applications that stay fast, maintainable, and ready for growth from the first release onward.",
    keywordFocus: "web application development agency",
    intro:
      "We build product-focused web applications for founders and teams that need a reliable delivery partner, not just a code vendor. Our approach blends product thinking, interface design, and full stack execution so the application can launch quickly and keep improving without rework.",
    secondaryKeywords: [
      "Next.js development agency",
      "React development company",
      "startup software development",
    ],
    sections: [
      {
        heading: "Built for launch speed and long-term change",
        paragraphs: [
          "A web application has to move from concept to production without turning into a maintenance trap. We shape the architecture, frontend structure, and backend boundaries together so the product can grow in small, predictable steps.",
          "That keeps the codebase approachable for startup teams while still supporting performance, accessibility, and search visibility.",
        ],
      },
      {
        heading: "A full stack process for product teams",
        paragraphs: [
          "We plan around real workflows, real users, and real delivery constraints. That means the same team can handle the interface, the APIs, and the deployment path without handoff friction.",
          "For startups, that usually means fewer coordination delays and a clearer path from wireframe to working software.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Custom software development", href: "/services/custom-software-development" },
      { label: "SaaS development", href: "/services/saas-development" },
      { label: "Contact Hylith", href: "/contact" },
    ],
    ctaLabel: "Talk about web application development",
  },
  {
    slug: "custom-software-development",
    title: "Custom Software Development Company",
    seoTitle: "Custom Software Development Company for Growing Teams",
    description:
      "We design custom software systems for teams that need a better fit than off the shelf tools can provide.",
    keywordFocus: "custom software development company",
    intro:
      "Custom software works best when it is shaped around the actual business problem. We build systems for internal operations, customer portals, and workflow automation so teams can replace manual work with software that feels native to the company.",
    secondaryKeywords: [
      "full stack development agency",
      "backend development services",
      "startup software development",
    ],
    sections: [
      {
        heading: "Software that matches the way the business works",
        paragraphs: [
          "Generic tools often force teams to change their process to fit the product. Custom software lets the process stay intact while the implementation does the heavy lifting behind the scenes.",
          "That is useful when the workflows are complex, the data is sensitive, or the team needs a reliable internal platform that grows with the company.",
        ],
      },
      {
        heading: "Designed for handoff and future expansion",
        paragraphs: [
          "We document the structure clearly and keep the codebase modular so future additions stay manageable. That helps internal teams inherit the project without a painful rewrite cycle.",
          "The result is software that remains practical after launch, not just polished at launch.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Backend development services", href: "/services/backend-development" },
      { label: "API development company", href: "/services/api-development" },
      { label: "Contact Hylith", href: "/contact" },
    ],
    ctaLabel: "Discuss custom software",
  },
  {
    slug: "saas-development",
    title: "SaaS Development Company",
    seoTitle: "SaaS Development Company for Startup Products",
    description:
      "Hylith helps startups plan, build, and launch SaaS products with a stack and delivery process that can support growth.",
    keywordFocus: "SaaS development company",
    intro:
      "SaaS builds need more than a good interface. They need subscriptions, onboarding flows, account management, secure backend services, and a release plan that can survive feedback from real users. We build around those requirements from the beginning.",
    secondaryKeywords: [
      "MVP development services",
      "Next.js development agency",
      "Node.js API development",
    ],
    sections: [
      {
        heading: "Start small, but with the right foundations",
        paragraphs: [
          "A startup SaaS product needs a clear first version, but that version still has to support authentication, data modeling, billing paths, and future feature growth.",
          "We design the product around those constraints so the launch version can mature without being rebuilt from scratch.",
        ],
      },
      {
        heading: "Full stack delivery for founder-led teams",
        paragraphs: [
          "We keep the delivery path tight so founders can move from idea to live product with one team across frontend, backend, and deployment. That keeps the feedback loop short and the launch plan realistic.",
          "It also makes it easier to stay focused on adoption, retention, and iteration once the first customers arrive.",
        ],
      },
    ],
    relatedLinks: [
      { label: "MVP development services", href: "/services/mvp-development" },
      { label: "Backend development services", href: "/services/backend-development" },
      { label: "Contact Hylith", href: "/contact" },
    ],
    ctaLabel: "Plan a SaaS build",
  },
  {
    slug: "mvp-development",
    title: "MVP Development Services",
    seoTitle: "MVP Development Services for Startups",
    description:
      "We help founders turn an idea into a focused MVP that proves the product direction without adding unnecessary build time.",
    keywordFocus: "MVP development services",
    intro:
      "A good MVP is not the smallest possible app. It is the smallest version that can teach the team something useful about the market. We help founders narrow the scope, choose the right tech, and release a product that supports real validation.",
    secondaryKeywords: [
      "startup software development",
      "web application development agency",
      "product engineering partner for startups",
    ],
    sections: [
      {
        heading: "Focus the roadmap on learning",
        paragraphs: [
          "MVP work is at its best when the product exposes the core promise clearly and leaves everything else for later. We help teams define that boundary so the first release stays practical and measurable.",
          "That usually means fewer features, clearer flows, and a stronger sense of what to build next.",
        ],
      },
      {
        heading: "Built to evolve after launch",
        paragraphs: [
          "Even early products should be set up so they can grow into a real platform. We keep the structure clean and the interfaces stable so new experiments do not turn the codebase into a dead end.",
          "That balance matters when the MVP turns into a funded product and the team needs to scale quickly.",
        ],
      },
    ],
    relatedLinks: [
      { label: "SaaS development", href: "/services/saas-development" },
      { label: "Web application development", href: "/services/web-app-development" },
      { label: "Contact Hylith", href: "/contact" },
    ],
    ctaLabel: "Scope an MVP",
  },
  {
    slug: "backend-development",
    title: "Backend Development Services",
    seoTitle: "Backend Development Services for Scalable Products",
    description:
      "Hylith builds backend systems that keep data reliable, APIs clean, and product teams ready for scale.",
    keywordFocus: "backend development services",
    intro:
      "The backend is where product reliability lives. We design backend systems that keep data consistent, support future integrations, and make the product easier to extend as usage grows.",
    secondaryKeywords: [
      "NestJS backend development",
      "Node.js API development",
      "scalable backend development for SaaS startups",
    ],
    sections: [
      {
        heading: "Clear data flow and maintainable services",
        paragraphs: [
          "A good backend does not just work today. It stays understandable as the product grows, which means service boundaries, data access patterns, and integration paths need to be deliberate from the start.",
          "We keep those pieces readable so future work does not depend on guesswork or brittle shortcuts.",
        ],
      },
      {
        heading: "The foundation for product growth",
        paragraphs: [
          "When the backend is organized well, the rest of the product becomes easier to ship. New features, admin tools, and external integrations can land with less risk and less friction.",
          "That is especially valuable for startups that expect the platform to evolve quickly after launch.",
        ],
      },
    ],
    relatedLinks: [
      { label: "API development", href: "/services/api-development" },
      { label: "Custom software development", href: "/services/custom-software-development" },
      { label: "Contact Hylith", href: "/contact" },
    ],
    ctaLabel: "Review backend architecture",
  },
  {
    slug: "api-development",
    title: "API Development Company",
    seoTitle: "API Development Company for Connected Products",
    description:
      "We build APIs that make integrations safer, product data easier to move, and future extensions easier to ship.",
    keywordFocus: "API development company",
    intro:
      "Good APIs make a product easier to connect, automate, and extend. We design APIs with consistency, security, and long-term maintenance in mind so the product can support both internal systems and external integrations.",
    secondaryKeywords: [
      "Node.js API development",
      "backend development services",
      "TypeScript full stack development",
    ],
    sections: [
      {
        heading: "Structured for reliability",
        paragraphs: [
          "An API needs clear contracts, predictable responses, and enough structure to support both frontend clients and third-party systems. That reduces integration risk and helps teams move faster with less rework.",
          "We keep versioning and documentation practical so the API can stay useful once real users depend on it.",
        ],
      },
      {
        heading: "Designed for product and platform use",
        paragraphs: [
          "Whether the API supports a web app, a mobile app, or an internal automation layer, the goal is the same: make the software easier to extend without compromising stability.",
          "That makes the API a product asset instead of a maintenance burden.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Backend development services", href: "/services/backend-development" },
      { label: "SaaS development", href: "/services/saas-development" },
      { label: "Contact Hylith", href: "/contact" },
    ],
    ctaLabel: "Discuss API development",
  },
] as const;

export const blogPosts: readonly BlogPostData[] = [
  {
    slug: "how-to-build-a-saas-application",
    title: "How to Build a SaaS Application",
    seoTitle: "How to Build a SaaS Application in 2026",
    description:
      "A practical SaaS build guide covering product scope, stack choices, backend structure, and launch planning for startup teams.",
    keywordFocus: "how to build a SaaS application",
    intro:
      "Building SaaS is a product decision as much as a technical one. The strongest early teams focus on the problem, scope the first release carefully, and choose an architecture that can survive the next phase of growth.",
    sections: [
      {
        heading: "Start with the problem, not the stack",
        paragraphs: [
          "The best SaaS products solve a painful workflow clearly. Before choosing frameworks or providers, the team should define the user, the job to be done, and the smallest version that proves value.",
        ],
      },
      {
        heading: "Choose a stack that will not slow the team down",
        paragraphs: [
          "Founders often benefit from a stack that keeps frontend and backend work close together, such as Next.js on the front and Node.js or NestJS on the backend. That can reduce context switching and make iteration easier for a small team.",
        ],
      },
      {
        heading: "Keep the launch path short",
        paragraphs: [
          "The first version should make onboarding, authentication, payments, and support flows straightforward. That gives the team enough signal to decide what to improve next without overbuilding the product from day one.",
        ],
      },
    ],
    relatedLinks: [
      { label: "SaaS development services", href: "/services/saas-development" },
      { label: "MVP development services", href: "/services/mvp-development" },
      { label: "Backend development services", href: "/services/backend-development" },
    ],
  },
  {
    slug: "cost-of-building-a-web-app-in-2026",
    title: "Cost of Building a Web App in 2026",
    seoTitle: "Cost of Building a Web App in 2026",
    description:
      "A clear look at the factors that shape web app cost, from scope and stack to design complexity, integrations, and support needs.",
    keywordFocus: "cost of building a web app in 2026",
    intro:
      "The cost of a web app is mostly a reflection of scope, complexity, and team structure. A simple product with a narrow workflow costs far less than a platform that needs multiple user roles, data pipelines, and external integrations.",
    sections: [
      {
        heading: "Scope drives the budget",
        paragraphs: [
          "The more workflows, roles, and edge cases the app needs to support, the more build time it requires. Early scope discipline is the fastest way to keep the project inside a realistic budget.",
        ],
      },
      {
        heading: "Engineering choices matter",
        paragraphs: [
          "A clean stack can reduce delivery cost over time by making the codebase easier to evolve. That is one reason many startups choose a full stack partner instead of stitching together separate vendors.",
        ],
      },
      {
        heading: "Plan for launch and iteration",
        paragraphs: [
          "A useful budget includes the first release and the next round of improvement work. That keeps the team focused on product value instead of treating launch as the end of the project.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Custom software development company", href: "/services/custom-software-development" },
      { label: "Web application development agency", href: "/services/web-app-development" },
      { label: "Contact Hylith", href: "/contact" },
    ],
  },
  {
    slug: "mvp-development-guide-for-startups",
    title: "MVP Development Guide for Startups",
    seoTitle: "MVP Development Guide for Startups",
    description:
      "A startup MVP guide for founders who want to validate the core product idea without overbuilding the first version.",
    keywordFocus: "MVP development guide for startups",
    intro:
      "An MVP should be narrow enough to ship quickly and strong enough to teach the team something real. That balance is easiest when the scope, user flow, and launch metrics are defined together.",
    sections: [
      {
        heading: "Define the single core promise",
        paragraphs: [
          "Every MVP should answer one question clearly: does the product solve the core problem well enough for the target user to keep using it?",
        ],
      },
      {
        heading: "Build only the high-value paths",
        paragraphs: [
          "Login, onboarding, core action, and feedback loops usually matter more than edge-case features. Keeping the release focused makes it easier to learn from real users quickly.",
        ],
      },
      {
        heading: "Leave room for the second version",
        paragraphs: [
          "An MVP is not supposed to be disposable. The right technical structure gives the team a base they can expand after the first round of validation.",
        ],
      },
    ],
    relatedLinks: [
      { label: "MVP development services", href: "/services/mvp-development" },
      { label: "SaaS development company", href: "/services/saas-development" },
      { label: "Contact Hylith", href: "/contact" },
    ],
  },
  {
    slug: "how-to-build-scalable-backend-architecture",
    title: "How to Build Scalable Backend Architecture",
    seoTitle: "How to Build Scalable Backend Architecture",
    description:
      "A backend architecture guide for teams that want reliable APIs, predictable data flow, and a codebase that can scale with the product.",
    keywordFocus: "how to build scalable backend architecture",
    intro:
      "Scalable backend architecture is mostly about discipline. Clear data ownership, predictable service boundaries, and a straightforward deployment path make the product easier to grow without becoming fragile.",
    sections: [
      {
        heading: "Keep boundaries visible",
        paragraphs: [
          "Start with the business domains and decide how data should move between them. That reduces accidental coupling and makes it easier to evolve each part of the system independently.",
        ],
      },
      {
        heading: "Make APIs boring in a good way",
        paragraphs: [
          "The most useful APIs are predictable. Consistent payloads, clear validation, and readable error handling help product teams move faster because the interface is easier to trust.",
        ],
      },
      {
        heading: "Scale with structure, not just infrastructure",
        paragraphs: [
          "Throwing more infrastructure at a poor architecture rarely fixes the underlying issue. Good backend design gives the team a path to scale that does not depend on guesswork.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Backend development services", href: "/services/backend-development" },
      { label: "API development company", href: "/services/api-development" },
      { label: "Contact Hylith", href: "/contact" },
    ],
  },
  {
    slug: "nextjs-vs-react-for-startups",
    title: "Next.js vs React for Startups",
    seoTitle: "Next.js vs React for Startups",
    description:
      "A practical comparison of Next.js and React for startup teams that want a stack aligned with speed, SEO, and maintainability.",
    keywordFocus: "Next.js vs React for startups",
    intro:
      "React is a strong UI library, while Next.js gives startup teams a more opinionated application framework. The right choice depends on how much routing, server rendering, SEO, and deployment structure the product needs.",
    sections: [
      {
        heading: "When React alone can be enough",
        paragraphs: [
          "If the product is mostly an internal app or a highly controlled client-side experience, React can be the right fit. It keeps the front end focused and lets the team assemble the rest of the stack deliberately.",
        ],
      },
      {
        heading: "Why Next.js often wins for startups",
        paragraphs: [
          "For public-facing products, Next.js can simplify routing, server rendering, and page performance. That makes it easier to build a web app that also supports marketing and search visibility well.",
        ],
      },
      {
        heading: "Pick the stack that matches the launch plan",
        paragraphs: [
          "The best choice is the one that matches the product, the team, and the first release timeline. A framework should reduce friction, not add another layer of decisions.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Web application development agency", href: "/services/web-app-development" },
      { label: "SaaS development company", href: "/services/saas-development" },
      { label: "Contact Hylith", href: "/contact" },
    ],
  },
  {
    slug: "monolith-vs-microservices-for-saas",
    title: "Monolith vs Microservices for SaaS",
    seoTitle: "Monolith vs Microservices for SaaS",
    description:
      "A practical guide to choosing between a monolith and microservices when building a SaaS product that needs to grow without becoming fragile.",
    keywordFocus: "monolith vs microservices for SaaS",
    intro:
      "For many SaaS startups, the monolith versus microservices decision is less about ideology and more about delivery speed, team size, and operational overhead. The right answer depends on what the product needs to do now and what the team can realistically support.",
    sections: [
      {
        heading: "Why many startups start with a monolith",
        paragraphs: [
          "A well-structured monolith is often easier to ship, easier to test, and easier to understand in the early stages. That can be a strong fit when the team is still validating the product.",
        ],
      },
      {
        heading: "When microservices become useful",
        paragraphs: [
          "Microservices can make sense when the system has clear bounded domains, independent deployment needs, or a team structure that can support the extra complexity. They are a tool for the right scale, not the default answer.",
        ],
      },
      {
        heading: "Pick the simplest architecture that can still grow",
        paragraphs: [
          "The goal is not to be clever. It is to build a system that stays understandable while the product gets larger and the team becomes more distributed.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Backend development services", href: "/services/backend-development" },
      { label: "SaaS development company", href: "/services/saas-development" },
      { label: "Contact Hylith", href: "/contact" },
    ],
  },
] as const;

export const caseStudies: readonly CaseStudyData[] = [
  {
    title: "Startup SaaS launch foundation",
    summary:
      "A seed-stage team needed a launch-ready SaaS base with clear onboarding, stable backend services, and room for paid plans later.",
    outcome:
      "The product path stayed focused on the first customer journey while leaving the platform open for future expansion.",
    services: [
      { label: "SaaS development", href: "/services/saas-development" },
      { label: "MVP development", href: "/services/mvp-development" },
    ],
  },
  {
    title: "Internal operations platform",
    summary:
      "A growing company wanted to replace several disconnected tools with one custom system that could support daily operations more reliably.",
    outcome:
      "The new workflow reduced manual coordination and gave the team a single place to manage the process.",
    services: [
      { label: "Custom software development", href: "/services/custom-software-development" },
      { label: "Backend development", href: "/services/backend-development" },
    ],
  },
  {
    title: "API-driven product expansion",
    summary:
      "A product team needed stable API foundations so internal tools and external integrations could move on a predictable contract.",
    outcome:
      "The platform became easier to extend without forcing the team into repeated architectural rewrites.",
    services: [
      { label: "API development", href: "/services/api-development" },
      { label: "Web application development", href: "/services/web-app-development" },
    ],
  },
] as const;

export function getServicePage(slug: string) {
  return servicePages.find((page) => page.slug === slug);
}

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
