import { localizedStepDescription } from '../step-localization.js';
const cell=(index)=>({index,row:Math.floor(index/9),col:index%9});
const step={kind:'QiuDeadlyPattern',title:"Qiu's Deadly Pattern External Type 1 (Ext-Num)",description:'QDP External Type 1 (Ext-Num): under the original Shufen-UR body conditions ...',candidates:[2,9],cells:[cell(0),cell(1),cell(2)],eliminations:[{type:'eliminate',index:2,row:0,col:2,candidates:[1]}],groups:[{label:'Branch:External Type 1/Ext-Num',cells:[]},{label:'MainLines:Columns:1,2',cells:[]},{label:'DistinguishingCells:29',cells:[cell(5),cell(23)]},{label:'CrossCells:29',cells:[cell(0),cell(1),cell(18),cell(19)]},{label:'ExternalStabilizer:29',cells:[cell(2)]}]};
const zh=localizedStepDescription(step,'zh');
if(!/External 1 型/.test(zh)||!/r1c3/.test(zh)||!/2\/9/.test(zh)||!/删除|可删|删去/.test(zh)||/under the original Shufen-UR body conditions/.test(zh)||/Qiu's Deadly Pattern/.test(zh)) throw new Error(zh);
console.log(zh);
