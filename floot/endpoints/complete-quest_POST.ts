import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { schema, type OutputType } from "./complete-quest_POST.schema";
export async function handle(request:Request){
 try{
  const {user}=await getServerUserSession(request); const input=schema.parse(superjson.parse(await request.text())); const userId=String(user.id); const questId=String(input.questId);
  const result=await db.transaction().execute(async trx=>{
   const quest=await trx.selectFrom("quests").selectAll().where("id","=",questId).executeTakeFirst();
   if(!quest) throw new Error("Quest not found");
   const profile=await trx.selectFrom("playerProfiles").selectAll().where("userId","=",userId).executeTakeFirstOrThrow();
   const already=await trx.selectFrom("userQuestProgress").select("id").where("userId","=",userId).where("questId","=",questId).executeTakeFirst();
   if(already) throw new Error("Quest already completed");
   if(quest.level>profile.level) throw new Error("Quest is locked");
   const today=new Date().toISOString().slice(0,10);
   const dailyXp=profile.lastXpDate && new Date(profile.lastXpDate).toISOString().slice(0,10)===today?profile.xp:0;
   const dailyCap=1000;
   const award=Math.min(quest.xpReward,Math.max(0,dailyCap-dailyXp));
   if(award<=0) throw new Error("Daily XP limit reached");
   const total=profile.xp+award; const level=Math.max(profile.level,Math.min(100,quest.level+1));
   const coins=profile.coins+quest.coinReward;
   await trx.insertInto("userQuestProgress").values({userId,questId}).execute();
   await trx.updateTable("playerProfiles").set({xp:total,level,coins,lastXpDate:new Date(),updatedAt:new Date()}).where("userId","=",userId).execute();
   return {xpAwarded:award,coinsAwarded:quest.coinReward,level,xp:total,coins,message:"Quest cleared"};
  });
  return new Response(superjson.stringify(result satisfies OutputType),{headers:{"Content-Type":"application/json"}});
 }catch(error){return new Response(superjson.stringify({error:error instanceof Error?error.message:"Quest failed"}),{status:400,headers:{"Content-Type":"application/json"}})}
}
