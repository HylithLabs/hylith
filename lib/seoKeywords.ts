export const moneyKeywords = [
  "custom software development company",
  "web application development agency",
  "SaaS development company",
  "MVP development services",
  "full stack development agency",
  "backend development services",
  "API development company",
  "startup software development",
] as const;

export const longTailStartupKeywords = [
  "startup software development partner",
  "web app development agency for startups",
  "MVP development partner for founders",
  "scalable backend development for SaaS startups",
  "product engineering partner for startups",
  "custom software for growing teams",
] as const;

export const technologySpecificKeywords = [
  "Next.js development agency",
  "NestJS backend development",
  "React development company",
  "Node.js API development",
  "TypeScript full stack development",
  "startup web app architecture",
] as const;

export const problemBasedBlogKeywords = [
  "how to build a SaaS application",
  "cost of building a web app in 2026",
  "MVP development guide for startups",
  "how to build scalable backend architecture",
  "Next.js vs React for startups",
  "monolith vs microservices for SaaS",
] as const;

export const keywordGroups = {
  moneyKeywords,
  longTailStartupKeywords,
  technologySpecificKeywords,
  problemBasedBlogKeywords,
} as const;

export function flattenKeywords(
  ...groups: readonly (readonly string[])[]
) {
  const values: string[] = [];

  for (const group of groups) {
    for (const keyword of group) {
      values.push(keyword);
    }
  }

  return Array.from(new Set(values));
}

export const allSeoKeywords = flattenKeywords(
  moneyKeywords,
  longTailStartupKeywords,
  technologySpecificKeywords,
  problemBasedBlogKeywords,
);
