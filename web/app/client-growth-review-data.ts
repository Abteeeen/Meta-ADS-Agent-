export type GrowthReviewSeed = {
  companyName: string;
  offer: string;
  primaryLocations: string[];
  primaryOutcome: string;
  audience: string;
  crm: string;
  followUp: string;
  campaignObjective: string;
  leadRoute: string;
  qualificationIntro: string;
  questions: string[];
  proofNeeded: string[];
  measurement: Array<[string, string]>;
  locationHypothesis: string;
  outcomeHypothesis: string;
  salesOutcome: string;
};

export type GrowthReview = ReturnType<typeof buildGrowthReview>;

export function buildGrowthReview(seed: GrowthReviewSeed) {
  return {
    ...seed,
    headline: `Turn enquiries into ${seed.primaryOutcome.toLowerCase()}.`,
    diagnosis: [
      { label: "Known direction", title: "Lead quality is the commercial constraint", detail: `The objective is ${seed.primaryOutcome.toLowerCase()}, not the highest possible volume of enquiries.` },
      { label: "Working hypothesis", title: "Location and readiness need to be visible earlier", detail: seed.locationHypothesis },
      { label: "Verification required", title: "Outcomes must return from the sales process", detail: seed.outcomeHypothesis },
    ],
    campaigns: seed.primaryLocations.map((location) => ({
      name: `${location} qualification test`,
      location,
      objective: seed.campaignObjective,
      status: "Draft only",
      route: seed.leadRoute,
      guardrail: "No publishing, budget or audience change without named approval",
    })),
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
  campaignObjective: "Lead generation",
  leadRoute: "High-intent form or approved message flow",
  qualificationIntro: "Show course, location and realistic next step.",
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
  locationHypothesis: "Separate Brisbane and Gold Coast routes and clarify course, location and next-step expectations before a person becomes a lead.",
  outcomeHypothesis: "Connect HubSpot after client authorisation so the team can compare enquiry, eligible lead, enrolment and paid outcomes.",
  salesOutcome: "enrolment and paid-student outcomes",
});

export const ecoCleanGrowthReview = buildGrowthReview({
  companyName: "Eco Clean Enterprises",
  offer: "Engine decarbonisation and automotive engine-care service",
  primaryLocations: ["Irinjalakuda", "Nearby service radius"],
  primaryOutcome: "qualified WhatsApp enquiries and booked service jobs",
  audience: "Local petrol and diesel vehicle owners experiencing concerns such as rough running, smoke, reduced pickup or a mileage concern. Final audience wording requires client validation.",
  crm: "the agreed booking and job-outcome record",
  followUp: "WhatsApp or phone response by the named workshop owner within the client-approved service level.",
  campaignObjective: "Messages / booking enquiries",
  leadRoute: "Approved click-to-WhatsApp or call route",
  qualificationIntro: "Show the workshop, the vehicle problem context and a clear booking next step.",
  questions: [
    "What is your vehicle make, model and fuel type?",
    "What issue are you noticing: smoke, rough running, pickup, mileage or something else?",
    "Which area are you travelling from?",
    "What is your preferred day and time for a workshop call or visit?",
  ],
  proofNeeded: [
    "Client-approved service description, typical price or pricing approach and estimated turnaround",
    "Evidence supporting any mileage, engine-life, emission or performance claim",
    "Three approved customer jobs with consent, vehicle plates blurred and outcomes documented",
    "One confirmed WhatsApp or phone owner, booking process and paid-job record",
  ],
  measurement: [
    ["Message or call", "Started an approved WhatsApp or call route"],
    ["Qualified enquiry", "Vehicle, concern, location and booking intent recorded"],
    ["Booked job", "Workshop appointment confirmed"],
    ["Arrived job", "Customer attended the workshop"],
    ["Paid service", "Paid job outcome recorded"],
  ],
  locationHypothesis: "Begin around Irinjalakuda with a client-approved local service radius, then expand only when booked-job outcomes justify it.",
  outcomeHypothesis: "Connect the booking and job-outcome record after client authorisation so the team can compare messages, appointments, arrivals and paid services.",
  salesOutcome: "booked and paid-service outcomes",
});

export const demoGrowthReviews = [fiveStarGrowthReview, ecoCleanGrowthReview] as const;
