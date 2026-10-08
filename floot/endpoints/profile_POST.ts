import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { InputSchema } from "./profile_POST.schema";

export async function handle(request:Request){
 try{
  const {user}=await getServerUserSession(request);
  const input=InputSchema.parse(superjson.parse(await request.text()));
  await db.updateTable("users").set({
    avatarUrl:String(input.avatarUrl),
    birthDate:input.birthDate?new Date(String(input.birthDate)):null,
    updatedAt:new Date()
  }).where("id","=",user.id).execute();
  return new Response(superjson.stringify({avatarUrl:String(input.avatarUrl),birthDate:input.birthDate??null}),{headers:{"Content-Type":"application/json"}});
 }catch(e){
  return new Response(superjson.stringify({message:e instanceof Error?e.message:"Could not save profile"}),{status:400,headers:{"Content-Type":"application/json"}});
 }
}
