import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import type { OutputType } from "./profile_GET.schema";

export async function handle(request:Request){
 try{
  const {user}=await getServerUserSession(request);
  const userId=String(user.id);
  let p=await db.selectFrom("playerProfiles").selectAll().where("userId","=",userId).executeTakeFirst();
  if(!p)p=await db.insertInto("playerProfiles").values({userId,level:1,xp:0,coins:0,streak:0}).returningAll().executeTakeFirstOrThrow();

  const count=await db.selectFrom("userQuestProgress").select("id").where("userId","=",userId).execute();
  const title=count.length===0 && p.xp===0?"Unranked":p.level>=91?"Spring Architect":p.level>=81?"Spring Master":p.level>=71?"Backend Knight":p.level>=61?"API Ranger":p.level>=51?"SQL Warden":p.level>=41?"DSA Hunter":p.level>=31?"Java Warrior":p.level>=26?"Generic Warlord":p.level>=21?"Collection Hunter":p.level>=16?"Collection Adept":p.level>=11?"OOP Initiate":p.level>=10?"Loop Slayer":p.level>=6?"Java Initiate":p.level>=5?"Debug Hunter":p.level>=2?"Rising Coder":"Code Recruit";
  const badges:string[]=[];
  if(count.length>=1)badges.push("First Blood");
  if(count.length>=3)badges.push("Quest Hunter");
  if(p.level>=5)badges.push("Boss Hunter");
  if(p.level>=10)badges.push("Loop Slayer");
  if(p.level>=15)badges.push("OOP Knight");
  if(p.level>=20)badges.push("Collection Hunter");
  if(p.level>=25)badges.push("Generic Warlord");
  if(p.level>=30)badges.push("Collections Champion");
  if(p.streak>=7)badges.push("7-Day Streak");

  const out:OutputType={
   user:{id:user.id,displayName:user.displayName,email:user.email,avatarUrl:user.avatarUrl},
   profile:{level:p.level,xp:p.xp,coins:p.coins,streak:p.streak},
   title,badges
  };
  return new Response(superjson.stringify(out),{headers:{"Content-Type":"application/json"}});
 }catch(e){
  console.error("Profile GET failed:",e);
  return new Response(superjson.stringify({error:e instanceof Error?e.message:"Unauthorized"}),{status:401,headers:{"Content-Type":"application/json"}});
 }
}
