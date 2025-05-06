// src/app/conversation/_data/index.ts
import { type User } from "~/contexts/UserContext"; // Assuming you have this
import { type careerRoutePlanData } from "~/app/route/data"; // To pull plan overview

// Simulating a user and their target role for context
// In a real app, this would come from UserContext or API
export const mockUser = {
  currentRole: "Junior Data Analyst",
  targetRole: "Product Analyst",
  currentResponsibilities: "Data analysis, reporting, dashboard creation",
  currentStrengths: "SQL, data visualization, analytical thinking",
  notableAchievements: "Streamlined reporting process, created KPI dashboard",
  reasonsForInterestInTarget: [
    "Desire to have more direct impact on product decisions",
    "Interest in understanding user behavior and needs",
    "Opportunity to combine analytical skills with strategic thinking",
    "Alignment with company's focus on product-led growth",
  ],
  // This would ideally be linked to the user's actual plan
  developmentPlanOverview: { 
    phases: [
        { name: "Cross-team collaboration", duration: "3 months"},
        { name: "Product metrics & roadmap", duration: "4 months"},
        { name: "Product tools & agile workflows", duration: "2 months"},
        { name: "Feature ownership", duration: "3 months"},
    ],
    keySkillsToDevelop: [
        "Product thinking and user-centric approach",
        "A/B testing methodologies",
        "Agile workflow and tools",
        "Stakeholder management",
    ]
  },
  supportRequestedManager: [
    "Opportunities to shadow/work with product team",
    "Regular feedback on progress (quarterly)",
    "Support for training budget for courses",
  ],
  supportRequestedOrg: [
    "Access to product management resources",
    "Participation in relevant projects",
    "Mentorship from an experienced Product Analyst",
  ]
};


export const preparationSections = [
  {
    id: 'org-goals',
    title: 'Link to organizational goals',
    number: 1,
    description: 'Connect your desired career move to company objectives and team goals.',
    checklist: [
      'Research company strategic priorities',
      'Identify how your target role supports those priorities',
      'Prepare specific examples of how this move benefits the organization',
    ],
    userNotesPlaceholder: "My notes on linking my aspiration to company goals..."
  },
  {
    id: 'evidence-potential',
    title: 'Evidence your potential',
    number: 2,
    description: 'Show proof that you have the foundation to succeed in the new role.',
    checklist: [
      'Highlight relevant achievements in your current role',
      'Discuss transferable skills you already possess',
      'Share examples of similar challenges you’ve overcome',
    ],
    userNotesPlaceholder: "Examples of my potential and achievements..."
  },
  {
    id: 'dev-commitments',
    title: 'Development commitments',
    number: 3,
    description: 'Show that you have a plan to address skill gaps.',
    checklist: [
      'Present your growth plan with clear milestones',
      'Specify what support you need from your manager',
      'Suggest how progress can be measured and reviewed',
    ],
    userNotesPlaceholder: "My development plan and support needs..."
  },
];

export const talkingPointsSections = [
  {
    id: 'opening',
    title: 'Opening',
    estimatedTime: '2-3 minutes',
    description: 'Express appreciation for the time and frame the conversation.',
    scriptTemplate: "I've been thinking about my growth path at the company, and I've done some research on how I can contribute even more effectively. I'd like to share my thoughts and get your input.",
    userNotesPlaceholder: "My personalized opening..."
  },
  {
    id: 'current-assessment',
    title: 'Current Assessment',
    estimatedTime: '3-4 minutes', 
    description: 'Briefly summarize your current role, accomplishments, and strengths.',
    scriptTemplate: "In my role as [Current Role], I've been able to [specific accomplishment]. I believe my strengths in [specific skills] have contributed to [specific team outcome].",
    userNotesPlaceholder: "My summary of current role & strengths..."
  },
  {
    id: 'growth-direction',
    title: 'Growth Direction',
    estimatedTime: '4-5 minutes', 
    description: "Present your target role and why you believe it's a good fit.",
    scriptTemplate: "I'm interested in moving toward a [Target Role] because [reasons]. This aligns with my interests in [specific interests] and the company's focus on [specific company goals].",
    userNotesPlaceholder: "Why I want this target role..."
  },
  {
    id: 'dev-plan',
    title: 'Development Plan',
    estimatedTime: '5-6 minutes',
    description: 'Share your growth plan with specific actions and timeline.',
    scriptTemplate: "I've created a detailed plan to develop the necessary skills over the next [Timeframe, e.g., 12-18 months]. The plan includes [key elements of plan]. My first steps would be [specific first actions].",
    userNotesPlaceholder: "My development plan outline..."
  },
  // Add more sections like "Request for Support," "Next Steps," "Closing"
];

export const countChecklistItems = (section: any): number => {
    return section.checklist?.length || 0;
}


export const confidenceCheckItems = [
    { id: 'cc1', text: "I've identified clear links to company goals." },
    { id: 'cc2', text: "I have specific examples of my achievements." },
    { id: 'cc3', text: "I've thought about the support I need." },
    { id: 'cc4', text: "I'm ready to articulate my development plan." },
];