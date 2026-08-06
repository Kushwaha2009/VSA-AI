import { PromptTemplate } from '../../types';

export const CURATED_PROMPTS: PromptTemplate[] = [
  // Coding & Architecture
  {
    id: 'code-refactor',
    title: 'Clean Code & Refactor',
    category: 'coding',
    description: 'Refactor code for maximum readability, performance, and best practices.',
    prompt: 'Please review and refactor the following code to adhere to clean code principles, SOLID patterns, optimal time complexity, and robust error handling. Explain your key improvements:\n\n```\n[Insert Code Here]\n```',
  },
  {
    id: 'code-debug',
    title: 'Deep Bug Hunter & Fix',
    category: 'coding',
    description: 'Pinpoint subtle race conditions, memory leaks, or logical bugs with a full fix.',
    prompt: 'I am experiencing an issue with the following code. Please identify the root cause of the bug, edge cases, and provide the corrected code with explanation:\n\n```\n[Insert Error & Code]\n```',
  },
  {
    id: 'api-architect',
    title: 'REST / GraphQL API Architect',
    category: 'coding',
    description: 'Design production-grade, secure API schemas with validation & error contracts.',
    prompt: 'Design a comprehensive, secure, and idiomatic REST API specification for a [Service/Feature Name]. Include endpoints, request/response JSON schemas, HTTP status codes, query pagination, and rate-limiting headers.',
  },
  {
    id: 'regex-master',
    title: 'Regex Generator & Explainer',
    category: 'coding',
    description: 'Craft high-efficiency Regular Expressions with step-by-step breakdown.',
    prompt: 'Write a robust Regular Expression (RegEx) to match and validate: [Describe format, e.g. Indian Phone Numbers, Strict Passwords, ISO Dates]. Include an explanation of each capture group and test cases.',
  },
  {
    id: 'sql-optimizer',
    title: 'SQL Query Optimizer & Indexer',
    category: 'coding',
    description: 'Optimize slow queries and recommend composite indices for Postgres / MySQL.',
    prompt: 'Analyze this SQL query for performance bottlenecks. Suggest optimal indexes, query rewriting, and explain the execution plan improvements:\n\n```sql\n[Insert Query]\n```',
  },

  // Indian Languages & Translation
  {
    id: 'hindi-pro',
    title: 'हिन्दी अनुवाद एवं संपादन (Hindi Pro)',
    category: 'translation',
    description: 'शुद्ध एवं प्रवाहपूर्ण हिन्दी अनुवाद (Formal & Colloquial Hindi translation).',
    prompt: 'कृपया निम्नलिखित पाठ का शुद्ध, स्वाभाविक और प्रवाहपूर्ण हिन्दी में अनुवाद करें। तकनीकी शब्दों को स्पष्ट रखें:\n\n[यहाँ टेक्स्ट लिखें]',
  },
  {
    id: 'maithili-trans',
    title: 'मैथिली भाषा अनुवाद (Maithili Translation)',
    category: 'translation',
    description: 'मिथिला की समृद्ध भाषा मैथिली में सटीक एवं आदरपूर्ण अनुवाद।',
    prompt: 'कृपया निम्नलिखित वाक्य/अनुच्छेद का शुद्ध एवं मधुर मैथिली भाषा में अनुवाद करें:\n\n[यहाँ टेक्स्ट लिखें]',
  },
  {
    id: 'bhojpuri-trans',
    title: 'भोजपुरी संवाद एवं अनुवाद (Bhojpuri Translation)',
    category: 'translation',
    description: 'स्वाभाविक एवं जीवंत भोजपुरी भाषा में अभिव्यक्ति।',
    prompt: 'कृपया नीचे दिए गए टेक्स्ट का सहज और लोकप्रिय भोजपुरी भाषा में अनुवाद करें:\n\n[यहाँ टेक्स्ट लिखें]',
  },
  {
    id: 'punjabi-trans',
    title: 'ਪੰਜਾਬੀ ਅਨੁਵਾਦ (Punjabi Translation)',
    category: 'translation',
    description: 'ਗੁਰਮੁਖੀ ਲਿਪੀ ਵਿੱਚ ਸਪਸ਼ਟ ਅਤੇ ਕੁਦਰਤੀ ਪੰਜਾਬੀ ਅਨੁਵਾਦ।',
    prompt: 'ਕਿਰਪਾ ਕਰਕੇ ਹੇਠਾਂ ਦਿੱਤੇ ਟੈਕਸਟ ਦਾ ਸ਼ੁੱਧ ਅਤੇ ਪ੍ਰਵਾਹਪੂਰਨ ਪੰਜਾਬੀ (ਗੁਰਮੁਖੀ) ਵਿੱਚ ਅਨੁਵਾਦ ਕਰੋ:\n\n[ਇੱਥੇ ਟੈਕਸਟ ਲਿਖੋ]',
  },

  // Trivi Legal & Consumer Law (Non-Technical)
  {
    id: 'legal-consumer-rights',
    title: 'Consumer Rights & Defective Product Claim',
    category: 'legal',
    description: 'Draft a legal notice and demand for refund/replacement on defective products or services.',
    prompt: 'I purchased [Product/Service] from [Seller/Company] on [Date], and it has the following severe defect/failure: [Describe Issue]. The seller is refusing to honor warranty or refund. Explain my legal consumer rights in plain English and draft a formal legal grievance notice demand letter.',
  },
  {
    id: 'legal-tenancy-lease',
    title: 'Tenant Lease Agreement & Security Deposit Claim',
    category: 'legal',
    description: 'Verify landlord obligations, notice periods, and claim withheld security deposits.',
    prompt: 'My landlord is refusing to return my security deposit of [Amount] after vacating the property on [Date], citing unjust deductions for normal wear and tear. Explain tenant rights in plain language, legal notice requirements, and the step-by-step remedy to recover the full deposit.',
  },
  {
    id: 'legal-freelance-contract',
    title: 'Freelance & Service Agreement Drafting',
    category: 'legal',
    description: 'Draft a robust freelance agreement protecting payment milestones, IP transfer, and late fees.',
    prompt: 'Draft a simple, highly protective freelance service contract between [My Name/Business] and [Client Name] for [Project Scope]. Include: 50% advance / 50% milestone payments, net-7 payment terms, late payment interest, client revision caps, and IP ownership transfer ONLY after full payment.',
  },
  {
    id: 'legal-nda-draft',
    title: 'Mutual Non-Disclosure Agreement (NDA)',
    category: 'legal',
    description: 'Protect confidential business ideas, source code, and customer data.',
    prompt: 'Draft a mutual Non-Disclosure Agreement (NDA) in plain everyday English between [Party A] and [Party B] to discuss [Project/Idea]. Include 2-year confidentiality duration, exclusions for public info, and remedies for breach.',
  },
  {
    id: 'legal-rti-filing',
    title: 'RTI (Right to Information) Application',
    category: 'legal',
    description: 'Draft an RTI query to public authorities for delayed government services, road repairs, or status.',
    prompt: 'Draft a formal Right to Information (RTI) application addressed to the Public Information Officer (PIO) of [Department/Ministry Name] seeking certified copies and exact status regarding [Issue/Application Number/Road Construction]. Keep it concise and legally compliant.',
  },

  // Document Analysis & Study
  {
    id: 'doc-executive-summary',
    title: 'Executive Document Summary',
    category: 'document',
    description: 'Condense 20+ page reports into an actionable 1-page briefing with metrics.',
    prompt: 'Summarize the attached document into an Executive Briefing:\n1. 3-sentence high-level overview\n2. Key quantitative findings & metrics\n3. Strategic risks & opportunities\n4. Recommended next steps',
  },
  {
    id: 'doc-contract-audit',
    title: 'Legal Agreement / Contract Review',
    category: 'document',
    description: 'Audit contracts for hidden liabilities, termination clauses, and risks.',
    prompt: 'Analyze this contract/terms agreement. Highlight:\n- Unfavorable indemnification or liability clauses\n- Auto-renewal & termination timelines\n- IP ownership assignment\n- Ambiguous definitions to clarify',
  },
  {
    id: 'eli5-concept',
    title: 'ELI5 (Explain Like I am 5)',
    category: 'document',
    description: 'Break down complex quantum physics, financial models, or AI into simple stories.',
    prompt: 'Explain the concept of [Topic/Technology] to someone with zero technical background. Use intuitive real-world metaphors, simple analogies, and conversational language.',
  },

  // Writing & Content Creation
  {
    id: 'persuasive-email',
    title: 'High-Converting Cold Outreach Email',
    category: 'writing',
    description: 'Write personalized, high-response B2B cold emails with strong hooks.',
    prompt: 'Write 3 variants of a high-converting cold email pitch for [Product/Service] targeting [Target Persona/Industry]. Keep each under 120 words with an intriguing hook, clear value proposition, and low-friction CTA.',
  },
  {
    id: 'blog-post-seo',
    title: 'Comprehensive SEO Article',
    category: 'writing',
    description: 'Create an in-depth, search-optimized article outline with H2/H3 headers and FAQs.',
    prompt: 'Generate an exhaustive, highly engaging 1,500-word blog post on the topic: "[Topic Title]". Include search-intent-driven H2/H3 headings, actionable examples, key statistics, and a schema-ready FAQ section.',
  },
  {
    id: 'youtube-script',
    title: 'Viral YouTube Video Script',
    category: 'creative',
    description: 'Hook-driven video script with visual cues, retention spikes, and outro CTAs.',
    prompt: 'Write a dynamic 8-minute YouTube video script about [Video Topic]. Structure with:\n- 0:00-0:30: High-retention Visual Hook\n- 0:30-3:00: Problem & Surprising Context\n- 3:00-7:00: Step-by-Step Breakdown with B-roll cues [Visual Notes]\n- 7:00-8:00: Climax & Call To Action',
  },

  // Business & Strategy
  {
    id: 'swot-analysis',
    title: 'Strategic SWOT Analysis',
    category: 'business',
    description: 'Evaluate Strengths, Weaknesses, Opportunities, and Threats for any venture.',
    prompt: 'Conduct a thorough SWOT Analysis for [Company/Product Idea]. Identify unique market differentiators, competitive threats, technology shifts, and strategic levers to capitalize on.',
  },
  {
    id: 'pitch-deck-outline',
    title: 'Investor Pitch Deck Structure',
    category: 'business',
    description: 'Standard 10-slide Y Combinator / Sequoia style pitch deck framework.',
    prompt: 'Draft the slide-by-slide narrative for a 10-slide startup pitch deck for [Startup Name & Value Prop]. For each slide provide: Headline, 3 core data points, visual chart recommendation, and key takeaway.',
  },

  // About Platform & Developer Info
  {
    id: 'who-made-you-hindi',
    title: 'किसने बनाया? (Who built this app?)',
    category: 'writing',
    description: 'डेवलपर विशाल कुमार एवं एप्लिकेशन की तकनीकी जानकारी।',
    prompt: 'यह ऐप किसने बनाया है और इसका डेवलपर कौन है?',
  },
  {
    id: 'model-transparency',
    title: 'वर्तमान AI मॉडल व तकनीकी आर्किटेक्चर',
    category: 'writing',
    description: 'Google Gemini AI मॉडल और बैकएंड इन्फ्रास्ट्रक्चर की जानकारी।',
    prompt: 'इस एप्लिकेशन में कौन सा AI मॉडल इस्तेमाल हो रहा है और यह कैसे काम करता है?',
  },
];
