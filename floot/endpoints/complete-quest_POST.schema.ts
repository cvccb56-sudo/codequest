import { z } from "zod";
import superjson from "superjson";
export const schema=z.object({questId:z.coerce.number().int().positive()});
export type InputType=z.infer<typeof schema>;
export type OutputType={xpAwarded:number;coinsAwarded:number;level:number;xp:number;coins:number;message:string};
export const postCompleteQuest=async(body:InputType,init?:RequestInit):Promise<OutputType>=>{
 const validated=schema.parse(body); const result=await fetch("/_api/complete-quest",{method:"POST",credentials:"include",body:superjson.stringify(validated),...init,headers:{"Content-Type":"application/json",...(init?.headers??{})}});
 if(!result.ok) throw new Error((await result.text())||"Quest failed"); return superjson.parse<OutputType>(await result.text());
};
