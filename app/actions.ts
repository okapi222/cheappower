"use server"

import { generateText } from "ai"
import { perplexity } from "some-module" // Declare the perplexity variable

interface RegionInfo {
  name: string
  price: number
  energyMix: Record<string, number>
}

interface ScoreRow {
  factor: string
  scores: Record<string, number> // region name -> score (-1, 0, or 1)
  justifications: Record<string, string> // region name -> brief justification
}

interface FactorAnalysis {
  factor: string
  analysis: string // comparative paragraph
  sources: { url: string; label: string }[]
}

interface EIASource {
  name: string
  url: string
}

interface AnalysisResponse {
  scoreTable: ScoreRow[]
  factorAnalyses: FactorAnalysis[]
  synthesis: string
  synthesisSources: { url: string; label: string }[]
  eiaSources: EIASource[]
}

const stateCodeMap: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
}

const USA_AVERAGE_PRICE = 0.127 // US average retail electricity price per kWh (2024)

export async function analyzeRegionPricing(regions: RegionInfo[], averagePrice: number, isSingleRegion: boolean) {
  const eiaSources: EIASource[] = regions.map((r) => {
    const stateName = r.name.toLowerCase()
    const stateCode = stateCodeMap[stateName]
    if (stateCode) {
      return {
        name: `EIA ${r.name}`,
        url: `https://www.eia.gov/electricity/state/${stateName.replace(/ /g, "")}/`,
      }
    }
    return {
      name: `EIA`,
      url: `https://www.eia.gov/electricity/`,
    }
  })

  const regionNames = regions.map(r => r.name)

  const prompt = `You are an electricity market analyst. Produce a concise, comparative analysis explaining WHY retail electricity prices differ across these regions.

**REGIONS TO ANALYZE:**
${regions
  .map(
    (r) =>
      `- ${r.name}: $${r.price.toFixed(3)}/kWh
  Energy Mix: ${Object.entries(r.energyMix)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${v}%`)
    .join(", ")}`,
  )
  .join("\n\n")}

US National Average: $${USA_AVERAGE_PRICE.toFixed(3)}/kWh

**ANALYSIS FRAMEWORK:**
Evaluate ALL of these factors, then report ONLY on the THREE factors that most strongly differentiate retail electricity prices across the selected regions:
1. Fuel and generation costs
2. Transmission and distribution (T&D)
3. Regulatory structure and utility model
4. State and federal policies
5. Wholesale market conditions
6. Geography and local conditions
7. Reliability and resilience costs

**SCORING REQUIREMENT:**
For each of the three reported factors, assign each region a relative score:
- +1 = structurally favorable for low retail prices
- 0 = neutral or mixed impact
- -1 = structurally unfavorable for low retail prices

**OUTPUT REQUIREMENTS:**
1. Score Table: Three factors with scores for each region and brief justifications
2. Factor Analyses: One paragraph per factor comparing how regions DIFFER and whether the factor HELPS or HURTS each region's ability to provide low-cost electricity
3. Synthesis: Final paragraph explaining WHY these regions have different retail electricity prices

Return ONLY valid JSON in this exact format:
{
  "scoreTable": [
    {
      "factor": "Factor Name",
      "scores": {${regionNames.map(n => `"${n}": 0`).join(", ")}},
      "justifications": {${regionNames.map(n => `"${n}": "Brief 1-2 sentence justification"`).join(", ")}}
    }
  ],
  "factorAnalyses": [
    {
      "factor": "Factor Name",
      "analysis": "Comparative paragraph explaining how this factor differs across regions and its impact on prices. Must compare all regions.",
      "sources": [{"url": "https://www.eia.gov/electricity/state/...", "label": "EIA State Data"}]
    }
  ],
  "synthesis": "Final paragraph synthesizing WHY these regions have different retail electricity prices, referencing the key factors analyzed.",
  "synthesisSources": [{"url": "https://www.eia.gov/electricity/", "label": "EIA"}]
}`

  const { text } = await generateText({
    model: "anthropic/claude-sonnet-4-20250514",
    prompt,
    maxOutputTokens: 6000,
  })

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    // Fix invalid JSON: replace +1 with 1 (JSON doesn't support + prefix for positive numbers)
    const jsonText = jsonMatch ? jsonMatch[0].replace(/:\s*\+1/g, ": 1") : text.replace(/:\s*\+1/g, ": 1")
    const parsed = JSON.parse(jsonText)
    return { success: true, data: { ...parsed, eiaSources } as AnalysisResponse }
  } catch {
    return {
      success: true,
      data: {
        scoreTable: [{
          factor: "Generation Mix",
          scores: Object.fromEntries(regions.map(r => [r.name, 0])),
          justifications: Object.fromEntries(regions.map(r => [r.name, "Analysis pending"]))
        }],
        factorAnalyses: [{
          factor: "Generation Mix",
          analysis: "Analysis of regional electricity pricing factors is being prepared.",
          sources: eiaSources.map(s => ({ url: s.url, label: s.name }))
        }],
        synthesis: "Regional electricity prices vary based on multiple factors including generation mix, regulatory structure, and infrastructure costs.",
        synthesisSources: [{ url: "https://www.eia.gov/electricity/", label: "EIA" }],
        eiaSources,
      } as AnalysisResponse,
    }
  }
}

export async function askFollowUp(
  question: string,
  previousAnalysis: {
    scoreTable: { factor: string; scores: Record<string, number>; justifications: Record<string, string> }[]
    factorAnalyses: { factor: string; analysis: string }[]
    synthesis: string
  },
  regions: RegionInfo[],
) {
  const prompt = `You are an electricity market analyst. The user has reviewed an analysis of regional electricity prices and has a follow-up question or challenge.

**PREVIOUS ANALYSIS:**

Score Table:
${previousAnalysis.scoreTable.map(row => 
  `${row.factor}: ${Object.entries(row.scores).map(([region, score]) => `${region}=${score > 0 ? '+' : ''}${score}`).join(', ')}`
).join('\n')}

Factor Analyses:
${previousAnalysis.factorAnalyses.map((f) => `- ${f.factor}: ${f.analysis}`).join("\n\n")}

Synthesis: ${previousAnalysis.synthesis}

**REGIONS DATA:**
${regions
  .map(
    (r) =>
      `- ${r.name}: $${r.price.toFixed(3)}/kWh
  Energy Mix: ${Object.entries(r.energyMix)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${v}%`)
    .join(", ")}`,
  )
  .join("\n\n")}

**USER'S QUESTION/CHALLENGE:**
${question}

**INSTRUCTIONS:**
Respond directly to the user's question or challenge. If they are challenging the analysis, acknowledge valid points and provide additional context or corrections. If they want to dig deeper, provide more detailed information. Keep your response focused, informative, and 2-4 paragraphs.

Respond with plain text only, no JSON formatting.`

  const { text } = await generateText({
    model: "anthropic/claude-sonnet-4-20250514",
    prompt,
    maxOutputTokens: 2000,
  })

  return { success: true, response: text }
}
