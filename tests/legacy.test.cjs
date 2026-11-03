// The private backup is read directly from the supplied ZIP and never copied into the repository.
const fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process'),assert=require('node:assert/strict');
const zip=process.argv[2]; if(!zip) throw Error('Pass the local handover ZIP path');
const py='import zipfile,sys\nwith zipfile.ZipFile(sys.argv[1]) as z:\n n=next(x for x in z.namelist() if x.startswith("legacy_records/") and x.endswith(".json"))\n sys.stdout.buffer.write(z.read(n))';
const backup=JSON.parse(cp.execFileSync('python',['-c',py,zip],{encoding:'utf8'}).replace(/^\ufeff/,''));
const source=fs.readFileSync('app.js','utf8');const fn=source.match(/function validImported\(s\)\{[^\n]+/)[0];const c={};vm.createContext(c);vm.runInContext(fn,c);
assert.equal(backup.app,'我的力量日志');assert.equal(backup.sessions.length,5);const invalid=backup.sessions.filter(s=>!c.validImported(s)).length;
console.log(`Legacy backup: ${backup.sessions.length} records, ${invalid} rejected by importer`);if(invalid)process.exitCode=1;
