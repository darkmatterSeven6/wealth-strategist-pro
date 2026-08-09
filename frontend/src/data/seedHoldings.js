export const SEED_HOLDINGS = [
  {
    fund_id: "fund-atram-tech",
    match_keywords: ["tech", "technology", "fidelity"],
    fund_name: "ATRAM Global Technology Feeder Fund",
    target_fund: "Fidelity Funds - Global Technology Fund",
    target_fund_manager: "Fidelity International",
    benchmark: "MSCI AC World Information Technology Index",
    top_10_weight: "42.80%",
    holdings: [
      {
        name: "Microsoft Corp.",
        ticker: "MSFT",
        sector: "Information Technology / Cloud",
        weight: "8.20%",
        description: "Global leader in enterprise cloud computing (Azure), generative AI integrations (Copilot), and enterprise productivity software."
      },
      {
        name: "Apple Inc.",
        ticker: "AAPL",
        sector: "Consumer Electronics / Hardware",
        weight: "5.70%",
        description: "Global consumer technology ecosystem across iPhone, Mac, Wearables, and high-margin recurring Digital Services."
      },
      {
        name: "NVIDIA Corporation",
        ticker: "NVDA",
        sector: "AI Accelerators & GPUs",
        weight: "5.40%",
        description: "Dominant global provider of accelerated GPU computing platforms, networking fabrics (InfiniBand), and AI model training infrastructure."
      },
      {
        name: "Taiwan Semiconductor (TSMC)",
        ticker: "TSM",
        sector: "Semiconductor Foundry",
        weight: "4.80%",
        description: "World's premier semiconductor manufacturing foundry fabricating leading-edge 3nm and 2nm nodes for global tech leaders."
      },
      {
        name: "Visa Inc.",
        ticker: "V",
        sector: "Financial Technology / Payments",
        weight: "4.30%",
        description: "Operates the world's largest retail electronic payments processing network with industry-leading operating margins."
      },
      {
        name: "Salesforce Inc.",
        ticker: "CRM",
        sector: "Enterprise Software / SaaS",
        weight: "3.90%",
        description: "Premier provider of cloud-based Customer Relationship Management (CRM) platforms, Data Cloud, and autonomous AI agents."
      },
      {
        name: "Alphabet Inc. (Google)",
        ticker: "GOOGL",
        sector: "Digital Advertising / Cloud & AI",
        weight: "3.70%",
        description: "Dominates global internet search, Android mobile operating ecosystem, YouTube video monetization, and Google Cloud Platform."
      },
      {
        name: "Samsung Electronics",
        ticker: "005930.KS",
        sector: "Semiconductors & Memory",
        weight: "3.50%",
        description: "Major global manufacturer of High Bandwidth Memory (HBM3e), DRAM/NAND flash storage, smartphones, and OLED displays."
      }
    ]
  },
  {
    fund_id: "fund-alfm-multi-asset",
    match_keywords: ["alfm", "multi-asset", "multi asset", "blackrock", "bgf"],
    fund_name: "ALFM Global Multi-Asset Income Fund Inc",
    target_fund: "BGF (BlackRock) Global Multi-Asset Income Fund",
    target_fund_manager: "BlackRock Financial Management",
    benchmark: "50% MSCI World / 50% Bloomberg Global Aggregate Bond Index",
    top_10_weight: "18.40%",
    holdings: [
      {
        name: "iShares MSCI EM USD ETF",
        ticker: "EMB",
        sector: "Emerging Market Debt / Bonds",
        weight: "2.03%",
        description: "High-yield bond fund tracking sovereign and corporate debt instruments across emerging market economies."
      },
      {
        name: "iShares $ High Yield Corp Bond ETF",
        ticker: "HYG",
        sector: "Corporate Fixed Income",
        weight: "0.96%",
        description: "Diversified basket of liquid, high-yield corporate bonds providing consistent monthly dividend cash flow."
      },
      {
        name: "Samsung Electronics GDS",
        ticker: "SMSN.L",
        sector: "Technology / Dividend Equities",
        weight: "0.29%",
        description: "Global technology hardware giant providing balance through solid preferred stock dividend distributions."
      },
      {
        name: "Microsoft Corp.",
        ticker: "MSFT",
        sector: "Technology / Dividend Growth",
        weight: "0.27%",
        description: "Core growth equity holding providing resilient cash balance alongside recurring quarterly dividend growth."
      },
      {
        name: "British American Tobacco",
        ticker: "BTI",
        sector: "Consumer Staples / High Yield",
        weight: "0.25%",
        description: "High-dividend defensive consumer staple generating predictable, recession-resilient operating cash flows."
      },
      {
        name: "American Electric Power Inc.",
        ticker: "AEP",
        sector: "Regulated Electric Utilities",
        weight: "0.24%",
        description: "Essential utility infrastructure operator providing stable regulated base returns and steady quarterly cash distributions."
      },
      {
        name: "AstraZeneca PLC",
        ticker: "AZN",
        sector: "Healthcare & Pharmaceuticals",
        weight: "0.23%",
        description: "Global biopharmaceutical innovator with robust oncology franchise, resilient global revenue, and dividend yield."
      },
      {
        name: "Shell PLC",
        ticker: "SHEL",
        sector: "Integrated Global Energy",
        weight: "0.22%",
        description: "Diversified energy major returning massive capital to shareholders through strong progressive dividends and buybacks."
      }
    ]
  },
  {
    fund_id: "fund-atram-infra",
    match_keywords: ["infra", "infrastructure", "ubs", "franklin"],
    fund_name: "ATRAM Global Infra Equity Feeder Fund",
    target_fund: "UBS (Lux) Infrastructure Equity Fund",
    target_fund_manager: "UBS Asset Management",
    benchmark: "FTSE Global Core Infrastructure 50/50 Index",
    top_10_weight: "41.60%",
    holdings: [
      {
        name: "Targa Resources Corp.",
        ticker: "TRGP",
        sector: "Energy Infrastructure / Midstream",
        weight: "4.71%",
        description: "Major North American natural gas gathering, processing, and pipeline operator in the prolific Permian Basin."
      },
      {
        name: "ONEOK Inc.",
        ticker: "OKE",
        sector: "Energy Infrastructure / NGLs",
        weight: "4.62%",
        description: "Integrated natural gas liquids (NGL) processing and long-haul transmission interstate pipeline network."
      },
      {
        name: "Williams Companies Inc.",
        ticker: "WMB",
        sector: "Energy Infrastructure / Gas",
        weight: "4.33%",
        description: "Transports over 30% of all natural gas consumed in the United States via critical interstate pipeline systems."
      },
      {
        name: "Kinder Morgan Inc.",
        ticker: "KMI",
        sector: "Energy Infrastructure / Pipelines",
        weight: "4.31%",
        description: "Operates 83,000 miles of pipelines and 140 energy terminals transporting natural gas, gasoline, and crude oil."
      },
      {
        name: "Flughafen Zürich AG",
        ticker: "FHZN.SW",
        sector: "Transportation / Airports",
        weight: "4.23%",
        description: "Owns and operates Zurich Airport, Switzerland's premier international passenger and air freight aviation hub."
      },
      {
        name: "Entergy Corporation",
        ticker: "ETR",
        sector: "Regulated Utilities / Power",
        weight: "3.93%",
        description: "Electric power generation and retail distribution utility serving 3 million customers across the US Deep South."
      },
      {
        name: "Union Pacific Corp.",
        ticker: "UNP",
        sector: "Freight Rail Transportation",
        weight: "3.69%",
        description: "Premier Class I freight railroad network spanning 23 western US states, transporting grain, energy, and intermodal freight."
      },
      {
        name: "Enbridge Inc.",
        ticker: "ENB",
        sector: "Energy Pipeline Infrastructure",
        weight: "3.55%",
        description: "Critical North American energy infrastructure network delivering millions of barrels of crude oil and natural gas daily."
      }
    ]
  },
  {
    fund_id: "fund-atram-consumer-trends",
    match_keywords: ["consumer", "consumer trends", "trends"],
    fund_name: "ATRAM Global Consumer Trends Feeder Fund",
    target_fund: "Fidelity Funds - Global Consumer Industries Fund",
    target_fund_manager: "Fidelity International",
    benchmark: "MSCI AC World Consumer Discretionary + Staples Index",
    top_10_weight: "46.20%",
    holdings: [
      {
        name: "Amazon.com Inc.",
        ticker: "AMZN",
        sector: "E-Commerce, Cloud & AI",
        weight: "8.50%",
        description: "Global powerhouse in e-commerce fulfillment logistics, digital subscriptions (Prime), and high-margin cloud infrastructure (AWS)."
      },
      {
        name: "LVMH Moët Hennessy Louis Vuitton",
        ticker: "MC.PA",
        sector: "Luxury Goods & Fashion",
        weight: "6.20%",
        description: "World's preeminent luxury conglomerate controlling iconic heritage houses including Louis Vuitton, Dior, and Tiffany & Co."
      },
      {
        name: "Hermès International",
        ticker: "RMS.PA",
        sector: "Ultra-Luxury Goods",
        weight: "5.10%",
        description: "Iconic French luxury house with exceptional pricing power, unmatched artisan craftsmanship, and long waiting lists."
      },
      {
        name: "L'Oréal S.A.",
        ticker: "OR.PA",
        sector: "Beauty & Personal Care",
        weight: "4.80%",
        description: "World leader in beauty, skincare, and cosmetics with extensive distribution across luxury and mass market channels."
      },
      {
        name: "Nike Inc.",
        ticker: "NKE",
        sector: "Athletic Footwear & Apparel",
        weight: "4.10%",
        description: "Global leader in athletic footwear, performance sportswear, and direct-to-consumer digital commerce."
      },
      {
        name: "Booking Holdings Inc.",
        ticker: "BKNG",
        sector: "Online Travel & Leisure",
        weight: "3.90%",
        description: "Dominant digital travel platform operating Booking.com, Priceline, and Agoda with superior operating cash generation."
      },
      {
        name: "Costco Wholesale Corp.",
        ticker: "COST",
        sector: "Consumer Staples / Retail",
        weight: "3.60%",
        description: "Membership warehouse club with incredible customer loyalty, 90%+ renewal rates, and high inventory turnover."
      }
    ]
  },
  {
    fund_id: "fund-manulife-reit",
    match_keywords: ["global reit", "manulife reit", "reit"],
    fund_name: "Manulife Global REIT Feeder Fund",
    target_fund: "Manulife Global Fund - Global REIT Fund",
    target_fund_manager: "Manulife Investment Management",
    benchmark: "FTSE EPRA Nareit Developed Index",
    top_10_weight: "44.50%",
    holdings: [
      {
        name: "Prologis Inc.",
        ticker: "PLD",
        sector: "Industrial & Logistics REIT",
        weight: "7.80%",
        description: "Global leader in modern logistics and supply chain warehouse real estate strategically positioned near high-density consumption hubs."
      },
      {
        name: "Equinix Inc.",
        ticker: "EQIX",
        sector: "Digital Infrastructure / Data Centers",
        weight: "6.90%",
        description: "Premier global digital infrastructure REIT providing interconnection and data center colocation for cloud and AI networks."
      },
      {
        name: "Welltower Inc.",
        ticker: "WELL",
        sector: "Healthcare & Senior Housing REIT",
        weight: "5.40%",
        description: "Capitalizes on structural aging demographics with premier senior living communities and post-acute healthcare properties."
      },
      {
        name: "Public Storage",
        ticker: "PSA",
        sector: "Self-Storage Facilities",
        weight: "4.60%",
        description: "Largest owner and operator of self-storage properties across the US with low operating expense ratios and resilient pricing."
      },
      {
        name: "Simon Property Group",
        ticker: "SPG",
        sector: "Retail & Mixed-Use Properties",
        weight: "4.20%",
        description: "Premier retail real estate investment trust owning high-productivity Class-A shopping destinations and premium outlets."
      },
      {
        name: "Realty Income Corp.",
        ticker: "O",
        sector: "Triple Net Lease Commercial",
        weight: "3.80%",
        description: "The 'Monthly Dividend Company' holding 15,000+ commercial properties under long-term net lease agreements with defensive tenants."
      }
    ]
  },
  {
    fund_id: "fund-bpi-philippine-stock-index",
    match_keywords: ["philippine stock index", "bpi stock index", "psei", "philippine stock"],
    fund_name: "Philippine Stock Index Fund (Units)",
    target_fund: "Philippine Stock Exchange Index (PSEi) Constituents",
    target_fund_manager: "BPI Wealth / Asset Management",
    benchmark: "PSEi (Philippine Stock Exchange Index)",
    top_10_weight: "67.80%",
    holdings: [
      {
        name: "SM Investments Corp.",
        ticker: "SM",
        sector: "Conglomerate / Banking & Retail",
        weight: "14.50%",
        description: "Philippines' largest conglomerate with market-leading positions in banking (BDO), property (SM Prime), and retail stores."
      },
      {
        name: "BDO Unibank Inc.",
        ticker: "BDO",
        sector: "Universal Banking & Financial Services",
        weight: "11.20%",
        description: "Largest universal bank in the Philippines in terms of total assets, loans, deposits, and nationwide branch footprint."
      },
      {
        name: "SM Prime Holdings",
        ticker: "SMPH",
        sector: "Real Estate & Commercial Malls",
        weight: "10.40%",
        description: "Largest integrated property developer and shopping mall operator in the Philippines with prime commercial landbanks."
      },
      {
        name: "Ayala Land Inc.",
        ticker: "ALI",
        sector: "Real Estate & Masterplanned Estates",
        weight: "8.90%",
        description: "Premier Philippine masterplanned estate developer, residential builder, commercial office, and shopping mall operator."
      },
      {
        name: "Bank of the Philippine Islands",
        ticker: "BPI",
        sector: "Universal Banking & Digital Finance",
        weight: "8.10%",
        description: "Oldest operating bank in Southeast Asia with superior return on equity (ROE), wealth management, and digital retail adoption."
      },
      {
        name: "International Container Terminal Services",
        ticker: "ICT",
        sector: "Port Terminal Operations & Logistics",
        weight: "7.60%",
        description: "Global port management giant operating 33+ marine container terminals across 20 countries with stellar cash flow."
      },
      {
        name: "Ayala Corporation",
        ticker: "AC",
        sector: "Diversified Conglomerate",
        weight: "7.10%",
        description: "One of the oldest conglomerates in the Philippines with core stakes in real estate, banking, telecommunications, and renewables."
      }
    ]
  },
  {
    fund_id: "fund-atram-ph-smart-index",
    match_keywords: ["smart index", "atram smart"],
    fund_name: "ATRAM Philippine Smart Index Feeder Fund",
    target_fund: "ATRAM Smart Index Portfolio",
    target_fund_manager: "ATRAM Trust Corporation",
    benchmark: "Enhanced PSEi Smart Beta Index",
    top_10_weight: "62.40%",
    holdings: [
      {
        name: "SM Investments Corp.",
        ticker: "SM",
        sector: "Conglomerate",
        weight: "13.80%",
        description: "Anchor holding across Philippine retail banking, property development, and retail department stores."
      },
      {
        name: "BDO Unibank Inc.",
        ticker: "BDO",
        sector: "Commercial Banking",
        weight: "10.90%",
        description: "Dominant universal bank with high net interest margins and nationwide branch distribution."
      },
      {
        name: "International Container Terminal Services",
        ticker: "ICT",
        sector: "Port Logistics",
        weight: "9.40%",
        description: "Smart-beta factor overweight due to exceptional return on invested capital and international container volume growth."
      },
      {
        name: "SM Prime Holdings",
        ticker: "SMPH",
        sector: "Real Estate",
        weight: "9.10%",
        description: "Commercial shopping mall developer with predictable leasing rental streams."
      },
      {
        name: "Bank of the Philippine Islands",
        ticker: "BPI",
        sector: "Universal Banking",
        weight: "8.50%",
        description: "Tier-1 Philippine lender benefiting from robust consumer credit growth and digital banking efficiency."
      }
    ]
  },
  {
    fund_id: "fund-atram-money-market",
    match_keywords: ["money market", "liquidity", "t-bill"],
    fund_name: "ATRAM Money Market Fund",
    target_fund: "Philippine Short-Term Sovereign Debt & Bank Time Deposits",
    target_fund_manager: "ATRAM Trust Corporation",
    benchmark: "Bloomberg Philippine Sovereign Bond 1-3 Month Index",
    top_10_weight: "100.00%",
    holdings: [
      {
        name: "Republic of the Philippines 91-Day T-Bills",
        ticker: "PH91DTB",
        sector: "Sovereign Debt (Gov)",
        weight: "35.00%",
        description: "Short-term sovereign debt securities issued by the Bureau of the Treasury with zero credit default risk."
      },
      {
        name: "Republic of the Philippines 182-Day T-Bills",
        ticker: "PH182DTB",
        sector: "Sovereign Debt (Gov)",
        weight: "25.00%",
        description: "6-month sovereign debt paper providing capital preservation and liquidity buffer."
      },
      {
        name: "BDO Unibank Institutional Time Deposit",
        ticker: "BDO-TD",
        sector: "Tier-1 Bank Cash Equiv",
        weight: "18.00%",
        description: "Short-term institutional bank time deposit earning attractive money-market interest rates."
      },
      {
        name: "BPI Short-Term Certificate of Deposit",
        ticker: "BPI-CD",
        sector: "Tier-1 Bank Cash Equiv",
        weight: "12.00%",
        description: "High-grade short term deposit instrument ensuring daily liquidity for fund redemptions."
      },
      {
        name: "BSP Overnight Reverse Repurchase (RRP)",
        ticker: "BSP-RRP",
        sector: "Central Bank Liquidity",
        weight: "10.00%",
        description: "Ultra-liquid overnight reverse repo facility directly with the Bangko Sentral ng Pilipinas."
      }
    ]
  },
  {
    fund_id: "fund-atram-medium-term-bond",
    match_keywords: ["bond", "medium term", "peso bond"],
    fund_name: "ATRAM Medium Term Peso Bond Fund",
    target_fund: "Markit iBoxx ALBI Philippines Sovereign & Corporate Bonds",
    target_fund_manager: "ATRAM Trust Corporation",
    benchmark: "Bloomberg Philippine Sovereign Bond 1-5 Year Index",
    top_10_weight: "65.00%",
    holdings: [
      {
        name: "Republic of the Philippines FXTN 10-60",
        ticker: "PH-FXTN-10-60",
        sector: "Sovereign Debt (Gov)",
        weight: "20.00%",
        description: "Philippine government sovereign bond offering steady coupon income with low default risk."
      },
      {
        name: "Republic of the Philippines RTB 05-12",
        ticker: "PH-RTB-05-12",
        sector: "Retail Treasury Bond",
        weight: "15.00%",
        description: "Retail treasury bond issued by the government, providing retail investors accessible fixed income."
      },
      {
        name: "Ayala Corporation 5.0% 2028",
        ticker: "AC-28",
        sector: "Corporate Bonds",
        weight: "10.00%",
        description: "High-grade corporate bond from the Philippines' oldest and largest conglomerate."
      },
      {
        name: "SM Prime Holdings 4.5% 2027",
        ticker: "SMPH-27",
        sector: "Corporate Bonds",
        weight: "10.00%",
        description: "Secured corporate debt from a leading property developer in Southeast Asia."
      },
      {
        name: "BDO Unibank 4.25% 2026",
        ticker: "BDO-26",
        sector: "Corporate Bonds",
        weight: "10.00%",
        description: "Senior unsecured notes from the largest bank in the Philippines."
      }
    ]
  },
  {
    fund_id: "fund-atram-health-care",
    match_keywords: ["health", "healthcare", "pharma"],
    fund_name: "ATRAM Global Health Care Feeder Fund",
    target_fund: "Fidelity Funds - Global Health Care Fund",
    target_fund_manager: "Fidelity International",
    benchmark: "MSCI AC World Health Care Index",
    top_10_weight: "42.10%",
    holdings: [
      {
        name: "Eli Lilly and Company",
        ticker: "LLY",
        sector: "Pharmaceuticals & Biotech",
        weight: "8.90%",
        description: "Pioneer in blockbuster GLP-1 metabolic health (diabetes and obesity) therapies, oncology, and neuroscience."
      },
      {
        name: "Novo Nordisk A/S",
        ticker: "NVO",
        sector: "Pharmaceuticals / Diabetes & Obesity",
        weight: "7.60%",
        description: "Global leader in diabetes and obesity treatment with exponential global adoption of Ozempic and Wegovy."
      },
      {
        name: "UnitedHealth Group Inc.",
        ticker: "UNH",
        sector: "Managed Healthcare Services",
        weight: "6.40%",
        description: "Largest healthcare enterprise in the United States offering health insurance (UnitedHealthcare) and health tech (Optum)."
      },
      {
        name: "Thermo Fisher Scientific Inc.",
        ticker: "TMO",
        sector: "Life Sciences Tools & Diagnostics",
        weight: "5.10%",
        description: "Essential global supplier of analytical instruments, laboratory reagents, and clinical trials software."
      },
      {
        name: "Johnson & Johnson",
        ticker: "JNJ",
        sector: "Diversified MedTech & Pharma",
        weight: "4.80%",
        description: "Global healthcare powerhouse specializing in innovative surgical medtech, orthopedics, and therapeutics."
      }
    ]
  },
  {
    fund_id: "fund-manulife-apac-reit",
    match_keywords: ["apac reit", "asia pacific reit"],
    fund_name: "Manulife Asia Pacific REIT Feeder Fund",
    target_fund: "Manulife Global Fund - Asia Pacific REIT Fund",
    target_fund_manager: "Manulife Investment Management",
    benchmark: "FTSE EPRA Nareit Asia ex-Japan REITs Index",
    top_10_weight: "45.00%",
    holdings: [
      {
        name: "CapitaLand Ascendas REIT",
        ticker: "A17U.SI",
        sector: "Singapore Industrial & Tech Parks",
        weight: "8.10%",
        description: "Singapore's first and largest business space and industrial REIT with data centers across the UK and Europe."
      },
      {
        name: "Link Real Estate Investment Trust",
        ticker: "0823.HK",
        sector: "Retail & Logistics (Hong Kong)",
        weight: "7.20%",
        description: "Asia's largest REIT managing essential community shopping centers, carparks, and fresh markets."
      },
      {
        name: "Nippon Prologis REIT Inc.",
        ticker: "3283.T",
        sector: "Japanese Modern Logistics",
        weight: "6.50%",
        description: "Focuses on state-of-the-art logistics facilities in Tokyo and Osaka metropolitan areas."
      },
      {
        name: "Goodman Group",
        ticker: "GMG.AX",
        sector: "Industrial Property & Data Centers",
        weight: "5.80%",
        description: "Leading global property group specializing in industrial property and hyper-scale powered data center campuses."
      }
    ]
  },
  {
    fund_id: "fund-atram-equity-opportunity",
    match_keywords: ["equity opportunity", "opportunity", "morgan stanley", "global equity opportunity", "atram-equity-opp"],
    fund_name: "ATRAM Global Equity Opportunity Feeder Fund",
    target_fund: "Morgan Stanley Investment Funds – Global Opportunity Fund",
    target_fund_manager: "Morgan Stanley Investment Management",
    benchmark: "MSCI All Country World Index (ACWI)",
    top_10_weight: "54.10%",
    holdings: [
      {
        name: "SK Hynix Inc.",
        ticker: "000660.KS",
        sector: "Information Technology / Memory Chips",
        weight: "9.67%",
        description: "Global leader in high-bandwidth memory (HBM) supply for AI hardware accelerators."
      },
      {
        name: "Taiwan Semiconductor (TSMC)",
        ticker: "TSM",
        sector: "Information Technology / Foundries",
        weight: "8.83%",
        description: "The world's largest semiconductor foundry, manufacturing chips for Apple, Nvidia, and AMD."
      },
      {
        name: "ServiceNow Inc.",
        ticker: "NOW",
        sector: "Information Technology / Enterprise Software",
        weight: "6.51%",
        description: "Enterprise cloud platform automating digital workflows and operational infrastructure."
      },
      {
        name: "Uber Technologies Inc.",
        ticker: "UBER",
        sector: "Consumer Discretionary / Mobility",
        weight: "6.33%",
        description: "Dominant global ride-hailing, freight logistics, and food delivery platform."
      },
      {
        name: "ASML Holding NV",
        ticker: "ASML",
        sector: "Information Technology / Semiconductor Equip.",
        weight: "5.64%",
        description: "Monopolistic Dutch manufacturer of Extreme Ultraviolet (EUV) lithography systems."
      },
      {
        name: "Meta Platforms Inc.",
        ticker: "META",
        sector: "Communication Services / Digital Ad",
        weight: "5.24%",
        description: "Global social media ecosystem across Facebook, Instagram, WhatsApp, and AI infrastructure."
      },
      {
        name: "Samsung Electronics Co.",
        ticker: "005930.KS",
        sector: "Information Technology / Hardware",
        weight: "4.51%",
        description: "Major global technology conglomerate specializing in DRAM memory, displays, and mobile devices."
      },
      {
        name: "Spotify Technology SA",
        ticker: "SPOT",
        sector: "Communication Services / Digital Media",
        weight: "4.26%",
        description: "World's leading audio streaming subscription platform with global user base."
      },
      {
        name: "Hermès International",
        ticker: "RMS.PA",
        sector: "Consumer Discretionary / Ultra-Luxury",
        weight: "3.81%",
        description: "Premier French ultra-luxury fashion house possessing extreme pricing power and margin stability."
      },
      {
        name: "DoorDash Inc.",
        ticker: "DASH",
        sector: "Consumer Discretionary / Local Logistics",
        weight: "3.67%",
        description: "Leading North American local commerce and on-demand delivery logistics platform."
      }
    ]
  }
];

/**
 * Resolves holdings for any fund record, with fallback to seed data registry
 */
export function getFundHoldingsData(fund) {
  if (!fund) return null;

  // 1. If fund already has structured non-empty top_holdings or topHoldings
  if (fund.top_holdings && Array.isArray(fund.top_holdings) && fund.top_holdings.length > 0) {
    return {
      targetFund: fund.targetFund || fund.target_fund || `${fund.name} (Underlying Portfolio)`,
      targetFundManager: fund.targetFundManager || fund.provider || 'Institutional Asset Manager',
      benchmark: fund.benchmark || 'Global Asset Benchmark',
      top10Weight: fund.top10Weight || fund.top_10_weight || '40.00%',
      holdings: fund.top_holdings
    };
  }

  if (fund.topHoldings && Array.isArray(fund.topHoldings) && fund.topHoldings.length > 0) {
    return {
      targetFund: fund.targetFund || fund.target_fund || `${fund.name} (Underlying Portfolio)`,
      targetFundManager: fund.targetFundManager || fund.provider || 'Institutional Asset Manager',
      benchmark: fund.benchmark || 'Global Asset Benchmark',
      top10Weight: fund.top10Weight || fund.top_10_weight || '40.00%',
      holdings: fund.topHoldings
    };
  }

  // 2. Match from static seed registry by ID
  const directMatch = SEED_HOLDINGS.find(s => s.fund_id === fund.id);
  if (directMatch) {
    return {
      targetFund: directMatch.target_fund,
      targetFundManager: directMatch.target_fund_manager,
      benchmark: directMatch.benchmark,
      top10Weight: directMatch.top_10_weight,
      holdings: directMatch.holdings
    };
  }

  // 3. Match from seed registry by name / keywords
  const nameLower = (fund.name || '').toLowerCase();
  const categoryLower = (fund.category || '').toLowerCase();

  const keywordMatch = SEED_HOLDINGS.find(s => {
    if (s.fund_name.toLowerCase() === nameLower) return true;
    if (s.match_keywords?.some(kw => nameLower.includes(kw) || categoryLower.includes(kw))) return true;
    return false;
  });

  if (keywordMatch) {
    return {
      targetFund: keywordMatch.target_fund,
      targetFundManager: keywordMatch.target_fund_manager,
      benchmark: keywordMatch.benchmark,
      top10Weight: keywordMatch.top_10_weight,
      holdings: keywordMatch.holdings
    };
  }

  // 4. Smart fallback for Bonds / Preferred
  if (nameLower.includes('bond') || categoryLower.includes('bond')) {
    return {
      targetFund: 'Philippine Fixed Income & Sovereign Debt Portfolio',
      targetFundManager: fund.provider || 'ATRAM Trust Corporation',
      benchmark: 'Bloomberg Sovereign Bond 1-5 Year Index',
      top10Weight: '85.50%',
      holdings: [
        { name: 'Republic of the Philippines 5-Yr Fixed Rate Treasury Bond (FXTN)', ticker: 'FXTN 05-77', sector: 'Sovereign Debt (Gov)', weight: '32.50%', description: 'Medium-term Philippine government bond paying semi-annual coupon distributions.' },
        { name: 'Republic of the Philippines 7-Yr Fixed Rate Treasury Bond (FXTN)', ticker: 'FXTN 07-68', sector: 'Sovereign Debt (Gov)', weight: '24.20%', description: 'Longer-duration sovereign debt holding stabilizing portfolio fixed income duration.' },
        { name: 'SMC Global Power Corp. Fixed Rate Bonds', ticker: 'SMCGP', sector: 'Corporate Debt / Energy', weight: '12.40%', description: 'High-grade corporate debt instrument issued by the Philippines largest independent power producer.' },
        { name: 'Ayala Land Inc. Corporate Bonds', ticker: 'ALI-CB', sector: 'Corporate Debt / Property', weight: '10.80%', description: 'Top-rated prime Philippine corporate bond offering resilient coupon payments.' },
        { name: 'Cash & BSP Overnight Repos', ticker: 'BSP-REPO', sector: 'Central Bank Liquidity', weight: '5.60%', description: 'Cash equivalents for redemption liquidity.' }
      ]
    };
  }

  return {
    targetFund: fund.targetFund || fund.target_fund || `${fund.name} (Underlying Portfolio)`,
    targetFundManager: fund.provider || 'Institutional Asset Manager',
    benchmark: fund.benchmark || 'Global Asset Benchmark',
    top10Weight: '40.00%',
    holdings: []
  };
}
