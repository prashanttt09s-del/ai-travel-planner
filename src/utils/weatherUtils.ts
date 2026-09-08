import { DestinationWeather, WeatherForecastDay, SupportedLanguage } from '../types';

/**
 * Normalizes or generates a 5-day realistic weather forecast for any destination
 * calibrated to the chosen travel start date and climate profile.
 */
export function generate5DayForecast(
  destination: string,
  startDateStr?: string,
  weatherSummary?: string,
  language: SupportedLanguage = 'en'
): DestinationWeather {
  const isHinglish = language === 'hi_hinglish';
  const destLower = (destination || '').toLowerCase();

  // Determine starting date
  let baseDate = new Date();
  if (startDateStr) {
    const parsed = new Date(startDateStr);
    if (!isNaN(parsed.getTime())) {
      baseDate = parsed;
    }
  }

  // Month of travel (0-11)
  const travelMonth = baseDate.getMonth(); // 0 = Jan, 7 = Aug, etc.

  // Climate classification
  let baseMaxC = 30;
  let baseMinC = 22;
  let defaultCondition: WeatherForecastDay['condition'] = 'Sunny';
  let defaultRainChance = 15;
  let defaultHumidity = 60;
  let defaultWind = 14;
  let bestSeason = 'October to March';

  if (
    destLower.includes('manali') ||
    destLower.includes('ladakh') ||
    destLower.includes('spiti') ||
    destLower.includes('kasol') ||
    destLower.includes('shimla') ||
    destLower.includes('leh') ||
    destLower.includes('switzerland') ||
    destLower.includes('alps') ||
    destLower.includes('kashmir') ||
    destLower.includes('gulmarg') ||
    destLower.includes('munnar') ||
    destLower.includes('ooty')
  ) {
    // Mountain / Alpine / High altitude
    if (travelMonth >= 11 || travelMonth <= 2) {
      // Winter
      baseMaxC = 7;
      baseMinC = -2;
      defaultCondition = 'Snow / Misty';
      defaultRainChance = 30;
      defaultHumidity = 70;
      bestSeason = 'May to September (Trekking) / Dec-Feb (Snow)';
    } else if (travelMonth >= 6 && travelMonth <= 8) {
      // Monsoon / Summer
      baseMaxC = 22;
      baseMinC = 13;
      defaultCondition = 'Partly Cloudy';
      defaultRainChance = 45;
      defaultHumidity = 75;
      bestSeason = 'April to June & Sept to Oct';
    } else {
      // Spring / Autumn
      baseMaxC = 18;
      baseMinC = 8;
      defaultCondition = 'Clear & Pleasant';
      defaultRainChance = 20;
      defaultHumidity = 55;
      bestSeason = 'March to June & Sept to Nov';
    }
  } else if (
    destLower.includes('goa') ||
    destLower.includes('bali') ||
    destLower.includes('phuket') ||
    destLower.includes('kerala') ||
    destLower.includes('maldives') ||
    destLower.includes('andaman') ||
    destLower.includes('gokarna') ||
    destLower.includes('pattaya') ||
    destLower.includes('krabi')
  ) {
    // Coastal / Tropical Beach
    if (travelMonth >= 5 && travelMonth <= 8) {
      // Monsoon
      baseMaxC = 30;
      baseMinC = 24;
      defaultCondition = 'Rainy';
      defaultRainChance = 65;
      defaultHumidity = 85;
      bestSeason = 'November to February (Pleasant & Clear)';
    } else {
      // Pleasant beach season
      baseMaxC = 32;
      baseMinC = 23;
      defaultCondition = 'Sunny';
      defaultRainChance = 10;
      defaultHumidity = 68;
      bestSeason = 'October to March (Best beach weather)';
    }
  } else if (
    destLower.includes('dubai') ||
    destLower.includes('jaipur') ||
    destLower.includes('jaisalmer') ||
    destLower.includes('egypt') ||
    destLower.includes('cairo') ||
    destLower.includes('abu dhabi') ||
    destLower.includes('rajasthan')
  ) {
    // Desert / Dry Warm
    if (travelMonth >= 4 && travelMonth <= 8) {
      baseMaxC = 41;
      baseMinC = 30;
      defaultCondition = 'Sunny';
      defaultRainChance = 5;
      defaultHumidity = 40;
      bestSeason = 'November to March';
    } else {
      baseMaxC = 28;
      baseMinC = 16;
      defaultCondition = 'Sunny';
      defaultRainChance = 5;
      defaultHumidity = 45;
      bestSeason = 'October to March (Comfortable evenings)';
    }
  } else if (
    destLower.includes('paris') ||
    destLower.includes('london') ||
    destLower.includes('tokyo') ||
    destLower.includes('rome') ||
    destLower.includes('amsterdam') ||
    destLower.includes('new york')
  ) {
    // Temperate City
    if (travelMonth >= 5 && travelMonth <= 8) {
      baseMaxC = 26;
      baseMinC = 16;
      defaultCondition = 'Partly Cloudy';
      defaultRainChance = 25;
      defaultHumidity = 60;
      bestSeason = 'April to June & Sept to Oct';
    } else if (travelMonth >= 11 || travelMonth <= 2) {
      baseMaxC = 8;
      baseMinC = 2;
      defaultCondition = 'Cloudy';
      defaultRainChance = 40;
      defaultHumidity = 78;
      bestSeason = 'May to September';
    } else {
      baseMaxC = 18;
      baseMinC = 9;
      defaultCondition = 'Clear & Pleasant';
      defaultRainChance = 30;
      defaultHumidity = 65;
      bestSeason = 'Spring (Apr-May) / Autumn (Sep-Oct)';
    }
  }

  const conditionVariations: WeatherForecastDay['condition'][] = [
    defaultCondition,
    defaultRainChance > 40 ? 'Rainy' : defaultCondition === 'Sunny' ? 'Clear & Pleasant' : 'Partly Cloudy',
    defaultCondition === 'Sunny' ? 'Partly Cloudy' : defaultCondition === 'Rainy' ? 'Thunderstorm' : 'Sunny',
    defaultCondition === 'Rainy' ? 'Cloudy' : 'Sunny',
    'Clear & Pleasant',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const forecast5Days: WeatherForecastDay[] = [];

  for (let i = 0; i < 5; i++) {
    const forecastDate = new Date(baseDate);
    forecastDate.setDate(baseDate.getDate() + i);

    const dayName = dayNames[forecastDate.getDay()];
    const fullDayName = fullDayNames[forecastDate.getDay()];
    const dateStr = forecastDate.toISOString().split('T')[0];
    const monthName = forecastDate.toLocaleString('default', { month: 'short' });
    const dayNum = forecastDate.getDate();

    // Slight daily temp variance
    const tempMaxVariance = (i % 2 === 0 ? 1 : -1) * (i * 0.8);
    const tempMinVariance = (i % 3 === 0 ? -1 : 1) * (i * 0.5);

    const tempMaxC = Math.round(baseMaxC + tempMaxVariance);
    const tempMinC = Math.round(baseMinC + tempMinVariance);

    const condition = conditionVariations[i % conditionVariations.length];
    
    let rainChance = defaultRainChance;
    if (condition === 'Rainy') rainChance = Math.min(90, defaultRainChance + 35);
    else if (condition === 'Thunderstorm') rainChance = 80;
    else if (condition === 'Sunny') rainChance = Math.max(5, defaultRainChance - 15);
    else if (condition === 'Partly Cloudy') rainChance = Math.max(15, defaultRainChance);

    const humidity = Math.min(95, Math.max(30, Math.round(defaultHumidity + (i % 2 === 0 ? 4 : -3))));
    const windSpeed = Math.round(defaultWind + (i % 3));
    const uvIndex = condition === 'Sunny' ? 8 : condition === 'Partly Cloudy' ? 6 : condition === 'Rainy' ? 3 : 5;

    let recommendation = '';
    if (condition === 'Sunny') {
      recommendation = isHinglish
        ? 'Dhoop acchi rahegi. Subah aur shaam outdoor sightseeing ke liye perfect time hai; sunscreen lagayein.'
        : 'Bright sunshine expected. Ideal for outdoor excursions and beach time; keep sunscreen handy.';
    } else if (condition === 'Partly Cloudy') {
      recommendation = isHinglish
        ? 'Mausam suhana aur thoda baadal chhaya rahega. Walking tours aur photography ke liye behtareen din.'
        : 'Comfortable partly cloudy weather. Great conditions for walking tours and photography.';
    } else if (condition === 'Rainy' || condition === 'Thunderstorm') {
      recommendation = isHinglish
        ? 'Dopahar ya shaam me baarish hone ke asar hain. Ek compact umbrella ya raincoat sath rakhein.'
        : 'Showers expected. Carry a compact umbrella and schedule indoor cafes/museums during peak rains.';
    } else if (condition === 'Snow / Misty') {
      recommendation = isHinglish
        ? 'Thand aur dhundh rahegi. Heavy woolens aur insulated shoes pehanein.'
        : 'Chilly and misty conditions. Layer up with warm thermal gear and insulated boots.';
    } else {
      recommendation = isHinglish
        ? 'Suhana mausam, halki hawa chalegi. Evening sunset aur street exploring zaroor karein.'
        : 'Pleasant breezy climate. Ideal for sunset viewpoints and leisurely street exploring.';
    }

    forecast5Days.push({
      dayIndex: i + 1,
      dateString: dateStr,
      dayName: `${dayName}, ${monthName} ${dayNum}`,
      condition,
      tempMaxC,
      tempMinC,
      rainChancePercent: rainChance,
      humidityPercent: humidity,
      windSpeedKmh: windSpeed,
      uvIndex,
      recommendation,
    });
  }

  const travelPackingWeatherTip = isHinglish
    ? `Mausam ke hisab se: ${
        defaultCondition === 'Rainy'
          ? 'Quick-dry clothes, waterproof mobile pouch aur raincoat pack karein.'
          : baseMaxC > 30
          ? 'Halke breathable cotton clothes, polarized sunglasses aur SPF 50 sunscreen zaroor rakhein.'
          : baseMaxC < 15
          ? 'Thermals, windproof jacket aur lip balm pack karein.'
          : 'Comfortable layers, walking sneakers aur sunglasses carry karein.'
      }`
    : `Weather Packing Tip: ${
        defaultCondition === 'Rainy'
          ? 'Pack quick-dry fabrics, waterproof phone pouch, and a sturdy compact umbrella.'
          : baseMaxC > 30
          ? 'Pack light breathable cottons/linens, polarized sunglasses, and SPF 50+ sunscreen.'
          : baseMaxC < 15
          ? 'Pack thermal layers, a fleece jacket, and moisturizing lip balm.'
          : 'Pack versatile layering clothes, comfortable walking sneakers, and sunglasses.'
      }`;

  return {
    destination,
    currentTempC: Math.round(baseMaxC - 2),
    currentCondition: defaultCondition,
    weatherSummary:
      weatherSummary ||
      (isHinglish
        ? `${destination} me aane wale dino me aamtaur par ${defaultCondition.toLowerCase()} mausam rahega, tapman ${baseMinC}°C se ${baseMaxC}°C ke beech.`
        : `${destination} expects predominantly ${defaultCondition.toLowerCase()} conditions with temperatures between ${baseMinC}°C and ${baseMaxC}°C.`),
    bestVisitingSeason: bestSeason,
    travelPackingWeatherTip,
    forecast5Days,
  };
}

export function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}
