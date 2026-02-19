"use strict";(()=>{var e={};e.id=335,e.ids=[335],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},2048:e=>{e.exports=require("fs")},2615:e=>{e.exports=require("http")},8791:e=>{e.exports=require("https")},5315:e=>{e.exports=require("path")},8621:e=>{e.exports=require("punycode")},6162:e=>{e.exports=require("stream")},7360:e=>{e.exports=require("url")},1764:e=>{e.exports=require("util")},2623:e=>{e.exports=require("worker_threads")},1568:e=>{e.exports=require("zlib")},7561:e=>{e.exports=require("node:fs")},4492:e=>{e.exports=require("node:stream")},2477:e=>{e.exports=require("node:stream/web")},9089:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>g,patchFetch:()=>f,requestAsyncStorage:()=>d,routeModule:()=>c,serverHooks:()=>m,staticGenerationAsyncStorage:()=>h});var s={};r.r(s),r.d(s,{POST:()=>p});var o=r(9303),a=r(8716),n=r(670),i=r(7070),u=r(3077);let l=`You are a personal life assistant for the user's "Life OS" app.
You have access to structured tools to help the user manage their life.

TOOLS AVAILABLE:
1. addTask(title: string, date?: string, time?: string)
   - Use when user wants to do something, schedule something, or create a reminder.
   - If 'today', 'tomorrow' is said, convert to YYYY-MM-DD.
   - If no date is specified, default to today.

2. addHabit(name: string)
   - Use when user wants to build a new habit or routine.

3. addGrocery(name: string, category?: string)
   - Use when user wants to buy something or adds to shopping list.
   - Infer category if possible (Dairy, Veg, Fruits, etc).

4. logExpense(amount: number, description: string, category: string)
   - Use when user spends money.
   - Categories: Food, Transport, Bills, Shopping, Entertainment, Health, Other.

5. clearPantry()
   - Use when user explicitly asks to clear all grocery/pantry items.

6. clearTasks(date: string)
   - Use when user explicitly asks to clear all tasks for a specific date.
   - Convert relative dates (today, tomorrow, etc.) to YYYY-MM-DD.

RESPONSE FORMAT:
You must respond in JSON format ONLY.
If the user's intent matches one or more tools, return:
{
  "requests": [
    { "tool": "toolName", "args": { ... } }
  ],
  "message": "Confirmation message to show user"
}

If the user just wants to chat, asks a question, or their request does NOT match any available tool:
{
  "message": "Your conversational response here"
}

CRITICAL RULES:
- ONLY execute tools for the user's LATEST message. Never re-execute tools from prior turns.
- Do NOT re-execute tools for actions that were already confirmed in the conversation history.
- If the user's latest request does NOT match any available tool, respond conversationally. Do NOT fall back to executing a previous tool.
- If you are unsure whether the user wants a tool action or is just chatting, respond conversationally without any tool calls.
- Keep confirmation messages concise and friendly.

Current Date: ${(()=>{let e=new Date,t=e.getFullYear(),r=String(e.getMonth()+1).padStart(2,"0"),s=String(e.getDate()).padStart(2,"0");return`${t}-${r}-${s}`})()}
`;async function p(e){let t=process.env.GROQ_API_KEY;if(!t)return i.NextResponse.json({error:"Groq API Key missing"},{status:500});try{let r;let{message:s,history:o=[]}=await e.json();if(!s)return i.NextResponse.json({error:"Message required"},{status:400});let a=new u.ZP({apiKey:t}),n=[{role:"system",content:l},...o,{role:"user",content:s}],p=await a.chat.completions.create({model:"llama-3.3-70b-versatile",messages:n,temperature:.1,response_format:{type:"json_object"}}),c=p.choices[0]?.message?.content;if(!c)throw Error("No content received from LLM");try{r=JSON.parse(c)}catch(e){return console.error("Failed to parse LLM JSON:",c),i.NextResponse.json({message:"I didn't quite get that. Could you try again?"})}return i.NextResponse.json(r)}catch(e){return console.error("Assistant API Error:",e),i.NextResponse.json({error:e.message||"Internal Server Error"},{status:500})}}let c=new o.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/assistant/chat/route",pathname:"/api/assistant/chat",filename:"route",bundlePath:"app/api/assistant/chat/route"},resolvedPagePath:"C:\\Users\\kharw\\OneDrive\\Desktop\\ai-assistant\\src\\app\\api\\assistant\\chat\\route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:d,staticGenerationAsyncStorage:h,serverHooks:m}=c,g="/api/assistant/chat/route";function f(){return(0,n.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:h})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[948,972,304,77],()=>r(9089));module.exports=s})();