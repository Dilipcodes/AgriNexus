/**
 * AgriNexus / FarmAI - Multilingual Translation Engine (EN, HI, BN, MR, TE)
 *
 * Combines:
 * 1. Instant offline dictionary for core agricultural UI strings.
 * 2. Live neural translation fallback (Google GTX) with localStorage caching for dynamic content.
 * 3. React-safe TextNode & placeholder synchronization via MutationObserver.
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'EN', label: 'English (EN)', native: 'English', tl: 'en' },
  { code: 'HI', label: 'हिंदी (HI)', native: 'हिंदी', tl: 'hi' },
  { code: 'BN', label: 'বাংলা (BN)', native: 'বাংলা', tl: 'bn' },
  { code: 'MR', label: 'मराठी (MR)', native: 'मराठी', tl: 'mr' },
  { code: 'TE', label: 'తెలుగు (TE)', native: 'తెలుగు', tl: 'te' }
];

const STATIC_DICTIONARY = {
  HI: {
    'Smarter Farming, Brighter Tomorrow': 'स्मार्ट खेती, उज्ज्वल कल',
    'Find the right crop': 'सही फसल चुनें',
    'for your land': 'अपनी भूमि के लिए',
    'Analyze your land using satellite, weather, soil and local crop data.':
      'उपग्रह, मौसम, मिट्टी और स्थानीय फसल डेटा का उपयोग करके अपनी भूमि का विश्लेषण करें।',
    'Satellite Land Analysis': 'उपग्रह भूमि विश्लेषण',
    'Local Crop Intelligence': 'स्थानीय फसल बुद्धिमत्ता',
    'Smart Crop Recommendation': 'स्मार्ट फसल अनुशंसा',
    'Detect My Land': 'मेरी भूमि खोजें',
    'Select Your Farm': 'अपना खेत चुनें',
    'Location Detected': 'स्थान की पहचान हुई',
    'Change Location': 'स्थान बदलें',
    'Area': 'क्षेत्रफल',
    'Coordinates': 'निर्देशांक',
    'Adjust Land Size (Acres)': 'भूमि का आकार बदलें (एकड़)',
    'Adjust Boundary Corners': 'सीमा के कोने समायोजित करें',
    'Finish Adjusting Corners': 'समायोजन पूर्ण करें',
    'Analyze This Land': 'इस भूमि का विश्लेषण करें',
    'Analyzing Your Land': 'आपकी भूमि का विश्लेषण हो रहा है',
    'Land & Soil Analysis': 'भूमि और मिट्टी विश्लेषण',
    'Land Analysis Report': 'भूमि विश्लेषण रिपोर्ट',
    'Key Insights': 'प्रमुख जानकारी',
    'Temperature': 'तापमान',
    'Soil Moisture': 'मिट्टी की नमी',
    'Annual Rainfall': 'वार्षिक वर्षा',
    'Overview': 'सारांश',
    'Soil': 'मिट्टी',
    'Climate': 'जलवायु',
    'Proceed to Cropping Pattern': 'फसल पैटर्न पर आगे बढ़ें',
    'View Full Analysis': 'पूरा विश्लेषण देखें',
    'Local Cropping Pattern': 'स्थानीय फसल पैटर्न',
    'View Market & Mandi Prices': 'मंडी और बाजार भाव देखें',
    'Nearby Mandi Prices': 'नजदीकी मंडी भाव',
    'See Recommended Crops': 'अनुशंसित फसलें देखें',
    'Top Recommended Crops': 'शीर्ष अनुशंसित फसलें',
    'Ask AI Farm Copilot': 'एआई फार्म कोपायलट से पूछें',
    'Ask FarmAI': 'फार्म एआई से पूछें',
    'What-If Scenario Simulator': 'क्या-अगर परिदृश्य सिम्युलेटर',
    'Personalized Farm Plan': 'व्यक्तिगत कृषि योजना',
    'Crop Disease Detection': 'फसल रोग पहचान',
    'Analyze Disease': 'रोग का विश्लेषण करें',
    'Regional Agriculture Dashboard': 'क्षेत्रीय कृषि डैशबोर्ड',
    'Farmer Login': 'किसान लॉगिन',
    'Create Account': 'खाता बनाएं',
    'Navigation Tabs': 'नेविगेशन टैब',
    'Module Switcher': 'मॉड्यूल स्विचर',
    'Execution Mode': 'निष्पादन मोड',
    'Tabs': 'टैब्स',
    'Rice': 'धान (चावल)',
    'Wheat': 'गेहूं',
    'Maize': 'मक्का'
  },
  BN: {
    'Smarter Farming, Brighter Tomorrow': 'স্মার্ট কৃষি, উজ্জ্বল আগামী',
    'Find the right crop': 'সঠিক ফসল খুঁজুন',
    'for your land': 'আপনার জমির জন্য',
    'Analyze your land using satellite, weather, soil and local crop data.':
      'স্যাটেলাইট, আবহাওয়া, মাটি এবং স্থানীয় ফসলের তথ্য ব্যবহার করে আপনার জমি বিশ্লেষণ করুন।',
    'Satellite Land Analysis': 'স্যাটেলাইট জমি বিশ্লেষণ',
    'Local Crop Intelligence': 'স্থানীয় ফসল বুদ্ধিমত্তা',
    'Smart Crop Recommendation': 'স্মার্ট ফসল সুপারিশ',
    'Detect My Land': 'আমার জমি শনাক্ত করুন',
    'Select Your Farm': 'আপনার খামার নির্বাচন করুন',
    'Location Detected': 'অবস্থান শনাক্ত হয়েছে',
    'Change Location': 'অবস্থান পরিবর্তন করুন',
    'Area': 'আয়তন',
    'Coordinates': 'স্থানাঙ্ক',
    'Adjust Land Size (Acres)': 'জমির আকার পরিবর্তন করুন (একর)',
    'Adjust Boundary Corners': 'সীমানা কোণ সামঞ্জস্য করুন',
    'Finish Adjusting Corners': 'সামঞ্জস্য সম্পন্ন করুন',
    'Analyze This Land': 'এই জমি বিশ্লেষণ করুন',
    'Analyzing Your Land': 'আপনার জমি বিশ্লেষণ করা হচ্ছে',
    'Land & Soil Analysis': 'জমি ও মাটি বিশ্লেষণ',
    'Land Analysis Report': 'জমি বিশ্লেষণ রিপোর্ট',
    'Key Insights': 'মূল তথ্য',
    'Temperature': 'তাপমাত্রা',
    'Soil Moisture': 'মাটির আর্দ্রতা',
    'Annual Rainfall': 'বার্ষিক বৃষ্টিপাত',
    'Overview': 'সংক্ষিপ্ত বিবরণ',
    'Soil': 'মাটি',
    'Climate': 'জলবায়ু',
    'Proceed to Cropping Pattern': 'ফসলের ধরনে এগিয়ে যান',
    'View Full Analysis': 'সম্পূর্ণ বিশ্লেষণ দেখুন',
    'Local Cropping Pattern': 'স্থানীয় ফসলের ধরন',
    'View Market & Mandi Prices': 'বাজার ও মান্ডি দর দেখুন',
    'Nearby Mandi Prices': 'কাছাকাছি মান্ডি দর',
    'See Recommended Crops': 'সুপারিশকৃত ফসল দেখুন',
    'Top Recommended Crops': 'শীর্ষ সুপারিশকৃত ফসল',
    'Ask AI Farm Copilot': 'এআই ফার্ম কোপাইলটকে জিজ্ঞাসা করুন',
    'Ask FarmAI': 'ফার্ম এআই-কে জিজ্ঞাসা করুন',
    'What-If Scenario Simulator': 'হোয়াট-ইফ সিমুলেটর',
    'Personalized Farm Plan': 'ব্যক্তিগত কৃষি পরিকল্পনা',
    'Crop Disease Detection': 'ফসলের রোগ নির্ণয়',
    'Analyze Disease': 'রোগ বিশ্লেষণ করুন',
    'Regional Agriculture Dashboard': 'আঞ্চলিক কৃষি ড্যাশবোর্ড',
    'Farmer Login': 'কৃষক লগইন',
    'Create Account': 'অ্যাকাউন্ট তৈরি করুন',
    'Navigation Tabs': 'নেভিগেশন ট্যাব',
    'Module Switcher': 'মডিউল সুইচার',
    'Execution Mode': 'এক্সিকিউশন মোড',
    'Tabs': 'ট্যাব',
    'Rice': 'ধান (চাল)',
    'Wheat': 'গম',
    'Maize': 'ভুট্টা'
  },
  MR: {
    'Smarter Farming, Brighter Tomorrow': 'स्मार्ट शेती, उज्ज्वल भविष्य',
    'Find the right crop': 'योग्य पीक निवडा',
    'for your land': 'तुमच्या जमिनीसाठी',
    'Analyze your land using satellite, weather, soil and local crop data.':
      'उपग्रह, हवामान, माती आणि स्थानिक पीक डेटा वापरून तुमच्या जमिनीचे विश्लेषण करा.',
    'Satellite Land Analysis': 'उपग्रह जमीन विश्लेषण',
    'Local Crop Intelligence': 'स्थानिक पीक माहिती',
    'Smart Crop Recommendation': 'स्मार्ट पीक शिफारस',
    'Detect My Land': 'माझी जमीन शोधा',
    'Select Your Farm': 'तुमचे शेत निवडा',
    'Location Detected': 'स्थान ओळखले गेले',
    'Change Location': 'स्थान बदला',
    'Area': 'क्षेत्रफळ',
    'Coordinates': 'निर्देशांक',
    'Adjust Land Size (Acres)': 'जमिनीचा आकार बदला (एकर)',
    'Adjust Boundary Corners': 'सीमेचे कोपरे समायोजित करा',
    'Finish Adjusting Corners': 'समायोजन पूर्ण करा',
    'Analyze This Land': 'या जमिनीचे विश्लेषण करा',
    'Analyzing Your Land': 'तुमच्या जमिनीचे विश्लेषण होत आहे',
    'Land & Soil Analysis': 'जमीन आणि माती विश्लेषण',
    'Land Analysis Report': 'जमीन विश्लेषण अहवाल',
    'Key Insights': 'महत्त्वाची माहिती',
    'Temperature': 'तापमान',
    'Soil Moisture': 'मातीतील ओलावा',
    'Annual Rainfall': 'वार्षिक पाऊस',
    'Overview': 'आढावा',
    'Soil': 'माती',
    'Climate': 'हवामान',
    'Proceed to Cropping Pattern': 'पीक पद्धतीकडे पुढे जा',
    'View Full Analysis': 'पूर्ण विश्लेषण पहा',
    'Local Cropping Pattern': 'स्थानिक पीक पद्धती',
    'View Market & Mandi Prices': 'बाजार आणि मंडी भाव पहा',
    'Nearby Mandi Prices': 'जवळपासचे मंडी भाव',
    'See Recommended Crops': 'शिफारस केलेली पिके पहा',
    'Top Recommended Crops': 'सर्वोत्तम शिफारस केलेली पिके',
    'Ask AI Farm Copilot': 'एआय फार्म कोपायलटला विचारा',
    'Ask FarmAI': 'फार्म एआयला विचारा',
    'What-If Scenario Simulator': 'पर्यायी पीक सिम्युलेटर',
    'Personalized Farm Plan': 'वैयक्तिक शेती नियोजन',
    'Crop Disease Detection': 'पीक रोग निदान',
    'Analyze Disease': 'रोगाचे विश्लेषण करा',
    'Regional Agriculture Dashboard': 'प्रादेशिक कृषी डॅशबोर्ड',
    'Farmer Login': 'शेतकरी लॉगिन',
    'Create Account': 'खाते तयार करा',
    'Navigation Tabs': 'नेव्हिगेशन टॅब',
    'Module Switcher': 'मॉड्यूल स्विचर',
    'Execution Mode': 'कार्य मोड',
    'Tabs': 'टॅब्स',
    'Rice': 'भात (तांदूळ)',
    'Wheat': 'गहू',
    'Maize': 'मका'
  },
  TE: {
    'Smarter Farming, Brighter Tomorrow': 'స్మార్ట్ వ్యవసాయం, উజ్వల భవిష్యత్తు',
    'Find the right crop': 'సరైన పంటను కనుగొనండి',
    'for your land': 'మీ భూమి కోసం',
    'Analyze your land using satellite, weather, soil and local crop data.':
      'উপగ్రహ, వాతావరణం, నేల మరియు స్థానిక పంట డేటాను ఉపయోగించి మీ భూమిని విశ్లేషించండి.',
    'Satellite Land Analysis': 'উপగ్రహ భూ విశ్లేషణ',
    'Local Crop Intelligence': 'స్థానిక పంట సమాచారం',
    'Smart Crop Recommendation': 'స్మార్ట్ పంట సిఫార్సు',
    'Detect My Land': 'నా భూమిని గుర్తించండి',
    'Select Your Farm': 'మీ పొలాన్ని ఎంచుకోండి',
    'Location Detected': 'స్థానం గుర్తించబడింది',
    'Change Location': 'స్థానాన్ని మార్చండి',
    'Area': 'విస్తీర్ణం',
    'Coordinates': 'నిరూపకాలు',
    'Adjust Land Size (Acres)': 'భూమి పరిమాణాన్ని మార్చండి (ఎకరాలు)',
    'Adjust Boundary Corners': 'సరిహద్దు మూలలను సర్దుబాటు చేయండి',
    'Finish Adjusting Corners': 'సర్దుబాటు పూర్తి చేయండి',
    'Analyze This Land': 'ఈ భూమిని విశ్లేషించండి',
    'Analyzing Your Land': 'మీ భూమిని విశ్లేషిస్తోంది',
    'Land & Soil Analysis': 'భూమి & నేల విశ్లేషణ',
    'Land Analysis Report': 'భూ విశ్లేషణ నివేదిక',
    'Key Insights': 'ముఖ్య వివరాలు',
    'Temperature': 'ఉష్ణోగ్రత',
    'Soil Moisture': 'నేల తేమ',
    'Annual Rainfall': 'వార్షిక వర్షపాతం',
    'Overview': 'అవలోకనం',
    'Soil': 'నేల',
    'Climate': 'వాతావరణం',
    'Proceed to Cropping Pattern': 'పంట సరళికి వెళ్లండి',
    'View Full Analysis': 'పూర్తి విశ్లేషణ చూడండి',
    'Local Cropping Pattern': 'స్థానిక పంట సరళి',
    'View Market & Mandi Prices': 'మార్కెట్ & మండీ ధరలు చూడండి',
    'Nearby Mandi Prices': 'సమీప మండీ ధరలు',
    'See Recommended Crops': 'సిఫార్సు చేసిన పంటలను చూడండి',
    'Top Recommended Crops': 'ఉత్తమ సిఫార్సు చేసిన పంటలు',
    'Ask AI Farm Copilot': 'AI ఫార్మ్ కోపైలట్‌ని అడగండి',
    'Ask FarmAI': 'ఫార్మ్ AIని అడగండి',
    'What-If Scenario Simulator': 'వాట్-ఇఫ్ సిమ్యులేటర్',
    'Personalized Farm Plan': 'వ్యక్తిగతీకరించిన వ్యవసాయ ప్రణాళిక',
    'Crop Disease Detection': 'పంట వ్యాధి గుర్తింపు',
    'Analyze Disease': 'వ్యాధిని విశ్లేషించండి',
    'Regional Agriculture Dashboard': 'ప్రాంతీయ వ్యవసాయ డాష్‌బోర్డ్',
    'Farmer Login': 'రైతు లాగిన్',
    'Create Account': 'ఖాతాను సృష్టించండి',
    'Navigation Tabs': 'నావిగేషన్ ట్యాబ్‌లు',
    'Module Switcher': 'మాడ్యూల్ స్విచర్',
    'Execution Mode': 'ఎగ్జిక్యూషన్ మోడ్',
    'Tabs': 'ట్యాబ్‌లు',
    'Rice': 'వరి (బియ్యం)',
    'Wheat': 'గోధుమ',
    'Maize': 'మొక్కజొన్న'
  }
};

// Runtime translation cache: { HI: { "English text": "Translated text" }, ... }
const runtimeCache = { HI: {}, BN: {}, MR: {}, TE: {} };

try {
  const savedCache = localStorage.getItem('agrinexus_i18n_cache_v1');
  if (savedCache) {
    const parsed = JSON.parse(savedCache);
    for (const k of ['HI', 'BN', 'MR', 'TE']) {
      if (parsed[k]) Object.assign(runtimeCache[k], parsed[k]);
    }
  }
} catch {
  // Ignore localStorage read errors
}

function saveCacheToStorage() {
  try {
    localStorage.setItem('agrinexus_i18n_cache_v1', JSON.stringify(runtimeCache));
  } catch {
    // Ignore quota errors
  }
}

// WeakMap storing original English text for each DOM Text node
const textNodeOriginals = new WeakMap();
// Set of all known translated values so we don't overwrite original English text with a translation
const knownTranslations = new Set();
for (const langDict of Object.values(STATIC_DICTIONARY)) {
  for (const val of Object.values(langDict)) {
    knownTranslations.add(val);
  }
}

let currentLanguage = localStorage.getItem('agrinexus_lang') || 'EN';
const listeners = new Set();

export function getCurrentLanguage() {
  return currentLanguage;
}

export function setCurrentLanguage(langCode) {
  if (!SUPPORTED_LANGUAGES.some((l) => l.code === langCode)) return;
  currentLanguage = langCode;
  try {
    localStorage.setItem('agrinexus_lang', langCode);
  } catch {
    // Ignore storage errors
  }
  listeners.forEach((fn) => fn(langCode));
}

export function subscribeLanguage(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Determine whether a string should be translated (skip numbers, symbols, codes)
function isTranslatableText(str) {
  if (!str) return false;
  const trimmed = str.trim();
  if (trimmed.length < 2) return false;
  // Skip pure numbers, coordinates, units like "27.4°C", "9:41", "10 / 11"
  if (/^[0-9.,:%°/\-+₹$()\s•➔]+$/.test(trimmed)) return false;
  // Must contain at least two Latin letters to be English source text
  if (!/[A-Za-z]{2,}/.test(trimmed)) return false;
  // Skip language selector codes
  if (['EN', 'HI', 'BN', 'MR', 'TE', 'DEMO', 'REAL'].includes(trimmed)) return false;
  return true;
}

async function fetchLiveTranslation(text, langCode) {
  const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
  if (!langObj || langCode === 'EN') return text;

  if (STATIC_DICTIONARY[langCode]?.[text]) {
    return STATIC_DICTIONARY[langCode][text];
  }
  if (runtimeCache[langCode]?.[text]) {
    return runtimeCache[langCode][text];
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${
      langObj.tl
    }&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map((part) => part[0]).join('');
        if (translated) {
          runtimeCache[langCode][text] = translated;
          knownTranslations.add(translated.trim());
          saveCacheToStorage();
          return translated;
        }
      }
    }
  } catch {
    // Fallback to original text if offline
  }
  return text;
}

/**
 * Translates all text nodes and input placeholders inside a root DOM element.
 */
export async function translateDOMSubtree(rootEl, langCode) {
  if (!rootEl) return;

  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'CODE') {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const textNodes = [];
  let currentNode = walker.nextNode();
  while (currentNode) {
    textNodes.push(currentNode);
    currentNode = walker.nextNode();
  }

  // Also handle input/textarea placeholders
  const inputs = rootEl.querySelectorAll('input[placeholder], textarea[placeholder]');
  inputs.forEach((inp) => {
    const currentPlaceholder = inp.getAttribute('placeholder') || '';
    if (!inp.dataset.origPlaceholder && isTranslatableText(currentPlaceholder)) {
      inp.dataset.origPlaceholder = currentPlaceholder;
    }
    const orig = inp.dataset.origPlaceholder;
    if (!orig) return;

    if (langCode === 'EN') {
      if (inp.getAttribute('placeholder') !== orig) {
        inp.setAttribute('placeholder', orig);
      }
    } else {
      const cached = STATIC_DICTIONARY[langCode]?.[orig] || runtimeCache[langCode]?.[orig];
      if (cached) {
        inp.setAttribute('placeholder', cached);
      } else {
        fetchLiveTranslation(orig, langCode).then((tr) => {
          if (getCurrentLanguage() === langCode && tr) {
            inp.setAttribute('placeholder', tr);
          }
        });
      }
    }
  });

  const pendingToFetch = new Map();

  for (const node of textNodes) {
    const val = node.nodeValue;
    if (!val || !val.trim()) continue;

    const trimmed = val.trim();
    let orig = textNodeOriginals.get(node);

    // If React updated the text node with a new English value, update the stored original
    if (!orig || (!knownTranslations.has(trimmed) && isTranslatableText(trimmed) && trimmed !== orig.trim())) {
      if (isTranslatableText(trimmed)) {
        orig = val;
        textNodeOriginals.set(node, val);
      }
    }

    if (!orig) continue;

    const origTrimmed = orig.trim();
    const leadingSpace = orig.match(/^\s*/)?.[0] || '';
    const trailingSpace = orig.match(/\s*$/)?.[0] || '';

    if (langCode === 'EN') {
      if (node.nodeValue !== orig) {
        node.nodeValue = orig;
      }
      continue;
    }

    // Check instant dictionary or runtime cache first
    const instant =
      STATIC_DICTIONARY[langCode]?.[origTrimmed] || runtimeCache[langCode]?.[origTrimmed];

    if (instant) {
      knownTranslations.add(instant.trim());
      const nextVal = `${leadingSpace}${instant}${trailingSpace}`;
      if (node.nodeValue !== nextVal) {
        node.nodeValue = nextVal;
      }
    } else if (isTranslatableText(origTrimmed)) {
      if (!pendingToFetch.has(origTrimmed)) {
        pendingToFetch.set(origTrimmed, []);
      }
      pendingToFetch.get(origTrimmed).push({ node, leadingSpace, trailingSpace });
    }
  }

  // Fetch any uncached dynamic strings in parallel batches
  if (langCode !== 'EN' && pendingToFetch.size > 0) {
    const entries = Array.from(pendingToFetch.entries());
    await Promise.all(
      entries.map(async ([origTrimmed, targets]) => {
        const translated = await fetchLiveTranslation(origTrimmed, langCode);
        if (getCurrentLanguage() !== langCode) return;
        for (const { node, leadingSpace, trailingSpace } of targets) {
          const nextVal = `${leadingSpace}${translated}${trailingSpace}`;
          if (node.nodeValue !== nextVal) {
            node.nodeValue = nextVal;
          }
        }
      })
    );
  }
}
