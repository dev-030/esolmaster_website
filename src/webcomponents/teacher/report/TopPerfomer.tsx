"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Performer {
  id: string;
  name: string;
  className: string;
  score: number;
  completedTasks?: number;
  email?: string;
}

interface TopPerformersProps {
  data: Performer[];
}

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

export const TopPerformers = ({ data }: TopPerformersProps) => {
  const empty = !data || data.length === 0;

  return (
    <Card className="w-full rounded-xl border border-slate-200/70 shadow-none">
      <CardHeader className="px-5 py-4 border-b border-slate-100">
        <CardTitle className="text-sm font-semibold text-slate-800">Top Performers</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-5">
        {empty ? (
          <div className="text-center py-8 text-sm text-slate-400">
            No performers data available
          </div>
        ) : (
          data.map((performer, index) => (
            <div
              key={performer.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative shrink-0">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/15 text-primary font-bold text-xs">
                      {getInitials(performer.name)}
                    </AvatarFallback>
                  </Avatar>
                  {index < 3 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-semibold text-sm text-slate-800 leading-tight truncate">
                    {performer.name}
                  </span>
                  <span className="text-xs text-slate-400 truncate">{performer.className}</span>
                  {performer.completedTasks && (
                    <span className="text-[10px] text-slate-400">
                      {performer.completedTasks} tasks completed
                    </span>
                  )}
                </div>
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
                {Math.round(performer.score)}%
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};