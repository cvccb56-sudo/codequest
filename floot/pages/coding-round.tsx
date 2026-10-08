import React,{useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import styles from "./gamepage.module.css";
import {postSubmitCodingRound} from "../endpoints/submit-coding-round_POST.schema";
import {getQuestContent} from "../helpers/questContent";
export default function CodingRound(){
 const queryClient=useQueryClient();
 const params=new URLSearchParams(typeof window!=="undefined"?window.location.search:"");
 const questId=Number(params.get("questId")||1);
 const info=getQuestContent(questId);
 const [started,setStarted]=useState(false);
 const [code,setCode]=useState("import java.util.Scanner;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    // write your Java solution here\n  }\n}");
 const [result,setResult]=useState<any>(null); const [busy,setBusy]=useState(false);
 const submit=async()=>{setBusy(true);setResult(null);try{const response=await postSubmitCodingRound({questId,code});setResult(response);if(response.passed){await queryClient.invalidateQueries({queryKey:["dashboard"]});}}catch(e){setResult({passed:false,message:e instanceof Error?e.message:"Submission failed"})}finally{setBusy(false)}};
 return <main className={styles.page}><header className={styles.header}><span>// JAVA ONLINE COMPILER · LEVEL {questId}</span><h1>{info.title}</h1><p>{info.description}</p></header>
 {!started?<section className={styles.card}><h2>Java Compiler</h2><p>Write normal Java code. CodeQuest compiles and runs it with test input. If the actual output is correct, the quest is cleared.</p><button className={styles.button} onClick={()=>setStarted(true)}>START CODING →</button></section>:
 <section className={styles.editor}><div><b>JAVA EDITOR</b><textarea value={code} onChange={e=>setCode(e.target.value)} spellCheck={false} style={{width:"100%",minHeight:420,background:"#07060a",color:"#eee",border:"1px solid #302a3a",padding:16,fontFamily:"monospace",fontSize:14}}/>
 <div style={{display:"flex",gap:12,marginTop:12}}><button className={styles.button} onClick={submit} disabled={busy}>{busy?"COMPILING…":"RUN & SUBMIT →"}</button></div>
 {result&&<div className={styles.result}><strong>{result.message}</strong>{result.details?.map((x:string,i:number)=><p key={i}>• {x}</p>)}{result.passed&&<p>🎯 Correct output. +{result.xpAwarded||0} XP / +{result.coinsAwarded||0} coins.</p>}</div>}</div>
 <div className={styles.tests}><b>DEMO EXAMPLE</b><pre style={{whiteSpace:"pre-wrap"}}>Input:
{info.demoInput||"(none)"}

Output:
{info.demoOutput}</pre><b>HOW IT WORKS</b><p>1. Write your solution<br/>2. Compile and run<br/>3. Your program is tested<br/>4. Correct logic = quest cleared</p><small>Your Java program actually runs on the server.</small></div></section>}
 <a className={styles.back} href="/quests">← Quest Board</a></main>
}
