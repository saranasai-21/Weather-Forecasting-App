/**
 * Simple string hash to select deterministic mock data.
 */
function getStringHash(str) {
  let hash = 0;
  if (!str) return hash;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/**
 * List of known cities to match in LinkedIn URLs.
 */
const KNOWN_CITIES = [
  "london", "seattle", "tokyo", "hyderabad", "paris", "new york", "nyc",
  "san francisco", "sf", "toronto", "chicago", "berlin", "sydney", "rome",
  "singapore", "mumbai", "bangalore", "delhi", "austin", "boston",
  "los angeles", "la", "miami", "dubai", "vancouver", "amsterdam"
];

const DEFAULT_CITIES = [
  "San Francisco", "London", "Paris", "Tokyo", "Sydney", "Hyderabad",
  "New York", "Toronto", "Berlin", "Singapore", "Rome", "Cape Town"
];

const MOCK_HEADLINES = [
  "Staff Software Engineer",
  "Principal Product Manager",
  "VP of Engineering",
  "AI Research Scientist",
  "Creative Director",
  "Founder & CEO",
  "Cloud Solutions Architect",
  "Strategy & Operations Lead",
  "Senior UX Designer",
  "Developer Advocate"
];

const MOCK_COMPANIES = [
  "SkyGlass Pro Tech",
  "Google",
  "OpenAI",
  "Meta",
  "Stripe",
  "Vercel",
  "Microsoft",
  "Tesla",
  "Atlassian",
  "Netflix"
];

/**
 * Parses a string to check if it's a URL. If yes, extracts a location query or coordinate set.
 * If it's a LinkedIn URL, it extracts/generates mock profile data.
 * 
 * @param {string} input 
 * @returns {object|null} { location: string, type: string, profile: object|null }
 */
export function parseLocationFromUrl(input) {
  if (!input) return null;
  const trimmed = input.trim();

  // Basic check to see if input is a URL
  const isUrl = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gi.test(trimmed);
  if (!isUrl) return null;

  try {
    // Standardize URL protocol for URL parser
    let urlStr = trimmed;
    if (!/^https?:\/\//i.test(urlStr)) {
      urlStr = 'https://' + urlStr;
    }
    const url = new URL(urlStr);

    // 1. LinkedIn Parse
    if (/linkedin\.com/i.test(url.hostname)) {
      const pathParts = url.pathname.split('/').filter(Boolean);
      // Expected: ['in', 'username'] or ['company', 'name']
      const type = pathParts[0] || 'in';
      const rawSlug = pathParts[1] || 'professional-user';

      // Clean trailing profile hashes (e.g. jane-doe-12345678)
      const slug = rawSlug.replace(/-[0-9a-fA-F]{6,12}$/g, '').replace(/-[0-9]+$/g, '');

      // Check if any word in the slug matches a known city name
      const slugWords = slug.toLowerCase().split('-');
      let matchedCity = null;

      for (const word of slugWords) {
        if (KNOWN_CITIES.includes(word)) {
          matchedCity = word;
          break;
        }
      }

      // If "new" and "york" are in slug, merge them
      if (slugWords.includes('new') && slugWords.includes('york')) {
        matchedCity = 'new york';
      } else if (slugWords.includes('san') && slugWords.includes('francisco')) {
        matchedCity = 'san francisco';
      } else if (slugWords.includes('los') && slugWords.includes('angeles')) {
        matchedCity = 'los angeles';
      } else if (slugWords.includes('cape') && slugWords.includes('town')) {
        matchedCity = 'cape town';
      }

      const hash = getStringHash(slug);
      let location = '';

      if (matchedCity) {
        // Capitalize matched city
        location = matchedCity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      } else {
        // Fallback to deterministic default city
        location = DEFAULT_CITIES[hash % DEFAULT_CITIES.length];
      }

      // Generate profile Name: strip the matched city words and format remainder
      let nameParts = slug.split('-').filter(w => {
        const lowerW = w.toLowerCase();
        if (matchedCity && matchedCity.toLowerCase().includes(lowerW)) return false;
        if (['in', 'company', 'school'].includes(lowerW)) return false;
        return true;
      });

      if (nameParts.length === 0) {
        nameParts = [slug];
      }

      const name = nameParts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const headline = MOCK_HEADLINES[hash % MOCK_HEADLINES.length];
      const company = MOCK_COMPANIES[(hash + 3) % MOCK_COMPANIES.length];

      return {
        location,
        type: 'linkedin',
        profile: {
          name,
          headline,
          company,
          location,
          slug: rawSlug,
          url: urlStr
        }
      };
    }

    // 2. Wikipedia Parse
    if (/wikipedia\.org/i.test(url.hostname)) {
      const match = url.pathname.match(/\/wiki\/([a-zA-Z0-9-_%]+)/i);
      if (match && match[1]) {
        const place = decodeURIComponent(match[1]).replace(/_/g, ' ');
        return {
          location: place,
          type: 'wikipedia',
          profile: null
        };
      }
    }

    // 3. Google Maps Parse
    if (/google\..*\/maps/i.test(url.hostname)) {
      // Check for place name in URL path
      const placeMatch = url.pathname.match(/\/place\/([a-zA-Z0-9-_%+]+)/i);
      if (placeMatch && placeMatch[1]) {
        const place = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
        return {
          location: place,
          type: 'maps',
          profile: null
        };
      }

      // Check for coordinates in URL path/hash, e.g. @37.7749,-122.4194
      const coordMatch = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch && coordMatch[1] && coordMatch[2]) {
        return {
          location: `${coordMatch[1]},${coordMatch[2]}`,
          type: 'maps',
          profile: null
        };
      }
    }

    // 4. Weather Sites Parse (e.g. weather.com, accuweather.com, weatherapi.com)
    if (/(weather|accuweather|weatherapi)\.com/i.test(url.hostname)) {
      // Extract the last path segments which usually contain the city name
      const pathParts = url.pathname.split('/').filter(Boolean);
      for (let i = pathParts.length - 1; i >= 0; i--) {
        const part = pathParts[i];
        // Strip numbers, codes, file extensions
        const cleanPart = part.replace(/[-_0-9]+/g, ' ').trim();
        if (cleanPart.length > 2 && !/^(today|weather|forecast|hour|daily|detail|index)$/i.test(cleanPart)) {
          return {
            location: cleanPart,
            type: 'weather_link',
            profile: null
          };
        }
      }
    }

    // 5. Generic Link Fallback: Clean up pathname or hostname
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      const cleanPart = decodeURIComponent(lastPart).replace(/[-_]+/g, ' ').trim();
      // Look for known cities inside the pathname
      for (const city of KNOWN_CITIES) {
        if (cleanPart.toLowerCase().includes(city)) {
          return {
            location: city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            type: 'generic_link',
            profile: null
          };
        }
      }

      if (cleanPart.length > 2 && cleanPart.length < 30) {
        return {
          location: cleanPart,
          type: 'generic_link',
          profile: null
        };
      }
    }

    // If pathname is empty, fallback to hostname main part (excluding www, .com, etc.)
    const domainParts = url.hostname.replace('www.', '').split('.');
    if (domainParts[0] && domainParts[0].length > 2) {
      return {
        location: domainParts[0],
        type: 'generic_link',
        profile: null
      };
    }

  } catch (err) {
    console.error('Failed to parse URL logic:', err);
  }

  // Fallback if URL but not matched
  return null;
}
