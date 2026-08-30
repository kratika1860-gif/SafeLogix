import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Area, 
  AreaChart 
} from 'recharts';
import { 
  TrendingUp, 
  CheckCircle2, 
  Route, 
  Calendar, 
  Flame, 
  ChevronRight, 
  Sparkles 
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DailyTripData {
  day: string;
  fullDate: string;
  trips: number;
  distanceKm: number;
  hoursDriven: number;
  onTimeRate: number;
}

const DEFAULT_7_DAY_DATA: DailyTripData[] = [
  { day: 'Mon', fullDate: 'Aug 24, 2026', trips: 5, distanceKm: 112, hoursDriven: 5.4, onTimeRate: 100 },
  { day: 'Tue', fullDate: 'Aug 25, 2026', trips: 7, distanceKm: 148, hoursDriven: 6.8, onTimeRate: 100 },
  { day: 'Wed', fullDate: 'Aug 26, 2026', trips: 4, distanceKm: 92, hoursDriven: 4.2, onTimeRate: 95 },
  { day: 'Thu', fullDate: 'Aug 27, 2026', trips: 8, distanceKm: 176, hoursDriven: 7.6, onTimeRate: 100 },
  { day: 'Fri', fullDate: 'Aug 28, 2026', trips: 6, distanceKm: 134, hoursDriven: 6.1, onTimeRate: 98 },
  { day: 'Sat', fullDate: 'Aug 29, 2026', trips: 9, distanceKm: 198, hoursDriven: 8.4, onTimeRate: 100 },
  { day: 'Sun', fullDate: 'Today (Aug 30)', trips: 6, distanceKm: 125, hoursDriven: 5.8, onTimeRate: 100 }
];

interface Props {
  data?: DailyTripData[];
  className?: string;
}

export default function DailyTripsSummaryCard({ data = DEFAULT_7_DAY_DATA, className }: Props) {
  const [hoveredData, setHoveredData] = useState<DailyTripData | null>(null);

  // Compute key summary statistics
  const totalTrips = data.reduce((acc, curr) => acc + curr.trips, 0);
  const totalDistance = data.reduce((acc, curr) => acc + curr.distanceKm, 0);
  const averageTripsPerDay = (totalTrips / data.length).toFixed(1);
  const maxTripsDay = data.reduce((prev, current) => (prev.trips > current.trips) ? prev : current, data[0]);
  const averageOnTime = Math.round(data.reduce((acc, curr) => acc + curr.onTimeRate, 0) / data.length);

  return (
    <div className={cn(
      "bg-[#121212] rounded-2xl border border-amber-500/20 shadow-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-amber-500/35",
      className
    )}>
      {/* Subtle luxury ambient highlight */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#E9C46A] shadow-inner shrink-0">
            <CheckCircle2 className="w-5 h-5 text-[#E9C46A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#FAF7F2] font-heading tracking-tight">
                Completed Daily Trips
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5" />
                +16.4%
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-amber-400/70" />
              Last 7 Days Performance &bull; NER Transit Corridors
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-2xl font-black text-[#FAF7F2] font-heading leading-none">
            {totalTrips}
          </div>
          <span className="text-[10px] font-bold uppercase text-[#E9C46A] tracking-wider">
            Total Trips
          </span>
        </div>
      </div>

      {/* Metric Badges Row */}
      <div className="grid grid-cols-3 gap-2.5 mb-4 relative z-10">
        <div className="bg-[#181818] border border-zinc-800/80 rounded-xl p-2.5 text-center">
          <span className="text-[10px] font-semibold uppercase text-zinc-400 block tracking-wider">
            Daily Avg
          </span>
          <span className="text-sm font-extrabold text-[#FAF7F2] font-heading mt-0.5 block">
            {averageTripsPerDay} <span className="text-[10px] font-normal text-zinc-400">/day</span>
          </span>
        </div>

        <div className="bg-[#181818] border border-zinc-800/80 rounded-xl p-2.5 text-center">
          <span className="text-[10px] font-semibold uppercase text-zinc-400 block tracking-wider">
            Peak Shift
          </span>
          <span className="text-sm font-extrabold text-[#E9C46A] font-heading mt-0.5 block flex items-center justify-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            {maxTripsDay.day} ({maxTripsDay.trips})
          </span>
        </div>

        <div className="bg-[#181818] border border-zinc-800/80 rounded-xl p-2.5 text-center">
          <span className="text-[10px] font-semibold uppercase text-zinc-400 block tracking-wider">
            Distance
          </span>
          <span className="text-sm font-extrabold text-[#FAF7F2] font-heading mt-0.5 block">
            {totalDistance} <span className="text-[10px] font-normal text-zinc-400">km</span>
          </span>
        </div>
      </div>

      {/* Recharts Mini Line / Area Chart */}
      <div className="w-full h-32 relative z-10 pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 12, left: -22, bottom: 0 }}
            onMouseMove={(state: any) => {
              if (state && state.activePayload && state.activePayload.length) {
                setHoveredData(state.activePayload[0].payload as DailyTripData);
              }
            }}
            onMouseLeave={() => setHoveredData(null)}
          >
            <defs>
              <linearGradient id="goldTripGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E9C46A" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#E9C46A" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#27272A" 
              opacity={0.4} 
              vertical={false} 
            />

            <XAxis 
              dataKey="day" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#A1A1AA', fontSize: 11, fontWeight: 600 }}
              dy={6}
            />

            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#71717A', fontSize: 10 }} 
              domain={[0, 'dataMax + 2']}
              allowDecimals={false}
            />

            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: '#E9C46A', strokeWidth: 1.5, strokeDasharray: '4 4' }}
            />

            <Area
              type="monotone"
              dataKey="trips"
              stroke="#E9C46A"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#goldTripGradient)"
              activeDot={{ 
                r: 5.5, 
                fill: '#FAF7F2', 
                stroke: '#E9C46A', 
                strokeWidth: 2.5,
                className: "drop-shadow-[0_0_8px_rgba(233,196,106,0.8)]"
              }}
              dot={{ 
                r: 3.5, 
                fill: '#E9C46A', 
                stroke: '#121212', 
                strokeWidth: 1.5 
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Footer Quick Info */}
      <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>On-Time Dispatch Rate: <strong className="text-[#FAF7F2] font-semibold">{averageOnTime}%</strong></span>
        </div>
        <span className="text-[11px] text-[#E9C46A] font-semibold hover:underline cursor-pointer flex items-center gap-0.5">
          Detailed Logs <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data: DailyTripData = payload[0].payload;
    return (
      <div className="bg-[#181818]/95 backdrop-blur-xl border border-amber-500/35 rounded-xl shadow-2xl p-3 text-xs min-w-[170px] animate-in fade-in-50 zoom-in-95">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2">
          <span className="font-bold text-[#FAF7F2]">{data.fullDate}</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[#E9C46A] font-bold text-[10px]">
            {data.day}
          </span>
        </div>

        <div className="space-y-1.5 text-zinc-300">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 font-medium">Completed Trips:</span>
            <span className="font-extrabold text-[#E9C46A] text-sm">{data.trips} trips</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 font-medium">Distance Covered:</span>
            <span className="font-semibold text-[#FAF7F2]">{data.distanceKm} km</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 font-medium">Shift Duration:</span>
            <span className="font-semibold text-zinc-300">{data.hoursDriven} hrs</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-zinc-800/80">
            <span className="text-zinc-400 font-medium">On-Time Rate:</span>
            <span className="font-bold text-emerald-400">{data.onTimeRate}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
