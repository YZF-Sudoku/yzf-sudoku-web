import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const source=readFileSync(new URL("../app.js",import.meta.url),"utf8");
const start=source.indexOf("const REF_TECHNIQUES = [");
const end=source.indexOf("const REF_TECHNIQUE_BY_TITLE =",start);
assert.ok(start>=0&&end>start);
const context=vm.createContext({});
vm.runInContext(source.slice(start,end)+"\n globalThis.catalog = {items:REF_TECHNIQUES, map:REF_TECHNIQUE_BY_KIND};",context);
const {items,map}=context.catalog;
const baseline=['FullHouse', 'HiddenSingle', 'NakedSingle', 'LockedCandidates', 'GSP', 'NakedPair', 'NakedTriple', 'HiddenPair', 'HiddenTriple', 'NakedQuad', 'HiddenQuad', 'XWing', 'Swordfish', 'Jellyfish', 'AlmostPair', 'AlmostTriple', 'BUGOne', 'AvoidableRectangle', 'Skyscraper', 'TwoStringKite', 'EmptyRectangle', 'ERIPair', 'WWing', 'XYWing', 'XYZWing', 'XYZRing', 'BUGPlusN', 'BivalueOddagon', 'WXYZWing', 'UniqueRectangle', 'UniqueLoop', 'ExtendedRectangle', 'FinnedXWing', 'FinnedSwordfish', 'FinnedJellyfish', 'SueDeCoq', 'Fireworks', 'BrokenWing', 'XChain', 'XYChain', 'AIC', 'GroupedAIC', 'ALSXZ', 'ALSXYWing', 'ALSWWing', 'AHSXZ', 'AHSXYWing', 'AHSWWing', 'ALSChain', 'AHSChain', 'DeathBlossom', 'ComplexSwordfish', 'ComplexJellyfish', 'ComplexSquirmbagFish', 'BlossomLoop', 'ComplexAIC', 'CellRegionFC', 'Whip', 'GWhip', 'DynamicChain', 'Braid', 'GBraid', 'SKLoop', 'MSLS', 'Multifish', 'JE', 'SeniorExocet', 'WeakExocet', 'TripletOddagon', 'BruteForce'];
assert.equal(items.length,73);
assert.deepEqual(Array.from(items.slice(0,70),x=>x.kind),baseline);
assert.equal(items[70].kind,"BorescoperDeadlyPattern3");
assert.equal(items[71].kind,"BorescoperDeadlyPattern4");
assert.equal(items[72].kind,"QiuDeadlyPattern");
const xr=map.get("ExtendedRectangle");
const finned=map.get("FinnedXWing");
const broken=map.get("BrokenWing");
const xchain=map.get("XChain");
const bdp3=map.get("BorescoperDeadlyPattern3");
const bdp4=map.get("BorescoperDeadlyPattern4");
const qdp=map.get("QiuDeadlyPattern");
assert.equal(bdp3.score,200); assert.equal(bdp3.difficulty,3); assert.equal(bdp3.colorLevel,3);
assert.equal(bdp4.score,260); assert.equal(bdp4.difficulty,4); assert.equal(bdp4.colorLevel,4);
assert.equal(qdp.score,260); assert.equal(qdp.difficulty,4); assert.equal(qdp.colorLevel,4);
for (const item of [bdp3,bdp4,qdp]) { assert.equal(item.category,"Uniqueness"); assert.equal(item.enabled,false); }
assert.ok(xr.order<bdp3.order&&bdp3.order<finned.order, "BDP3 remains after XR");
assert.ok(broken.order<bdp4.order&&bdp4.order<qdp.order&&qdp.order<xchain.order, "BDP4/QDP immediately before XChain");
for(const filename of ["app.js","step-localization.js","techniques-i18n.js","technique-tutorial-data.js"]) {
  const text=readFileSync(new URL("../"+filename,import.meta.url),"utf8");
  for(const kind of ["BorescoperDeadlyPattern3","BorescoperDeadlyPattern4","QiuDeadlyPattern"])assert.ok(text.includes(kind),filename+" missing "+kind);
}

const tutorialMod = await import(new URL("../technique-tutorial-data.js", import.meta.url));
for (const kind of ["BorescoperDeadlyPattern3","BorescoperDeadlyPattern4","QiuDeadlyPattern"]) {
  const card=tutorialMod.TECHNIQUE_TUTORIAL_CARDS[kind];
  assert.ok(card, "tutorial card missing "+kind);
  assert.equal(card.zh.length,6, kind+" zh tutorial fields");
  assert.equal(card.en.length,6, kind+" en tutorial fields");
}
console.log("Deadly frontend catalog: BDP3=3/200 yellow; BDP4/QDP=4/260 orange; BDP4/QDP before XChain");
