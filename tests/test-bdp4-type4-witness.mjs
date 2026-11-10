import assert from 'node:assert/strict';
import { localizedStepDescription } from '../step-localization.js';
const cells=[40,41,42,49,50,51,67,68].map(index=>({index}));
const step={
 kind:'BorescoperDeadlyPattern4', title:"Borescoper's Deadly Pattern (4 digits) Type 4",
 cells,
 groups:[
  {label:'BDPBody:2489',cells},
  {label:'BDP4CandidateWitness:24892489',cells},
  {label:'BDP4GeometricPartner:84298249',cells},
 ], eliminations:[{index:41,mask:1<<8}]
};
const zh=localizedStepDescription(step,'zh');
assert.match(zh,/候选兼容局部填数/);
assert.match(zh,/另一组几何填数/);
assert.match(zh,/r5c5=2/);
assert.match(zh,/不保证满足当前盘面已经删除的所有笔记候选/);
console.log('BDP4 Type4 Chinese witness & exchange text: PASS');
