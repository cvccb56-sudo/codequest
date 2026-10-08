import { z } from "zod";
export const InputSchema=z.object({avatarUrl:z.string().trim().max(3000000).refine(v=>v.startsWith("data:image/")||/^https?:\/\//.test(v),"Enter an image URL or upload an image"),birthDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional()});
export const OutputSchema=z.object({avatarUrl:z.string(),birthDate:z.string().nullable().optional()});
export type InputType=z.infer<typeof InputSchema>; export type OutputType=z.infer<typeof OutputSchema>;
export async function postProfile(input:InputType):Promise<OutputType>{const r=await fetch("/_api/profile",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify(input)});const j=await r.json();if(!r.ok)throw new Error(j.message||j.error||"Could not save profile");return OutputSchema.parse(j);}
