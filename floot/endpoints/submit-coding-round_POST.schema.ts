import { z } from "zod";
import superjson from "superjson";
export const schema=z.object({questId:z.coerce.number().int().positive(),code:z.string().min(10).max(20000)});
export type InputType=z.infer<typeof schema>;
export type OutputType={passed:boolean;message:string;details?:string[];lineHints?:string[];xpAwarded?:number;coinsAwarded?:number;level?:number;xp?:number;coins?:number};
export const postSubmitCodingRound=async(body:InputType,init?:RequestInit):Promise<OutputType>=>{const validated=schema.parse(body);const result=await fetch("/_api/submit-coding-round",{method:"POST",credentials:"include",body:superjson.stringify(validated),...init,headers:{"Content-Type":"application/json",...(init?.headers??{})}});if(!result.ok)throw new Error((await result.text())||"Submission failed");return superjson.parse<OutputType>(await result.text())};
