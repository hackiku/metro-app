// src/app/destinations/data.ts

export interface RecommendedDestination {
  id: string;
  title: string;
  matchPercentage: number;
  description: string;
  keySkills: string[];
  theme: 'product' | 'scientist' | 'advisor' | 'default'; // To control colors
}

const destinationThemes = {
  product: {
    border: "border-green-500",
    gradientFrom: "from-green-500/10",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
  },
  scientist: {
    border: "border-purple-500",
    gradientFrom: "from-purple-500/10",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  advisor: {
    border: "border-yellow-500", // Or orange-500
    gradientFrom: "from-yellow-500/10",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
  default: {
    border: "border-neutral-500",
    gradientFrom: "from-neutral-500/10",
    iconBg: "bg-neutral-100 dark:bg-neutral-900/30",
    iconColor: "text-neutral-600 dark:text-neutral-400",
  }
};

export const getDestinationTheme = (themeName: RecommendedDestination['theme']) => {
  return destinationThemes[themeName] || destinationThemes.default;
}

export const recommendedDestinationsData: RecommendedDestination[] = [
  {
    id: 'dest-001',
    title: 'Product Analyst',
    matchPercentage: 85,
    description: 'Provide data-driven insights to guide product development and optimization',
    keySkills: ['A/B Testing', 'Product Metrics', 'User Behavior Analysis', 'Agile/Scrum', 'Stakeholder Management'],
    theme: 'product',
  },
  {
    id: 'dest-002',
    title: 'Data Scientist',
    matchPercentage: 72,
    description: 'Apply advanced analytics, statistical methods and machine learning to solve complex problems',
    keySkills: ['Python/R', 'Machine Learning', 'Statistical Modeling', 'Data Mining', 'Predictive Analytics'],
    theme: 'scientist',
  },
  {
    id: 'dest-003',
    title: 'Category Advisor',
    matchPercentage: 67,
    description: 'Provide expert advice on specific business domains based on data insights',
    keySkills: ['Domain Expertise', 'Business Strategy', 'Trend Analysis', 'Competitive Analysis', 'Executive Communication'],
    theme: 'advisor',
  },
];