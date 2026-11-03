const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const code = fs.readFileSync('app.js','utf8');
const part = code.slice(code.indexOf('// The access token'),code.indexOf('function context(type)'));
function storage() { const data = new Map(); return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)}; }
const localStorage=storage(); let sessionStorage=storage();
function open() {
  const el=Object.fromEntries(['proxyUrl','aiModel','proxyToken','rememberToken','saveAi'].map(k=>['#'+k,{value:'',checked:false}]));
  const ctx={localStorage,sessionStorage,AI:'settings',read:(k,f)=>JSON.parse(localStorage.getItem(k))??f,sessionGet:k=>sessionStorage.getItem(k),sessionSet:(k,v)=>sessionStorage.setItem(k,v),$:s=>el[s],toast:()=>{}};
  vm.runInNewContext(part,ctx); return el;
}
let el=open(); el['#proxyUrl'].value='https://example.com/'; el['#proxyToken'].value='test-only'; el['#rememberToken'].checked=true; el['#saveAi'].onclick();
sessionStorage=storage(); el=open(); assert.equal(el['#proxyUrl'].value,'https://example.com'); assert.equal(el['#proxyToken'].value,'test-only'); assert.equal(el['#rememberToken'].checked,true);
el['#rememberToken'].checked=false; el['#saveAi'].onclick(); sessionStorage=storage(); el=open(); assert.equal(el['#proxyToken'].value,''); assert.equal(el['#rememberToken'].checked,false);
assert.ok(!JSON.stringify(localStorage.getItem('settings')).includes('test-only'));
console.log('AI settings checks passed');
