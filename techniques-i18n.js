(() => {
  "use strict";

  const FIELD_LABELS = [
    "Basic idea",
    "Why it works",
    "Mathematical logic",
    "How to read the grid",
    "Highlight guide",
    "Checkpoints",
  ];

  const entry = (...items) => items;

  const nakedSubset = (size, name) => entry(
    `A ${name} is a set of ${size} cells in one house whose combined candidates contain only ${size} digits.`,
    `Those ${size} digits must occupy those ${size} cells, so the same digits can be removed from every other cell in the house.`,
    `This is a pigeonhole argument: ${size} cells need ${size} values and their candidate union has size ${size}. The set therefore consumes the entire capacity for those digits inside the house.`,
    `1. Choose ${size} cells. 2. Merge their candidates. 3. Confirm that exactly ${size} digits remain. 4. Eliminate those digits from the other cells in the house.`,
    `The highlighted body is the ${size}-cell set; eliminations lie outside the set but inside the same row, column, or box.`,
    `The cells need not have identical candidate lists, but their union must contain exactly ${size} digits and all cells must share one house.`
  );

  const hiddenSubset = (size, name) => entry(
    `A ${name} occurs when ${size} digits appear only in the same ${size} cells of one house.`,
    `Those cells must carry those digits, so every other candidate in the same cells can be removed.`,
    `This is the dual of a naked subset. A house must place each of the ${size} digits once, and there are only ${size} cells available for them. Those cells therefore cannot take any outside digit.`,
    `1. Choose ${size} digits. 2. Locate every occurrence in the house. 3. Confirm that they occupy only ${size} cells. 4. Remove all other candidates from those cells.`,
    `The highlights focus on the restricted locations of the digits; eliminations occur inside the selected cells.`,
    `Check digit locations rather than cell candidate counts. If any selected digit has another location in the house, the subset is not valid.`
  );

  const standardFish = (size, name) => entry(
    `${name} is a single-digit fish with ${size} base rows or columns whose candidates lie entirely in ${size} cover columns or rows.`,
    `Each base house must place the digit once, and all placements are caught by the cover houses. The cover capacity is therefore filled by the fish body.`,
    `The ${size} mandatory placements in the base houses must occupy the ${size} cover houses. Any extra occurrence of the same digit in a cover house would exceed that capacity, so it can be eliminated.`,
    `1. Fix one digit. 2. Choose ${size} base houses. 3. Verify that all their candidates lie in ${size} cover houses. 4. Eliminate the digit from cover cells outside the fish body.`,
    `The body consists of the candidate intersections of base and cover houses; eliminations are other candidates of the same digit in the covers.`,
    `Use only one digit. Every base must still have a possible placement, and all of its locations must be covered by the selected covers.`
  );

  const finnedFish = (size, name) => entry(
    `${name} is a size-${size} fish with one or more fin candidates outside the clean fish body.`,
    `If every fin is false, the ordinary fish is active. If a fin is true, candidates that see the fin are false. Only targets eliminated in both cases are safe.`,
    `This is a two-case proof. The no-fin branch gives the standard base-cover elimination; the fin-true branch eliminates candidates visible to the fin. Their intersection is the valid elimination set.`,
    `1. Identify the fish body. 2. Mark the fin or fins. 3. Find targets constrained by the fish and visible to the relevant fin. 4. Eliminate only those common targets.`,
    `Body, covers, fins, and eliminations should be visually distinct. The target normally lies in a cover and also sees the fin.`,
    `Do not apply every elimination of the unfinned fish. A target that is not constrained by the fin is not justified by the finned pattern.`
  );

  const complexFish = (size, name) => entry(
    `${name} is a size-${size} fish whose base and cover sectors may mix rows, columns, boxes, cells, or grouped regions.`,
    `The same digit still has ${size} mandatory instances supplied by the bases and captured by the covers; excess cover capacity produces eliminations.`,
    `This is rank-style set covering. The bases require instances of one digit, while the covers provide the available capacity. When that capacity exactly accounts for every required instance, an extra candidate would overfill a cover or leave a base unsatisfied.`,
    `1. Fix the digit. 2. Separate base sectors from cover sectors. 3. Check the coverage count and any fins or self-cannibalism. 4. Apply only the reported eliminations.`,
    `Highlights may cross rows, columns, and boxes. Read the role of each sector rather than expecting a rectangular fish shape.`,
    `Verify that the argument still concerns one digit and that the base/cover count or reported rank condition is satisfied.`
  );

  const uniqueness = (label, shape) => entry(
    `${label} is a uniqueness pattern based on a locally interchangeable ${shape}.`,
    `If the dangerous candidates remained, the local digits could be swapped to create a second completed grid. That contradicts the assumption that the puzzle has one solution.`,
    `This is proof by contradiction under the unique-solution premise. The deadly form has two completions with identical external constraints, so a valid unique puzzle must keep a breaker or reject the candidate that completes the deadly form.`,
    `1. Identify the highlighted ${shape}. 2. Verify the interchangeable digit pattern. 3. Locate the extra candidate or breaker. 4. Apply only the elimination justified by avoiding the deadly completion.`,
    `The display separates the deadly body from its breaker, extra candidate, or target.`,
    `Use this only on a confirmed unique puzzle. Do not apply it to a multi-solution grid, an inconsistent grid, or an OCR draft whose uniqueness has not been checked.`
  );

  const chainLogic = (name, nodeText, stepText, highlightText, checkText) => entry(
    `${name} is an alternating inference structure built from ${nodeText}.`,
    `Strong links mean at least one endpoint is true; weak links mean the endpoints cannot both be true. Alternation forces a relation between the chain ends.`,
    `Starting from one endpoint false, truth values propagate through alternating strong and weak relations until the other endpoint is forced true. Therefore the endpoints are not both false, and any candidate conflicting with both can be removed. Discontinuous loops may instead force a placement or an elimination at the break.`,
    stepText,
    highlightText,
    checkText
  );

  const CARDS = {
    FullHouse: entry(
      "A row, column, or box already contains eight digits and has one empty cell.",
      "The missing digit has no other place in that house, so it must occupy the final cell.",
      "Every house must contain 1–9 exactly once. With eight values present, the ninth value and its only container are fixed.",
      "1. Inspect the highlighted house. 2. Find its only empty cell. 3. Determine the missing digit. 4. Place it.",
      "The house and its last empty cell are the important highlights; this is a placement, not a candidate elimination.",
      "Confirm that the house really has only one empty cell and that exactly one digit is missing."
    ),
    HiddenSingle: entry(
      "One digit has only one legal position in a row, column, or box, even though that cell may contain other candidates.",
      "Every other position for the digit is blocked, so the remaining location must take it.",
      "A house must contain the digit once. If all locations except one are impossible, that final location is forced.",
      "1. Fix the digit. 2. Inspect one house. 3. Rule out every other location. 4. Place the digit in the unique location.",
      "The highlight represents a house, one digit, and its only location—not necessarily a one-candidate cell.",
      "If the digit still has a second legal location in the house, it is not a Hidden Single."
    ),
    NakedSingle: entry(
      "An empty cell has only one candidate left.",
      "Its row, column, and box exclude the other eight digits, so the remaining candidate is true.",
      "A cell must receive one value. If every other value is illegal, rejecting the final candidate would leave the cell empty and contradict Sudoku rules.",
      "1. Inspect the target cell. 2. Count its candidates. 3. Confirm that only one remains. 4. Place it.",
      "The only candidate in the cell is highlighted. This is a placement, not a deletion of that candidate.",
      "Do not place the digit if the cell still has two or more candidates."
    ),
    LockedCandidates: entry(
      "A digit is confined to the intersection of a box and a row or column, allowing eliminations outside the intersection.",
      "If all box locations for a digit lie in one line, that line must place the digit inside the box, so the line cannot place it elsewhere. The converse also holds.",
      "The box and line share the complete set of possible locations for the digit. Once one sector must satisfy the digit inside the intersection, the outside part of the other sector loses that digit.",
      "1. Fix one digit. 2. Find its confined intersection. 3. Separate the locked body from the outside cells. 4. Remove the digit from the affected outside cells.",
      "The locked intersection and the elimination area should be shown separately.",
      "An eliminated candidate must be outside the locked body but still in the affected row, column, or box."
    ),
    GSP: entry(
      "GSP uses global placement symmetry or the unique-solution premise to reject a candidate combination that would permit an equivalent completion.",
      "Keeping the highlighted arrangement would create an interchangeable second completion, contradicting uniqueness.",
      "The pattern exposes a set of placements that can be permuted without changing the external constraints. A unique puzzle cannot allow both completions, so the combination that preserves the symmetry must be broken.",
      "1. Inspect the grouped highlighted positions. 2. Verify the interchangeable relation. 3. Confirm the unique-solution premise. 4. Apply the reported elimination.",
      "Read the synchronized group as a whole rather than focusing on one cell.",
      "Do not use GSP as manual logic on a multi-solution grid, an invalid grid, or an unverified OCR draft."
    ),
    NakedPair: nakedSubset(2, "Naked Pair"),
    NakedTriple: nakedSubset(3, "Naked Triple"),
    HiddenPair: hiddenSubset(2, "Hidden Pair"),
    HiddenTriple: hiddenSubset(3, "Hidden Triple"),
    NakedQuad: nakedSubset(4, "Naked Quad"),
    HiddenQuad: hiddenSubset(4, "Hidden Quad"),
    XWing: standardFish(2, "X-Wing"),
    Swordfish: standardFish(3, "Swordfish"),
    Jellyfish: standardFish(4, "Jellyfish"),
    FinnedXWing: finnedFish(2, "Finned X-Wing"),
    FinnedSwordfish: finnedFish(3, "Finned Swordfish"),
    FinnedJellyfish: finnedFish(4, "Finned Jellyfish"),
    ComplexSwordfish: complexFish(3, "Complex Swordfish"),
    ComplexJellyfish: complexFish(4, "Complex Jellyfish"),
    ComplexSquirmbagFish: complexFish(5, "Complex Squirmbag Fish"),
    Multifish: entry(
      "Multi-Fish combines several fish-like covers and may use multiple sector types.",
      "Read it as rank logic: mandatory instances supplied by strong sectors are fully absorbed by weak-sector capacity, leaving no room for extra candidates.",
      "When the selected covers exactly account for every required instance, an extra covered candidate would overfill a weak sector or deprive a strong sector of its required placement.",
      "1. Identify the digit or digit set. 2. Separate the base/strong sectors from the cover/weak sectors. 3. Check the coverage and exceptions. 4. Apply only common valid eliminations.",
      "Highlights may be layered; not every highlighted candidate is an ordinary fish-body candidate.",
      "Confirm that each elimination is excess capacity in a weak sector and is not a fin, guardian, or allowed exception."
    ),
    BUGOne: entry(
      "BUG+1 is a nearly all-bivalue grid with one cell containing one extra candidate.",
      "Without the extra candidate, the grid would become a two-colour interchangeable BUG state. A unique puzzle therefore needs the extra candidate to break it.",
      "In a pure BUG, every unsolved cell is bivalue and each candidate occurs twice in each relevant house, producing two interchangeable colourings. The single extra candidate is the only breaker, so under uniqueness it must be true, or equivalently the other candidates in its cell can be removed.",
      "1. Check the global bivalue pattern. 2. Find the only exceptional cell. 3. Identify the extra candidate. 4. Apply the placement or eliminations.",
      "The exceptional cell and candidate are the main highlights.",
      "Confirm uniqueness and verify that the remaining unsolved grid really has the BUG parity structure."
    ),
    BUGPlusN: entry(
      "BUG+n generalizes BUG+1 to several extra candidates or exceptional cells.",
      "At least one exception must break the underlying all-bivalue deadly state, so the exceptions constrain one another.",
      "If all relevant extras were removed, the grid would reduce to an interchangeable BUG completion. Uniqueness forbids that, so the reported elimination follows from preserving at least one valid breaker.",
      "1. Identify the bivalue skeleton. 2. Mark every exception. 3. Inspect their shared constraints. 4. Apply the common consequence.",
      "Several exceptional candidates may be highlighted; the result need not be a single placement.",
      "Verify that the highlighted extras are genuinely the candidates preventing the BUG state."
    ),
    Skyscraper: entry(
      "For one digit, two parallel houses each contain a conjugate pair. One pair of endpoints sees each other; the other endpoints are the two rooftops.",
      "The rooftops cannot both be false, so a same-digit candidate seeing both rooftops can be removed.",
      "If one rooftop is false, its conjugate partner is true; that partner sees the other base endpoint, forcing it false and the other rooftop true. The reverse direction is symmetric, proving at least one rooftop true.",
      "1. Fix one digit. 2. Find two parallel conjugate pairs. 3. Verify that one endpoint from each pair sees the other. 4. Eliminate candidates seeing both opposite endpoints.",
      "Read it as two strong links joined by a weak link, not as an ordinary base-cover X-Wing.",
      "Each pair must be conjugate, the connected endpoints must see each other, and the target must see both rooftops."
    ),
    TwoStringKite: entry(
      "For one digit, a row conjugate pair and a column conjugate pair have one endpoint from each pair in the same box.",
      "The two remote endpoints cannot both be false, so a same-digit candidate seeing both can be eliminated.",
      "If the remote row endpoint is false, the row partner is true; it sees the column partner in the shared box, forcing that partner false and the remote column endpoint true. The reverse argument also holds.",
      "1. Fix one digit. 2. Find a row conjugate pair. 3. Find a column conjugate pair. 4. Confirm the inner endpoints see each other in one box. 5. Eliminate a target seeing both remote endpoints.",
      "The row and column strong links form the kite; the box connection is the weak link.",
      "All links must use the same digit, and the target must see both remote endpoints—not merely the inner connection."
    ),
    EmptyRectangle: entry(
      "An Empty Rectangle uses a box-internal candidate pattern together with an external conjugate pair.",
      "The box pattern and external strong link form a short inference chain whose endpoints cannot both be false.",
      "If one endpoint is false, strong and weak relations through the ER structure force the other endpoint true. Therefore a candidate seeing both endpoints is impossible.",
      "1. Fix the digit. 2. Identify the box's empty-rectangle pattern. 3. Find the external conjugate pair. 4. Remove the common conflicting candidate.",
      "The box pattern, external strong link, and target should be highlighted separately.",
      "The target must be constrained by both the internal ER implication and the external strong pair."
    ),
    ERIPair: entry(
      "ERI Pair combines two Empty Rectangle Intersection structures for remote single-digit elimination.",
      "Each ERI compresses a box pattern into an inference endpoint; together the endpoints constrain a common target.",
      "The two ERI endpoints form a short alternating implication. At least one endpoint must be true, so any same-digit candidate seeing both is false.",
      "1. Fix the digit. 2. Find two ERI structures. 3. Follow their connection. 4. Eliminate candidates constrained by both sides.",
      "Expect two box-internal structures plus an external connection.",
      "Both ERIs must concern the same digit, and the elimination must be covered by both implications."
    ),
    Fireworks: entry(
      "Fireworks treats candidates near a box corner or row-column intersection as an array whose digits must be carried into the related lines.",
      "If candidates leave the core in certain ways, the corresponding row and column outlets become forced; their shared capacity can then eliminate other candidates.",
      "The proof is a candidate-array capacity argument, not ordinary Broken Wing guardian logic. The core digits have a limited set of row, column, and box outlets; a target that consumes required outlet capacity is impossible.",
      "1. Identify the fireworks core. 2. Determine the digit set and its row/column outlets. 3. Separate base cells from targets. 4. Apply the synchronized eliminations.",
      "Highlights normally show the core, base cells, and affected rows or columns.",
      "Do not reduce the pattern to one digit or automatically interpret it as Guardian Logic unless the reported step explicitly says so."
    ),
    WWing: entry(
      "W-Wing links two bivalue cells through a strong relation on one shared candidate.",
      "The two endpoints cannot both avoid the target digit, so a target seeing both endpoint occurrences can be removed.",
      "Each possible location of the linking digit forces one endpoint to take the elimination digit. Thus at least one endpoint contains that digit, and any candidate seeing all such endpoints is false. FindAIC output may present the same proof as a compressed AIC.",
      "1. Find the two bivalue endpoint cells. 2. Identify their shared candidate. 3. Locate the conjugate or strong connection. 4. Eliminate the other shared digit from cells seeing both endpoints.",
      "The two bivalue cells and the middle strong relation are the main structure; eliminations use common visibility.",
      "The linking candidate must form a genuine strong relation in a row, column, box, or valid grouped node."
    ),
    XYWing: entry(
      "XY-Wing has one bivalue pivot and two wings using three digits X, Y, and Z.",
      "Whichever value the pivot takes, one wing is forced to Z, so a Z candidate seeing both wings can be removed.",
      "The pivot is x/y. In the x branch one wing must be z; in the y branch the other wing must be z. Since every branch places z in one of the wings, a common peer cannot also be z.",
      "1. Find the pivot. 2. Find the two wings it sees. 3. Verify the shared elimination digit Z. 4. Remove Z from common peers of the two wings.",
      "Pivot, wings, and the common Z target are highlighted separately.",
      "The pivot must see both wings, and the candidate relationships must form the exact XY/XZ/YZ pattern."
    ),
    XYZWing: entry(
      "XYZ-Wing resembles XY-Wing, but the pivot usually contains X, Y, and Z.",
      "If the pivot is Z, nearby Z targets are blocked directly; if it is X or Y, one of the wings is forced to Z. A target constrained in every branch can be removed.",
      "The proof covers all three pivot values. Each value places Z in the pivot or a wing, so a candidate seeing every possible Z location is false.",
      "1. Find the three-value pivot. 2. Find its two related wings. 3. Identify all possible Z locations. 4. Remove Z from a cell seeing those required locations.",
      "The pivot, two wings, and common Z are the key highlights.",
      "The elimination visibility is stricter than XY-Wing: the target normally must see the pivot and the relevant wing Z locations."
    ),
    XYZRing: entry(
      "XYZ-Ring is an XYZ-Wing-like structure whose inferences close into a loop.",
      "Closing the loop forces a consistent assignment around the ring, allowing external eliminations and sometimes placements.",
      "If the target were true, implication around the closed ring would create a repeated digit, a broken strong link, or a cell with no candidate. Therefore the target is incompatible with every valid ring assignment.",
      "1. Identify the pivot and wing structure. 2. Follow the links around the ring. 3. Confirm that the path closes. 4. Apply only the reported external elimination or placement.",
      "You should be able to trace the highlighted path back to its start.",
      "Confirm that it is a true closed loop rather than an open three-cell wing, and do not extend eliminations beyond the reported targets."
    ),
    WXYZWing: entry(
      "WXYZ-Wing can be read as a multi-branch regular wing or, more generally, as an ALS-XZ / bent almost-locked-set pattern with four digits.",
      "The set has one more candidate than cells. Restricted common candidates constrain every legal assignment, so a target excluded in all assignments is false.",
      "Treat the core as an almost locked set. When a restricted candidate is removed or claimed on one side, the remaining values become locked. A target that sees every possible occurrence of the elimination digit, or destroys every legal locked assignment, cannot be true.",
      "1. Identify the core set. 2. Verify that candidate count is cell count plus one. 3. Find the restricted common candidate or bent-set target. 4. Eliminate only candidates excluded by every legal assignment.",
      "Read the set boundary and candidate capacity first; do not search mechanically for a classic pivot and two wings.",
      "The target must be constrained by all required endpoints. Seeing only part of the structure is insufficient."
    ),
    BrokenWing: entry(
      "Broken Wing belongs to Guardian Logic despite its historical name; it is not a classic pivot-and-wings pattern.",
      "If every guardian were false, the remaining pattern would become an impossible all-strong loop, no-solution structure, rank conflict, or other bad core. Therefore at least one guardian is true.",
      "Assume all guardians false. If that activates a contradiction, the guardian set is an at-least-one-true set. A same-digit target seeing every guardian would make them all false and is therefore removable; a single guardian may be placed.",
      "1. Identify the guardians. 2. Verify the bad structure obtained when they are all false. 3. Check whether the target eliminates every guardian. 4. Apply only the common guardian conclusion.",
      "Keep the bad core and its guardian exits visually separate. No pivot cell is required.",
      "The critical proof is ‘all guardians false implies an impossible structure.’ UR/BUG/AR/UL/XR/GSP remain uniqueness techniques even when their names mention a guard."
    ),
    AvoidableRectangle: uniqueness("Avoidable Rectangle", "rectangle that may include solved values"),
    UniqueRectangle: uniqueness("Unique Rectangle", "four-cell two-digit rectangle in two rows, two columns, and two boxes"),
    UniqueLoop: uniqueness("Unique Loop", "closed alternating loop of bivalue cells"),
    ExtendedRectangle: uniqueness("Extended Rectangle", "larger reversible rectangle-like structure"),
    BivalueOddagon: entry(
      "A Bivalue Oddagon is an odd cycle of bivalue relations that would be impossible without an escape candidate. It is a negative-rank contradiction, not a uniqueness proof.",
      "Two values cannot alternate consistently around an odd cycle, so a guardian or extra candidate must break the cycle.",
      "Propagation around the odd cycle returns to the start with the opposite truth state, or overfills local capacity. The complete oddagon has no solution; a target that removes every escape or forces the bad core is false.",
      "1. Trace the bivalue cycle. 2. Confirm its odd structure. 3. Identify guardians or exits. 4. Eliminate only a candidate that closes all exits or activates the contradiction.",
      "The odd-cycle body and guardian candidates should be shown separately.",
      "Do not interpret this as UR/BUG second-solution logic. Verify the odd/negative-rank contradiction and every required exit."
    ),
    TripletOddagon: entry(
      "Triplet or Trivalue Oddagon extends the oddagon idea to three digits or trivalue structures.",
      "Closing the dangerous odd structure creates a missing digit, duplicate placement, or insufficient local capacity, so an exit candidate is required.",
      "The three-digit cycle is a negative-rank no-solution structure. If a target is true and every compatible assignment then overfills a sector, loses a required digit, or closes all guardians, the target is false.",
      "1. Identify the three-digit set. 2. Trace the odd structure. 3. Mark guardians or exceptional branches. 4. Apply the conclusion shared by all exits and branches.",
      "Several digit colours and multiple guardians may appear; identify the cycle's digit set first.",
      "Verify that the conclusion uses every necessary exit and is not being justified as a uniqueness second-solution pattern."
    ),
    AlmostPair: entry(
      "Almost Pair is the smallest ALS: its candidate count is one greater than its cell count.",
      "Removing or fixing one extra candidate turns it into a locked pair, which then constrains outside candidates.",
      "The set is one condition away from a Naked Pair. Any branch that reduces it to the locked pair excludes candidates conflicting with that forced allocation.",
      "1. Inspect the outlined set. 2. Count cells. 3. Confirm that candidates are cells plus one. 4. Follow the external restriction to the elimination.",
      "The complete outlined set is the logical node.",
      "The candidate count must be exactly one more than the number of cells."
    ),
    AlmostTriple: entry(
      "Almost Triple is an almost locked set whose candidate count is one greater than its cell count.",
      "Once a restricted candidate is fixed or removed, the set becomes an ordinary triple and produces eliminations.",
      "Every valid branch is one step away from a locked three-digit allocation. If all branches eliminate the same outside candidate, that candidate is false.",
      "1. Outline the ALS. 2. Count its cells and candidates. 3. Find the restricted common candidate or external condition. 4. Apply the common elimination.",
      "Read the ALS as one set node rather than separate candidate links.",
      "Confirm that all cells form a valid ALS region and that candidate count equals cell count plus one."
    ),
    SueDeCoq: entry(
      "Sue de Coq is a candidate-capacity lock at the intersection of a box and a row or column.",
      "Digits in the intersection must be divided between the box side and line side, leaving no capacity for matching outside candidates.",
      "The intersection, line remainder, and box remainder jointly hold a fixed digit set. An outside target would make one side require more digits than available cells or leave the other side unable to place a required digit.",
      "1. Find the box-line intersection. 2. Partition the candidate groups. 3. Separate the box-side and line-side sets. 4. Remove the corresponding outside candidates.",
      "The intersection, box remainder, and line remainder should be visually distinct.",
      "Each elimination must lie in the appropriate outside portion of the box or line and follow the stated partition."
    ),
    ALSXZ: entry(
      "ALS-XZ uses two almost locked sets sharing a restricted common candidate X and another common candidate Z.",
      "The two ALSs cannot both omit X. Consequently Z must occur in at least one side, eliminating any Z that sees every relevant Z occurrence in both sets.",
      "An ALS has n cells and n+1 candidates. A restricted common candidate cannot be true in both sets and cannot be absent from both in the required arrangement; that coupling makes the Z endpoints an at-least-one-true set.",
      "1. Find the two ALSs. 2. Identify the RCC X. 3. Identify the elimination digit Z. 4. Remove Z from cells seeing all relevant Z positions in both sets.",
      "Two outlined ALS nodes, the RCC, and the Z target are the important highlights.",
      "Verify that X is genuinely restricted: occurrences of X in the two ALSs cannot both be true."
    ),
    ALSXYWing: entry(
      "ALS-XY-Wing uses three ALS nodes in the roles of a pivot and two wings.",
      "Two restricted common candidates pass the implication through the middle ALS, making the endpoint digit true in at least one outer ALS.",
      "Whichever side of the middle coupling is selected, one outer ALS must contain the elimination digit Z. A target seeing every possible endpoint Z is false.",
      "1. Find the three ALSs. 2. Verify both RCC links. 3. Identify the common endpoint digit. 4. Eliminate it from common peers of the outer endpoints.",
      "Read the three outlined sets as wing nodes rather than individual cells.",
      "Only the endpoint digit participates in the elimination; do not treat every ALS candidate as a target."
    ),
    ALSWWing: entry(
      "ALS-W-Wing connects two ALSs through an external strong relation.",
      "The strong relation prevents both ALSs from losing the key candidate, so the common target digit must occur in at least one side.",
      "This is W-Wing with ALS nodes replacing bivalue cells. The strong link preserves an at-least-one-true relation between the endpoint occurrences, eliminating a target that sees them all.",
      "1. Find the two ALSs. 2. Find the connecting conjugate or strong relation. 3. Identify the common target digit. 4. Remove it from common peers.",
      "The two ALS outlines and the external strong link should be read as one compressed chain.",
      "The connector must be a real strong relation, not merely a weak visibility link."
    ),
    ALSChain: entry(
      "ALS Chain links several almost locked sets through restricted common candidates.",
      "Implication passes from one ALS to the next, leaving the two chain-end candidates unable to be false together.",
      "If the head endpoint is false, each RCC successively fixes the next ALS state until the tail endpoint is forced true. A target seeing both endpoints is therefore false.",
      "1. Read the ALS nodes in order. 2. Verify every RCC. 3. Identify the two endpoint candidates. 4. Remove a common conflicting target.",
      "Follow the ordered outlined sets and their RCC labels instead of reading isolated cells.",
      "Adjacent ALSs must have valid restricted common candidates, and the elimination must be a common peer of the chain ends."
    ),
    DeathBlossom: entry(
      "Death Blossom branches from a stem cell into several ALS petals.",
      "Each possible value of the stem activates a petal that excludes the same target; because the stem must take one value, the target is false.",
      "This is a complete multi-branch ALS proof. Every stem candidate forces a corresponding ALS allocation that consumes or excludes the target digit, so no stem branch permits the target.",
      "1. Identify the stem. 2. Match each stem candidate to its ALS petal. 3. Verify the shared target. 4. Eliminate the candidate rejected by every branch.",
      "The centre stem and the surrounding ALS petals are highlighted as separate roles.",
      "Every stem branch must independently constrain the same elimination candidate."
    ),
    AHSXZ: entry(
      "AHS-XZ is the Almost Hidden Set dual of ALS-XZ.",
      "Digits are nearly confined to a group of cells; a restricted common cell or candidate couples two AHS nodes and forces a common consequence.",
      "An AHS has n digits restricted to n+1 cells, so one cell must be outside the digit set. Coupling two AHS nodes prevents certain positions from being absent together, and targets excluded by both sides can be removed.",
      "1. Choose the digit sets. 2. Locate their possible cells. 3. Identify the restricted common element. 4. Apply the common elimination.",
      "The visual emphasis is on digit sets and their possible locations, not on low-candidate cell sets.",
      "Confirm that this is a hidden-set relation—digits confined to cells—rather than an ALS read from cell candidates."
    ),
    XChain: chainLogic(
      "X-Chain",
      "candidates of one digit",
      "1. Fix the digit. 2. Follow alternating strong and weak links. 3. Identify the chain ends. 4. Remove same-digit candidates seeing both ends.",
      "All nodes use one digit; line style shows the alternating link type.",
      "The ends must use the same digit, and every elimination must see both endpoints."
    ),
    XYChain: chainLogic(
      "XY-Chain",
      "bivalue cells that pass implications between different digits",
      "1. Choose an endpoint candidate. 2. Follow the bivalue cells in order. 3. Reach the same digit at the other end. 4. Remove that digit from common peers of both ends.",
      "The chain normally runs through bivalue cells; the equal-digit endpoints define the elimination.",
      "Check that the internal cells support the required bivalue transitions and that the endpoint digit matches."
    ),
    AIC: chainLogic(
      "AIC",
      "single candidates, grouped candidates, or logical set nodes",
      "1. Locate the chain head. 2. Follow strict strong/weak alternation. 3. Inspect the tail or discontinuity. 4. Apply the endpoint conclusion.",
      "Solid and dashed links encode the inference; the conclusion is normally written after the arrow.",
      "Verify link alternation and confirm that the two endpoints or loop break justify the exact placement or elimination."
    ),
    GroupedAIC: chainLogic(
      "Grouped AIC",
      "groups of same-digit candidates treated as single nodes",
      "1. Identify each group node. 2. Read it as one proposition. 3. Follow the alternating links. 4. Apply the endpoint conclusion.",
      "A highlighted region may represent one logical node rather than one cell.",
      "Candidates inside a group must share the relevant house and digit constraint."
    ),
    ComplexAIC: chainLogic(
      "Complex AIC",
      "ALS, AHS, Almost Fish, Fireworks, and other composite nodes",
      "1. Compress each complex structure into its stated node relation. 2. Follow strong/weak alternation. 3. Reach the endpoint. 4. Apply the common consequence.",
      "Lines may connect outlined sets or regions; read each complex node's internal implication first.",
      "A node need not be one candidate, but every advertised strong or weak relation must be valid."
    ),
    CellRegionFC: entry(
      "Cell/Region Forcing Chain starts from every possible value of one cell or every possible position of one digit in a house.",
      "If every complete branch reaches the same placement or elimination, that conclusion is true regardless of which branch is the real one.",
      "The branch set is exhaustive and mutually exclusive. Since one branch must be true, any result shared by all branches is logically forced. Merged, finned, and dynamic forcing chains differ only in branch organization.",
      "1. Identify the starting cell or region. 2. Read every branch. 3. Find the shared result. 4. Apply that result.",
      "Several branches may be drawn; no single branch alone proves the conclusion.",
      "Confirm that all possible starting cases are represented and that every branch yields the same conclusion."
    ),
    Whip: entry(
      "Whip is a directed linear contradiction chain used to eliminate its starting candidate.",
      "Assuming the target true successively forces later nodes until a cell, house, or candidate requirement becomes impossible.",
      "Each step follows a valid strong or weak implication. A final contradiction means the initial assumption has no solution, so the target candidate is false.",
      "1. Start at the elimination candidate. 2. Assume it true. 3. Follow the main chain. 4. Verify the terminal contradiction.",
      "The directed main chain and its contradiction endpoint are the key highlights.",
      "Follow the displayed direction and do not import unrelated nearby candidates into the proof."
    ),
    GWhip: entry(
      "g-Whip is a Whip containing grouped logical nodes.",
      "A group represents several locations jointly satisfying one proposition; the contradiction proof otherwise follows ordinary Whip logic.",
      "Assuming the target true forces grouped and single nodes until a digit has no location, a cell has no candidate, or another contradiction occurs.",
      "1. Start from the target. 2. Read grouped nodes as single propositions. 3. Follow the directed chain. 4. Confirm the contradiction and eliminate the target.",
      "Grouped candidate regions should be read as one node.",
      "Each group must be valid under a common house and digit constraint."
    ),
    DynamicChain: entry(
      "Dynamic Chain may use temporary placements and eliminations derived during the proof and then continue from them.",
      "Every temporary result is forced by the initial assumption; if the accumulated deterministic consequences end in contradiction, the assumption is false.",
      "This remains proof by contradiction, but the proof state evolves. No guessed branch is accepted: each intermediate deduction must follow from earlier forced consequences.",
      "1. Identify the starting assumption. 2. Read the temporary deductions in order. 3. Locate the final contradiction or common result. 4. Apply the reported conclusion.",
      "The path may be long and may contain nested branches or intermediate marks.",
      "For manual checking, prioritize the final contradiction and the dependency of each temporary result rather than recreating the search order."
    ),
    Braid: entry(
      "Braid is a broader contradiction proof than a linear Whip and allows several supporting branches.",
      "Assuming the target true leaves multiple possible escape paths, but the braid shows that every path is eventually blocked.",
      "The main implication skeleton plus side branches exhausts all alternatives. If every alternative under the initial assumption ends in contradiction, the target is false.",
      "1. Start from the target. 2. Follow the main strand. 3. Inspect side branches that close alternative choices. 4. Confirm that no legal branch remains.",
      "The main strand and support branches have different roles; do not read them as one simple chain.",
      "The elimination must depend on the complete braid, not on one isolated weak link."
    ),
    GBraid: entry(
      "g-Braid is a Braid whose proof may use grouped nodes.",
      "Grouped nodes compress house-level alternatives while the braid blocks every completion under the target assumption.",
      "Assuming the target true, strong, weak, grouped, and capacity relations eliminate all possible branches, leaving no legal completion.",
      "1. Identify the target. 2. Find the main strand. 3. Read grouped and side branches. 4. Verify that every escape route is closed.",
      "Dense highlights should be decomposed into group nodes, the main strand, and supporting branches.",
      "Use the whole grouped braid proof; no single branch should be treated as sufficient unless it independently reaches contradiction."
    ),
    SKLoop: entry(
      "SK Loop and Domino Loop are the same technique. The detector uses exactly eight grouped link segments alternating through rows, boxes, columns, and boxes; one segment may carry several digits.",
      "The geometric segment count is fixed at eight, while every digit-house pair counts as one Link slot. Body cell truths equal the total Link slots, giving strict rank 0.",
      "Let the eight segments be L1...L8 with digit sets Di. LinkSlotCount is the sum of |Di|, and CellCount must equal LinkSlotCount. '16 Links' in the title means digit-house Link slots, not sixteen geometric segments.",
      "1. Confirm SegmentCount=8. 2. Read each segment's digit set. 3. Count digit-house Link slots. 4. Verify CellCount=LinkSlotCount. 5. Remove outside candidates that steal link capacity.",
      "Display LoopBody, the eight Link segments, and eliminations separately. Treat multiple digits on one segment as one grouped Link role.",
      "SK Loop is Domino Loop and is a strict rank-0 eight-segment loop. Keep segment count separate from Link-slot count."
    ),
    MSLS: entry(
      "This project has Exact Rank-0, Advanced Rank-0, and Advanced with Attachment MSLS paths.",
      "Exact selects the cheapest row, column, or box cover for each digit. Advanced also enumerates row-side/column-side choices for floating digits and may absorb attachment cells.",
      "When Core CellCount equals final LinkCount, capacity is saturated. Outside candidates in a selected link house steal capacity, while candidates covered by multiple links are cannibal overfills.",
      "1. Confirm the Core. 2. Compare cover cost for each digit. 3. For Advanced, verify floating-digit choices and Attachments. 4. Check CellCount=LinkCount. 5. Apply outside or cannibal eliminations.",
      "Display Core, Attachment, actual Links, PermutableDigits, and eliminations separately.",
      "Exact, Advanced, and Advanced with Attachment are distinct search paths. Explain only the Branch emitted by the step."
    ),
    RankMultifish: entry(
      "Multi-Fish in rank logic is a Rank-0 cover structure that may involve several digits and several sector types.",
      "Every strong sector requires one true instance, while each weak sector can hold at most one. Equal required and available counts fill all weak-sector capacity.",
      "Rank is weak-sector capacity minus mandatory strong-sector instances. At Rank 0 with complete coverage, any extra candidate in a weak sector consumes capacity reserved for a required instance and is therefore false.",
      "1. Identify all involved digits. 2. Count strong sectors. 3. Count weak sectors. 4. Verify exact coverage and Rank 0. 5. Remove extra weak-sector candidates.",
      "Read the strong and weak sector colouring rather than expecting a conventional single-digit fish shape.",
      "Confirm the sector count and complete coverage, and verify that every elimination is an extra candidate in a covered weak sector."
    ),
    BlossomLoop: entry(
      "Blossom Loop is a Rank-0 loop/network between a continuous loop and a net, with dynamic and forcing branches blooming from the main loop.",
      "Each apparently weak break is reinforced by a dynamic or forcing branch, allowing the overall structure to behave like a continuous loop.",
      "Truth sectors require at least one true candidate and Link sectors allow at most one. At Rank 0 the lower and upper bounds are equal, so every link capacity is exactly used. An outside target that disrupts a link or branch quota makes a Truth unsatisfied or a Link overfull and is false.",
      "1. Find the main loop. 2. Mark dynamic and forcing/burr branches. 3. Verify how branches split and rejoin. 4. Count Truths and Links. 5. Apply continuous-loop-style eliminations at justified weak links.",
      "The main loop is the skeleton; branches are proof components that turn breaks into effective strong relations.",
      "Do not describe it as an ordinary AIC loop or merely a closed Death Blossom. Rank 0 and every branch reinforcement must be verified."
    ),
    JE: entry(
      "Junior Exocet is built on true base digits being carried by the two target sides; the same search entity also runs several independent checks.",
      "After the Base, Targets, and Cross/S-cell quota is established, apply only checks actually triggered: Target Check, X-Rule, Mirror, Locked Member, True Base, JEPOM, and others.",
      "Every Check has its own prerequisites and elimination set. Absent checks must not be added. Double JExocet and Almost JE4 use their own emitted roles.",
      "1. Confirm BaseCandidates. 2. Separate Targets from Cross/S-cells. 3. Read every Check. 4. Match it to roles and eliminations. 5. Apply the actual conclusion.",
      "Display Base, Target Q/R, Cross, Mirror, Locked Member, True Base, and other roles separately.",
      "One step may trigger several checks. The tutorial must list all actual checks and must not inherit the entire JE rule set."
    ),
    SeniorExocet: entry(
      "Senior Exocet permits multi-cell targets, endo-targets, target-line AHS, and adjusted cross-line/S-cell sets.",
      "Actual checks include Cross-Line Need, Target-House Lock, Non-Base Target Cleanup, True Base, Mirror, Incompatible Base, X-Rule, and Potential Target Cover House.",
      "Each check independently constrains base-to-target carrying and S-cell capacity. Only checks emitted by this step belong to its proof.",
      "1. Find the Base. 2. Separate target groups from Cross/S-cells. 3. Read every Check. 4. Verify locks, mirrors, AHS, X-Rule, or cover-house conditions. 5. Apply eliminations.",
      "Display Base, TargetGroup A/B, Cross, locked non-base candidates, and check results separately.",
      "Do not infer rules from a Franken, Mutant, Complex, or Advanced shape. Every elimination must trace to a concrete emitted Check."
    ),
    WeakExocet: entry(
      "Weak Exocet retains only the partial Base-to-Target synchronization proved by the current weak structure and emits the WeakSeat, YLock, and checks actually triggered.",
      "Y-lock means a base digit is locked in the Y area. Target Cells Check is the T-cell check; Mirror Check is the M-cell check, not the Adjacent-Target rule. Use Adjacent Target only when explicitly emitted.",
      "The T-cell check removes incompatible target candidates; the Z-zone check removes non-base candidates from Z cells; the W-zone check removes base candidates where its capacity condition holds; the M-cell check uses targets and mirror nodes to remove incompatible candidates.",
      "1. Confirm BaseCandidates, Base, and WeakSeat. 2. Verify YLock/YArea. 3. Read TCheckTargets, ZZoneTargets, WZoneTargets, and MNodes/MCheckTargets. 4. Apply only actual Checks. 5. Apply their eliminations.",
      "Display Base, Targets, Cross, WeakSeat, YArea, ZZone, WZoneTargets, MNodes, and each target role separately.",
      "The corpus now has one real Y-lock+Z-zone sample and one real multi-check T-cell+Z-zone+W-zone+M-cell sample. The tutorial must remain selective."
    ),
    ExocetExtensions: entry(
      "JE+, Double JE, Almost JE, and Mutant JE modify object pairs, targets, cross-lines, or S-cell conditions within the Exocet base-target proof.",
      "An extension inherits only the Exocet consequences that remain proved under its modified structure.",
      "All variants still require true base digits to be carried by target/cross capacity. Because the carrying mechanism changes, every elimination must follow from all compatible arrangements, not from copying the full Junior Exocet rule set.",
      "1. Confirm the standard Exocet skeleton. 2. Identify the modified roles. 3. Verify each guardian, locked member, or incompatible base pair. 4. Apply only the reported conclusion.",
      "Extended Exocets require conservative reading: trust the explicitly demonstrated role and elimination rather than the variant name alone.",
      "Do not infer additional eliminations that the current step result did not prove."
    ),
    BruteForce: entry(
      "BruteForce is a Verified-Solution Placement: verify the complete solution first, then read one unsolved cell from it as the terminal fallback.",
      "The detector prefers an unsolved cell with few candidates and reads its value from CompleteSolution. It does not disguise one guess as local logic.",
      "Reliability comes from verification of the full solution, not a local structural proof. The step reports only the solved placement.",
      "1. Confirm logical techniques have no result. 2. Solve and verify the full grid. 3. Select an unsolved cell with few candidates. 4. Read and place its solved digit.",
      "Display only the selected cell and final placement; do not invent pivots, chains, or subsets.",
      "BruteForce is excluded from technique training. For a logic-only solve, change the configuration or inspect an earlier step."
    ),
  };

  const CATEGORY_EN = {
    "cat-basic": "These are direct-constraint techniques. Read the existing digits in a row, column, or box and check whether a cell or a digit has become unique.",
    "cat-subsets": "Subsets are capacity locks, not shape matching. Count cells and digits inside one house and verify that they reserve one another.",
    "cat-fish": "Fish use one digit throughout. Base sectors provide mandatory placements; cover sectors define the capacity and elimination area.",
    "cat-single-digit": "Fix one digit first, then follow how conjugate pairs, box intersections, BUG parity, or array constraints force its placement.",
    "cat-wings": "Wing families use several proof styles: classic XY/XYZ pivot branches, AIC-like multi-strong-link wings, and ALS-XZ or bent-set logic for WXYZ/VWXYZ. Do not force every Wing into one pivot-and-two-wings template.",
    "cat-uniqueness": "Uniqueness techniques prevent an interchangeable deadly completion. They are proofs by contradiction and require a puzzle intended to have exactly one solution.",
    "cat-oddagon": "Oddagons belong to negative-rank logic. First verify why the odd structure itself is impossible, then identify the guardians or extra candidates that keep it from closing.",
    "cat-als": "Treat every outline as an Almost Locked Set node, then follow the restricted common candidates connecting the sets.",
    "cat-ahs": "Almost Hidden Sets are the hidden dual of ALS: begin with digits confined to a small group of cells, then derive the outside restrictions.",
    "cat-chains": "Chains compare forced consequences rather than guessing. Follow strong/weak alternation or exhaust every forcing branch until the endpoint or contradiction is clear.",
    "cat-rank-logic": "Read Complex/Multi-Fish with strong/weak sector rank. Read MSLS and SK Loop with Home/Away and NS/HS/DC capacity. Read Blossom Loop as a Rank-0 loop reinforced by dynamic and forcing branches.",
    "cat-exocet": "Exocet is not an ordinary fish or chain. Separate base, target, cross-line/S-cell, companion, mirror, and guardian roles, then verify how true base digits must be carried by target/cross capacity.",
    "cat-fallback": "Fallback search is not a manual technique. It indicates that the current logical configuration found no displayable step and the solver used search instead.",
  };

  const TOP_BLOCKS = [
    ["header .wrap > p:not(.meta)", "Player-facing logic explanations; internal search implementation details are intentionally omitted."],
    ["#reading-intro > h2", "Reading Guide"],
    ["#reading-intro > p:nth-of-type(1)", "This guide follows Kazusa's layered progression: direct techniques, local and full candidate marking, chains, constructions, rank theory, Exocet, and deadly patterns. It condenses those ideas into what a player should inspect when the program shows a step."],
    ["#reading-intro > p:nth-of-type(2)", "<strong>Matched to the currently wired backend:</strong> the reference table contains 70 entries. <code>AHS-XY-Wing</code>, <code>AHS-W-Wing</code>, and <code>AHS Chain</code> remain explicit reference placeholders, so they are not listed as implemented techniques."],
    ["#reading-intro > p:nth-of-type(3)", "Further reading: <a href=\"https://github.com/kyoyama-kazusa/Sudoku/tree/main/docs/tutorial\" rel=\"noopener\" target=\"_blank\">Kazusa Sudoku tutorial</a>. This page uses a definition → reasoning → checkpoint reading structure without copying external diagrams or documenting internal search code."],
    ["#step-reading-method > p", "This guide organizes each technique as definition → current structure → why the placement or elimination works → how to verify it. Identify the structure, understand the proof, then verify the conclusion."],
    ["#step-reading-method .method-boxes > div:nth-child(1) h3", "1. Identify the structure"],
    ["#step-reading-method .method-boxes > div:nth-child(1) p", "Check the highlighted cells, candidates, houses, chain nodes, or set outlines and confirm that they match the named technique."],
    ["#step-reading-method .method-boxes > div:nth-child(2) h3", "2. Read the proof"],
    ["#step-reading-method .method-boxes > div:nth-child(2) p", "Decide whether the step uses a unique location, set capacity, base-cover logic, alternating links, uniqueness contradiction, or rank/guardian coverage."],
    ["#step-reading-method .method-boxes > div:nth-child(3) h3", "3. Verify the conclusion"],
    ["#step-reading-method .method-boxes > div:nth-child(3) p", "Confirm that every placement or elimination is covered by the structure. The dynamic Explain button inserts the current step's cells and conclusions into the same proof templates."],
    ["#dynamic-step-tutorial > p:nth-of-type(1)", "The main interface keeps Explain beside the User Manual link. After Hint, or after selecting a step from Available Steps or the solution path, it reads the current step result fields—title, kind, description, cells, candidates, actions, eliminations, nodes, edges, groups, rank, and more—and builds a proof for that exact step. The button remains disabled when no valid step is selected."],
    ["#dynamic-step-tutorial > p:nth-of-type(2)", "The static guide explains each technique's general mathematics; the dynamic tutorial fills in the current cells, digits, eliminations, chain nodes, and cover counts. You therefore see the proof for the current grid rather than only an abstract definition."],
    ["#reading-legend > h2", "Reading Highlights and Conclusions"],
    ["#reading-legend > p", "<strong>Recommended order:</strong> read the step title and the <code>=</code> / <code>&lt;&gt;</code> / <code>=&gt;</code> conclusion first, inspect the highlighted structure second, and check the crossed-out candidates last."],
    ["#reading-legend .legend-grid > p:nth-child(1)", "<strong>Placement:</strong> <code>r3c5=7</code> means row 3 column 5 is set to 7."],
    ["#reading-legend .legend-grid > p:nth-child(2)", "<strong>Elimination:</strong> <code>r3c5&lt;&gt;7</code> means candidate 7 can be removed from row 3 column 5."],
    ["#reading-legend .legend-grid > p:nth-child(3)", "<strong>Solid line:</strong> usually a strong relation—at least one endpoint is true."],
    ["#reading-legend .legend-grid > p:nth-child(4)", "<strong>Dashed line:</strong> usually a weak relation—the endpoints cannot both be true."],
    ["#reading-legend .legend-grid > p:nth-child(5)", "<strong>Oval or outline:</strong> usually a composite node such as an ALS, AHS, Almost Fish, or Exocet support region."],
    ["#reading-legend .legend-grid > p:nth-child(6)", "<strong>Guardian / fin:</strong> an exception preventing the standard bad structure; eliminations normally occur only where every relevant case overlaps."],
    ["#proof-reading > p", "Each entry explains why its placement or elimination is forced. First verify that the structure satisfies its premises, then identify the proof type: unique location, set capacity, base-cover coverage, alternating-link contradiction, uniqueness contradiction, or rank/guardian branch coverage."],
    ["#proof-reading > ul", "<li><strong>Unique location:</strong> a cell or digit has no second legal choice.</li><li><strong>Set capacity:</strong> n cells reserve n digits, excluding those digits elsewhere.</li><li><strong>Coverage:</strong> mandatory base placements are fully captured by covers, so extra cover positions are false.</li><li><strong>Chains / branches:</strong> every truth branch gives the same result, or assuming the target true creates a contradiction.</li><li><strong>Uniqueness:</strong> the dangerous state would create two interchangeable completed grids, contradicting the one-solution premise.</li>"],
    ["#tutorial-reading-path > h2", "Reading YZF with Kazusa's Tutorial Progression"],
    ["#tutorial-reading-path > p", "Kazusa progresses from visible constraints to candidate sets, chains, constructions, rank, Exocet, and deadly patterns. YZF uses the same player-facing order: you do not need to know how the program searches, only what must be checked on the grid."],
    ["#tutorial-reading-path .path-grid > p:nth-child(1)", "<strong>Direct techniques:</strong> Full House, Singles, and Locked Candidates. Read row/column/box restrictions first."],
    ["#tutorial-reading-path .path-grid > p:nth-child(2)", "<strong>Candidate sets:</strong> Naked/Hidden Subsets, ALS/AHS, and Sue de Coq. Count cells and digits to see what is locked."],
    ["#tutorial-reading-path .path-grid > p:nth-child(3)", "<strong>Fish:</strong> X-Wing, Swordfish, Jellyfish, and Finned Fish use single-digit base-cover logic; Complex and Multi-Fish use rank-style strong/weak sector coverage."],
    ["#tutorial-reading-path .path-grid > p:nth-child(4)", "<strong>Chains:</strong> X-Chain, XY-Chain, AIC, ALS Chain, Forcing Chains, Whips, and Braids. Follow alternating relations and focus on endpoints or contradictions."],
    ["#tutorial-reading-path .path-grid > p:nth-child(5)", "<strong>Constructions:</strong> read ordinary Wings by their core support, Blossom Loop as a Rank-0 loop with dynamic/forcing branches, and Broken Wing/Loop as Guardian or Broken-Pattern logic. UR, BUG, AR, UL, XR, and GSP remain uniqueness families even when a name contains guard. Fireworks remains a candidate-array family."],
    ["#tutorial-reading-path .path-grid > p:nth-child(6)", "<strong>Rank, Exocet, and deadly patterns:</strong> distinguish rank coverage, base-target quotas, negative-rank exits/guardians, and the unique-solution premise. Oddagons are no-solution negative-rank contradictions; UR/BUG are uniqueness contradictions."],
    ["#tutorial-reading-path .path-grid > p:nth-child(7)", "<strong>Negative-rank reminder:</strong> Guardian, Bivalue/Trivalue Oddagon, and Broken Loop sit near Kazusa's Negative Ranks. Read Oddagon/Tridagon as impossible odd structures, not as UR/BUG uniqueness or ordinary Wing/Loop logic."],
  ];

  const PLACEHOLDERS = {
    "AHS-XY-Wing": "After the finder is fully wired, document it using the AHS-XZ and ALS-XY-Wing proof style.",
    "AHS-W-Wing": "After the finder is fully wired, document it using the AHS-XZ and ALS-W-Wing proof style.",
    "AHS Chain": "After the finder is fully wired, document it using the AHS-XZ and ALS Chain proof style.",
  };


  function containsHan(text) {
    return /[\u3400-\u9fff]/.test(String(text || ""));
  }

  function splitBilingualText(text) {
    const parts = String(text || "").split(" / ");
    if (parts.length !== 2) return null;
    const [left, right] = parts.map((part) => part.trim());
    if (containsHan(left) && !containsHan(right)) return { zh: left, en: right };
    if (!containsHan(left) && containsHan(right)) return { en: left, zh: right };
    return { zh: left, en: right };
  }

  function wrapBilingualText(element, zh, en) {
    if (!element || element.dataset.bilingualTitle === "1") return;
    element.dataset.bilingualTitle = "1";
    element.classList.add("bilingual-title");
    element.textContent = "";
    const enNode = document.createElement("span");
    enNode.className = "title-en";
    enNode.textContent = en;
    const zhNode = document.createElement("span");
    zhNode.className = "title-zh";
    zhNode.textContent = zh;
    const separator = document.createElement("span");
    separator.className = "title-separator";
    separator.textContent = " / ";
    element.append(enNode, separator, zhNode);
  }

  function prepareBilingualTitles() {
    wrapBilingualText(document.querySelector("h1"), "YZF Sudoku 技巧说明", "YZF Sudoku Techniques");
    document.querySelectorAll("nav h2, nav a, section.category > h2, section.note > h2, section.panel > h2").forEach((element) => {
      const pair = splitBilingualText(element.textContent);
      if (pair) wrapBilingualText(element, pair.zh, pair.en);
    });
    document.querySelectorAll(".tech-card h3").forEach((heading) => {
      if (heading.dataset.bilingualTitle === "1") return;
      const secondary = heading.querySelector(":scope > span")?.textContent?.trim() || "";
      const primary = Array.from(heading.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent)
        .join(" ")
        .trim();
      if (!secondary) return;
      const primaryHan = containsHan(primary);
      const secondaryHan = containsHan(secondary);
      let en = primaryHan && !secondaryHan ? secondary : primary;
      const zh = primaryHan && !secondaryHan ? primary : secondary;
      if (heading.closest("#ExocetExtensions")) en = "Exocet Extension Notes";
      wrapBilingualText(heading, zh, en);
    });
  }

  function localizeElement(element, englishHtml, options = {}) {
    if (!element || element.dataset.techLocalized === "1") return;
    element.dataset.techLocalized = "1";
    element.classList.add("lang-copy", "lang-zh");
    const clone = element.cloneNode(false);
    clone.removeAttribute("id");
    clone.dataset.techLocalized = "1";
    clone.classList.remove("lang-zh");
    clone.classList.add("lang-en");
    clone.innerHTML = englishHtml;
    if (options.after === false) element.parentNode.insertBefore(clone, element);
    else element.insertAdjacentElement("afterend", clone);
  }

  function ensureSectionIds() {
    const intro = document.querySelector("main > section.note:not([id])");
    if (intro) intro.id = "reading-intro";
    const proof = document.querySelector("main > section.panel:not([id])");
    if (proof) proof.id = "proof-reading";
  }

  function injectTopTranslations() {
    ensureSectionIds();
    for (const [selector, englishHtml] of TOP_BLOCKS) {
      localizeElement(document.querySelector(selector), englishHtml);
    }
    for (const [id, text] of Object.entries(CATEGORY_EN)) {
      localizeElement(document.querySelector(`#${id} > .cat-intro`), text);
    }

    const appendix = document.querySelector("section.appendix");
    if (appendix) {
      localizeElement(appendix.querySelector(":scope > h2"), "Reference Placeholders");
      localizeElement(
        appendix.querySelector(":scope > p"),
        "These entries remain in the reference table to preserve ordering and filtering, but the current source still marks their finders as unwired. They are therefore not listed among implemented techniques."
      );
      appendix.querySelectorAll(":scope > .tech-card").forEach((card) => {
        const title = card.querySelector("h3")?.childNodes[0]?.textContent?.trim() || "";
        const paragraph = card.querySelector(":scope > p:last-child");
        if (paragraph && PLACEHOLDERS[title]) localizeElement(paragraph, PLACEHOLDERS[title]);
      });
    }
  }

  function injectCardTranslations() {
    const missing = [];
    document.querySelectorAll("article.tech-card[id]").forEach((card) => {
      const id = card.id;
      const values = CARDS[id];
      const source = card.querySelector(":scope > dl");
      if (!source) return;
      if (!values) {
        missing.push(id);
        return;
      }
      source.classList.add("lang-copy", "lang-zh", "tech-card-copy");
      source.dataset.techLocalized = "1";
      const translated = document.createElement("dl");
      translated.className = "lang-copy lang-en tech-card-copy";
      translated.dataset.techLocalized = "1";
      values.forEach((text, index) => {
        const dt = document.createElement("dt");
        dt.textContent = FIELD_LABELS[index] || `Note ${index + 1}`;
        const dd = document.createElement("dd");
        dd.textContent = text;
        translated.append(dt, dd);
      });
      source.insertAdjacentElement("afterend", translated);
    });
    if (missing.length) console.warn("Missing English technique entries:", missing.join(", "));
  }

  function createLanguageToolbar() {
    const headerWrap = document.querySelector("header .wrap");
    if (!headerWrap || document.getElementById("techLanguageToolbar")) return;
    const toolbar = document.createElement("div");
    toolbar.id = "techLanguageToolbar";
    toolbar.className = "tech-language-toolbar";
    toolbar.setAttribute("aria-label", "Language view");
    toolbar.innerHTML = [
      '<button type="button" data-tech-lang-button="zh">中文</button>',
      '<button type="button" data-tech-lang-button="en">English</button>',
      '<button type="button" data-tech-lang-button="bilingual">中英对照 / Bilingual</button>',
    ].join("");
    headerWrap.appendChild(toolbar);
  }

  function languageText(mode) {
    if (mode === "en") return {
      title: "YZF Sudoku Techniques",
      searchLabel: "Search technique",
      searchPlaceholder: "Technique name, Kind, or category, e.g. AIC / ALS / Fish / Unique Rectangle",
      meta: "V466 · true Chinese/English switching · complete bilingual technique guide",
    };
    if (mode === "zh") return {
      title: "YZF Sudoku 技巧说明",
      searchLabel: "快速查找技巧",
      searchPlaceholder: "输入技巧名、Kind、类别，例如 AIC / ALS / Fish / 唯一矩形",
      meta: "V466 · 技巧说明中英文切换 · 完整双语技巧页",
    };
    return {
      title: "YZF Sudoku 技巧说明 / Techniques",
      searchLabel: "快速查找技巧 / Search technique",
      searchPlaceholder: "输入技巧名、Kind、类别 / Technique name, Kind, or category",
      meta: "V466 · true Chinese/English switching · complete bilingual technique guide",
    };
  }

  function setLanguageView(value, updateUrl = false) {
    const mode = value === "zh" || value === "en" ? value : "bilingual";
    document.body.dataset.techLang = mode;
    document.documentElement.lang = mode === "en" ? "en" : "zh-CN";
    document.querySelectorAll("[data-tech-lang-button]").forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.techLangButton === mode ? "true" : "false");
    });
    const strings = languageText(mode);
    document.title = strings.title;
    const meta = document.querySelector("header .meta");
    if (meta) meta.textContent = strings.meta;
    const search = document.getElementById("techSearch");
    if (search) {
      search.placeholder = strings.searchPlaceholder;
      const label = search.closest("label");
      if (label) {
        const textNode = Array.from(label.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
        if (textNode) textNode.textContent = strings.searchLabel;
      }
    }
    try { localStorage.setItem("yzf-techniques-language", mode); } catch (_) {}
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set("lang", mode);
      history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }

  function initializeLanguage() {
    const requested = new URLSearchParams(location.search).get("lang");
    let saved = "";
    try { saved = localStorage.getItem("yzf-techniques-language") || ""; } catch (_) {}
    const initial = ["zh", "en", "bilingual"].includes(requested)
      ? requested
      : (["zh", "en", "bilingual"].includes(saved) ? saved : "bilingual");
    document.querySelectorAll("[data-tech-lang-button]").forEach((button) => {
      button.addEventListener("click", () => setLanguageView(button.dataset.techLangButton, true));
    });
    setLanguageView(initial, false);
  }

  if (typeof globalThis !== "undefined") {
    globalThis.YZF_TECHNIQUES_I18N_DATA = { FIELD_LABELS, CARDS, CATEGORY_EN };
  }

  createLanguageToolbar();
  injectTopTranslations();
  injectCardTranslations();
  prepareBilingualTitles();
  initializeLanguage();
})();
