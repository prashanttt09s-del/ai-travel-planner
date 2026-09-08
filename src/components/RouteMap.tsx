import { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

interface RouteMapProps {
  origin: string;
  destination: string;
  stops?: string[];
}

interface Location {
  lat: number;
  lon: number;
  name: string;
  type: 'start' | 'stop' | 'destination';
}

interface RouteInfo {
  distanceKm: number;
  durationMinutes: number;
}

function createNumberIcon(number: number, kind: Location['type']) {
  const background =
    kind === 'start'
      ? '#059669'
      : kind === 'destination'
        ? '#dc2626'
        : '#f59e0b';

  return L.divIcon({
    className: 'route-number-marker',
    html: `<div style="
      width:32px;
      height:32px;
      border-radius:9999px;
      background:${background};
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      font-weight:800;
      font-size:13px;
      border:3px solid white;
      box-shadow:0 2px 10px rgba(15,23,42,.28);
    ">${number}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

function FitRoute({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(L.latLngBounds(positions), {
        padding: [40, 40],
      });
    }
  }, [map, positions]);

  return null;
}

async function findLocation(name: string): Promise<{ lat: number; lon: number }> {
  const original = name.trim();
  let searchName = original;
  const lowerName = original.toLowerCase();

  if (lowerName === 'goa') {
    searchName = 'Panaji, Goa, India';
  } else if (lowerName.includes('manali')) {
    searchName = 'Manali, Himachal Pradesh, India';
  } else if (lowerName.includes('kasol')) {
    searchName = 'Kasol, Himachal Pradesh, India';
  } else if (lowerName.includes('leh')) {
    searchName = 'Leh, Ladakh, India';
  } else if (lowerName.includes('jaipur')) {
    searchName = 'Jaipur, Rajasthan, India';
  } else if (lowerName.includes('mumbai')) {
    searchName = 'Mumbai, Maharashtra, India';
  } else if (lowerName.includes('delhi')) {
    searchName = 'New Delhi, India';
  } else if (!lowerName.includes('india')) {
    searchName = `${original}, India`;
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(searchName)}`,
    { headers: { Accept: 'application/json' } },
  );

  if (!response.ok) {
    throw new Error('Location search failed');
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`Location not found: ${original}`);
  }

  return {
    lat: Number(data[0].lat),
    lon: Number(data[0].lon),
  };
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

export function RouteMap({
  origin,
  destination,
  stops = [],
}: RouteMapProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cleanStops = useMemo(
    () => stops.map((stop) => stop.trim()).filter(Boolean).slice(0, 4),
    [stops],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadRoute() {
      try {
        setLoading(true);
        setError('');
        setLocations([]);
        setRoute([]);
        setRouteInfo(null);

        const cleanOrigin = origin.trim();
        let cleanDestination = destination.trim();

        if (cleanDestination.includes('&')) {
          cleanDestination = cleanDestination.split('&')[0].trim();
        }

        if (!cleanOrigin || !cleanDestination) {
          throw new Error('Origin and destination are required');
        }

        const locationNames = [
          cleanOrigin,
          ...cleanStops,
          cleanDestination,
        ];

        const foundLocations: Location[] = [];

        for (let i = 0; i < locationNames.length; i += 1) {
          try {
            const coordinates = await findLocation(locationNames[i]);

            foundLocations.push({
              ...coordinates,
              name: locationNames[i],
              type:
                i === 0
                  ? 'start'
                  : i === locationNames.length - 1
                    ? 'destination'
                    : 'stop',
            });
          } catch (locationError) {
            console.warn(
              `Could not find route location: ${locationNames[i]}`,
              locationError,
            );
          }
        }

        if (foundLocations.length < 2) {
          throw new Error('Not enough locations found');
        }

        if (cancelled) return;
        setLocations(foundLocations);

        const coordinates = foundLocations
          .map((location) => `${location.lon},${location.lat}`)
          .join(';');

        const routeResponse = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`,
        );

        if (!routeResponse.ok) {
          throw new Error('Routing service unavailable');
        }

        const routeData = await routeResponse.json();

        if (
          routeData.code !== 'Ok' ||
          !routeData.routes ||
          routeData.routes.length === 0
        ) {
          throw new Error('Route could not be created');
        }

        const firstRoute = routeData.routes[0];
        const routePositions: [number, number][] =
          firstRoute.geometry.coordinates.map(
            (point: [number, number]) => [point[1], point[0]],
          );

        if (!cancelled) {
          setRoute(routePositions);
          setRouteInfo({
            distanceKm: Number(firstRoute.distance || 0) / 1000,
            durationMinutes: Number(firstRoute.duration || 0) / 60,
          });
        }
      } catch (err) {
        console.error('Route error:', err);

        if (!cancelled) {
          setError(
            'Route load nahi ho paaya. Location names ya internet connection check karein.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRoute();

    return () => {
      cancelled = true;
    };
  }, [origin, destination, cleanStops]);

  const center: [number, number] =
    locations.length > 0
      ? [locations[0].lat, locations[0].lon]
      : [20.5937, 78.9629];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              🗺️ Live Road Route Map
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {origin} → {destination}
            </p>
          </div>

          {routeInfo && (
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold">
                📏 {routeInfo.distanceKm.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}{' '}
                km
              </span>
              <span className="px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-extrabold">
                ⏱️ {formatDuration(routeInfo.durationMinutes)}
              </span>
            </div>
          )}
        </div>

        {loading && (
          <p className="text-xs text-emerald-600 font-semibold mt-3">
            🧭 Exact road route calculate ho raha hai...
          </p>
        )}

        {error && (
          <p className="text-xs text-red-600 font-semibold mt-3">
            ⚠️ {error}
          </p>
        )}

        {!loading && !error && route.length > 1 && (
          <p className="text-xs text-emerald-600 font-semibold mt-3">
            ✅ Road distance aur route successfully calculate ho gaya.
          </p>
        )}
      </div>

      <div className="h-[420px] w-full">
        <MapContainer
          center={center}
          zoom={5}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {route.length > 1 && (
            <>
              <Polyline
                positions={route}
                pathOptions={{
                  color: '#059669',
                  weight: 6,
                  opacity: 0.85,
                }}
              />
              <FitRoute positions={route} />
            </>
          )}

          {locations.map((location, index) => (
            <Marker
              key={`${location.name}-${index}`}
              position={[location.lat, location.lon]}
              icon={createNumberIcon(index + 1, location.type)}
            >
              <Popup>
                <strong>
                  {location.type === 'start'
                    ? '📍 Start'
                    : location.type === 'destination'
                      ? '🏁 Destination'
                      : `📌 Stop ${index}`}
                </strong>
                <br />
                {location.name}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {cleanStops.length > 0 && (
        <div className="p-5 border-t border-slate-100 bg-amber-50/50">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🛣️</span>
            <h4 className="text-sm font-black text-slate-900">
              Suggested En-route Stops
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cleanStops.map((stop, index) => (
              <div
                key={`${stop}-${index}`}
                className="flex items-start gap-2.5 bg-white border border-amber-200 rounded-xl p-3"
              >
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {stop}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Break / food / fuel stop — AI route suggestion
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
