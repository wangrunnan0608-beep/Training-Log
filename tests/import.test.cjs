const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('app.js', 'utf8');
const valid = source.match(/function validImported\(s\)\{[^\n]+/)[0];
const handler = source.match(/\$\('#importBtn'\)\.onclick=async\(\)=>\{[^\n]+/)[0];
const item = id => ({id, date:'2026-11-01', exercises:[{name:'悬垂', sets:[{weight:27, seconds:30}]}]});
async function run(existing, incoming, saveResult = true) {
  const messages = [], elements = {'#importBtn':{}, '#importFile':{files:[{size:100, text:async()=>JSON.stringify({app:'我的力量日志',sessions:incoming})}]}};
  const ctx = {sessions:structuredClone(existing), $:s=>elements[s], toast:s=>messages.push(s), drawHistory:()=>{}, saveSessions:()=>saveResult};
  vm.createContext(ctx); vm.runInContext(valid+'\n'+handler, ctx); await elements['#importBtn'].onclick();
  return {sessions:ctx.sessions,messages};
}
(async()=>{
  let result = await run([], [item('a'),item('a')]);
  assert.equal(result.sessions.length,1); assert.match(result.messages[0],/跳过 1/);
  result = await run([item('a')], [{...item('a'), notes:'不同'},item('b')]);
  assert.equal(result.sessions.length,1); assert.match(result.messages[0],/内容不同/);
  result = await run([], [item('a'),{id:'invalid'}]);
  assert.equal(result.sessions.length,0); assert.match(result.messages[0],/未导入任何记录/);
  result = await run([], [item('a')], false);
  assert.equal(result.sessions.length,0);
  console.log('Import safety checks passed');
})().catch(e=>{console.error(e);process.exitCode=1});
