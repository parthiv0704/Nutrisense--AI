const CALENDARS = [
  "en.indian#holiday@group.v.calendar.google.com",
  "en.hinduism#holiday@group.v.calendar.google.com",
  "en.islamic#holiday@group.v.calendar.google.com",
  "en.christian#holiday@group.v.calendar.google.com"
];

const FESTIVAL_META = [
  {
    keywords: ["navratri", "navaratri"],
    type: "fast",
    fastingRules: "No onion, garlic, grains. Allowed: sabudana, kuttu atta, singhare atta, sendha namak, fruits, dairy, potatoes, sweet potato"
  },
  {
    keywords: ["ekadashi"],
    type: "fast",
    fastingRules: "No grains, no beans, no non-veg. Allowed: fruits, milk, nuts, sabudana, rajgira"
  },
  {
    keywords: ["karva chauth", "karwa chauth"],
    type: "fast",
    fastingRules: "Full day fast until moonrise. Break fast with water and sweets. Pre-fast: mathri, phenia, halwa"
  },
  {
    keywords: ["ramadan", "ramzan"],
    type: "fast",
    fastingRules: "Sehri before dawn, Iftar at sunset. Sehri: dates, fruits, light protein. Iftar: dates, shorba, biryani, sheer khurma"
  },
  {
    keywords: ["mahashivratri", "shivratri"],
    type: "fast",
    fastingRules: "No grains. Allowed: fruits, milk, sabudana, singhare atta, sendha namak"
  },
  {
    keywords: ["janmashtami"],
    type: "fast",
    fastingRules: "Fast until midnight. Allowed: fruits, milk, makhana, sabudana. Break fast with panchamrit and sweets at midnight"
  },
  {
    keywords: ["diwali", "deepawali"],
    type: "festive",
    fastingRules: "Festive sweets and snacks. Include: mathri, chakli, besan ladoo, kaju katli, gulab jamun"
  },
  {
    keywords: ["eid", "eid ul-fitr", "eid al-fitr"],
    type: "festive",
    fastingRules: "Festive meal. Include: sheer khurma, biryani, sewaiyan, haleem, mutton curry"
  },
  {
    keywords: ["onam"],
    type: "festive",
    fastingRules: "Sadya feast: rice, sambar, avial, olan, payasam, banana chips, papadom"
  },
  {
    keywords: ["pongal"],
    type: "festive",
    fastingRules: "Include sweet pongal, ven pongal, sugarcane, banana, coconut rice"
  },
  {
    keywords: ["ganesh", "chaturthi", "vinayaka"],
    type: "festive",
    fastingRules: "Include modak, puran poli, ukdiche modak. Avoid non-veg on main day"
  },
  {
    keywords: ["holi"],
    type: "festive",
    fastingRules: "Include gujiya, thandai, malpua, dahi bhalle, puran poli"
  },
  {
    keywords: ["baisakhi", "vaisakhi"],
    type: "festive",
    fastingRules: "Include makki roti, sarson saag, lassi, kheer, pinni"
  },
  {
    keywords: ["makar sankranti", "uttarayan", "lohri"],
    type: "festive",
    fastingRules: "Include tilgul, til ladoo, khichdi, puran poli, groundnut chikki, rewri"
  },
  {
    keywords: ["christmas"],
    type: "festive",
    fastingRules: "Include plum cake, appam with stew, roast, fruit cake"
  },
  {
    keywords: ["guru nanak", "gurpurab"],
    type: "festive",
    fastingRules: "Include langar meals: dal, roti, kheer, kadah prasad"
  }
];

const inferFestivalMeta = (eventName) => {
  const lowerName = eventName.toLowerCase();
  for (const meta of FESTIVAL_META) {
    if (meta.keywords.some(kw => lowerName.includes(kw))) {
      return { type: meta.type, fastingRules: meta.fastingRules };
    }
  }
  return { type: "holiday", fastingRules: null };
};

const getLocalYYYYMMDD = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const fetchFestivalEvents = async (daysAhead = 30) => {
  try {
    const cachedAt = localStorage.getItem('nutrisense_festivals_fetched_at');
    const cache = localStorage.getItem('nutrisense_festivals_cache');
    
    if (cachedAt && cache) {
      const parsedDate = new Date(cachedAt);
      const isStale = (new Date() - parsedDate) > 24 * 60 * 60 * 1000;
      if (!isStale) {
        return JSON.parse(cache);
      }
    }

    const VITE_GCAL_API_KEY = import.meta.env.VITE_GCAL_API_KEY;
    if (!VITE_GCAL_API_KEY) {
      console.warn("VITE_GCAL_API_KEY is not defined. Skipping festival fetch.");
      return [];
    }

    const today = new Date();
    const todayISO = today.toISOString();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);
    const timeMaxISO = futureDate.toISOString();

    const fetchPromises = CALENDARS.map(async (calendarId) => {
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${VITE_GCAL_API_KEY}&timeMin=${encodeURIComponent(todayISO)}&timeMax=${encodeURIComponent(timeMaxISO)}&singleEvents=true&orderBy=startTime&maxResults=20`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return { calendarSource: calendarId, items: data.items || [] };
    });

    const results = await Promise.allSettled(fetchPromises);
    
    let allEvents = [];
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allEvents = allEvents.concat(result.value.items.map(item => {
          let startDate = item.start?.date || item.start?.dateTime;
          if (startDate && startDate.includes('T')) startDate = startDate.split('T')[0];
          
          let endDateObj = item.end?.date || item.end?.dateTime;
          let rawEndDate = endDateObj;
          if (rawEndDate && rawEndDate.includes('T')) rawEndDate = rawEndDate.split('T')[0];
          
          let isMultiDay = false;
          let actualEndDate = startDate;

          if (item.start?.date && item.end?.date) {
              const startD = new Date(item.start.date);
              const endD = new Date(item.end.date);
              endD.setDate(endD.getDate() - 1);
              const localEnd = getLocalYYYYMMDD(endD);
              actualEndDate = localEnd;
              if (actualEndDate !== startDate) {
                  isMultiDay = true;
              }
          }

          const meta = inferFestivalMeta(item.summary || "Unnamed Event");

          return {
            id: item.id,
            name: item.summary,
            date: startDate,
            endDate: actualEndDate,
            isMultiDay,
            calendarSource: result.value.calendarSource,
            type: meta.type,
            fastingRules: meta.fastingRules
          };
        }));
      } else {
        console.warn("Calendar fetch failed for one source:", result.reason);
      }
    });

    const uniqueEvents = [];
    const seen = new Set();
    for (const ev of allEvents) {
      if (!ev.date || !ev.name) continue; 
      const key = `${ev.name.toLowerCase()}_${ev.date}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueEvents.push(ev);
      }
    }

    uniqueEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    localStorage.setItem('nutrisense_festivals_cache', JSON.stringify(uniqueEvents));
    localStorage.setItem('nutrisense_festivals_fetched_at', new Date().toISOString());

    return uniqueEvents;
  } catch (error) {
    console.warn("Festival calendar unavailable:", error.message);
    return [];
  }
};

export const getTodaysFestivals = (events) => {
  if (!events) return [];
  const todayStr = getLocalYYYYMMDD(new Date());
  return events.filter(ev => {
    if (ev.isMultiDay && ev.endDate) {
      return todayStr >= ev.date && todayStr <= ev.endDate;
    }
    return ev.date === todayStr;
  });
};

export const getUpcomingFestivals = (events, daysAhead = 7) => {
  if (!events) return [];
  const todayStr = getLocalYYYYMMDD(new Date());
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() + daysAhead);
  const limitStr = getLocalYYYYMMDD(limitDate);

  return events.filter(ev => {
    return ev.date > todayStr && ev.date <= limitStr;
  });
};

export const isFastingDay = (events) => {
  if (!events) return false;
  const todays = getTodaysFestivals(events);
  return todays.some(ev => ev.type === 'fast');
};

export const loadFestivalsOnAppStart = async () => {
  return await fetchFestivalEvents();
};
