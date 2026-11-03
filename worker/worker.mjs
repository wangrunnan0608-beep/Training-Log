// Cloudflare Worker: create secrets DEEPSEEK_API_KEY and ACCESS_TOKEN in dashboard.
// Set ALLOWED_ORIGIN to the exact GitHub Pages site origin (e.g. https://username.github.io).
const respond=(data,status,origin)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':origin,'Vary':'Origin','X-Content-Type-Options':'nosniff'}});
export default {async fetch(req,env){
 const started=Date.now();const origin=req.headers.get('Origin')||'';const allowed=(env.ALLOWED_ORIGIN||'').trim();
 if(!allowed||origin!==allowed)return respond({error:'Origin not allowed'},403,'null');
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Max-Age':'600','Vary':'Origin'}});
 const url=new URL(req.url);if(url.pathname!=='/api/chat'||req.method!=='POST')return respond({error:'Not found'},404,allowed);
 if(!env.ACCESS_TOKEN||!env.DEEPSEEK_API_KEY)return respond({error:'Worker secrets not configured'},503,allowed);
 const supplied=(req.headers.get('Authorization')||'').replace(/^Bearer\s+/i,'');if(!supplied||supplied!==env.ACCESS_TOKEN)return respond({error:'Unauthorized'},401,allowed);
 if(Number(req.headers.get('Content-Length')||0)>24000)return respond({error:'Request too large'},413,allowed);
 let payload;try{const body=await req.text();if(body.length>24000)return respond({error:'Request too large'},413,allowed);payload=JSON.parse(body)}catch{return respond({error:'Invalid JSON'},400,allowed)}
 if(!['deepseek-chat','deepseek-reasoner'].includes(payload.model)||!Array.isArray(payload.messages)||payload.messages.length<1||payload.messages.length>4||payload.messages.some(m=>!['system','user'].includes(m.role)||typeof m.content!=='string'||m.content.length>15000))return respond({error:'Invalid request'},400,allowed);
 try{const upstream=await fetch('https://api.deepseek.com/chat/completions',{method:'POST',headers:{'Authorization':'Bearer '+env.DEEPSEEK_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:payload.model,messages:payload.messages,response_format:payload.response_format?.type==='json_object'?{type:'json_object'}:undefined,max_tokens:Math.min(Math.max(Number(payload.max_tokens)||1200,40),1800),stream:false}),signal:AbortSignal.timeout(45000)});const json=await upstream.json().catch(()=>({}));if(!upstream.ok)return respond({error:'DeepSeek '+upstream.status+': '+String(json.error?.message||'request failed').slice(0,160)},upstream.status,allowed);return respond({elapsedMs:Date.now()-started,choices:[{message:{content:json.choices?.[0]?.message?.content||''}}]},200,allowed)}catch{return respond({error:'上游连接失败或超时'},502,allowed)}
 }};
