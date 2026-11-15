import test from "node:test";
import assert from "node:assert/strict";
import {parseAttemptDraft} from "../src/lib/attempt-draft.ts";

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
