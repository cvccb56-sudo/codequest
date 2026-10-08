import React from "react";
import {useQuery,useQueryClient} from "@tanstack/react-query";
import {getProfile} from "../endpoints/profile_GET.schema";
import {postProfile} from "../endpoints/profile_POST.schema";
import styles from "./profile.module.css";

export default function Profile(){
 const q=useQuery({queryKey:["profile"],queryFn:getProfile});
 const qc=useQueryClient();
 const [file,setFile]=React.useState<File|null>(null);
 const [preview,setPreview]=React.useState("");
 const [birthDate,setBirthDate]=React.useState("");
 const [msg,setMsg]=React.useState("");
 if(q.isPending)return <main className={styles.page}><div className={styles.card}><span>// PLAYER PROFILE</span><h1>Loading…</h1></div></main>;
 if(q.isError)return <main className={styles.page}><div className={styles.card}><h1>Profile unavailable</h1><p>Log in again and reopen your profile.</p><a href="/login">LOGIN →</a></div></main>;
 const d=q.data;
 const avatar=preview||d.user.avatarUrl;
 const choose=(f:File|null)=>{
  if(!f)return;
  if(!["image/png","image/jpeg","image/webp"].includes(f.type)){setMsg("Use PNG, JPG or WebP.");return}
  if(f.size>2.8*1024*1024){setMsg("Image must be under 2.8 MB.");return}
  if(preview)URL.revokeObjectURL(preview);
  setFile(f);setPreview(URL.createObjectURL(f));setMsg("");
 };
 const save=async()=>{
  try{
   let avatarUrl=d.user.avatarUrl||"";
   if(file)avatarUrl=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error("Could not read image"));r.readAsDataURL(file)});
   if(!avatarUrl){setMsg("Choose a profile photo first.");return}
   await postProfile({avatarUrl,birthDate:birthDate||null});
   setFile(null);setMsg("Profile saved.");
   if(preview)URL.revokeObjectURL(preview);setPreview("");
   await qc.invalidateQueries({queryKey:["profile"]});
   await qc.invalidateQueries({queryKey:["dashboard"]});
  }catch(e){setMsg(e instanceof Error?e.message:"Save failed")}
 };
 return <main className={styles.page}>
  <header className={styles.header}><span>// PLAYER PROFILE</span><h1>{d.user.displayName}</h1><p>Your public CodeQuest identity.</p></header>
  <section className={styles.card}>
   <div className={styles.identity}>
    <div className={styles.avatarWrap}>
     {avatar?<img src={avatar} alt="Profile" className={styles.avatar}/>:<div className={styles.avatarEmpty}><span>+</span><small>PHOTO</small></div>}
    </div>
    <div><span className={styles.level}>LV {d.profile.level}</span><h2>{d.title}</h2><p>{d.profile.xp.toLocaleString()} XP · {d.profile.coins} coins · 🔥 {d.profile.streak} day streak</p><div className={styles.badges}>{d.badges.length?d.badges.map(b=><span key={b}>◆ {b}</span>):<span>No badges yet</span>}</div></div>
   </div>
   <div className={styles.form}>
    <label className={styles.upload}><b>PROFILE PHOTO</b><span>{file?"New photo selected":"Choose an image"}</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>choose(e.target.files?.[0]??null)}/></label>
    <small>PNG, JPG or WebP · maximum 2.8 MB · shown on the leaderboard</small>
    <label><b>BIRTH DATE</b><input type="date" value={birthDate} onChange={e=>setBirthDate(e.target.value)}/></label>
    <button className={styles.save} onClick={save}>SAVE PROFILE →</button>
    {msg&&<p className={msg==="Profile saved."?styles.success:styles.error}>{msg}</p>}
   </div>
  </section>
  <a className={styles.back} href="/leaderboard">← Global leaderboard</a>
 </main>;
}
