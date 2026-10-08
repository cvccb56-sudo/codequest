import { z } from "zod";
export const OutputSchema=z.object({user:z.object({id:z.number(),displayName:z.string(),email:z.string(),avatarUrl:z.string().nullable()}),profile:z.object({level:z.number(),xp:z.number(),coins:z.number(),streak:z.number()}),title:z.string(),badges:z.array(z.string())});
export type OutputType=z.infer<typeof OutputSchema>;
export async function getProfile():Promise<OutputType>{const r=await fetch("/_api/profile",{credentials:"include"});if(!r.ok)throw new Error("Profile unavailable");return OutputSchema.parse(await r.json());}
