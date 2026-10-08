import superjson from "superjson";
export type OutputType = {
  user: { id:number; displayName:string; email:string; avatarUrl:string|null };
  profile: { level:number; xp:number; coins:number; streak:number };
  nextQuest: { id:string; level:number; title:string; description:string; xpReward:number; coinReward:number } | null;
  campaign: Array<{level:number; title:string; completed:boolean; locked:boolean}>;
  nextBoss: {level:number; name:string; locked:boolean} | null;
  leaderboard: Array<{ rank:number; displayName:string; level:number; xp:number; title:string; badges:string[]; avatarUrl:string|null }>;
};
export const getDashboard = async (init?: RequestInit): Promise<OutputType> => {
  const result = await fetch("/_api/dashboard", { method:"GET", credentials:"include", ...init });
  const body = await result.text();
  if (!result.ok) throw new Error(body || "Dashboard request failed");
  return superjson.parse<OutputType>(body);
};
