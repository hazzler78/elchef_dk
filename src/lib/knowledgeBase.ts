// Dynamisk kunskapsbas för AI-chatten
// Denna fil kan uppdateras enkelt för att hålla AI:n uppdaterad

export interface KnowledgeItem {
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  lastUpdated: string;
}

export interface CampaignInfo {
  id: string;
  title: string;
  description: string;
  validFrom: string;
  validTo: string;
  active: boolean;
}

export interface ProviderInfo {
  name: string;
  type: 'rorligt' | 'fastpris' | 'foretag';
  features: string[];
  url: string;
  active: boolean;
}

// Vanliga frågor och svar
export const faqKnowledge: KnowledgeItem[] = [
  {
    category: "elaftale",
    question: "Hvordan finder jeg gode elaftaler?",
    answer: "Registrer din e-mail i formularen i bunden af siden for at få tidlige tilbud, før de bliver fuldt bookede.",
    keywords: ["finde", "god", "tilbud", "registrere", "e-mail"],
    lastUpdated: "2025-01-20"
  },
  {
    category: "elaftale",
    question: "Hvad skal jeg vælge - Fastpris eller Variabel?",
    answer: "**Fastpris**: Forudsigeligt gennem hele aftaleperioden, godt hvis du vil undgå prischok. **Variabel**: Følger markedet, historisk billigere over tid men kan variere. Tænk over: Tror du elpriserne bliver billigere eller dyrere fremover?",
    keywords: ["fastpris", "variabel", "valg", "prischok", "marked"],
    lastUpdated: "2025-01-20"
  },
  {
    category: "skift",
    question: "Skal jeg opsige min gamle elaftale, når jeg skifter leverandør?",
    answer: "Nej, du behøver normalt ikke selv at opsige din gamle elaftale. Når du skifter elleverandør, håndterer den nye leverandør normalt skiftet for dig, inklusive opsigelsen af din tidligere aftale.",
    keywords: ["opsige", "gammel", "aftale", "skift", "leverandør"],
    lastUpdated: "2025-01-20"
  },
  {
    category: "gebyrer",
    question: "Er der noget gebyr for at opsige en elaftale?",
    answer: "Variable elaftaler kan normalt opsiges uden gebyr og har typisk en opsigelsestid på en måned. Fastprisaftaler har derimod en bindingsperiode, og hvis du vil afslutte aftalen i utide, kan der komme et afbrudsgebyr (også kaldet en indfrielsesafgift).",
    keywords: ["gebyr", "opsige", "afbrudsgebyr", "indfrielsesafgift", "bindingsperiode"],
    lastUpdated: "2025-01-20"
  },
  {
    category: "elomrader",
    question: "Hvilket elområde/elzone tilhører jeg?",
    answer: "Danmark er opdelt i to elområder: **DK1** - Vestdanmark (Jylland og Fyn), **DK2** - Østdanmark (Sjælland, Lolland-Falster og Bornholm). Hvilket elområde du tilhører afhænger af, hvor du bor, og påvirker elprisen i din region.",
    keywords: ["elområde", "elzone", "DK1", "DK2", "region"],
    lastUpdated: "2025-01-20"
  },
  {
    category: "fortrydelsesret",
    question: "Kan jeg fortryde min elaftale?",
    answer: "Ja, ifølge lov om forbrugeraftaler har du fortrydelsesret i 14 dage, når du indgår en aftale på distancen. Det betyder, at du kan fortryde aftalen uden omkostninger inden for denne periode. Undtagelse: betalt forbrug af el i fortrydelsesperioden.",
    keywords: ["fortryde", "aftale", "14 dage", "forbrugeraftaler", "omkostning"],
    lastUpdated: "2025-01-20"
  }
];

// Aktuella kampanjer
export const activeCampaigns: CampaignInfo[] = [
  {
    id: "variabel-2025",
    title: "Variabel aftale - 0 kr i gebyrer",
    description: "0 kr i gebyrer første år – uden bindingsperiode",
    validFrom: "2025-01-01",
    validTo: "2025-12-31",
    active: true
  },
  {
    id: "fastpris-2025",
    title: "Fastprisaftale med prisgaranti",
    description: "Prisgaranti med valgfri bindingsperiode (1-3 år)",
    validFrom: "2025-01-01",
    validTo: "2025-12-31",
    active: true
  },
  {
    id: "erhverv-2025",
    title: "Erhvervsaftale via Energi2.se",
    description: "Særlige erhvervsaftaler til virksomheder",
    validFrom: "2025-01-01",
    validTo: "2025-12-31",
    active: true
  }
];

// Leverantörsinformation
export const providers: ProviderInfo[] = [
  {
    name: "Cheap Energy",
    type: "rorligt",
    features: ["0 kr månedsgebyr", "0 øre tillæg", "Ingen bindingsperiode"],
    url: "https://www.cheapenergy.se/elchef-rorligt/",
    active: true
  },
  {
    name: "Svealands Elbolag",
    type: "fastpris",
    features: ["Prisgaranti", "Valgfri bindingsperiode", "Ingen skjulte gebyrer"],
    url: "https://www.svealandselbolag.se/elchef-fastpris/",
    active: true
  },
  {
    name: "Energi2.se",
    type: "foretag",
    features: ["Erhvervsaftale", "Skræddersyede løsninger", "Volumenrabatter"],
    url: "https://energi2.se/elchef/",
    active: true
  }
];

// Bytprocessinformation
export const bytProcess = {
  steps: [
    "Udfyld formularen med dine oplysninger",
    "Vælg aftaletype (variabel eller fastpris)",
    "Vi ordner opsigelsen hos dit gamle elselskab",
    "Klar på 14 dage",
    "Ingen gebyrer - helt gratis"
  ],
  features: [
    "Helt digitalt - ingen papirer eller opkald",
    "Vi håndterer alt for dig",
    "Fortrydelsesret i 14 dage",
    "Ingen skjulte omkostninger"
  ],
  timeFrame: "14 dage"
};

// Vejrets påvirkning på elprisen
export const weatherImpact = {
  lowerPrices: [
    { factor: "Regn", reason: "Fylder vandreservoirer – billig vandkraft" },
    { factor: "Vind", reason: "Meget vindkraftproduktion presser prisen" },
    { factor: "Varme", reason: "Mindre efterspørgsel på opvarmning" }
  ],
  higherPrices: [
    { factor: "Tørke eller vindstille", reason: "Mindre billig el – vi importerer dyrere el" }
  ]
};

// Sommertips
export const summerTips = {
  title: "Sommeren er perfekt til at sikre en god elaftale",
  reasons: [
    "Mange vil låse lave sommerpriser før efteråret",
    "Hos os på elchef.dk får du variabel pris uden tillæg – kun markedsprisen",
    "Vi viser også faste elaftaler for dig, der vil undgå prischok"
  ]
};

// Hjemmesidens grundinformation
export const companyInfo = {
  name: "Elchef.dk",
  company: "VKNG LTD",
  experience: "30+ års erfaring fra branchen",
  description: "Vi er IKKE et elselskab - du får aldrig en elregning fra os. Vi arbejder uafhængigt og samarbejder med flere elleverandører for at fremhæve kampagner og rabatter, der faktisk gør en forskel.",
  mission: "Give dig kontrollen tilbage. Du skal slippe for at bruge timer på at søge selv. Vi fremhæver kun aftaler, der er værd at overveje – med klare vilkår og priser, du rent faktisk forstår."
};

// Funktion för att hämta relevant kunskap baserat på fråga
export function findRelevantKnowledge(question: string): KnowledgeItem[] {
  const lowerQuestion = question.toLowerCase();
  return faqKnowledge.filter(item => 
    item.keywords.some(keyword => 
      lowerQuestion.includes(keyword.toLowerCase())
    )
  );
}

// Funktion för att hämta aktiva kampanjer
export function getActiveCampaigns(): CampaignInfo[] {
  const now = new Date();
  return activeCampaigns.filter(campaign => 
    campaign.active && 
    new Date(campaign.validFrom) <= now && 
    new Date(campaign.validTo) >= now
  );
}

// Funktion för att hämta leverantörer efter typ
export function getProvidersByType(type: 'rorligt' | 'fastpris' | 'foretag'): ProviderInfo[] {
  return providers.filter(provider => 
    provider.type === type && provider.active
  );
}

// Funktion för att generera sammanfattning av aktuell kunskap
export function generateKnowledgeSummary(): string {
  const activeCampaigns = getActiveCampaigns();
  const rorligtProviders = getProvidersByType('rorligt');
  const fastprisProviders = getProvidersByType('fastpris');
  
  let summary = `## Aktuelle tilbud (${new Date().toLocaleDateString('da-DK')})\n\n`;
  
  if (activeCampaigns.length > 0) {
    summary += "**Aktive kampagner:**\n";
    activeCampaigns.forEach(campaign => {
      summary += `• ${campaign.title}: ${campaign.description}\n`;
    });
    summary += "\n";
  }
  
  if (rorligtProviders.length > 0) {
    summary += "**Variable aftaler:**\n";
    rorligtProviders.forEach(provider => {
      summary += `• ${provider.name}: ${provider.features.join(', ')}\n`;
    });
    summary += "\n";
  }
  
  if (fastprisProviders.length > 0) {
    summary += "**Fastprisaftaler:**\n";
    fastprisProviders.forEach(provider => {
      summary += `• ${provider.name}: ${provider.features.join(', ')}\n`;
    });
    summary += "\n";
  }
  
  summary += `**Skifteproces:** ${bytProcess.timeFrame}, ${bytProcess.features.join(', ')}\n`;
  summary += `**Virksomhed:** ${companyInfo.description}`;
  
  return summary;
}
