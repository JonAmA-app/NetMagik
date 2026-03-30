
import React, { useState, useEffect } from 'react';
import { Language, PublicIpInfo } from '../types';
import { TRANSLATIONS } from '../constants';
import { Globe, MapPin, Building, RefreshCw, Zap, Server } from 'lucide-react';

interface InternetStatusProps {
  language: Language;
}

export const InternetStatus: React.FC<InternetStatusProps> = ({ language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PublicIpInfo | null>(null);
  const [, setError] = useState<string | null>(null);

  // Stability / Jitter States
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([]);
  const [currentPing, setCurrentPing] = useState(0);
  const [jitter, setJitter] = useState(0);

  const fetchPublicInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://ip-api.com/json/?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,query');
      const json = await res.json();

      if (json.status === 'success') {
        setData(json);
      } else {
        setError(json.message || t.failedToFetchData);
      }
    } catch (e) {
      setError(t.connectionFailedCheckInternet);
    } finally {
      setLoading(false);
    }
  };

  const startJitterTest = async () => {
    setIsMeasuring(true);
    setLatencyHistory([]);
    setJitter(0);

    let pings: number[] = [];
    let count = 0;
    const maxPings = 20;

    const pingLoop = setInterval(async () => {
      if (count >= maxPings) {
        clearInterval(pingLoop);
        setIsMeasuring(false);
        return;
      }

      const start = performance.now();
      try {
        // We assume fetching a small file/head from a fast CDN
        await fetch('https://1.1.1.1/cdn-cgi/trace', { mode: 'no-cors', cache: 'no-store' });
        const end = performance.now();
        const lat = Math.floor(end - start);

        setCurrentPing(lat);
        pings.push(lat);
        setLatencyHistory([...pings]);

        // Calculate Jitter (average absolute difference between consecutive pings)
        if (pings.length > 1) {
          let diffSum = 0;
          for (let i = 0; i < pings.length - 1; i++) {
            diffSum += Math.abs(pings[i] - pings[i + 1]);
          }
          const calcJitter = Math.floor(diffSum / (pings.length - 1));
          setJitter(calcJitter);
        }

      } catch (e) {
        // Timeout/Error
      }
      count++;
    }, 800);
  };

  useEffect(() => {
    fetchPublicInfo();
  }, []);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-theme-bg-secondary p-6 rounded-xl border border-theme-border-primary shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-theme-text-primary flex items-center gap-2">
            <Globe className="text-theme-brand-primary" />
            {t.internetStatus}
          </h2>
          <p className="text-theme-text-muted text-sm mt-1">
            {t.internetDesc}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { fetchPublicInfo(); startJitterTest(); }}
            disabled={loading || isMeasuring}
            className="px-4 py-2 bg-theme-bg-tertiary hover:bg-theme-bg-hover text-theme-text-secondary rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading || isMeasuring ? 'animate-spin' : ''} />
            {t.fetchIp}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Public IP Card */}
        <div className="bg-theme-bg-secondary p-6 rounded-xl border border-theme-border-primary shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Server size={64} />
          </div>
          <h3 className="text-sm font-semibold text-theme-text-muted uppercase tracking-wider mb-2">{t.publicIp}</h3>
          {loading ? (
            <div className="h-8 w-32 bg-theme-bg-tertiary rounded animate-pulse"></div>
          ) : (
            <div className="text-3xl font-mono font-bold text-theme-text-primary tracking-tight">
              {data?.query || '---'}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-theme-text-secondary">
              <Building size={16} className="text-theme-brand-primary" />
              <span className="font-medium">{t.isp}:</span>
              <span>{data?.isp || '---'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-theme-text-secondary">
              <Zap size={16} className="text-yellow-500" />
              <span className="font-medium">{t.asOrg}:</span>
              <span className="truncate">{data?.org || '---'}</span>
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-theme-bg-secondary p-6 rounded-xl border border-theme-border-primary shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <MapPin size={64} />
          </div>
          <h3 className="text-sm font-semibold text-theme-text-muted uppercase tracking-wider mb-2">{t.location}</h3>

          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-theme-text-primary">
              {data ? `${data.city}, ${data.regionName}` : '---'}
            </div>
          </div>
            {data?.country || t.unknownRegion}

          {/* Fake Map Visualization */}
          <div className="w-full h-24 bg-theme-bg-tertiary rounded-lg relative overflow-hidden flex items-center justify-center border border-theme-border-secondary">
            {data ? (
              <>
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-theme-brand-primary/20 via-transparent to-transparent"></div>
                <div className="flex flex-col items-center z-10">
                  <MapPin className="text-red-500 animate-bounce" size={24} />
                  <span className="text-[10px] font-mono mt-1 text-theme-text-muted">{data.lat.toFixed(4)}, {data.lon.toFixed(4)}</span>
                </div>
                {/* Grid lines */}
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--theme-border-primary) 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.3 }}></div>
              </>
            ) : (
              <span className="text-xs text-theme-text-muted">{t.mapUnavailable}</span>
            )}
          </div>
        </div>

        {/* Jitter / Stability Card */}
        <div className="bg-theme-bg-secondary p-6 rounded-xl border border-theme-border-primary shadow-sm relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-theme-text-muted uppercase tracking-wider">{t.stability}</h3>
            {!isMeasuring && (
              <button onClick={startJitterTest} className="text-xs text-theme-brand-primary hover:underline">{t.runTest}</button>
            )}
          </div>

          <div className="flex items-end gap-1 flex-1 mb-2 h-24">
            {latencyHistory.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-theme-text-muted text-xs italic bg-theme-bg-tertiary rounded-lg border border-dashed border-theme-border-primary text-center px-4">
                {t.clickToTestQuality}
              </div>
            ) : (
              latencyHistory.map((val, i) => {
                const height = Math.min(100, Math.max(10, val * 1.5)); // Scale height
                const colorClass = val < 50 ? 'bg-emerald-400' : val < 100 ? 'bg-yellow-400' : 'bg-rose-400';
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-sm transition-all duration-300 ${colorClass}`}
                    style={{ height: `${height}%` }}
                    title={`${val}${t.ms}`}
                  />
                )
              })
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-theme-border-secondary">
            <div>
              <span className="text-xs text-theme-text-muted">{t.currentPing}</span>
              <div className="text-xl font-bold text-theme-text-primary">{currentPing} <span className="text-xs font-normal text-theme-text-muted">{t.ms}</span></div>
            </div>
            <div>
              <span className="text-xs text-theme-text-muted">{t.jitter}</span>
              <div className={`text-xl font-bold ${jitter < 10 ? 'text-emerald-500' : jitter < 30 ? 'text-yellow-500' : 'text-rose-500'}`}>
                {jitter} <span className="text-xs font-normal text-theme-text-muted">{t.ms}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
