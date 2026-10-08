import React from "react";
import styles from "./gamepage.module.css";
import {QUEST_CONTENT} from "../helpers/questContent";
import {useQuery} from "@tanstack/react-query";
import {getDashboard} from "../endpoints/dashboard_GET.schema";
import {useAuth} from "../helpers/useAuth";
const rewards:any={1:[100,25],2:[120,30],3:[140,35],4:[160,40],5:[250,75],6:[110,25],7:[115,25],8:[120,30],9:[125,30],10:[250,80],11:[120,30],12:[125,30],13:[130,35],14:[135,35],15:[275,85],16:[120,30],17:[125,30],18:[130,35],19:[135,35],20:[275,90],21:[130,35],22:[135,35],23:[140,40],24:[145,40],25:[300,100],26:[140,40],27:[145,40],28:[150,45],29:[155,45],30:[350,120]};
export default function Quests(){
 const {authState}=useAuth();
 const dashboard=useQuery({queryKey:["dashboard"],queryFn:getDashboard,enabled:authState.type==="authenticated"});
 const currentLevel=dashboard.data?.profile.level??1;
 return <main className={styles.page}>
  <header className={styles.header}><span>// JAVA ASCENSION · LEVELS 1–30</span><h1>Quests & Coding Rounds</h1><p>Every quest has a clear objective and a demo. Clear the current level to unlock the next one.</p></header>
  <div className={styles.grid}>{QUEST_CONTENT.map(q=>{const locked=q.level>currentLevel;return <article className={styles.card} key={q.id}>
   <small>LEVEL {q.level}{q.id%5===0?" · MINI-BOSS":""}</small><h2>{q.title}</h2><p>{q.description}</p>
   <div className={styles.reward}>+{rewards[q.id][0]} XP · +{rewards[q.id][1]} COINS</div>
   <details><summary>DEMO EXAMPLE</summary><pre style={{whiteSpace:"pre-wrap"}}>{"Input:\n"+(q.demoInput||"(none)")+"\n\nOutput:\n"+q.demoOutput}</pre><small>{q.hint}</small></details>
   {locked?<span className={styles.lock}>🔒 LOCKED · CLEAR LEVEL {q.level-1}</span>:<a className={styles.button} href={"/coding-round?questId="+q.id}>START CODING →</a>}
  </article>})}</div>
  <a className={styles.back} href="/">← Dashboard</a>
 </main>;
}
