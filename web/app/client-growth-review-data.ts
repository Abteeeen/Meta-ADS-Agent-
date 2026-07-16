export type GrowthReviewSeed = {
  companyName: string;
  offer: string;
  primaryLocations: string[];
  primaryOutcome: string;
  audience: string;
  crm: string;
  followUp: string;
};

export type GrowthReview = ReturnType<typeof buildGrowthReview>;

export function buildGrowthReview(seed: GrowthReviewSeed) {
  return {
    ...seed,
    headline: `Turn enquiries into ${seed.primaryOutcome.toLowerCase()}.`,
    diagnosis: [
      { label: "Known direction", title: "Lead quality is the commercial constraint", detail: `The objective is ${seed.primaryOutcome.toLowerCase()}, not the highest possible volume of form submissions.` },
      { label: "Working hypothesis", title: "Location and readiness need to be visible earlier", detail: `Separate ${seed.primaryLocations.join(" and ")} routes and clarify course, location and next-step expectations before a person becomes a lead.` },
      { label: "Verification required", title: "Outcomes must return from the sales process", detail: `Connect ${seed.crm} after client authorisation so the team can compare enquiry, eligible lead, enrolment and paid outcomes.` },
    ],
    campaigns: seed.primaryLocations.map((location) => ({
      name: `${location} qualification test`,
      location,
      objective: "Lead generation",
      status: "Draft only",
      route: "High-intent form or approved message flow",
      guardrail: "No publishing, budget or audience change without named approval",
    })),
    questions: [
      "Which training location works best for you?",
      "Which upcoming course date are you interested in?",
      "Are you looking to begin security training in the next 30 days?",
      "What is the best phone number and preferred time for our team to contact you?",
    ],
    proofNeeded: [
      "Confirmed Brisbane and Gold Coast dates, capacity and enrolment cut-offs",
      "Approved course, funding, licence and employment wording",
      "Student testimonials or trainer proof with release approval",
      "A named HubSpot owner and agreed eligible-lead definition",
    ],
    measurement: [
      ["Enquiry", "Submitted a form or started an approved message route"],
      ["Eligible lead", "Matches the approved location, timing and course criteria"],
      ["Contacted", "Phone/SMS action recorded within the agreed service level"],
      ["Enrolment started", "Completed the next meaningful sales/enrolment step"],
      ["Paid student", "Commercial outcome confirmed in the CRM"],
    ],
  };
}

export const fiveStarGrowthReview = buildGrowthReview({
  companyName: "Five Star Training Academy",
  offer: "CPP20218 Certificate II in Security Operations",
  primaryLocations: ["Brisbane (Boondall)", "Gold Coast (Nerang)"],
  primaryOutcome: "eligible leads and paid students",
  audience: "Adults exploring entry-level security work, career change or recognised security training in Brisbane and the Gold Coast.",
  crm: "HubSpot",
  followUp: "Phone and SMS follow-up within one business day.",
});
