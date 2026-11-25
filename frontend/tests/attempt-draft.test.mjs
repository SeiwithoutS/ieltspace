import test from "node:test";
import assert from "node:assert/strict";
import {parseAttemptDraft} from "../src/lib/attempts/attempt-draft.ts";

test("restores answers and writing drafts saved by JSX pages",()=>{
 const state={ans:{"1":"A"},flag:[2],texts:{"1":"My first draft"},notes:{"1":"Outline"},task:1,fontPct:110};
 const draft={options:{mode:"practice",parts:[0]},seconds:120,state};
 assert.deepEqual(parseAttemptDraft(JSON.stringify(draft)),draft);
});
test("rejects malformed storage and invalid state without crashing",()=>{
 for(const value of ["{",JSON.stringify({options:null}),JSON.stringify({options:{mode:"practice",parts:[]},seconds:2}),JSON.stringify({options:{mode:"real",parts:[0]},seconds:2,state:{texts:{1:42}}}),JSON.stringify({options:{mode:"real",parts:[0]},seconds:2,state:{hl:{}}})])
  assert.equal(parseAttemptDraft(value),null);
});
test("preserves complete highlights and an expired countdown",()=>{
 const hl=Object.fromEntries(["h1","h2","h3"].map(key=>[key,{color:"vang",note:"",on:true}]));
 const draft={options:{mode:"real",parts:[0]},seconds:0,state:{hl,pop:null}};
 assert.deepEqual(parseAttemptDraft(JSON.stringify(draft)),draft);
});
test("keeps a valid time limit and drops an invalid one",()=>{
 const base={options:{mode:"practice",parts:[0],limitMinutes:20},seconds:30};
 assert.deepEqual(parseAttemptDraft(JSON.stringify(base)).options,base.options);
 const bad={options:{mode:"practice",parts:[0],limitMinutes:-5},seconds:30};
 assert.deepEqual(parseAttemptDraft(JSON.stringify(bad)).options,{mode:"practice",parts:[0]});
});
test("old drafts without speaking progress or savedAt still parse unchanged",()=>{
 const draft={options:{mode:"real",parts:[0,1,2],limitMinutes:15},seconds:40,state:{current:3}};
 assert.deepEqual(parseAttemptDraft(JSON.stringify(draft)),draft);
});
test("keeps valid speaking progress and savedAt",()=>{
 const speaking={attemptId:"abc",stepId:"p1q2",index:2,phase:"recording",answered:["p1q0","p1q1"]};
 const draft={options:{mode:"real",parts:[0],limitMinutes:15},seconds:40,state:{current:2,speaking},savedAt:1700000000000};
 assert.deepEqual(parseAttemptDraft(JSON.stringify(draft)),draft);
});
test("malformed speaking progress is dropped without losing the draft",()=>{
 for(const speaking of [{attemptId:"",stepId:"a",index:0,phase:"viewing",answered:[]},{attemptId:"a",stepId:"a",index:-1,phase:"viewing",answered:[]},{attemptId:"a",stepId:"a",index:0,phase:"nope",answered:[]},{attemptId:"a",stepId:"a",index:0,phase:"viewing",answered:[1]},"x"]){
  const parsed=parseAttemptDraft(JSON.stringify({options:{mode:"real",parts:[0]},seconds:1,state:{current:1,speaking},savedAt:"bad"}));
  assert.ok(parsed);
  assert.equal(parsed.state.speaking,undefined);
  assert.equal(parsed.state.current,1);
  assert.equal(parsed.savedAt,undefined);
 }
});
test("keeps a valid startedAtEpoch and drops an invalid one",()=>{
 const base={options:{mode:"real",parts:[0],limitMinutes:15},seconds:40,savedAt:1700000000000};
 assert.equal(parseAttemptDraft(JSON.stringify({...base,startedAtEpoch:1699999960000})).startedAtEpoch,1699999960000);
 for(const bad of [-1,"x",null])
  assert.equal(parseAttemptDraft(JSON.stringify({...base,startedAtEpoch:bad})).startedAtEpoch,undefined);
});
test("a malformed speaking part keeps startedAtEpoch so the clock is not reset",async()=>{
 const {speakingBegan,speakingEpoch}=await import("../src/lib/attempts/attempt-storage.ts");
 const raw={options:{mode:"real",parts:[0],limitMinutes:15},seconds:40,state:{speaking:"x"},savedAt:1700000000000,startedAtEpoch:1699999960000};
 const parsed=parseAttemptDraft(JSON.stringify(raw));
 assert.equal(parsed.state.speaking,undefined);
 assert.equal(speakingBegan(parsed),true);
 assert.equal(speakingEpoch(parsed),1699999960000);
 const noEpoch=parseAttemptDraft(JSON.stringify({...raw,startedAtEpoch:undefined}));
 assert.equal(speakingBegan(noEpoch),false);
 assert.equal(speakingEpoch(noEpoch),1700000000000-40000);
});

test("draft Writing giữ tiến độ lượt làm hợp lệ và bỏ phần sai dạng", async () => {
  const { parseAttemptDraft } = await import("../src/lib/attempts/attempt-draft.ts");
  const make = (writing) =>
    JSON.stringify({
      options: { mode: "real", parts: [], limitMinutes: 60 },
      seconds: 10,
      state: { texts: { 1: "a", 2: "b" }, writing },
      savedAt: 1,
      startedAtEpoch: 1,
    });
  const ok = parseAttemptDraft(make({ attemptId: "c1", serverAttemptId: "s1", extra: "bỏ" }));
  assert.deepEqual(ok.state.writing, { attemptId: "c1", serverAttemptId: "s1" });
  assert.deepEqual(ok.state.texts, { 1: "a", 2: "b" });
  const noServer = parseAttemptDraft(make({ attemptId: "c1" }));
  assert.deepEqual(noServer.state.writing, { attemptId: "c1" });
  const bad = parseAttemptDraft(make({ attemptId: "" }));
  assert.equal(bad.state.writing, undefined);
  assert.deepEqual(bad.state.texts, { 1: "a", 2: "b" });
});
