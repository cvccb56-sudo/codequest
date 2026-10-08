import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import type { OutputType } from "./dashboard_GET.schema";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const userId = String(user.id);

    let profile = await db.selectFrom("playerProfiles").selectAll().where("userId","=",userId).executeTakeFirst();
    if (!profile) {
      profile = await db.insertInto("playerProfiles").values({userId,level:1,xp:0,coins:0,streak:0}).returningAll().executeTakeFirstOrThrow();
    }

    const progress = await db.selectFrom("userQuestProgress").select(["userId","questId"]).execute();
    const userProgress = progress.filter(p => String(p.userId) === userId);
    const completedQuestIds = new Set(userProgress.map(p => String(p.questId)));

    const completedQuestRows = userProgress.length
      ? await db.selectFrom("quests").select(["id","level"]).where("id","in",userProgress.map(p => String(p.questId))).execute()
      : [];
    const highestCompletedLevel = completedQuestRows.reduce((max,q) => Math.max(max,q.level),0);
    const effectiveLevel = Math.max(profile.level, Math.min(100, highestCompletedLevel + 1));

    const nextQuest = await db.selectFrom("quests").select(["id","level","title","description","xpReward","coinReward"])
      .where("level","=",effectiveLevel).orderBy("id","asc").limit(1).executeTakeFirst();

    const rows = await db.selectFrom("playerProfiles").innerJoin("users","users.id","playerProfiles.userId")
      .select(["users.id as userId","users.displayName","users.avatarUrl","playerProfiles.level","playerProfiles.xp","playerProfiles.streak"])
      .orderBy("playerProfiles.level","desc").orderBy("playerProfiles.xp","desc").execute();

    const titleFor=(level:number)=>level>=91?"Spring Architect":level>=81?"Spring Master":level>=71?"Backend Knight":level>=61?"API Ranger":level>=51?"SQL Warden":level>=41?"DSA Hunter":level>=31?"Java Warrior":level>=26?"Generic Warlord":level>=21?"Collection Hunter":level>=16?"Collection Adept":level>=11?"OOP Initiate":level>=10?"Loop Slayer":level>=6?"Java Initiate":level>=5?"Debug Hunter":level>=2?"Rising Coder":"Code Recruit";
    const completedByUser=new Map<string,number>();
    for(const p of progress){const key=String(p.userId);completedByUser.set(key,(completedByUser.get(key)??0)+1);}
    const badgesFor=(uid:string,level:number,streak:number)=>{const count=completedByUser.get(String(uid))??0;const b:string[]=[];if(count>=1)b.push("First Blood");if(count>=3)b.push("Quest Hunter");if(level>=5)b.push("Boss Hunter");if(level>=10)b.push("Loop Slayer");if(level>=15)b.push("OOP Knight");if(level>=20)b.push("Collection Hunter");if(level>=25)b.push("Generic Warlord");if(level>=30)b.push("Collections Champion");if(streak>=7)b.push("7-Day Streak");return b;};
    const leaderboard = rows.map((r,i)=>{const isMe=String(r.userId)===userId;const level=isMe?effectiveLevel:r.level;return {rank:i+1,displayName:r.displayName,level,xp:r.xp,title:titleFor(level),badges:badgesFor(String(r.userId),level,r.streak),avatarUrl:r.avatarUrl};});

    const questRows = await db.selectFrom("quests").select(["id","level","title"]).where("level","<=",30).orderBy("level","asc").execute();
    const campaign = questRows.map(q=>({level:q.level,title:q.title,completed:completedQuestIds.has(String(q.id)),locked:q.level>effectiveLevel}));

    const milestones=[5,10,15,20,25,30];
    const bossLevel=milestones.find(n=>effectiveLevel<=n)??null;
    const bossName=bossLevel===5?"Debug Knight":bossLevel===10?"Loop Warden":bossLevel===15?"OOP Knight":bossLevel===20?"Collection Hunter":bossLevel===25?"Generic Warlord":bossLevel===30?"Collections Champion":"Campaign Complete";
    const nextBoss = bossLevel ? {level:bossLevel,name:bossName,locked:effectiveLevel<bossLevel}:null;

    const output:OutputType={
      user:{id:user.id,displayName:user.displayName,email:user.email,avatarUrl:user.avatarUrl},
      profile:{level:effectiveLevel,xp:profile.xp,coins:profile.coins,streak:profile.streak},
      nextQuest:nextQuest?{id:String(nextQuest.id),level:nextQuest.level,title:nextQuest.title,description:nextQuest.description,xpReward:nextQuest.xpReward,coinReward:nextQuest.coinReward}:null,
      campaign,nextBoss,leaderboard
    };
    return new Response(superjson.stringify(output),{headers:{"Content-Type":"application/json"}});
  } catch(error) {
    return new Response(superjson.stringify({error:error instanceof Error?"Not authenticated": "Unauthorized"}),{status:401,headers:{"Content-Type":"application/json"}});
  }
}
