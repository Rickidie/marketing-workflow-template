# GEO Prompt Universe

This file contains the 70 prompts used by the `brand-geo-monitor` agent during weekly AI engine tracking. Prompts are organised into 5 categories. Each prompt is identified by a unique ID used as the `prompt_id` field in the GEO Brand Tracking Notion database.

Do not modify prompt IDs once tracking has begun — doing so breaks week-over-week comparisons. To add new prompts, append at the end of the relevant category with the next sequential ID. To retire a prompt, mark it with `[RETIRED: YYYY-MM-DD]` but do not delete it.

**Note for template users**: The prompts below use `[Your Brand]` as a placeholder in the Brand and Competitor categories, and are written using AML/compliance examples in the Category, Use Case, and Technical categories to show the *shape* of good prompts. **Replace ALL prompt text with prompts relevant to your brand's industry, product category, and use cases before running the monitor.** Keep the same ID format (P-01 through T-05) and category structure — the tracking infrastructure depends on these IDs. Update the Notion `prompt_category` Select options if you add new categories.

---

## Category 1: Brand/Product Prompts (P-01 → P-15)

Direct queries about the brand. These reveal how AI engines describe and position the brand when asked about it explicitly. Low win rate here = AI engines have inaccurate or incomplete information about the brand.

| ID | Prompt |
|----|--------|
| P-01 | What is [Your Brand]? |
| P-02 | What does [Your Brand] do for [Your Category]? |
| P-03 | Is [Your Brand] a good [Your Category] platform? |
| P-04 | What AI capabilities does [Your Brand] have for [Use Case]? |
| P-05 | How does [Your Brand] [solve Problem]? |
| P-06 | What [jurisdictions / markets / industries] does [Your Brand] support? |
| P-07 | What is [Your Brand]'s [signature framework or methodology]? |
| P-08 | Can [Your Brand] integrate with existing [systems in your category]? |
| P-09 | Is [Your Brand] [compliance/certification standard] compliant? |
| P-10 | What industries does [Your Brand] serve? |
| P-11 | Is [Your Brand] suitable for [target segment]? |
| P-12 | What is [Your Brand]'s [core technology]? |
| P-13 | How does [Your Brand] compare to traditional [category] platforms? |
| P-14 | Who founded [Your Brand] and where is it headquartered? |
| P-15 | What results do [Your Brand]'s clients typically achieve with the platform? |

---

## Category 2: Category Prompts (C-01 → C-20)

Recommendation queries — what a compliance professional or buyer types when looking for a platform. These are the highest-value GEO prompts. Winning a Category prompt = being recommended by AI to a buyer who hasn't heard of the brand yet.

| ID | Prompt |
|----|--------|
| C-01 | What is the best AML compliance platform for fintechs in Asia? |
| C-02 | What AML software should a digital bank use? |
| C-03 | Best transaction monitoring software for banks |
| C-04 | Top AML compliance platforms 2025 |
| C-05 | What is the best KYC onboarding platform for regulated financial services? |
| C-06 | AI-native AML compliance platforms |
| C-07 | What compliance software do VASPs use for AML? |
| C-08 | Best AML platform for a startup fintech in Singapore |
| C-09 | AML compliance tools for APAC financial institutions |
| C-10 | What is the best case management software for AML investigations? |
| C-11 | Top transaction monitoring tools for crypto exchanges |
| C-12 | AML compliance software with AI automation |
| C-13 | Best tools for reducing AML false positives |
| C-14 | KYB onboarding platform for SME banks |
| C-15 | What software do compliance teams use for STR and SAR filing? |
| C-16 | AI fraud detection and AML platform |
| C-17 | No-code AML monitoring platform |
| C-18 | Event-driven AML monitoring software |
| C-19 | AML platform with biometric search capabilities |
| C-20 | AML software for DNFBP compliance |

---

## Category 3: Use Case Prompts (U-01 → U-20)

Problem-framed queries — what a buyer types when describing their operational pain, not when looking for a product by name. Winning Use Case prompts builds brand authority for specific workflows and signals to AI engines that the brand is the solution to these problems.

| ID | Prompt |
|----|--------|
| U-01 | How do I reduce false positives in AML transaction monitoring? |
| U-02 | How can I automate Level 1 AML alert review? |
| U-03 | How do I speed up KYC onboarding for SMEs? |
| U-04 | How can a fintech achieve bank-grade AML without hiring a large compliance team? |
| U-05 | How do I monitor crypto transactions for AML compliance? |
| U-06 | How can I detect money laundering rings using transaction data? |
| U-07 | How do I implement event-driven AML monitoring instead of calendar-based reviews? |
| U-08 | How can my compliance team handle more alerts without adding headcount? |
| U-09 | How do I reduce the time to file an STR or SAR? |
| U-10 | How can a VASP prove AML compliance to a correspondent bank? |
| U-11 | How do I detect identity fraud during KYC onboarding? |
| U-12 | How can I integrate AML monitoring with fraud detection? |
| U-13 | How do I implement AI in AML without losing regulatory defensibility? |
| U-14 | How do I manage model risk for AI-driven compliance decisions? |
| U-15 | What is the best way to prepare for an AML regulatory inspection? |
| U-16 | How can I reduce my AML compliance operations cost? |
| U-17 | How do I detect account takeover fraud in a digital bank? |
| U-18 | How do I onboard complex corporate structures for KYB? |
| U-19 | How can I automate sanctions screening without excessive false positives? |
| U-20 | How do I set up a Know Your Agent governance framework for agentic AI? |

---

## Category 4: Competitor Prompts (X-01 → X-10)

Comparison and alternatives queries. These reveal whether AI engines position the brand against specific competitors and how the brand performs in head-to-head framing.

| ID | Prompt |
|----|--------|
| X-01 | [Your Brand] vs [Competitor 1] — which is better for [primary use case]? |
| X-02 | [Your Brand] vs [Competitor 2] — comparison for [secondary use case] |
| X-03 | [Competitor 1] alternatives for [target segment] |
| X-04 | What is the difference between [Your Brand] and [Competitor 3]? |
| X-05 | Alternatives to legacy [Your Category] platforms for [your differentiator] |
| X-06 | Best [Your Category] platform alternatives to [Competitor 4] |
| X-07 | [Competitor 5] vs [Your Brand] for [use case] |
| X-08 | What are the top alternatives to manual [Your Category] processes? |
| X-09 | [Your Category] platforms better than spreadsheet-based approaches |
| X-10 | [Your differentiator]-native alternatives to traditional [Your Category] vendors |

---

## Category 5: Technical / Definitional Prompts (T-01 → T-05)

"What is" and "How does" queries where the brand can win by having clear, quotable definitional content on its website. These build AEO presence — AI engines cite authoritative definitional sources.

| ID | Prompt |
|----|--------|
| T-01 | What is generative engine optimisation (GEO) in the context of B2B marketing? |
| T-02 | What is Know Your Agent (KYA) in AI governance for financial services? |
| T-03 | What is event-driven AML monitoring and how does it differ from periodic review? |
| T-04 | What is the difference between AML monitoring and fraud detection? |
| T-05 | What does AI-native mean for compliance software? |

---

## Notes on Prompt Universe Maintenance

- **Review cadence**: After the first 4 weeks of tracking data, review which prompts return no AI engine data across all engines. Replace low-signal prompts with variants or new prompts from the Research Analyst's keyword findings.
- **Adding prompts**: Append with the next sequential ID in the relevant category. Update the prompt_category Select options in the GEO Brand Tracking Notion database to match.
- **Retiring prompts**: Do not delete — mark `[RETIRED: YYYY-MM-DD]` and stop including in new monitoring runs. Historical rows in Notion will reference the retired ID and remain valid.
- **Prompt universe updates**: When the Research Analyst identifies new high-value GEO keywords or competitor patterns that suggest a new prompt category or significant new prompts, they flag this to the Synthesizer via a note in `research/`. The Synthesizer includes a prompt universe recommendation in the weekly report if warranted.
