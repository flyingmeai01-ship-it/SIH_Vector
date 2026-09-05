"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// --- Language Configuration ---
const LANGUAGES = [
  { code: "en", label: "English", tts: "en-IN" },
  { code: "hi", label: "Hindi", tts: "hi-IN" }
];

// --- Scenarios Data with Translations ---
const CATEGORIES = [
  {
    id: "bihu",
    title: "Bihu Celebrations",
    icon: "🌾",
    color: "bg-amber-100 text-amber-800",
    scenarios: [
      {
        emotion: "Happy",
        translations: {
          en: "It's the first day of Bihu! The sweet smell of pitha fills the air, and everyone is gathering to dance in the open fields.",
          hi: "यह बिहू का पहला दिन है! हवा में पीठा की मीठी महक है, और सभी खुले मैदानों में नृत्य करने के लिए इकट्ठा हो रहे हैं।"
        }
      },
      {
        emotion: "Surprised",
        translations: {
          en: "A friend unexpectedly arrives at your door with a beautiful hand-woven Bihuwan (gamosa) they made just for you!",
          hi: "एक दोस्त अप्रत्याशित रूप से आपके दरवाजे पर आता है, और आपके लिए उनके द्वारा बनाया गया एक सुंदर हाथ से बुना हुआ बिहूवान (गमोसा) लाता है!"
        }
      },
      {
        emotion: "Calm",
        translations: {
          en: "The evening fire (Meji) is glowing warmly in the distance. The crackling wood sounds very peaceful.",
          hi: "दूर जलती हुई मेजी (अलाव) की हल्की आंच में आपको सुकून महसूस होता है। लकड़ी के जलने की आवाज़ बहुत शांति देती है।"
        }
      },
      {
        emotion: "Happy",
        translations: {
          en: "Children are running around the courtyard, laughing and playing traditional Bihu games.",
          hi: "बच्चे आंगन में दौड़ रहे हैं, पारंपरिक बिहू खेल खेलते हुए हंस रहे हैं।"
        }
      },
      {
        emotion: "Happy",
        translations: {
          en: "You sit down to a grand feast with your family, enjoying fresh doi, chira, and gur.",
          hi: "आप अपने परिवार के साथ एक शानदार दावत के लिए बैठते हैं, और ताज़े दही, चिउरा और गुड़ का आनंद लेते हैं।"
        }
      }
    ]
  },
  {
    id: "hornbill",
    title: "Hornbill Festival",
    icon: "🪶",
    color: "bg-red-100 text-red-800",
    scenarios: [
      {
        emotion: "Calm",
        translations: {
          en: "You are sitting quietly on the porch during the Hornbill festival, listening to the gentle hum of traditional folk songs.",
          hi: "आप हॉर्नबिल उत्सव के दौरान पोर्च पर चुपचाप बैठे हैं, पारंपरिक लोक गीतों की कोमल धुन सुन रहे हैं।"
        }
      },
      {
        emotion: "Happy",
        translations: {
          en: "You watch the vibrant traditional dances, and the rhythmic beat of the log drums fills you with energy.",
          hi: "आप जीवंत पारंपरिक नृत्य देखते हैं, और ढोल की लयबद्ध थाप आपको ऊर्जा से भर देती है।"
        }
      },
      {
        emotion: "Surprised",
        translations: {
          en: "A performer wearing an incredibly colorful and large traditional headdress walks right past you!",
          hi: "अविश्वसनीय रूप से रंगीन और बड़ा पारंपरिक हेडड्रेस पहने एक कलाकार ठीक आपके पास से गुजरता है!"
        }
      },
      {
        emotion: "Calm",
        translations: {
          en: "The sun is setting over the heritage village, casting a gentle golden light over the thatched roofs.",
          hi: "विरासत गांव पर सूरज ढल रहा है, जो फूस की छतों पर एक कोमल सुनहरी रोशनी डाल रहा है।"
        }
      },
      {
        emotion: "Happy",
        translations: {
          en: "You taste a delicious traditional bamboo shoot dish that brings back fond memories.",
          hi: "आप एक स्वादिष्ट पारंपरिक बांस के अंकुर से बना व्यंजन चखते हैं जो पुरानी यादें ताजा कर देता है।"
        }
      }
    ]
  },
  {
    id: "harvest",
    title: "Harvest Feast",
    icon: "🍲",
    color: "bg-green-100 text-green-800",
    scenarios: [
      {
        emotion: "Happy",
        translations: {
          en: "The evening feast is ready. Your family sits together, sharing stories and laughter under the lanterns.",
          hi: "शाम की दावत तैयार है। आपका परिवार एक साथ बैठा है, लालटेन की रोशनी में कहानियाँ साझा कर रहा है और हँस रहा है।"
        }
      },
      {
        emotion: "Calm",
        translations: {
          en: "Looking out over the golden fields, you see the successful harvest waving gently in the breeze.",
          hi: "सुनहरे खेतों को देखते हुए, आप देखते हैं कि सफल फसल हवा में धीरे-धीरे लहरा रही है।"
        }
      },
      {
        emotion: "Surprised",
        translations: {
          en: "Your grandchildren present you with a beautiful woven basket they made from the first harvest.",
          hi: "आपके पोते-पोतियां आपको पहली फसल से बनी एक खूबसूरत टोकरी भेंट करते हैं।"
        }
      },
      {
        emotion: "Happy",
        translations: {
          en: "Neighbors bring over plates of sweets to share the joy of a good season.",
          hi: "पड़ोसी एक अच्छे मौसम की खुशी साझा करने के लिए मिठाइयों की प्लेट लाते हैं।"
        }
      },
      {
        emotion: "Calm",
        translations: {
          en: "You sit back with a warm cup of tea after a long, satisfying day of celebration.",
          hi: "जश्न के एक लंबे, संतोषजनक दिन के बाद आप एक गर्म कप चाय के साथ आराम से बैठते हैं।"
        }
      }
    ]
  }
];

const EMOTIONS = [
  { label: "Happy", emoji: "😊", color: "bg-amber-100 text-amber-700 border-amber-300" },
  { label: "Calm", emoji: "😌", color: "bg-teal-100 text-teal-700 border-teal-300" },
  { label: "Surprised", emoji: "😲", color: "bg-purple-100 text-purple-700 border-purple-300" }
];

export default function FestivalFacesHub() {
  const router = useRouter();
  
  // -- App State --
  const [activeLang, setActiveLang] = useState("en");
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // -- Game State --
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect'
  const [score, setScore] = useState(0);

  // --- Voice Logic (Calmer & Localized) ---
  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    // Extremely calm, slow, and soothing voice settings
    utterance.rate = 0.75; 
    utterance.pitch = 0.9; 
    
    // Set language for TTS
    const langConfig = LANGUAGES.find(l => l.code === activeLang);
    if (langConfig) utterance.lang = langConfig.tts;
    
    // Attempt to find a soft female local voice if available
    const voices = window.speechSynthesis.getVoices();
    const localVoice = voices.find(v => v.lang === utterance.lang && v.name.toLowerCase().includes("female"));
    if (localVoice) utterance.voice = localVoice;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
  };

  // Ensure voices are loaded (Chrome quirk)
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Play audio automatically when navigating to a new question
  useEffect(() => {
    if (selectedCategory && selectedCategory.scenarios[currentIndex]) {
      const scenarioText = selectedCategory.scenarios[currentIndex].translations[activeLang] || selectedCategory.scenarios[currentIndex].translations.en;
      speak(scenarioText);
    }
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [currentIndex, selectedCategory, activeLang]);

  // --- Handlers ---
  const handleSelectEmotion = (emotionLabel) => {
    if (feedback === "correct") return;

    const currentScenario = selectedCategory.scenarios[currentIndex];

    if (emotionLabel === currentScenario.emotion) {
      setFeedback("correct");
      setScore(s => s + 1);
      
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      
      setTimeout(() => {
        setFeedback(null);
        if (currentIndex < selectedCategory.scenarios.length - 1) {
          setCurrentIndex(i => i + 1);
        } else {
          setCurrentIndex(-1); // Game Complete
        }
      }, 2000);
    } else {
      setFeedback("incorrect");
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const startCategory = (category) => {
    setSelectedCategory(category);
    setCurrentIndex(0);
    setScore(0);
    setFeedback(null);
  };

  const quitToHub = () => {
    setSelectedCategory(null);
    setCurrentIndex(0);
    setScore(0);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  };


  // ── View 1: Game Complete ──
  if (selectedCategory && currentIndex === -1) {
    return (
      <main className="min-h-dvh flex flex-col relative bg-elder-canvas p-6 items-center justify-center text-center">
        <div className="bg-elder-card rounded-3xl p-8 shadow-xl max-w-md w-full animate-splash-logo-pop">
          <span className="text-7xl block mb-4">🎉</span>
          <h1 className="text-3xl font-black text-elder-navy mb-2">Wonderful!</h1>
          <p className="text-lg text-elder-text mb-6">You identified all emotions in {selectedCategory.title}.</p>
          <p className="text-2xl font-bold text-elder-teal mb-8">Score: {score} / {selectedCategory.scenarios.length}</p>
          <button
            onClick={quitToHub}
            className="w-full py-4 bg-elder-teal text-elder-card font-bold rounded-xl shadow-md text-lg active:scale-95 transition-transform"
          >
            Back to Categories
          </button>
        </div>
      </main>
    );
  }

  // ── View 2: Gameplay ──
  if (selectedCategory) {
    const currentScenario = selectedCategory.scenarios[currentIndex];
    const scenarioText = currentScenario.translations[activeLang] || currentScenario.translations.en; // Fallback to English if missing

    return (
      <main className="min-h-dvh flex flex-col relative bg-elder-canvas">
        <div className="relative z-10 flex flex-col flex-1 w-full max-w-md mx-auto px-5 py-6">
          
          <header className="flex items-center justify-between mb-8">
            <button
              onClick={quitToHub}
              className="w-12 h-12 bg-white border border-elder-muted/20 shadow-sm rounded-2xl flex items-center justify-center text-elder-text hover:shadow-md transition-all active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-elder-text">{selectedCategory.title}</h1>
              <p className="text-sm text-elder-teal font-bold">{currentIndex + 1} of {selectedCategory.scenarios.length}</p>
            </div>
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center font-bold text-elder-teal">
              {score}
            </div>
          </header>

          <div className="bg-elder-card rounded-3xl shadow-md p-6 mb-8 text-center relative border border-elder-muted/10">
            {feedback === "correct" && (
               <div className="absolute inset-0 bg-green-500 rounded-3xl flex items-center justify-center z-20 animate-splash-logo-pop">
                 <span className="text-6xl text-white">✅</span>
               </div>
            )}
            
            <button 
              onClick={() => speak(scenarioText)}
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 transition-all shadow-sm active:scale-95 ${
                isPlaying ? "bg-elder-teal text-white animate-pulse" : "bg-elder-canvas text-elder-teal"
              }`}
            >
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            
            <p className="text-lg sm:text-xl font-bold text-elder-navy leading-relaxed">
              "{scenarioText}"
            </p>
          </div>

          <h2 className="text-center font-bold text-elder-text mb-4 text-lg">How do you feel?</h2>
          <div className="grid grid-cols-3 gap-3">
            {EMOTIONS.map((emotion) => (
              <div
                key={emotion.label}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectEmotion(emotion.label)}
                className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all active:scale-95 cursor-pointer touch-manipulation ${emotion.color} ${
                  feedback === "incorrect" ? "opacity-50" : "hover:shadow-md"
                }`}
              >
                <span className="text-5xl mb-2 block pointer-events-none">{emotion.emoji}</span>
                <span className="font-bold text-sm pointer-events-none">{emotion.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ── View 3: Hub / Category Selection ──
  return (
    <main className="min-h-dvh flex flex-col relative bg-elder-canvas">
      <div className="relative z-10 flex flex-col flex-1 w-full max-w-md mx-auto px-5 py-6">
        
        {/* Hub Header */}
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/games")}
            className="w-12 h-12 bg-white border border-elder-muted/20 shadow-sm rounded-2xl flex items-center justify-center text-elder-text hover:shadow-md transition-all active:scale-95"
            aria-label="Go Back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-elder-text">Festival Faces</h1>
          </div>
          <div className="w-12 h-12" />
        </header>

        {/* Language Selector */}
        <div className="bg-elder-card rounded-2xl p-4 shadow-sm mb-6">
          <label className="block text-xs font-bold text-elder-teal uppercase tracking-wide mb-2">
            Select Regional Language
          </label>
          <select 
            value={activeLang}
            onChange={(e) => setActiveLang(e.target.value)}
            className="w-full bg-elder-canvas border border-elder-muted/20 text-elder-navy font-bold rounded-xl p-3 focus:outline-none focus:border-elder-teal"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-elder-muted mt-2 font-medium">
            *Audio pronunciation depends on your device's installed text-to-speech voices.
          </p>
        </div>

        {/* Categories List */}
        <h2 className="font-bold text-elder-navy text-lg mb-4">Choose a Scenario</h2>
        <div className="space-y-4">
          {CATEGORIES.map(category => (
            <div
              key={category.id}
              role="button"
              tabIndex={0}
              onClick={() => startCategory(category)}
              className={`w-full text-left flex items-center p-5 rounded-3xl transition-transform active:scale-95 shadow-sm border border-transparent hover:border-black/5 cursor-pointer touch-manipulation ${category.color}`}
            >
              <span className="text-4xl mr-4">{category.icon}</span>
              <div className="flex-1 pointer-events-none">
                <h3 className="font-bold text-lg">{category.title}</h3>
                <p className="text-sm opacity-80 font-medium">{category.scenarios.length} Scenarios</p>
              </div>
              <svg className="w-6 h-6 ml-auto opacity-50 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
