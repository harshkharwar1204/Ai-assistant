"use strict";(()=>{var e={};e.id=628,e.ids=[628],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},2048:e=>{e.exports=require("fs")},2615:e=>{e.exports=require("http")},8791:e=>{e.exports=require("https")},5315:e=>{e.exports=require("path")},8621:e=>{e.exports=require("punycode")},6162:e=>{e.exports=require("stream")},7360:e=>{e.exports=require("url")},1764:e=>{e.exports=require("util")},2623:e=>{e.exports=require("worker_threads")},1568:e=>{e.exports=require("zlib")},7561:e=>{e.exports=require("node:fs")},4492:e=>{e.exports=require("node:stream")},2477:e=>{e.exports=require("node:stream/web")},7366:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>m,patchFetch:()=>h,requestAsyncStorage:()=>l,routeModule:()=>c,serverHooks:()=>g,staticGenerationAsyncStorage:()=>d});var s={};t.r(s),t.d(s,{POST:()=>u});var o=t(9303),a=t(8716),n=t(670),i=t(7070),p=t(3077);async function u(e){let r=process.env.GROQ_API_KEY;if(!r)return i.NextResponse.json({error:"Groq API key not configured. Set GROQ_API_KEY in .env.local"},{status:500});try{let t;let{prompt:s,currentItems:o}=await e.json();if(!s||"string"!=typeof s)return i.NextResponse.json({error:"A prompt is required"},{status:400});let a=(o||[]).map(e=>e.name).join(", "),n=new p.ZP({apiKey:r}),u=await n.chat.completions.create({model:"moonshotai/kimi-k2-instruct-0905",messages:[{role:"system",content:`You are a smart grocery planning assistant for an Indian household.

RULES:
- Generate a JSON object containing "recipes" based on the user's request.
- Provide AT LEAST 5 distinct recipes/meal ideas.
- Structure:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "Brief description",
      "source": "Source (e.g., 'Traditional', 'YouTube - Chef Ranveer Brar', etc.)",
      "sourceUrl": "URL to the recipe source (e.g. YouTube video or blog post)",
      "instructions": ["Step 1", "Step 2", ...],
      "ingredients": [
        { "name": "Ingredient Name", "category": "Category", "isEssential": boolean }
      ]
    }
  ]
}
- Categories: Dairy, Vegetables, Fruits, Grains, Spices, Snacks, Beverages, Meat, Cleaning, Personal Care, Other.
- NEVER suggest lentils (dal) or fish — the user has dietary restrictions.
- Prefer Indian grocery items and brands where applicable.
- Mark staple items as essential (isEssential: true).
- Only return the JSON object, no other text.
- Do NOT include items the user already has: ${a||"none"}.`},{role:"user",content:s}],temperature:.7,max_completion_tokens:4096}),c=u.choices[0]?.message?.content||"{}";try{let e=c.replace(/```json\s*/gi,"").replace(/```\s*/gi,"").trim();t=JSON.parse(e)}catch{return console.error("Failed to parse Groq response:",c),i.NextResponse.json({error:"AI returned an invalid response. Please try again."},{status:502})}if(!t.recipes||!Array.isArray(t.recipes))return i.NextResponse.json({error:"AI returned unexpected format.",raw:c},{status:502});return i.NextResponse.json({recipes:t.recipes})}catch(e){return console.error("Groq grocery plan error:",e),i.NextResponse.json({error:e.message||"Failed to generate grocery plan"},{status:500})}}let c=new o.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/groceries/plan/route",pathname:"/api/groceries/plan",filename:"route",bundlePath:"app/api/groceries/plan/route"},resolvedPagePath:"C:\\Users\\kharw\\OneDrive\\Desktop\\ai-assistant\\src\\app\\api\\groceries\\plan\\route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:l,staticGenerationAsyncStorage:d,serverHooks:g}=c,m="/api/groceries/plan/route";function h(){return(0,n.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:d})}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[948,972,304,77],()=>t(7366));module.exports=s})();