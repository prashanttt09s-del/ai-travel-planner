import React, { useState, useMemo } from 'react';
import {
  Sun,
  CloudSun,
  CloudRain,
  CloudLightning,
  Cloud,
  Snowflake,
  Wind,
  Droplets,
  Thermometer,
  Calendar,
  Sparkles,
  Info,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Compass,
  Umbrella,
  Eye
} from 'lucide-react';
import { DestinationWeather, WeatherForecastDay, SupportedLanguage } from '../types';
import { generate5DayForecast, celsiusToFahrenheit } from '../utils/weatherUtils';

interface WeatherWidgetProps {
  destination: string;
  initialStartDate?: string;
  weatherSummary?: string;
  initialWeather?: DestinationWeather;
  language: SupportedLanguage;
  onDateChange?: (newDateStr: string) => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  destination,
  initialStartDate,
  weatherSummary,
  initialWeather,
  language,
  onDateChange,
}) => {
  const isHinglish = language === 'hi_hinglish';

  // Default start date (today formatted as YYYY-MM-DD)
  const defaultDateStr = useMemo(() => {
    if (initialStartDate) return initialStartDate;
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, [initialStartDate]);

  const [selectedStartDate, setSelectedStartDate] = useState<string>(defaultDateStr);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Generate or update 5-day forecast based on current travel date and destination
  const weatherData: DestinationWeather = useMemo(() => {
    return generate5DayForecast(destination, selectedStartDate, weatherSummary, language);
  }, [destination, selectedStartDate, weatherSummary, language]);

  const handleDateChange = (newDateStr: string) => {
    setSelectedStartDate(newDateStr);
    if (onDateChange) {
      onDateChange(newDateStr);
    }
  };

  const handleQuickPreset = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const formatted = d.toISOString().split('T')[0];
    handleDateChange(formatted);
  };

  const activeDay = weatherData.forecast5Days.find((d) => d.dayIndex === selectedDayIndex) || weatherData.forecast5Days[0];

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${celsiusToFahrenheit(celsius)}°F`;
    }
    return `${celsius}°C`;
  };

  const getWeatherIcon = (condition: WeatherForecastDay['condition'], className: string = 'w-6 h-6') => {
    switch (condition) {
      case 'Sunny':
        return <Sun className={`${className} text-amber-500`} />;
      case 'Partly Cloudy':
        return <CloudSun className={`${className} text-amber-500`} />;
      case 'Rainy':
        return <CloudRain className={`${className} text-sky-500`} />;
      case 'Thunderstorm':
        return <CloudLightning className={`${className} text-indigo-500`} />;
      case 'Cloudy':
        return <Cloud className={`${className} text-slate-400`} />;
      case 'Snow / Misty':
        return <Snowflake className={`${className} text-cyan-400`} />;
      case 'Clear & Pleasant':
        return <Sun className={`${className} text-emerald-500`} />;
      default:
        return <CloudSun className={`${className} text-amber-500`} />;
    }
  };

  const getConditionColor = (condition: WeatherForecastDay['condition']) => {
    switch (condition) {
      case 'Sunny':
        return 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-900';
      case 'Partly Cloudy':
        return 'from-sky-500/10 to-amber-500/10 border-sky-200 text-slate-800';
      case 'Rainy':
        return 'from-blue-500/15 to-sky-500/15 border-blue-200 text-blue-950';
      case 'Thunderstorm':
        return 'from-indigo-500/15 to-purple-500/15 border-indigo-200 text-indigo-950';
      case 'Snow / Misty':
        return 'from-cyan-500/15 to-slate-500/15 border-cyan-200 text-cyan-950';
      default:
        return 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-950';
    }
  };

  return (
    <div
      id="itinerary-weather-widget"
      className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
    >
      {/* Header Bar */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-sky-50 via-teal-50/40 to-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <CloudSun className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {isHinglish ? `5-Day Weather Forecast: ${destination}` : `5-Day Travel Weather Forecast`}
              </h3>
              <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 border border-sky-200 rounded-full text-[11px] font-extrabold">
                {destination}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isHinglish
                ? 'Aapki travel dates ke anusaar 5 dino ka mausam aur temperature prediction.'
                : 'Customized meteorological forecast based on your selected travel dates.'}
            </p>
          </div>
        </div>

        {/* Right Controls: Date Selector & Temp Unit Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Travel Date Picker Input */}
          <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
              {isHinglish ? 'Trip Start:' : 'Trip Date:'}
            </span>
            <input
              type="date"
              value={selectedStartDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="font-bold text-slate-800 text-xs bg-transparent focus:outline-none cursor-pointer"
              title="Select your travel departure date"
            />
          </div>

          {/* Temp Unit Toggle (°C / °F) */}
          <div className="inline-flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setTempUnit('C')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                tempUnit === 'C'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setTempUnit('F')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                tempUnit === 'F'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              °F
            </button>
          </div>

          {/* Toggle Expand / Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors shadow-2xs"
            title={isExpanded ? 'Collapse Forecast' : 'Expand Forecast'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Quick Date Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1">
              {isHinglish ? 'Quick Dates:' : 'Quick Dates:'}
            </span>
            {[
              { label: isHinglish ? 'Aaj (Today)' : 'Today', offset: 0 },
              { label: isHinglish ? 'Kal (Tomorrow)' : 'Tomorrow', offset: 1 },
              { label: isHinglish ? 'Is Weekend' : 'This Weekend', offset: 5 },
              { label: isHinglish ? 'Agle Hafte' : 'Next Week', offset: 7 },
              { label: isHinglish ? '1 Mahina Baad' : 'Next Month', offset: 30 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleQuickPreset(preset.offset)}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-200 hover:border-sky-200 text-[11px] font-semibold transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* 5-Day Forecast Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {weatherData.forecast5Days.map((day) => {
              const isSelected = day.dayIndex === selectedDayIndex;
              return (
                <button
                  key={day.dayIndex}
                  onClick={() => setSelectedDayIndex(day.dayIndex)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-sky-50 to-white border-sky-500 shadow-xs ring-2 ring-sky-500/20'
                      : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200 text-slate-700'
                  }`}
                >
                  {/* Day Label & Date */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-black uppercase tracking-wider ${isSelected ? 'text-sky-700' : 'text-slate-500'}`}>
                        Day {day.dayIndex}
                      </span>
                      {day.rainChancePercent >= 40 && (
                        <span className="text-[10px] font-bold text-sky-600 flex items-center space-x-0.5 bg-sky-100 px-1.5 py-0.2 rounded-md">
                          <Droplets className="w-2.5 h-2.5" />
                          <span>{day.rainChancePercent}%</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                      {day.dayName}
                    </div>
                  </div>

                  {/* Weather Icon & Condition */}
                  <div className="my-3 flex flex-col items-center justify-center text-center">
                    <div className="p-2 rounded-xl bg-white shadow-2xs mb-1.5">
                      {getWeatherIcon(day.condition, 'w-7 h-7')}
                    </div>
                    <div className="text-[11px] font-bold text-slate-700 line-clamp-1">
                      {day.condition}
                    </div>
                  </div>

                  {/* Temperature Range */}
                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900">
                      {formatTemp(day.tempMaxC)}
                    </span>
                    <span className="text-slate-400 font-semibold">
                      {formatTemp(day.tempMinC)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Selected Day Detailed Insight Panel */}
          {activeDay && (
            <div className={`p-4 sm:p-5 rounded-2xl border bg-gradient-to-br ${getConditionColor(activeDay.condition)} space-y-4`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/5">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/80 rounded-xl shadow-2xs">
                    {getWeatherIcon(activeDay.condition, 'w-6 h-6')}
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-slate-600">
                      {isHinglish ? `Day ${activeDay.dayIndex} Mausam Details` : `Day ${activeDay.dayIndex} Weather Outlook`}
                    </div>
                    <div className="text-sm sm:text-base font-extrabold text-slate-900">
                      {activeDay.dayName} • {activeDay.condition}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs font-bold">
                  <div className="px-3 py-1.5 rounded-xl bg-white/90 shadow-2xs flex items-center space-x-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                    <span>Max: {formatTemp(activeDay.tempMaxC)}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-600">Min: {formatTemp(activeDay.tempMinC)}</span>
                  </div>
                </div>
              </div>

              {/* Meteorological Indicators Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* Rain probability */}
                <div className="p-3 bg-white/85 rounded-xl border border-black/5 shadow-2xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center space-x-1">
                    <Droplets className="w-3.5 h-3.5 text-sky-500" />
                    <span>Rain Probability</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-slate-900">{activeDay.rainChancePercent}%</span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {activeDay.rainChancePercent > 40 ? 'High' : activeDay.rainChancePercent > 20 ? 'Moderate' : 'Low'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 h-full rounded-full"
                      style={{ width: `${activeDay.rainChancePercent}%` }}
                    />
                  </div>
                </div>

                {/* Humidity */}
                <div className="p-3 bg-white/85 rounded-xl border border-black/5 shadow-2xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center space-x-1">
                    <Wind className="w-3.5 h-3.5 text-teal-500" />
                    <span>Humidity</span>
                  </div>
                  <div className="text-base font-black text-slate-900">{activeDay.humidityPercent}%</div>
                  <div className="text-[10px] text-slate-500 font-semibold">
                    {activeDay.humidityPercent > 70 ? 'Humid / Coastal' : 'Comfortable'}
                  </div>
                </div>

                {/* Wind Speed */}
                <div className="p-3 bg-white/85 rounded-xl border border-black/5 shadow-2xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center space-x-1">
                    <Compass className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Wind Speed</span>
                  </div>
                  <div className="text-base font-black text-slate-900">{activeDay.windSpeedKmh} km/h</div>
                  <div className="text-[10px] text-slate-500 font-semibold">
                    {activeDay.windSpeedKmh > 20 ? 'Breezy / Gusty' : 'Gentle Breeze'}
                  </div>
                </div>

                {/* UV Index */}
                <div className="p-3 bg-white/85 rounded-xl border border-black/5 shadow-2xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center space-x-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>UV Index</span>
                  </div>
                  <div className="text-base font-black text-slate-900">{activeDay.uvIndex} / 10</div>
                  <div className="text-[10px] text-slate-500 font-semibold">
                    {activeDay.uvIndex >= 7 ? 'High (Use Sunscreen)' : 'Moderate UV'}
                  </div>
                </div>
              </div>

              {/* Day Travel & Activity Advice */}
              <div className="p-3.5 bg-white/90 rounded-xl border border-black/5 flex items-start space-x-2.5 text-xs text-slate-700 leading-relaxed">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">
                    {isHinglish ? 'AI Day Activity Weather Advice:' : 'Day-Specific Activity Advice:'}
                  </span>{' '}
                  {activeDay.recommendation}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Weather Summary & Packing Tips */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start space-x-2.5">
              <Umbrella className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">
                  {isHinglish ? 'Mausam ke anusaar Packing Tip:' : 'Weather-Driven Packing Advice:'}
                </span>{' '}
                <span className="text-slate-600">{weatherData.travelPackingWeatherTip}</span>
              </div>
            </div>

            <div className="shrink-0 px-3 py-1 bg-emerald-100/70 text-emerald-900 rounded-xl font-bold text-[11px] self-start sm:self-auto border border-emerald-200">
              Season: {weatherData.bestVisitingSeason}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
