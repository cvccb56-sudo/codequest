import React from "react";
import {useQuery} from "@tanstack/react-query";
import {getDashboard} from "../endpoints/dashboard_GET.schema";
import styles from "./gamepage.module.css";

function frame(level:number){
 return level>=30?"2px solid #f5c542":level>=20?"2px solid #d6a84f":level>=10?"2px solid #c0c0c0":level>=5?"2px solid #a855f7":"1px solid var(--border)";
}
export default function Leaderboard(){
 const q=useQuery({queryKey:["dashboard"],queryFn:getDashboard,staleTime:0});
 if(q.isPending)return <main className={styles.page}><h1>Loading leaderboard…</h1></main>;
 if(q.isError)return <main className={styles.page}><h1>Leaderboard unavailable</h1></main>;
 return <main className={styles.page}>
  <header className={styles.header}><span>// GLOBAL RANKING</span><h1>Leaderboard</h1><p>One shared ranking for every CodeQuest player.</p></header>
  <section className={styles.table}>{q.data.leaderboard.map(r=>
   <div className={styles.rankrow} key={r.rank}>
    <strong>#{r.rank}</strong>
    <span style={{display:"flex",alignItems:"center",gap:10,minWidth:220}}>
     {r.avatarUrl?<img src={r.avatarUrl} alt="" style={{width:44,height:44,borderRadius:"50%",objectFit:"cover",border:frame(r.level),boxSizing:"border-box"}}/>:<span style={{width:44,height:44,borderRadius:"50%",display:"grid",placeItems:"center",border:frame(r.level),boxSizing:"border-box",fontWeight:800}}>{r.displayName.slice(0,1).toUpperCase()}</span>}
     <span><strong>{r.displayName}</strong><small style={{display:"block",opacity:.65}}>{r.title}</small></span>
    </span>
    <b>Lv {r.level}</b><em>{r.title}</em><small>{r.badges.length?r.badges.join(" · "):"No badges yet"}</small><b>{r.xp.toLocaleString()} XP</b>
   </div>
  )}</section>
  <a className={styles.back} href="/">← Dashboard</a>
 </main>;
}
