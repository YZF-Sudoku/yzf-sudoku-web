// Generated from techniques.html and techniques-i18n.js.
// Keep the standalone guide and in-app tutorial text synchronized.
export const TECHNIQUE_TUTORIAL_FIELDS = {
  "zh": [
    "基本含义",
    "成立逻辑",
    "数学逻辑",
    "看盘步骤",
    "高亮阅读",
    "核对要点"
  ],
  "en": [
    "Basic idea",
    "Why it works",
    "Mathematical logic",
    "How to read the grid",
    "Highlight guide",
    "Checkpoints"
  ]
};

export const TECHNIQUE_TUTORIAL_CARDS = {
  "FullHouse": {
    "zh": [
      "某一行、列或宫已经填了 8 个数字，只剩一个空格。",
      "把该区域缺失的数字数出来；因为区域必须包含 1 到 9 各一次，缺的那个数只能进最后空格。",
      "这是最直接的“区域完备性”推理：每一行、列、宫都必须恰好包含 1–9 各一次。若一个区域只剩一个空格，且其他 8 个数字已经出现，那么缺失数字没有第二个容器，只能填入该空格；否则该区域永远无法补齐。",
      "① 看高亮的行/列/宫；② 找最后空格；③ 数缺失数字；④ 填入结论。",
      "先看高亮区域，再看唯一空格；这是出数步骤，通常结论写成某格等于某数。",
      "数一遍该行/列/宫是否确实只缺一个数字；不要把候选删数步骤误读成 Full House。"
    ],
    "en": [
      "A row, column, or box already contains eight digits and has one empty cell.",
      "The missing digit has no other place in that house, so it must occupy the final cell.",
      "Every house must contain 1–9 exactly once. With eight values present, the ninth value and its only container are fixed.",
      "1. Inspect the highlighted house. 2. Find its only empty cell. 3. Determine the missing digit. 4. Place it.",
      "The house and its last empty cell are the important highlights; this is a placement, not a candidate elimination.",
      "Confirm that the house really has only one empty cell and that exactly one digit is missing."
    ]
  },
  "HiddenSingle": {
    "zh": [
      "某个数字在一个行、列或宫里只有一个可放位置，即使该格还有别的候选，它也必须填这个数字。",
      "从数字出发检查同一区域：其他格要么已有冲突，要么候选已被排除，唯一剩下的位置承担该数字。",
      "这是“某数字在某区域内唯一落点”的推理。一个区域最终必须出现一次该数字；如果除目标格外的所有位置都因同行、同列、同宫冲突而不能放它，那么把它填到目标格不是猜测，而是该区域满足规则的唯一方式。",
      "① 锁定数字；② 看行/列/宫；③ 排除其他位置；④ 确认唯一落点。",
      "高亮重点通常是“某区域 + 某数字 + 唯一落点”，不是该格只剩一个候选。",
      "确认同一区域内该数字没有第二个合法位置；如果还有第二处，就不是 Hidden Single。"
    ],
    "en": [
      "One digit has only one legal position in a row, column, or box, even though that cell may contain other candidates.",
      "Every other position for the digit is blocked, so the remaining location must take it.",
      "A house must contain the digit once. If all locations except one are impossible, that final location is forced.",
      "1. Fix the digit. 2. Inspect one house. 3. Rule out every other location. 4. Place the digit in the unique location.",
      "The highlight represents a house, one digit, and its only location—not necessarily a one-candidate cell.",
      "If the digit still has a second legal location in the house, it is not a Hidden Single."
    ]
  },
  "NakedSingle": {
    "zh": [
      "某个空格只剩一个候选数。",
      "从格子出发：同行、同列、同宫已经排除了其他 8 个数字，所以剩余候选必真。",
      "这是“单元格候选集合缩成单元素”的推理。一个空格最终必须填一个数字；若其他 8 个数字都已被同行、同列、同宫排除，剩下的候选若再不成立，该格就无数可填，盘面矛盾。",
      "① 看目标格；② 数候选；③ 确认只剩一个；④ 填入该数。",
      "高亮会集中在目标格的唯一候选；这是出数，不是删除该候选。",
      "检查该格候选是否真的只剩一个；若还有两个以上候选，就不能按 Naked Single 填。"
    ],
    "en": [
      "An empty cell has only one candidate left.",
      "Its row, column, and box exclude the other eight digits, so the remaining candidate is true.",
      "A cell must receive one value. If every other value is illegal, rejecting the final candidate would leave the cell empty and contradict Sudoku rules.",
      "1. Inspect the target cell. 2. Count its candidates. 3. Confirm that only one remains. 4. Place it.",
      "The only candidate in the cell is highlighted. This is a placement, not a deletion of that candidate.",
      "Do not place the digit if the cell still has two or more candidates."
    ]
  },
  "LockedCandidates": {
    "zh": [
      "某数字在宫与行/列的交叉处被锁住，因此交叉线或交叉宫外的同数字候选可以删除。",
      "如果一个宫内的某数字只能落在同一行/列，那么该行/列其他宫不能再放此数；反向也成立。",
      "这是交叉区域的覆盖推理。若数字 d 在某宫内所有可能位置都落在同一行/列，那么该宫必须在这条线中完成 d；于是这条线在宫外的位置不能再放 d。反向同理：若一条线上的 d 全落在同一宫，宫内其他位置就失去放 d 的机会。",
      "① 锁定一个数字；② 找它集中在哪个交叉区域；③ 分清本体与外部；④ 删除外部同数字。",
      "高亮应分成锁定区域和删数区域：同一个数字在两个区域之间形成“范围锁定”。",
      "确认删数不是锁定本体的一部分；删数必须在同一行/列或同一宫的外侧受影响区域。"
    ],
    "en": [
      "A digit is confined to the intersection of a box and a row or column, allowing eliminations outside the intersection.",
      "If all box locations for a digit lie in one line, that line must place the digit inside the box, so the line cannot place it elsewhere. The converse also holds.",
      "The box and line share the complete set of possible locations for the digit. Once one sector must satisfy the digit inside the intersection, the outside part of the other sector loses that digit.",
      "1. Fix one digit. 2. Find its confined intersection. 3. Separate the locked body from the outside cells. 4. Remove the digit from the affected outside cells.",
      "The locked intersection and the elimination area should be shown separately.",
      "An eliminated candidate must be outside the locked body but still in the affected row, column, or box."
    ]
  },
  "GSP": {
    "zh": [
      "GSP 使用唯一解前提或全局摆放对称性，排除某些看似可行但会构造第二解或等价变化的候选。",
      "用户可以把它理解成一种“全局唯一性检查”：若某组候选按某种方式保留，会制造可替换的第二种完成方式；这与谜题唯一解前提矛盾。",
      "这是基于唯一解的全局可替换性推理。若高亮结构允许一组候选互换而不影响其他格，则同一题会产生两个完成盘；这与谜题唯一解前提矛盾。因此在唯一解题中，破坏唯一性的候选组合必须被排除。",
      "① 找高亮的成组位置；② 看它们是否形成可替换关系；③ 确认唯一解前提；④ 应用系统给出的删数。",
      "高亮通常会标出一组互相呼应的位置；重点不是单个格子，而是整组位置的同步关系。",
      "只在确认题目是唯一解时使用；若是多解/无解盘面，或 OCR 草稿尚未通过唯一性校验，GSP 类结论不应作为手工逻辑依据。"
    ],
    "en": [
      "GSP uses global placement symmetry or the unique-solution premise to reject a candidate combination that would permit an equivalent completion.",
      "Keeping the highlighted arrangement would create an interchangeable second completion, contradicting uniqueness.",
      "The pattern exposes a set of placements that can be permuted without changing the external constraints. A unique puzzle cannot allow both completions, so the combination that preserves the symmetry must be broken.",
      "1. Inspect the grouped highlighted positions. 2. Verify the interchangeable relation. 3. Confirm the unique-solution premise. 4. Apply the reported elimination.",
      "Read the synchronized group as a whole rather than focusing on one cell.",
      "Do not use GSP as manual logic on a multi-solution grid, an invalid grid, or an unverified OCR draft."
    ]
  },
  "NakedPair": {
    "zh": [
      "同一区域内两个格子只含同一对候选。",
      "这两个格子必须分别填这两个数字，因此该区域其他格不能再保留这两个候选。",
      "这是鸽巢原理式的集合锁定：同一区域内 2 个格子的候选并集只有 2 个数字。由于这 2 个格子最终都要填数，且同一区域不能重复，这 2 个数字会被这些格子全部占用；区域内其他格若再保留这些数字，就会和这组格子的必需分配冲突。",
      "① 找两个格；② 比较候选集合；③ 确认同一区域；④ 删除区域其他同候选。",
      "高亮两个双值格和区域内被删的同候选。",
      "两个格子必须在同一行、列或宫内，并且候选集合完全相同。"
    ],
    "en": [
      "A Naked Pair is a set of 2 cells in one house whose combined candidates contain only 2 digits.",
      "Those 2 digits must occupy those 2 cells, so the same digits can be removed from every other cell in the house.",
      "This is a pigeonhole argument: 2 cells need 2 values and their candidate union has size 2. The set therefore consumes the entire capacity for those digits inside the house.",
      "1. Choose 2 cells. 2. Merge their candidates. 3. Confirm that exactly 2 digits remain. 4. Eliminate those digits from the other cells in the house.",
      "The highlighted body is the 2-cell set; eliminations lie outside the set but inside the same row, column, or box.",
      "The cells need not have identical candidate lists, but their union must contain exactly 2 digits and all cells must share one house."
    ]
  },
  "NakedTriple": {
    "zh": [
      "同一区域内三个格子的候选总共只覆盖三个数字。",
      "这三个数字会被这三个格子占完，所以区域其他格不能保留这些数字。",
      "这是鸽巢原理式的集合锁定：同一区域内 3 个格子的候选并集只有 3 个数字。由于这 3 个格子最终都要填数，且同一区域不能重复，这 3 个数字会被这些格子全部占用；区域内其他格若再保留这些数字，就会和这组格子的必需分配冲突。",
      "① 选三个格；② 合并候选；③ 确认只有三种数字；④ 删除区域外这些数字。",
      "高亮三个格组成的集合；删数在集合外。",
      "三个格不一定候选完全相同，但合并后的候选种类必须只有三个。"
    ],
    "en": [
      "A Naked Triple is a set of 3 cells in one house whose combined candidates contain only 3 digits.",
      "Those 3 digits must occupy those 3 cells, so the same digits can be removed from every other cell in the house.",
      "This is a pigeonhole argument: 3 cells need 3 values and their candidate union has size 3. The set therefore consumes the entire capacity for those digits inside the house.",
      "1. Choose 3 cells. 2. Merge their candidates. 3. Confirm that exactly 3 digits remain. 4. Eliminate those digits from the other cells in the house.",
      "The highlighted body is the 3-cell set; eliminations lie outside the set but inside the same row, column, or box.",
      "The cells need not have identical candidate lists, but their union must contain exactly 3 digits and all cells must share one house."
    ]
  },
  "HiddenPair": {
    "zh": [
      "同一区域内两个数字只出现在两个格子里。",
      "这两个格子必须承担这两个数字，因此这两个格子里的其他候选可以删除。",
      "这是显性数组的对偶推理：同一区域内 2 个数字只出现在 2 个格子里。该区域最终必须各出现一次这些数字，所以这 2 个格子必须承担它们；若这些格子还填了别的数字，就会导致目标数字没有足够位置落脚。",
      "① 选两个数字；② 看它们只在哪两格出现；③ 锁定这两格；④ 删除两格内其他候选。",
      "高亮重点是两个数字的唯一活动范围；删数发生在这两个格子内部。",
      "不要按显性数对读：Hidden Pair 的目标是删掉目标格中的其他候选。"
    ],
    "en": [
      "A Hidden Pair occurs when 2 digits appear only in the same 2 cells of one house.",
      "Those cells must carry those digits, so every other candidate in the same cells can be removed.",
      "This is the dual of a naked subset. A house must place each of the 2 digits once, and there are only 2 cells available for them. Those cells therefore cannot take any outside digit.",
      "1. Choose 2 digits. 2. Locate every occurrence in the house. 3. Confirm that they occupy only 2 cells. 4. Remove all other candidates from those cells.",
      "The highlights focus on the restricted locations of the digits; eliminations occur inside the selected cells.",
      "Check digit locations rather than cell candidate counts. If any selected digit has another location in the house, the subset is not valid."
    ]
  },
  "HiddenTriple": {
    "zh": [
      "同一区域内三个数字只出现在三个格子里。",
      "这三个格子必须承担这三个数字，因此三个格子里的其他候选可以删除。",
      "这是显性数组的对偶推理：同一区域内 3 个数字只出现在 3 个格子里。该区域最终必须各出现一次这些数字，所以这 3 个格子必须承担它们；若这些格子还填了别的数字，就会导致目标数字没有足够位置落脚。",
      "① 选三个数字；② 找出现位置；③ 确认只有三格；④ 删除三格内其他候选。",
      "高亮三个数字的覆盖格；删数在这些格子内部。",
      "确认这三个数字没有出现在第 4 个格子；否则不构成隐藏三数组。"
    ],
    "en": [
      "A Hidden Triple occurs when 3 digits appear only in the same 3 cells of one house.",
      "Those cells must carry those digits, so every other candidate in the same cells can be removed.",
      "This is the dual of a naked subset. A house must place each of the 3 digits once, and there are only 3 cells available for them. Those cells therefore cannot take any outside digit.",
      "1. Choose 3 digits. 2. Locate every occurrence in the house. 3. Confirm that they occupy only 3 cells. 4. Remove all other candidates from those cells.",
      "The highlights focus on the restricted locations of the digits; eliminations occur inside the selected cells.",
      "Check digit locations rather than cell candidate counts. If any selected digit has another location in the house, the subset is not valid."
    ]
  },
  "NakedQuad": {
    "zh": [
      "同一区域内四个格子的候选总共只覆盖四个数字。",
      "这四个数字会被四个格子占完，所以区域其他格不能保留这些数字。",
      "这是鸽巢原理式的集合锁定：同一区域内 4 个格子的候选并集只有 4 个数字。由于这 4 个格子最终都要填数，且同一区域不能重复，这 4 个数字会被这些格子全部占用；区域内其他格若再保留这些数字，就会和这组格子的必需分配冲突。",
      "① 选四格；② 合并候选；③ 确认四种数字；④ 删除区域外这些数字。",
      "高亮四格集合；删数在同一区域的集合外。",
      "确认格子数和候选种类数同为四，且全部在同一个行/列/宫。"
    ],
    "en": [
      "A Naked Quad is a set of 4 cells in one house whose combined candidates contain only 4 digits.",
      "Those 4 digits must occupy those 4 cells, so the same digits can be removed from every other cell in the house.",
      "This is a pigeonhole argument: 4 cells need 4 values and their candidate union has size 4. The set therefore consumes the entire capacity for those digits inside the house.",
      "1. Choose 4 cells. 2. Merge their candidates. 3. Confirm that exactly 4 digits remain. 4. Eliminate those digits from the other cells in the house.",
      "The highlighted body is the 4-cell set; eliminations lie outside the set but inside the same row, column, or box.",
      "The cells need not have identical candidate lists, but their union must contain exactly 4 digits and all cells must share one house."
    ]
  },
  "HiddenQuad": {
    "zh": [
      "同一区域内四个数字只出现在四个格子里。",
      "这四个格子被四个数字占用，格内其他候选没有机会成立。",
      "这是显性数组的对偶推理：同一区域内 4 个数字只出现在 4 个格子里。该区域最终必须各出现一次这些数字，所以这 4 个格子必须承担它们；若这些格子还填了别的数字，就会导致目标数字没有足够位置落脚。",
      "① 选四个数字；② 看它们出现在哪些格；③ 确认只覆盖四格；④ 删除格内其他候选。",
      "高亮四个数字及其所在格；结论通常是格内删数。",
      "检查数字出现范围，而不是只看格子的候选数量。"
    ],
    "en": [
      "A Hidden Quad occurs when 4 digits appear only in the same 4 cells of one house.",
      "Those cells must carry those digits, so every other candidate in the same cells can be removed.",
      "This is the dual of a naked subset. A house must place each of the 4 digits once, and there are only 4 cells available for them. Those cells therefore cannot take any outside digit.",
      "1. Choose 4 digits. 2. Locate every occurrence in the house. 3. Confirm that they occupy only 4 cells. 4. Remove all other candidates from those cells.",
      "The highlights focus on the restricted locations of the digits; eliminations occur inside the selected cells.",
      "Check digit locations rather than cell candidate counts. If any selected digit has another location in the house, the subset is not valid."
    ]
  },
  "XWing": {
    "zh": [
      "某数字在两个 base 行/列中的候选位置只落在同两个 cover 列/行。",
      "两个 base 区域各需要一个该数字，而位置又全被两个 cover 区域接住，所以 cover 区域其他位置不能放该数字。",
      "这是单数字的 base-cover 覆盖推理。选定 2 个 base 行/列后，每个 base 都必须放一次该数字；如果这些可能位置全部被 2 个 cover 列/行接住，那么这 2 个 cover 也会被这 2 个放置占满。因此 cover 中不属于鱼身的同数字候选没有机会成立，可以删除。",
      "① 锁定一个数字；② 找 2 条 base；③ 确认只落在 2 条 cover；④ 删除 cover 外部同数字。",
      "高亮通常是四角鱼身，删数在 cover 线的鱼身外。",
      "全程只看一个数字；不要把不同数字混进鱼结构。"
    ],
    "en": [
      "X-Wing is a single-digit fish with 2 base rows or columns whose candidates lie entirely in 2 cover columns or rows.",
      "Each base house must place the digit once, and all placements are caught by the cover houses. The cover capacity is therefore filled by the fish body.",
      "The 2 mandatory placements in the base houses must occupy the 2 cover houses. Any extra occurrence of the same digit in a cover house would exceed that capacity, so it can be eliminated.",
      "1. Fix one digit. 2. Choose 2 base houses. 3. Verify that all their candidates lie in 2 cover houses. 4. Eliminate the digit from cover cells outside the fish body.",
      "The body consists of the candidate intersections of base and cover houses; eliminations are other candidates of the same digit in the covers.",
      "Use only one digit. Every base must still have a possible placement, and all of its locations must be covered by the selected covers."
    ]
  },
  "Swordfish": {
    "zh": [
      "三阶鱼：某数字在三条 base 行/列中的候选只落在三条 cover 列/行。",
      "三条 base 都必须放该数字，且只能分配到三条 cover 中，因此 cover 其他位置无机会。",
      "这是单数字的 base-cover 覆盖推理。选定 3 个 base 行/列后，每个 base 都必须放一次该数字；如果这些可能位置全部被 3 个 cover 列/行接住，那么这 3 个 cover 也会被这 3 个放置占满。因此 cover 中不属于鱼身的同数字候选没有机会成立，可以删除。",
      "① 锁定数字；② 找 3 条 base；③ 找 3 条 cover；④ 删除 cover 外部同数字。",
      "高亮鱼身可能不是满 9 格；只要覆盖关系成立即可。",
      "确认每条 base 至少有可用位置，且所有位置都被三条 cover 覆盖。"
    ],
    "en": [
      "Swordfish is a single-digit fish with 3 base rows or columns whose candidates lie entirely in 3 cover columns or rows.",
      "Each base house must place the digit once, and all placements are caught by the cover houses. The cover capacity is therefore filled by the fish body.",
      "The 3 mandatory placements in the base houses must occupy the 3 cover houses. Any extra occurrence of the same digit in a cover house would exceed that capacity, so it can be eliminated.",
      "1. Fix one digit. 2. Choose 3 base houses. 3. Verify that all their candidates lie in 3 cover houses. 4. Eliminate the digit from cover cells outside the fish body.",
      "The body consists of the candidate intersections of base and cover houses; eliminations are other candidates of the same digit in the covers.",
      "Use only one digit. Every base must still have a possible placement, and all of its locations must be covered by the selected covers."
    ]
  },
  "Jellyfish": {
    "zh": [
      "四阶鱼：某数字在四条 base 行/列中的候选只落在四条 cover 列/行。",
      "四条 base 需要四个该数字，而 cover 区域已经接住全部可能位置。",
      "这是单数字的 base-cover 覆盖推理。选定 4 个 base 行/列后，每个 base 都必须放一次该数字；如果这些可能位置全部被 4 个 cover 列/行接住，那么这 4 个 cover 也会被这 4 个放置占满。因此 cover 中不属于鱼身的同数字候选没有机会成立，可以删除。",
      "① 锁定数字；② 找 4 条 base；③ 确认候选只在 4 条 cover；④ 删除 cover 外部同数字。",
      "高亮范围较大，读法仍与 X-Wing 相同：base 负责必须性，cover 负责删数。",
      "不要被候选数量吓到；关键是是否只占用四条 cover。"
    ],
    "en": [
      "Jellyfish is a single-digit fish with 4 base rows or columns whose candidates lie entirely in 4 cover columns or rows.",
      "Each base house must place the digit once, and all placements are caught by the cover houses. The cover capacity is therefore filled by the fish body.",
      "The 4 mandatory placements in the base houses must occupy the 4 cover houses. Any extra occurrence of the same digit in a cover house would exceed that capacity, so it can be eliminated.",
      "1. Fix one digit. 2. Choose 4 base houses. 3. Verify that all their candidates lie in 4 cover houses. 4. Eliminate the digit from cover cells outside the fish body.",
      "The body consists of the candidate intersections of base and cover houses; eliminations are other candidates of the same digit in the covers.",
      "Use only one digit. Every base must still have a possible placement, and all of its locations must be covered by the selected covers."
    ]
  },
  "FinnedXWing": {
    "zh": [
      "带鳍二阶鱼：标准二阶鱼旁边多出一个或多个 fin。",
      "如果 fin 不成立，鱼成立；如果 fin 成立，能看见 fin 的目标候选也被排除。只有两种情况都能排除的位置才可删。",
      "这是标准鱼加一个例外点 fin 的二分讨论。若 fin 不成立，剩余鱼身退化为 2 阶标准鱼，按 base-cover 逻辑删数；若 fin 成立，所有能直接看见 fin 的目标候选也不能成立。只有“鱼成立”和“fin 成立”两种情况下都会被排除的候选，才是安全删数。",
      "① 找鱼身；② 找 fin；③ 看目标是否既受鱼约束又看见 fin；④ 只删共同区域。",
      "高亮会区分鱼身和 fin；删数通常必须同时看见 fin，并位于 cover 影响范围内。",
      "不能把普通 X-Wing 的所有 cover 外部候选都删掉；只删被 fin 共同约束的位置。"
    ],
    "en": [
      "Finned X-Wing is a size-2 fish with one or more fin candidates outside the clean fish body.",
      "If every fin is false, the ordinary fish is active. If a fin is true, candidates that see the fin are false. Only targets eliminated in both cases are safe.",
      "This is a two-case proof. The no-fin branch gives the standard base-cover elimination; the fin-true branch eliminates candidates visible to the fin. Their intersection is the valid elimination set.",
      "1. Identify the fish body. 2. Mark the fin or fins. 3. Find targets constrained by the fish and visible to the relevant fin. 4. Eliminate only those common targets.",
      "Body, covers, fins, and eliminations should be visually distinct. The target normally lies in a cover and also sees the fin.",
      "Do not apply every elimination of the unfinned fish. A target that is not constrained by the fin is not justified by the finned pattern."
    ]
  },
  "FinnedSwordfish": {
    "zh": [
      "带鳍三阶鱼：三阶鱼有额外 fin 破坏完整覆盖。",
      "fin 是例外点；不论 fin 真或鱼身成立，只有共同受限的目标候选可删。",
      "这是标准鱼加一个例外点 fin 的二分讨论。若 fin 不成立，剩余鱼身退化为 3 阶标准鱼，按 base-cover 逻辑删数；若 fin 成立，所有能直接看见 fin 的目标候选也不能成立。只有“鱼成立”和“fin 成立”两种情况下都会被排除的候选，才是安全删数。",
      "① 找三阶鱼骨架；② 标出 fin；③ 检查删数是否看见 fin；④ 应用共同删数。",
      "高亮通常有 base、cover、fin 三类对象；先分清角色。",
      "删数必须与 fin 有可见关系，不能按无鳍鱼扩大删数。"
    ],
    "en": [
      "Finned Swordfish is a size-3 fish with one or more fin candidates outside the clean fish body.",
      "If every fin is false, the ordinary fish is active. If a fin is true, candidates that see the fin are false. Only targets eliminated in both cases are safe.",
      "This is a two-case proof. The no-fin branch gives the standard base-cover elimination; the fin-true branch eliminates candidates visible to the fin. Their intersection is the valid elimination set.",
      "1. Identify the fish body. 2. Mark the fin or fins. 3. Find targets constrained by the fish and visible to the relevant fin. 4. Eliminate only those common targets.",
      "Body, covers, fins, and eliminations should be visually distinct. The target normally lies in a cover and also sees the fin.",
      "Do not apply every elimination of the unfinned fish. A target that is not constrained by the fin is not justified by the finned pattern."
    ]
  },
  "FinnedJellyfish": {
    "zh": [
      "带鳍四阶鱼：四阶鱼骨架外存在 fin。",
      "逻辑同带鳍鱼：fin 成立或鱼成立都会排除同一批候选。",
      "这是标准鱼加一个例外点 fin 的二分讨论。若 fin 不成立，剩余鱼身退化为 4 阶标准鱼，按 base-cover 逻辑删数；若 fin 成立，所有能直接看见 fin 的目标候选也不能成立。只有“鱼成立”和“fin 成立”两种情况下都会被排除的候选，才是安全删数。",
      "① 看四阶骨架；② 找 fin；③ 找 fin 与 cover 的交集影响；④ 删除交集内候选。",
      "高亮范围可能很大，先看 fin 再看结论。",
      "如果目标看不见 fin，通常不能被 finned fish 删除。"
    ],
    "en": [
      "Finned Jellyfish is a size-4 fish with one or more fin candidates outside the clean fish body.",
      "If every fin is false, the ordinary fish is active. If a fin is true, candidates that see the fin are false. Only targets eliminated in both cases are safe.",
      "This is a two-case proof. The no-fin branch gives the standard base-cover elimination; the fin-true branch eliminates candidates visible to the fin. Their intersection is the valid elimination set.",
      "1. Identify the fish body. 2. Mark the fin or fins. 3. Find targets constrained by the fish and visible to the relevant fin. 4. Eliminate only those common targets.",
      "Body, covers, fins, and eliminations should be visually distinct. The target normally lies in a cover and also sees the fin.",
      "Do not apply every elimination of the unfinned fish. A target that is not constrained by the fin is not justified by the finned pattern."
    ]
  },
  "ComplexSwordfish": {
    "zh": [
      "复杂三阶鱼允许 base/cover 使用行、列、宫等混合区域。",
      "仍然只讨论一个数字；三组必须位置被三组覆盖区域接住，外部共同覆盖处产生删数。",
      "这是把鱼推广为集合覆盖后的秩逻辑。base 集合要求放入若干个同数字实例，cover 集合负责接住这些实例；当 cover 的容量正好锁住 base 的全部可能位置时，cover 外或 cover 内多余位置会导致某个区域重复或某个 base 无法满足。复杂鱼的“复杂”不在结论，而在 base/cover 可由行、列、宫甚至组合区域共同构成。",
      "① 锁定数字；② 分清 base 区域；③ 分清 cover 区域；④ 按覆盖关系删数。",
      "高亮中的 base/cover 不一定是纯行列，可能含宫。",
      "确认它还是同一个数字的覆盖问题，而不是链或数组。"
    ],
    "en": [
      "Complex Swordfish is a size-3 fish whose base and cover sectors may mix rows, columns, boxes, cells, or grouped regions.",
      "The same digit still has 3 mandatory instances supplied by the bases and captured by the covers; excess cover capacity produces eliminations.",
      "This is rank-style set covering. The bases require instances of one digit, while the covers provide the available capacity. When that capacity exactly accounts for every required instance, an extra candidate would overfill a cover or leave a base unsatisfied.",
      "1. Fix the digit. 2. Separate base sectors from cover sectors. 3. Check the coverage count and any fins or self-cannibalism. 4. Apply only the reported eliminations.",
      "Highlights may cross rows, columns, and boxes. Read the role of each sector rather than expecting a rectangular fish shape.",
      "Verify that the argument still concerns one digit and that the base/cover count or reported rank condition is satisfied."
    ]
  },
  "ComplexJellyfish": {
    "zh": [
      "复杂四阶鱼是四阶规模的混合区域鱼。",
      "四个 base 名额被四个 cover 区域控制，cover 多余位置可删；有 fin 时只删共同受限点。",
      "这是把鱼推广为集合覆盖后的秩逻辑。base 集合要求放入若干个同数字实例，cover 集合负责接住这些实例；当 cover 的容量正好锁住 base 的全部可能位置时，cover 外或 cover 内多余位置会导致某个区域重复或某个 base 无法满足。复杂鱼的“复杂”不在结论，而在 base/cover 可由行、列、宫甚至组合区域共同构成。",
      "① 锁定数字；② 数 base 与 cover；③ 看是否有 fin/自噬；④ 删除合法目标。",
      "高亮可能跨行、列、宫；先按 base/cover 角色读。",
      "不要只凭形状判断；复杂鱼的关键是覆盖计数。"
    ],
    "en": [
      "Complex Jellyfish is a size-4 fish whose base and cover sectors may mix rows, columns, boxes, cells, or grouped regions.",
      "The same digit still has 4 mandatory instances supplied by the bases and captured by the covers; excess cover capacity produces eliminations.",
      "This is rank-style set covering. The bases require instances of one digit, while the covers provide the available capacity. When that capacity exactly accounts for every required instance, an extra candidate would overfill a cover or leave a base unsatisfied.",
      "1. Fix the digit. 2. Separate base sectors from cover sectors. 3. Check the coverage count and any fins or self-cannibalism. 4. Apply only the reported eliminations.",
      "Highlights may cross rows, columns, and boxes. Read the role of each sector rather than expecting a rectangular fish shape.",
      "Verify that the argument still concerns one digit and that the base/cover count or reported rank condition is satisfied."
    ]
  },
  "ComplexSquirmbagFish": {
    "zh": [
      "五阶复杂鱼，规模比 Jellyfish 更大，通常属于高级覆盖结构。",
      "本质仍是一个数字在 base 与 cover 之间的名额分配；多余 cover 位置被排除。",
      "这是把鱼推广为集合覆盖后的秩逻辑。base 集合要求放入若干个同数字实例，cover 集合负责接住这些实例；当 cover 的容量正好锁住 base 的全部可能位置时，cover 外或 cover 内多余位置会导致某个区域重复或某个 base 无法满足。复杂鱼的“复杂”不在结论，而在 base/cover 可由行、列、宫甚至组合区域共同构成。",
      "① 锁定数字；② 数 base/cover；③ 区分本体、fin、删数；④ 只删结论列出的候选。",
      "高亮较复杂，优先看结论位置是否在 cover 里且不属于必要结构。",
      "手工核对时先确认同数字，再确认 base/cover 数量一致或秩条件允许。"
    ],
    "en": [
      "Complex Squirmbag Fish is a size-5 fish whose base and cover sectors may mix rows, columns, boxes, cells, or grouped regions.",
      "The same digit still has 5 mandatory instances supplied by the bases and captured by the covers; excess cover capacity produces eliminations.",
      "This is rank-style set covering. The bases require instances of one digit, while the covers provide the available capacity. When that capacity exactly accounts for every required instance, an extra candidate would overfill a cover or leave a base unsatisfied.",
      "1. Fix the digit. 2. Separate base sectors from cover sectors. 3. Check the coverage count and any fins or self-cannibalism. 4. Apply only the reported eliminations.",
      "Highlights may cross rows, columns, and boxes. Read the role of each sector rather than expecting a rectangular fish shape.",
      "Verify that the argument still concerns one digit and that the base/cover count or reported rank condition is satisfied."
    ]
  },
  "Multifish": {
    "zh": [
      "多重鱼把多个鱼状覆盖组合起来看，可能同时涉及更复杂的覆盖关系。",
      "用户可按秩理论读：若强区域提供的名额被弱区域覆盖，多余候选就没有空间成立。",
      "这是把鱼推广为集合覆盖后的秩逻辑。base 集合要求放入若干个同数字实例，cover 集合负责接住这些实例；当 cover 的容量正好锁住 base 的全部可能位置时，cover 外或 cover 内多余位置会导致某个区域重复或某个 base 无法满足。复杂鱼的“复杂”不在结论，而在 base/cover 可由行、列、宫甚至组合区域共同构成。",
      "① 看同数字覆盖；② 分清多组 base/cover；③ 找例外点；④ 核对删数只落在共同限制处。",
      "高亮可能分层；不要把所有候选都看成普通鱼身。",
      "检查删数是否在弱区域多余位置，且没有被标为 guardian/fin 的例外。"
    ],
    "en": [
      "Multi-Fish combines several fish-like covers and may use multiple sector types.",
      "Read it as rank logic: mandatory instances supplied by strong sectors are fully absorbed by weak-sector capacity, leaving no room for extra candidates.",
      "When the selected covers exactly account for every required instance, an extra covered candidate would overfill a weak sector or deprive a strong sector of its required placement.",
      "1. Identify the digit or digit set. 2. Separate the base/strong sectors from the cover/weak sectors. 3. Check the coverage and exceptions. 4. Apply only common valid eliminations.",
      "Highlights may be layered; not every highlighted candidate is an ordinary fish-body candidate.",
      "Confirm that each elimination is excess capacity in a weak sector and is not a fin, guardian, or allowed exception."
    ]
  },
  "BUGOne": {
    "zh": [
      "BUG+1 指全盘几乎全是双值格，只剩一个格子多一个候选。",
      "若多出的候选也被去掉，盘面会接近双值循环并形成可互换的第二解；这与谜题唯一解前提矛盾，因此多出的候选通常被确认。",
      "BUG 的数学核心是双值图的奇偶平衡：若全盘所有未定格都是双值，且每个候选在每个区域中也恰好出现两次，就会形成一个可二染色的双解结构。这个第二解与谜题唯一解前提矛盾。BUG+1 只有一个额外候选能破坏这种双解；因此在唯一解前提下，该额外候选必须成立，或等价地删除同格其他候选。",
      "① 看全盘双值状态；② 找唯一异常格；③ 找异常候选；④ 按结论出数或删数。",
      "高亮重点是唯一的异常格和异常候选。",
      "它依赖唯一解前提；先确认题目是唯一解，再确认除异常格外其他空格是否基本双值。"
    ],
    "en": [
      "BUG+1 is a nearly all-bivalue grid with one cell containing one extra candidate.",
      "Without the extra candidate, the grid would become a two-colour interchangeable BUG state. A unique puzzle therefore needs the extra candidate to break it.",
      "In a pure BUG, every unsolved cell is bivalue and each candidate occurs twice in each relevant house, producing two interchangeable colourings. The single extra candidate is the only breaker, so under uniqueness it must be true, or equivalently the other candidates in its cell can be removed.",
      "1. Check the global bivalue pattern. 2. Find the only exceptional cell. 3. Identify the extra candidate. 4. Apply the placement or eliminations.",
      "The exceptional cell and candidate are the main highlights.",
      "Confirm uniqueness and verify that the remaining unsolved grid really has the BUG parity structure."
    ]
  },
  "BUGPlusN": {
    "zh": [
      "BUG+n 是 BUG+1 的推广，盘面有多个额外候选或异常点。",
      "这些额外候选必须破坏全双值致命形态；结论来自异常候选之间的共同约束。",
      "BUG+n 是 BUG+1 的推广。若去掉若干额外候选后会得到一个全双值、可互换的 BUG 双解结构，就会产生第二个完成盘，这与谜题唯一解前提矛盾。因此这些额外候选不可能全部为假；系统给出的删数来自“保持至少一个破坏点成立”之后对同格或同区域的排除。",
      "① 看全盘双值骨架；② 找异常候选；③ 看异常之间关系；④ 应用共同结论。",
      "高亮会标出多个异常点，不一定只有一个出数。",
      "核对异常候选是否确实是防止 BUG 形态成立的必要点。"
    ],
    "en": [
      "BUG+n generalizes BUG+1 to several extra candidates or exceptional cells.",
      "At least one exception must break the underlying all-bivalue deadly state, so the exceptions constrain one another.",
      "If all relevant extras were removed, the grid would reduce to an interchangeable BUG completion. Uniqueness forbids that, so the reported elimination follows from preserving at least one valid breaker.",
      "1. Identify the bivalue skeleton. 2. Mark every exception. 3. Inspect their shared constraints. 4. Apply the common consequence.",
      "Several exceptional candidates may be highlighted; the result need not be a single placement.",
      "Verify that the highlighted extras are genuinely the candidates preventing the BUG state."
    ]
  },
  "Skyscraper": {
    "zh": [
      "同一个数字在两条平行行/列中各形成一个强对；一侧端点互相看见，另一侧两个端点就是“楼顶”。",
      "摩天楼虽然可归入 Turbot Fish/特殊鱼形，但用户读法应优先按 X-Chain：两条强链之间用一个弱连接接起来，两个楼顶端点至少一真，因此能同时看见两个楼顶的同数字候选可删。",
      "强链表示某行/列里该数字只有两个落点，所以两端至少一真。若第一个楼顶为假，则第一条强链迫使其底端为真；底端与另一底端互相看见，不能同真，所以另一底端为假；第二条强链再迫使第二个楼顶为真。反向同理，因此两个楼顶不可能同时为假。任何候选若同时看见两个楼顶，一旦它为真就会排除两个楼顶，违反“至少一真”，所以可删。",
      "① 锁定一个数字；② 找两条平行行/列中的共轭对；③ 找互相看见的一侧端点；④ 把另一侧两个端点当作链端点；⑤ 删除同时看见两个链端点的同数字候选。",
      "高亮通常像两座塔：底部是弱连接，顶部是两个至少一真的端点。不要按普通 X-Wing 的 base-cover 口径硬读。",
      "确认两个强对各自确实只有两个该数字候选；确认底部端点互相看见；确认删数同时看见两个楼顶端点。"
    ],
    "en": [
      "For one digit, two parallel houses each contain a conjugate pair. One pair of endpoints sees each other; the other endpoints are the two rooftops.",
      "The rooftops cannot both be false, so a same-digit candidate seeing both rooftops can be removed.",
      "If one rooftop is false, its conjugate partner is true; that partner sees the other base endpoint, forcing it false and the other rooftop true. The reverse direction is symmetric, proving at least one rooftop true.",
      "1. Fix one digit. 2. Find two parallel conjugate pairs. 3. Verify that one endpoint from each pair sees the other. 4. Eliminate candidates seeing both opposite endpoints.",
      "Read it as two strong links joined by a weak link, not as an ordinary base-cover X-Wing.",
      "Each pair must be conjugate, the connected endpoints must see each other, and the target must see both rooftops."
    ]
  },
  "TwoStringKite": {
    "zh": [
      "同一个数字在一行和一列各形成一个强对，其中行强对的一端与列强对的一端落在同一宫内，形成风筝的连接点。",
      "双线风筝也应优先按双强链理解：一条行强链、一条列强链，中间通过宫内弱连接相接，两个远端至少一真；因此同时看见两个远端的同数字候选可删。",
      "若行强链的远端为假，则该行里另一个端点必须为真；这个端点与列强链在同宫的连接端互相看见，所以列连接端不能为真；列连接端为假后，列强链的远端必须为真。反向也成立，所以两个远端至少有一个为真。目标候选若同时看见这两个远端，它为真会同时排除两个远端，造成两条强链都无法满足，故可删。",
      "① 锁定一个数字；② 找一条行共轭对；③ 找一条列共轭对；④ 确认一端在同一宫内互相看见；⑤ 删除同时看见两个远端的候选。",
      "高亮像风筝：一条横向强链、一条纵向强链，宫内连接端是弱连接，两个远端是至少一真的端点。",
      "确认行强对、列强对、宫内弱连接都针对同一个数字；删数必须同时看见两个远端，而不是只看见连接端。"
    ],
    "en": [
      "For one digit, a row conjugate pair and a column conjugate pair have one endpoint from each pair in the same box.",
      "The two remote endpoints cannot both be false, so a same-digit candidate seeing both can be eliminated.",
      "If the remote row endpoint is false, the row partner is true; it sees the column partner in the shared box, forcing that partner false and the remote column endpoint true. The reverse argument also holds.",
      "1. Fix one digit. 2. Find a row conjugate pair. 3. Find a column conjugate pair. 4. Confirm the inner endpoints see each other in one box. 5. Eliminate a target seeing both remote endpoints.",
      "The row and column strong links form the kite; the box connection is the weak link.",
      "All links must use the same digit, and the target must see both remote endpoints—not merely the inner connection."
    ]
  },
  "EmptyRectangle": {
    "zh": [
      "某个宫内的候选形成“空矩形”结构，并与外部强对配合。",
      "宫内布局迫使该数字若不在一侧，就会通过外部强对落到另一端，从而排除目标。",
      "这是一个短链式的强弱关系推理。两端候选由共轭对、空矩形或 ERI 结构连接：若一端为假，沿强弱关系会推出另一端为真；若一端为真则另一端是否真不重要。于是两端至少有一个为真，任何同时看见两端的同数字候选都不能成立。",
      "① 锁定数字；② 看宫内空矩形；③ 找外部强对；④ 删除共同冲突点。",
      "高亮会标出宫内空矩形、外部强链和删数点。",
      "目标必须同时受宫内推理和外部强对约束。"
    ],
    "en": [
      "An Empty Rectangle uses a box-internal candidate pattern together with an external conjugate pair.",
      "The box pattern and external strong link form a short inference chain whose endpoints cannot both be false.",
      "If one endpoint is false, strong and weak relations through the ER structure force the other endpoint true. Therefore a candidate seeing both endpoints is impossible.",
      "1. Fix the digit. 2. Identify the box's empty-rectangle pattern. 3. Find the external conjugate pair. 4. Remove the common conflicting candidate.",
      "The box pattern, external strong link, and target should be highlighted separately.",
      "The target must be constrained by both the internal ER implication and the external strong pair."
    ]
  },
  "ERIPair": {
    "zh": [
      "ERI Pair 是两个 ERI 结构的配合，常用于同一个数字的远程删数。",
      "每个 ERI 把宫内候选压缩成一个可推理入口；两个入口共同限制目标候选。",
      "这是一个短链式的强弱关系推理。两端候选由共轭对、空矩形或 ERI 结构连接：若一端为假，沿强弱关系会推出另一端为真；若一端为真则另一端是否真不重要。于是两端至少有一个为真，任何同时看见两端的同数字候选都不能成立。",
      "① 锁定数字；② 找两个 ERI；③ 看它们如何连接；④ 删除共同受限候选。",
      "高亮通常有两个宫内结构和外部连接。",
      "先确认两个 ERI 是否针对同一个数字，再看删数是否同时被两侧约束。"
    ],
    "en": [
      "ERI Pair combines two Empty Rectangle Intersection structures for remote single-digit elimination.",
      "Each ERI compresses a box pattern into an inference endpoint; together the endpoints constrain a common target.",
      "The two ERI endpoints form a short alternating implication. At least one endpoint must be true, so any same-digit candidate seeing both is false.",
      "1. Fix the digit. 2. Find two ERI structures. 3. Follow their connection. 4. Eliminate candidates constrained by both sides.",
      "Expect two box-internal structures plus an external connection.",
      "Both ERIs must concern the same digit, and the elimination must be covered by both implications."
    ]
  },
  "Fireworks": {
    "zh": [
      "烟花把一个宫角或交叉区域内的多个候选看成会向行列“发射”的集合。",
      "若某些候选不能留在核心位置，就会被迫出现在对应行/列；这种同步限制可以产生删数。",
      "按 Kazusa 的烟花数组口径，Fireworks 讨论的是一个宫角或交叉区域内候选向相关行列的承接关系：核心候选不能随意全部离开，否则对应数字在行、列或宫中的放置机会会被迫集中到有限出口。删数来自这些出口/承接关系的容量限制，而不是普通 Broken Wing 的 guardian 全假逻辑。只有后端输出明确说明为 guardian/broken-pattern 时，才按守护者证明补充阅读。",
      "① 找烟花核心；② 看涉及数字集合；③ 分清 base/目标格；④ 删除被同步限制的候选。",
      "高亮通常标出 fireworks 核心、base cell 和受影响的行列。",
      "不要只看单个数字；烟花常同时讨论一组候选在交叉区域的去向。"
    ],
    "en": [
      "Fireworks treats candidates near a box corner or row-column intersection as an array whose digits must be carried into the related lines.",
      "If candidates leave the core in certain ways, the corresponding row and column outlets become forced; their shared capacity can then eliminate other candidates.",
      "The proof is a candidate-array capacity argument, not ordinary Broken Wing guardian logic. The core digits have a limited set of row, column, and box outlets; a target that consumes required outlet capacity is impossible.",
      "1. Identify the fireworks core. 2. Determine the digit set and its row/column outlets. 3. Separate base cells from targets. 4. Apply the synchronized eliminations.",
      "Highlights normally show the core, base cells, and affected rows or columns.",
      "Do not reduce the pattern to one digit or automatically interpret it as Guardian Logic unless the reported step explicitly says so."
    ]
  },
  "WWing": {
    "zh": [
      "两个含有同一候选的双值格，通过该候选在某区域中的强关系连接；用户读法更接近短 AIC。",
      "两个端点不可能同时避开目标数字；因此能同时看见两个端点的该数字候选可删。",
      "Kazusa 的 W-Wing 讲法是从某个区域里目标数字的全部落点分支出发：每个落点都会推出一个同数字端点，因此这些端点至少一个为真；能同时看见所有端点的同数字候选可删。普通 W-Wing 是两个分支，多分支 W-Wing 可以是三个或更多分支。YZF 里若步骤来自 FindAIC，则还应按 AIC 压缩链核对每个强弱关系。",
      "① 找两个双值格；② 找共同候选；③ 找连接强对；④ 删除两端共同看见的候选。",
      "高亮两个双值格和中间强关系，删数看共同可见。",
      "确认连接候选在某行/列/宫中形成强对，否则 W-Wing 不成立。"
    ],
    "en": [
      "W-Wing links two bivalue cells through a strong relation on one shared candidate.",
      "The two endpoints cannot both avoid the target digit, so a target seeing both endpoint occurrences can be removed.",
      "Each possible location of the linking digit forces one endpoint to take the elimination digit. Thus at least one endpoint contains that digit, and any candidate seeing all such endpoints is false. FindAIC output may present the same proof as a compressed AIC.",
      "1. Find the two bivalue endpoint cells. 2. Identify their shared candidate. 3. Locate the conjugate or strong connection. 4. Eliminate the other shared digit from cells seeing both endpoints.",
      "The two bivalue cells and the middle strong relation are the main structure; eliminations use common visibility.",
      "The linking candidate must form a genuine strong relation in a row, column, box, or valid grouped node."
    ]
  },
  "XYWing": {
    "zh": [
      "一个双值枢纽格连接两个翼格，三个格子合起来包含 X、Y、Z 三个候选。",
      "枢纽无论取哪一个值，都会迫使某个翼格取 Z；所以同时看见两个翼格的 Z 可删。",
      "XY-Wing 是三格两两共享候选的二分讨论。枢纽格只有 x/y 两种选择：若取 x，会迫使一个翅膀取 z；若取 y，会迫使另一个翅膀取 z。两种分支都让某个翅膀含 z，因此同时看见两个 z 翅膀的候选 z 必假。",
      "① 找 pivot；② 找两个 wing；③ 确认共同数字 Z；④ 删除共同可见的 Z。",
      "高亮 pivot 和两个 wing；删数是两个 wing 共同可见的 Z。",
      "确认 pivot 能看见两个 wing，且两个 wing 不能互相随意替换角色。"
    ],
    "en": [
      "XY-Wing has one bivalue pivot and two wings using three digits X, Y, and Z.",
      "Whichever value the pivot takes, one wing is forced to Z, so a Z candidate seeing both wings can be removed.",
      "The pivot is x/y. In the x branch one wing must be z; in the y branch the other wing must be z. Since every branch places z in one of the wings, a common peer cannot also be z.",
      "1. Find the pivot. 2. Find the two wings it sees. 3. Verify the shared elimination digit Z. 4. Remove Z from common peers of the two wings.",
      "Pivot, wings, and the common Z target are highlighted separately.",
      "The pivot must see both wings, and the candidate relationships must form the exact XY/XZ/YZ pattern."
    ]
  },
  "XYZWing": {
    "zh": [
      "XYZ-Wing 类似 XY-Wing，但枢纽格通常含有三个候选 X/Y/Z。",
      "若目标 Z 放在能看见所有关键格的位置，会与枢纽和翼格的必然选择冲突。",
      "XYZ-Wing 比 XY-Wing 多保留枢纽中的 z。若枢纽为 z，目标 z 被同格/同区域排除；若枢纽不是 z，则它在 x/y 两分支中迫使某个翅膀为 z。目标候选若同时受枢纽和两个翅膀限制，就在所有分支中都不能成立。",
      "① 找三值 pivot；② 找两个相关 wing；③ 确认共同候选；④ 删除能看见关键点的目标。",
      "高亮 pivot、两个 wing 和共同候选 Z。",
      "删数通常必须看见 pivot 和相关 wing，比 XY-Wing 的共同可见条件更严格。"
    ],
    "en": [
      "XYZ-Wing resembles XY-Wing, but the pivot usually contains X, Y, and Z.",
      "If the pivot is Z, nearby Z targets are blocked directly; if it is X or Y, one of the wings is forced to Z. A target constrained in every branch can be removed.",
      "The proof covers all three pivot values. Each value places Z in the pivot or a wing, so a candidate seeing every possible Z location is false.",
      "1. Find the three-value pivot. 2. Find its two related wings. 3. Identify all possible Z locations. 4. Remove Z from a cell seeing those required locations.",
      "The pivot, two wings, and common Z are the key highlights.",
      "The elimination visibility is stricter than XY-Wing: the target normally must see the pivot and the relevant wing Z locations."
    ]
  },
  "XYZRing": {
    "zh": [
      "XYZ-Ring 是 Wing 形成闭环后的形态。",
      "闭环会让某些候选在环上被强制分配，环外共同冲突候选可删，部分情形也能强化为出数。",
      "XYZ-Ring 把 XYZ-Wing 的分支闭合成环。环上候选的真假会被连续约束；若目标候选成立，会迫使环上出现重复、断链或某格无候选，因此目标候选与环的必然分配不相容。",
      "① 找 pivot/wing；② 顺环读连接；③ 看闭环共同候选；④ 应用环外删数或出数。",
      "高亮应能沿环读回起点。",
      "确认这是闭环而不是普通三格 Wing；结论不要扩大到环外无关位置。"
    ],
    "en": [
      "XYZ-Ring is an XYZ-Wing-like structure whose inferences close into a loop.",
      "Closing the loop forces a consistent assignment around the ring, allowing external eliminations and sometimes placements.",
      "If the target were true, implication around the closed ring would create a repeated digit, a broken strong link, or a cell with no candidate. Therefore the target is incompatible with every valid ring assignment.",
      "1. Identify the pivot and wing structure. 2. Follow the links around the ring. 3. Confirm that the path closes. 4. Apply only the reported external elimination or placement.",
      "You should be able to trace the highlighted path back to its start.",
      "Confirm that it is a true closed loop rather than an open three-cell wing, and do not extend eliminations beyond the reported targets."
    ]
  },
  "WXYZWing": {
    "zh": [
      "WXYZ-Wing 在 Kazusa 的 regular wing 体系里可按核心格多分支覆盖读；在 YZF 的高级说明里也可看成四候选的 ALS-XZ / Bent Almost Set 特例。",
      "核心集合的格数与候选数只差 1，受限公共候选把分支锁住；目标候选若成立，会破坏所有合法分配。",
      "把核心区域看成一个 almost locked set：若某个受限候选被排除或被某侧占用，剩余候选会被迫成为锁定分配。目标候选若同时看见所有可能承担目标数字的位置，或会让每个分支都无法完成这个锁定分配，就不能成立。因此 WXYZ-Wing 的删数本质来自 ALS-XZ/Bent Set 的容量与受限公共候选逻辑。",
      "① 看核心集合；② 确认候选数比格数多 1；③ 找受限公共候选或弯曲集合的共同目标；④ 删除被所有合法分支排除的候选。",
      "高亮可能包含 4 个以上格；先看集合边界与候选容量，再看目标候选，不要按普通双翼寻找 pivot。",
      "检查目标是否被所有必要端点共同限制；如果只看见部分端点，删数不成立。"
    ],
    "en": [
      "WXYZ-Wing can be read as a multi-branch regular wing or, more generally, as an ALS-XZ / bent almost-locked-set pattern with four digits.",
      "The set has one more candidate than cells. Restricted common candidates constrain every legal assignment, so a target excluded in all assignments is false.",
      "Treat the core as an almost locked set. When a restricted candidate is removed or claimed on one side, the remaining values become locked. A target that sees every possible occurrence of the elimination digit, or destroys every legal locked assignment, cannot be true.",
      "1. Identify the core set. 2. Verify that candidate count is cell count plus one. 3. Find the restricted common candidate or bent-set target. 4. Eliminate only candidates excluded by every legal assignment.",
      "Read the set boundary and candidate capacity first; do not search mechanically for a classic pivot and two wings.",
      "The target must be constrained by all required endpoints. Seeing only part of the structure is insufficient."
    ]
  },
  "BrokenWing": {
    "zh": [
      "Broken Wing 在 Kazusa 体系里应归到 Guardian Logic。它不是普通 XY/XYZ-Wing 的“枢纽 + 翼格”结构，只是历史名称里带 Wing。",
      "先找 guardian / 守护者候选。若所有守护者都为假，剩余结构会变成全强链死环、无解图形、零秩容量冲突或某个致命结构主体；因此至少一个守护者必须为真。",
      "这是反证式守护者证明：假设所有 guardian 都不成立，则坏结构被激活，盘面不可能完成。真实解必须避开这个坏结构，所以 guardian 集合中至少一个为真。任何同时看见全部 guardian 的同数字候选如果成立，就会排除所有 guardian，与“至少一个 guardian 为真”矛盾，因此可删。若只有一个 guardian，则它可直接出数。这个证明不需要寻找枢纽格。",
      "① 找 guardian 候选；② 看 guardian 全假时剩下的坏结构；③ 判断结论候选是否会同时排除所有 guardian；④ 只删除被 guardian 集合共同排除的目标。",
      "守护者通常是阻止坏结构成立的出口；高亮中的坏结构主体和 guardian 要分开看。不要把 Broken Wing 当作普通双翼图形。",
      "重点核对“guardian 全假 ⇒ 坏结构成立”这一步，以及删数是否同时看见所有 guardian。UR、BUG、AR、UL、XR、GSP 不从唯一性体系挪走；若名称里出现 UR Guardian，应解释为“唯一性结构的破坏点/保护候选”，必须明确唯一解前提。只有 Broken Wing、Broken Loop、Pattern Having No Solution 这类才按普通 Guardian / Broken Pattern 读。"
    ],
    "en": [
      "Broken Wing belongs to Guardian Logic despite its historical name; it is not a classic pivot-and-wings pattern.",
      "If every guardian were false, the remaining pattern would become an impossible all-strong loop, no-solution structure, rank conflict, or other bad core. Therefore at least one guardian is true.",
      "Assume all guardians false. If that activates a contradiction, the guardian set is an at-least-one-true set. A same-digit target seeing every guardian would make them all false and is therefore removable; a single guardian may be placed.",
      "1. Identify the guardians. 2. Verify the bad structure obtained when they are all false. 3. Check whether the target eliminates every guardian. 4. Apply only the common guardian conclusion.",
      "Keep the bad core and its guardian exits visually separate. No pivot cell is required.",
      "The critical proof is ‘all guardians false implies an impossible structure.’ UR/BUG/AR/UL/XR/GSP remain uniqueness techniques even when their names mention a guard."
    ]
  },
  "AvoidableRectangle": {
    "zh": [
      "可避免矩形通常出现在含有已填数或候选的矩形结构中，利用唯一解避免可交换形态。",
      "如果某候选成立会导致两个解可互换，这与谜题唯一解前提矛盾；所以在唯一解题中它不能成立。",
      "这是唯一解反证。若删数候选被保留或某些额外候选全被去掉，结构会退化成只含两个数字的可交换闭环；这会产生两个只在该结构内互换、其他格完全相同的完成盘。这与谜题唯一解前提矛盾，所以在唯一解题中必须保留破坏点，或删除会导致致命形态的候选。",
      "① 找矩形四角；② 看候选对；③ 判断危险互换；④ 删除造成危险的候选。",
      "高亮矩形四角和导致危险形态的候选。",
      "只适用于唯一解题；先确认题目唯一，再确认矩形不是跨四宫导致推理失效的形态。"
    ],
    "en": [
      "Avoidable Rectangle is a uniqueness pattern based on a locally interchangeable rectangle that may include solved values.",
      "If the dangerous candidates remained, the local digits could be swapped to create a second completed grid. That contradicts the assumption that the puzzle has one solution.",
      "This is proof by contradiction under the unique-solution premise. The deadly form has two completions with identical external constraints, so a valid unique puzzle must keep a breaker or reject the candidate that completes the deadly form.",
      "1. Identify the highlighted rectangle that may include solved values. 2. Verify the interchangeable digit pattern. 3. Locate the extra candidate or breaker. 4. Apply only the elimination justified by avoiding the deadly completion.",
      "The display separates the deadly body from its breaker, extra candidate, or target.",
      "Use this only on a confirmed unique puzzle. Do not apply it to a multi-solution grid, an inconsistent grid, or an OCR draft whose uniqueness has not been checked."
    ]
  },
  "UniqueRectangle": {
    "zh": [
      "唯一矩形使用四个分布在两行两列两个宫内的格子，避免两个数字形成可互换的第二解，并以此作为唯一解反证。",
      "若额外候选被去掉后四格只剩同一对数字，就会出现两种互换完成方式；这与谜题唯一解前提矛盾，因此唯一解题不允许这种状态。",
      "这是唯一解反证。若删数候选被保留或某些额外候选全被去掉，结构会退化成只含两个数字的可交换闭环；这会产生两个只在该结构内互换、其他格完全相同的完成盘。这与谜题唯一解前提矛盾，所以在唯一解题中必须保留破坏点，或删除会导致致命形态的候选。",
      "① 找四角；② 确认两数字候选对；③ 找额外候选或目标；④ 删除会造成致命矩形的候选。",
      "高亮四角、候选对和额外候选/删数。",
      "确认四格必须在两行两列且只占两个宫；跨四宫或梯形不能直接套用。"
    ],
    "en": [
      "Unique Rectangle is a uniqueness pattern based on a locally interchangeable four-cell two-digit rectangle in two rows, two columns, and two boxes.",
      "If the dangerous candidates remained, the local digits could be swapped to create a second completed grid. That contradicts the assumption that the puzzle has one solution.",
      "This is proof by contradiction under the unique-solution premise. The deadly form has two completions with identical external constraints, so a valid unique puzzle must keep a breaker or reject the candidate that completes the deadly form.",
      "1. Identify the highlighted four-cell two-digit rectangle in two rows, two columns, and two boxes. 2. Verify the interchangeable digit pattern. 3. Locate the extra candidate or breaker. 4. Apply only the elimination justified by avoiding the deadly completion.",
      "The display separates the deadly body from its breaker, extra candidate, or target.",
      "Use this only on a confirmed unique puzzle. Do not apply it to a multi-solution grid, an inconsistent grid, or an OCR draft whose uniqueness has not been checked."
    ]
  },
  "UniqueLoop": {
    "zh": [
      "唯一环是唯一矩形的环状推广，由一串双值格构成可交替互换的危险闭环。",
      "若环上只剩两个数字交替排列，会产生另一种等价解；这与谜题唯一解前提矛盾，因此额外候选必须破坏该环。",
      "这是唯一解反证。若删数候选被保留或某些额外候选全被去掉，结构会退化成只含两个数字的可交换闭环；这会产生两个只在该结构内互换、其他格完全相同的完成盘。这与谜题唯一解前提矛盾，所以在唯一解题中必须保留破坏点，或删除会导致致命形态的候选。",
      "① 沿环找双值候选；② 确认可交替；③ 找异常候选；④ 按结论删数。",
      "高亮沿环连接多个格，删数多在异常点或环内候选。",
      "确认题目唯一；再确认环是偶数长度、交替可闭合，并且本结论确实依赖唯一解前提。"
    ],
    "en": [
      "Unique Loop is a uniqueness pattern based on a locally interchangeable closed alternating loop of bivalue cells.",
      "If the dangerous candidates remained, the local digits could be swapped to create a second completed grid. That contradicts the assumption that the puzzle has one solution.",
      "This is proof by contradiction under the unique-solution premise. The deadly form has two completions with identical external constraints, so a valid unique puzzle must keep a breaker or reject the candidate that completes the deadly form.",
      "1. Identify the highlighted closed alternating loop of bivalue cells. 2. Verify the interchangeable digit pattern. 3. Locate the extra candidate or breaker. 4. Apply only the elimination justified by avoiding the deadly completion.",
      "The display separates the deadly body from its breaker, extra candidate, or target.",
      "Use this only on a confirmed unique puzzle. Do not apply it to a multi-solution grid, an inconsistent grid, or an OCR draft whose uniqueness has not been checked."
    ]
  },
  "ExtendedRectangle": {
    "zh": [
      "扩展矩形是唯一矩形的规格推广，危险结构不一定只有标准四格。",
      "核心仍是避免一个可反转/可交换的候选形态构造第二解，从而与谜题唯一解前提矛盾。",
      "这是唯一解反证。若删数候选被保留或某些额外候选全被去掉，结构会退化成只含两个数字的可交换闭环；这会产生两个只在该结构内互换、其他格完全相同的完成盘。这与谜题唯一解前提矛盾，所以在唯一解题中必须保留破坏点，或删除会导致致命形态的候选。",
      "① 找扩展结构；② 看候选对/交换关系；③ 找破坏点；④ 删除危险候选。",
      "高亮会比普通 UR 更大；先看候选对和互换路径。",
      "不要只凭“像矩形”判断；必须能解释为什么会产生第二解，以及为什么这与唯一解前提矛盾。"
    ],
    "en": [
      "Extended Rectangle is a uniqueness pattern based on a locally interchangeable larger reversible rectangle-like structure.",
      "If the dangerous candidates remained, the local digits could be swapped to create a second completed grid. That contradicts the assumption that the puzzle has one solution.",
      "This is proof by contradiction under the unique-solution premise. The deadly form has two completions with identical external constraints, so a valid unique puzzle must keep a breaker or reject the candidate that completes the deadly form.",
      "1. Identify the highlighted larger reversible rectangle-like structure. 2. Verify the interchangeable digit pattern. 3. Locate the extra candidate or breaker. 4. Apply only the elimination justified by avoiding the deadly completion.",
      "The display separates the deadly body from its breaker, extra candidate, or target.",
      "Use this only on a confirmed unique puzzle. Do not apply it to a multi-solution grid, an inconsistent grid, or an OCR draft whose uniqueness has not been checked."
    ]
  },
  "BivalueOddagon": {
    "zh": [
      "双值奇环由一圈双值关系构成，若没有破坏点会造成奇数环/负秩无解矛盾；它不是唯一性技巧，不以“产生第二解”为主要证明。",
      "奇环无法用两个值稳定交替闭合，因此必须存在某个 guardian/额外候选作为出口来打破它；若某候选会封死这些出口或强迫坏结构成立，它可删。",
      "Bivalue Oddagon 在 Kazusa 体系里属于 Rank Logic / Negative Rank。它是奇环不可二染色或负秩容量矛盾：奇数个双值格只围绕两个数字交替约束时，沿环传播真假会在回到起点时要求同一候选既真又假，或要求相邻位置同时取同一侧状态，因此完整坏结构无解。guardian/额外候选只是阻止坏结构成立的出口；若某候选会消灭所有出口或把盘面推入这个无解结构，它就可删。",
      "① 沿环读双值关系；② 确认奇环；③ 找 guardian；④ 删除被所有必要条件排除的候选。",
      "高亮环本体和 guardian；删数通常来自所有 guardian 的共同影响。",
      "确认环长度和双值关系；不要把 guardian 当成普通环节点，也不要把它当成 UR/BUG 的唯一解第二解反证。"
    ],
    "en": [
      "A Bivalue Oddagon is an odd cycle of bivalue relations that would be impossible without an escape candidate. It is a negative-rank contradiction, not a uniqueness proof.",
      "Two values cannot alternate consistently around an odd cycle, so a guardian or extra candidate must break the cycle.",
      "Propagation around the odd cycle returns to the start with the opposite truth state, or overfills local capacity. The complete oddagon has no solution; a target that removes every escape or forces the bad core is false.",
      "1. Trace the bivalue cycle. 2. Confirm its odd structure. 3. Identify guardians or exits. 4. Eliminate only a candidate that closes all exits or activates the contradiction.",
      "The odd-cycle body and guardian candidates should be shown separately.",
      "Do not interpret this as UR/BUG second-solution logic. Verify the odd/negative-rank contradiction and every required exit."
    ]
  },
  "TripletOddagon": {
    "zh": [
      "三数字奇环把双值奇环推广到三个数字或三值结构，仍属于负秩/无解矛盾口径。",
      "若三数字结构按危险方式闭合，会造成某个数字缺位、重复占位或局部容量无法满足；guardian 或异常候选承担的是“出口/破坏点”作用。",
      "Triplet/Trivalue Oddagon 是双值奇环的三数字推广，Kazusa 体系下仍归入 Rank Logic / Negative Rank。若高亮结构被限制成三数字的固定循环，沿奇数结构分配会在某处造成重复、缺位或容量不足；系统删数的含义是：该候选若成立，就会封死所有出口，或把结构推入这种不可完成的负秩状态。",
      "① 看三数字集合；② 沿奇环读结构；③ 找 guardian/异常点；④ 应用共同结论。",
      "高亮可能有三种候选和多个 guardian；先分清环数字集合。",
      "核对结论是否来自全部 guardian/出口或必要分支，而不是只看其中一条线；同时确认它不是唯一性第二解证明。"
    ],
    "en": [
      "Triplet or Trivalue Oddagon extends the oddagon idea to three digits or trivalue structures.",
      "Closing the dangerous odd structure creates a missing digit, duplicate placement, or insufficient local capacity, so an exit candidate is required.",
      "The three-digit cycle is a negative-rank no-solution structure. If a target is true and every compatible assignment then overfills a sector, loses a required digit, or closes all guardians, the target is false.",
      "1. Identify the three-digit set. 2. Trace the odd structure. 3. Mark guardians or exceptional branches. 4. Apply the conclusion shared by all exits and branches.",
      "Several digit colours and multiple guardians may appear; identify the cycle's digit set first.",
      "Verify that the conclusion uses every necessary exit and is not being justified as a uniqueness second-solution pattern."
    ]
  },
  "AlmostPair": {
    "zh": [
      "准数对是 1 个格子多出 1 个候选的 ALS 最小形态，也可理解为“差一点成为锁定集合”。",
      "若某个候选被外部条件排除，剩余候选会被迫在集合内锁定。",
      "Almost Pair 是“差一个条件就成为数对”的反证。若额外候选被排除或目标候选成立导致该集合退化为标准 Naked Pair，那么数对会锁住两个数字；与这个锁定冲突的候选必须删除。",
      "① 看圈住的集合；② 数格子；③ 数候选种类；④ 看外部删数如何受集合限制。",
      "高亮通常用外框/椭圆圈住集合。",
      "检查集合内候选种类数是否比格子数多 1。"
    ],
    "en": [
      "Almost Pair is the smallest ALS: its candidate count is one greater than its cell count.",
      "Removing or fixing one extra candidate turns it into a locked pair, which then constrains outside candidates.",
      "The set is one condition away from a Naked Pair. Any branch that reduces it to the locked pair excludes candidates conflicting with that forced allocation.",
      "1. Inspect the outlined set. 2. Count cells. 3. Confirm that candidates are cells plus one. 4. Follow the external restriction to the elimination.",
      "The complete outlined set is the logical node.",
      "The candidate count must be exactly one more than the number of cells."
    ]
  },
  "AlmostTriple": {
    "zh": [
      "准三数组是格子数与候选数相差 1 的待定数组。",
      "一旦某个受限候选被确定或排除，集合会退化为普通数组并产生删数。",
      "Almost Triple 同理：三个格的候选差一点被三个数字完全锁住。任何会迫使它成为标准三数组的分支，都会让集合外同数字候选失去机会；若所有可能分支都排除同一候选，该候选可删。",
      "① 圈定 ALS；② 数格子/候选；③ 找受限公共候选；④ 应用外部删数。",
      "高亮重点是整个 ALS，而不是每个候选单独成链。",
      "确认所有格子在同一区域或同一 ALS 允许范围内。"
    ],
    "en": [
      "Almost Triple is an almost locked set whose candidate count is one greater than its cell count.",
      "Once a restricted candidate is fixed or removed, the set becomes an ordinary triple and produces eliminations.",
      "Every valid branch is one step away from a locked three-digit allocation. If all branches eliminate the same outside candidate, that candidate is false.",
      "1. Outline the ALS. 2. Count its cells and candidates. 3. Find the restricted common candidate or external condition. 4. Apply the common elimination.",
      "Read the ALS as one set node rather than separate candidate links.",
      "Confirm that all cells form a valid ALS region and that candidate count equals cell count plus one."
    ]
  },
  "SueDeCoq": {
    "zh": [
      "Sue de Coq 是交叉区域中的候选集合锁定，常同时涉及一个宫和一条行/列。",
      "交叉区候选会在宫侧与线侧分配，导致外部同候选没有空间保留。",
      "Sue de Coq 是交叉区域里的候选容量分配。交叉格、行/列余部、宫余部共同承担一组数字；若某个外部候选成立，就会让某一侧需要的数字数量超过可用格数，或让另一侧缺少必需数字，因此被删。",
      "① 找交叉区域；② 看候选如何分组；③ 区分宫侧/线侧；④ 删除外部受限候选。",
      "高亮会区分交叉区、宫侧和行/列侧。",
      "确认删数落在相应宫或行/列的外部受限位置。"
    ],
    "en": [
      "Sue de Coq is a candidate-capacity lock at the intersection of a box and a row or column.",
      "Digits in the intersection must be divided between the box side and line side, leaving no capacity for matching outside candidates.",
      "The intersection, line remainder, and box remainder jointly hold a fixed digit set. An outside target would make one side require more digits than available cells or leave the other side unable to place a required digit.",
      "1. Find the box-line intersection. 2. Partition the candidate groups. 3. Separate the box-side and line-side sets. 4. Remove the corresponding outside candidates.",
      "The intersection, box remainder, and line remainder should be visually distinct.",
      "Each elimination must lie in the appropriate outside portion of the box or line and follow the stated partition."
    ]
  },
  "ALSXZ": {
    "zh": [
      "两个 ALS 共享一个受限候选 X，并在另一个候选 Z 上共同限制目标。",
      "若一个 ALS 不取 X，另一个就被迫取 X；由此 Z 在两侧至少一处成立，能同时看见两侧 Z 的目标可删。",
      "ALS 有 n 个格、n+1 个候选，必定“多一个候选”。两个 ALS 通过 restricted common 连接时，该公共候选不能在两个 ALS 中同时缺席，否则两边都会被迫各自占满而冲突；对于另一个共同候选 Z，凡是同时看见两个 ALS 内所有 Z 的位置，都不可能取 Z。",
      "① 找两个 ALS；② 找 RCC/X；③ 找共同删数 Z；④ 删除同时看见两侧 Z 的目标。",
      "高亮通常有两个 ALS、受限公共候选 X 和删数候选 Z。",
      "确认 X 是受限公共候选：两侧 X 不能同时成立。"
    ],
    "en": [
      "ALS-XZ uses two almost locked sets sharing a restricted common candidate X and another common candidate Z.",
      "The two ALSs cannot both omit X. Consequently Z must occur in at least one side, eliminating any Z that sees every relevant Z occurrence in both sets.",
      "An ALS has n cells and n+1 candidates. A restricted common candidate cannot be true in both sets and cannot be absent from both in the required arrangement; that coupling makes the Z endpoints an at-least-one-true set.",
      "1. Find the two ALSs. 2. Identify the RCC X. 3. Identify the elimination digit Z. 4. Remove Z from cells seeing all relevant Z positions in both sets.",
      "Two outlined ALS nodes, the RCC, and the Z target are the important highlights.",
      "Verify that X is genuinely restricted: occurrences of X in the two ALSs cannot both be true."
    ]
  },
  "ALSXYWing": {
    "zh": [
      "ALS-XY-Wing 用三个 ALS 模拟 XY-Wing 的枢纽和两翼。",
      "公共受限候选在 ALS 之间传递，使两个端点候选至少一真，从而删除共同可见目标。",
      "ALS-XY-Wing 是三个 ALS 的分支闭合。中间 restricted common 迫使左右 ALS 至少有一边提供目标候选 Z；因此任何同时看见两侧 Z 位置的候选 Z，没有一个分支能让它成立。",
      "① 找三个 ALS；② 确认两条 RCC；③ 找端点共同候选；④ 删除共同可见目标。",
      "高亮三个 ALS，读法类似 Wing，但节点是集合。",
      "不要把 ALS 内所有候选都当成删数目标；只看链端共同候选。"
    ],
    "en": [
      "ALS-XY-Wing uses three ALS nodes in the roles of a pivot and two wings.",
      "Two restricted common candidates pass the implication through the middle ALS, making the endpoint digit true in at least one outer ALS.",
      "Whichever side of the middle coupling is selected, one outer ALS must contain the elimination digit Z. A target seeing every possible endpoint Z is false.",
      "1. Find the three ALSs. 2. Verify both RCC links. 3. Identify the common endpoint digit. 4. Eliminate it from common peers of the outer endpoints.",
      "Read the three outlined sets as wing nodes rather than individual cells.",
      "Only the endpoint digit participates in the elimination; do not treat every ALS candidate as a target."
    ]
  },
  "ALSWWing": {
    "zh": [
      "ALS-W-Wing 用两个 ALS 和一个外部强关系连接。",
      "外部强关系保证两侧 ALS 中某个候选至少一边发挥作用，从而排除共同目标。",
      "ALS-W-Wing 把 W-Wing 的双值格替换成 ALS。强链保证两侧 ALS 不可能同时失去关键公共候选；于是目标候选在两侧至少一侧会被占用，同时看见这些占用位置的目标候选可删。",
      "① 找两个 ALS；② 找连接候选强对；③ 找共同目标候选；④ 删除共同可见目标。",
      "高亮两个 ALS 与连接强对；删数看两端共同限制。",
      "确认连接不是普通弱关系，而是足以支撑 W-Wing 的强关系。"
    ],
    "en": [
      "ALS-W-Wing connects two ALSs through an external strong relation.",
      "The strong relation prevents both ALSs from losing the key candidate, so the common target digit must occur in at least one side.",
      "This is W-Wing with ALS nodes replacing bivalue cells. The strong link preserves an at-least-one-true relation between the endpoint occurrences, eliminating a target that sees them all.",
      "1. Find the two ALSs. 2. Find the connecting conjugate or strong relation. 3. Identify the common target digit. 4. Remove it from common peers.",
      "The two ALS outlines and the external strong link should be read as one compressed chain.",
      "The connector must be a real strong relation, not merely a weak visibility link."
    ]
  },
  "ALSChain": {
    "zh": [
      "ALS Chain 是把多个 ALS 当作链节点，通过受限公共候选串联。",
      "链端候选至少一端成立，或中间假设会传到端点产生矛盾，因此端点共同影响处可删。",
      "ALS Chain 是 ALS 之间 restricted common 的连续传递。若链头某候选为假，受限公共候选会逐段迫使下一段成立/失效，最终得到链尾候选为真；所以链头和链尾形成“至少一真”的关系，共同可见的同候选可删。",
      "① 按顺序读 ALS；② 找每条 RCC；③ 看链端候选；④ 删除链端共同影响的目标。",
      "高亮会有多个椭圆/外框；按顺序读 RCC，而不是逐格乱看。",
      "核对相邻 ALS 的连接候选是否受限；链端结论是否只作用于共同可见位置。"
    ],
    "en": [
      "ALS Chain links several almost locked sets through restricted common candidates.",
      "Implication passes from one ALS to the next, leaving the two chain-end candidates unable to be false together.",
      "If the head endpoint is false, each RCC successively fixes the next ALS state until the tail endpoint is forced true. A target seeing both endpoints is therefore false.",
      "1. Read the ALS nodes in order. 2. Verify every RCC. 3. Identify the two endpoint candidates. 4. Remove a common conflicting target.",
      "Follow the ordered outlined sets and their RCC labels instead of reading isolated cells.",
      "Adjacent ALSs must have valid restricted common candidates, and the elimination must be a common peer of the chain ends."
    ]
  },
  "DeathBlossom": {
    "zh": [
      "死亡花由一个 stem 候选分叉到多个 ALS 花瓣。",
      "stem 的不同取值会迫使各花瓣承担候选，所有分支都排除同一目标时，该目标可删。",
      "Death Blossom 是多分支 ALS 反证。中心格若取任一候选，都会激活对应 ALS，并迫使同一个目标候选被某个 ALS 占用；因为中心格必取其中一个候选，所以目标候选在所有分支下都不能成立。",
      "① 找 stem；② 看每个花瓣 ALS；③ 检查共同目标；④ 删除所有分支都排除的候选。",
      "高亮通常有中心 stem 和多个 ALS 花瓣。",
      "确认每个花瓣都能对同一删数候选给出约束。"
    ],
    "en": [
      "Death Blossom branches from a stem cell into several ALS petals.",
      "Each possible value of the stem activates a petal that excludes the same target; because the stem must take one value, the target is false.",
      "This is a complete multi-branch ALS proof. Every stem candidate forces a corresponding ALS allocation that consumes or excludes the target digit, so no stem branch permits the target.",
      "1. Identify the stem. 2. Match each stem candidate to its ALS petal. 3. Verify the shared target. 4. Eliminate the candidate rejected by every branch.",
      "The centre stem and the surrounding ALS petals are highlighted as separate roles.",
      "Every stem branch must independently constrain the same elimination candidate."
    ]
  },
  "AHSXZ": {
    "zh": [
      "AHS-XZ 是隐藏待定集合版本的 XZ 逻辑。",
      "若若干数字几乎只被困在一组格子里，公共受限数字会让端点候选至少一边成立。",
      "AHS 是 ALS 的对偶：n 个数字只分布在 n+1 个格中，必有一个格不承载这组数字。AHS-XZ 通过受限公共格/候选把两个 AHS 连接起来，使某些候选或格位不可能同时缺席；目标删数来自两个 AHS 都会排除它的共同结果。",
      "① 选数字集合；② 看它们可落格；③ 找受限公共候选；④ 删除共同目标。",
      "高亮重点是数字集合及其可落格，而不是显性候选集合。",
      "确认这是“数字被困住”，不是“格子候选少”的 ALS 读法。"
    ],
    "en": [
      "AHS-XZ is the Almost Hidden Set dual of ALS-XZ.",
      "Digits are nearly confined to a group of cells; a restricted common cell or candidate couples two AHS nodes and forces a common consequence.",
      "An AHS has n digits restricted to n+1 cells, so one cell must be outside the digit set. Coupling two AHS nodes prevents certain positions from being absent together, and targets excluded by both sides can be removed.",
      "1. Choose the digit sets. 2. Locate their possible cells. 3. Identify the restricted common element. 4. Apply the common elimination.",
      "The visual emphasis is on digit sets and their possible locations, not on low-candidate cell sets.",
      "Confirm that this is a hidden-set relation—digits confined to cells—rather than an ALS read from cell candidates."
    ]
  },
  "XChain": {
    "zh": [
      "X-Chain 是只含一个数字的强弱交替链。",
      "链头若假会一路推出链尾真，因此链头和链尾至少一个为真；共同可见的同数字候选可删。",
      "链的数学逻辑是强弱关系交替。强关系表示“两端至少一真”，弱关系表示“两端至多一真”；从链头假设为假开始，真假会沿链传播到链尾为真。于是链头与链尾至少一真，凡是同时与两端冲突的候选都不能成立；若首尾是同一目标，还可能直接出数或删数。",
      "① 锁定数字；② 从一端沿强弱交替读；③ 找另一端；④ 删除两端共同可见候选。",
      "实线/虚线交替读；所有节点都是同一个数字。",
      "确认链两端是同数字，并且删数能同时看见两端。"
    ],
    "en": [
      "X-Chain is an alternating inference structure built from candidates of one digit.",
      "Strong links mean at least one endpoint is true; weak links mean the endpoints cannot both be true. Alternation forces a relation between the chain ends.",
      "Starting from one endpoint false, truth values propagate through alternating strong and weak relations until the other endpoint is forced true. Therefore the endpoints are not both false, and any candidate conflicting with both can be removed. Discontinuous loops may instead force a placement or an elimination at the break.",
      "1. Fix the digit. 2. Follow alternating strong and weak links. 3. Identify the chain ends. 4. Remove same-digit candidates seeing both ends.",
      "All nodes use one digit; line style shows the alternating link type.",
      "The ends must use the same digit, and every elimination must see both endpoints."
    ]
  },
  "XYChain": {
    "zh": [
      "XY-Chain 使用一串双值格在不同数字之间传递。",
      "每个双值格内部提供异数强关系，外部同数字可见提供弱关系；链端同数字至少一真。",
      "链的数学逻辑是强弱关系交替。强关系表示“两端至少一真”，弱关系表示“两端至多一真”；从链头假设为假开始，真假会沿链传播到链尾为真。于是链头与链尾至少一真，凡是同时与两端冲突的候选都不能成立；若首尾是同一目标，还可能直接出数或删数。",
      "① 找起点候选；② 沿双值格传递；③ 找同数字终点；④ 删除共同可见目标。",
      "高亮多为双值格链，端点共同候选是删数目标。",
      "确认中间格多为双值格；端点数字通常相同。"
    ],
    "en": [
      "XY-Chain is an alternating inference structure built from bivalue cells that pass implications between different digits.",
      "Strong links mean at least one endpoint is true; weak links mean the endpoints cannot both be true. Alternation forces a relation between the chain ends.",
      "Starting from one endpoint false, truth values propagate through alternating strong and weak relations until the other endpoint is forced true. Therefore the endpoints are not both false, and any candidate conflicting with both can be removed. Discontinuous loops may instead force a placement or an elimination at the break.",
      "1. Choose an endpoint candidate. 2. Follow the bivalue cells in order. 3. Reach the same digit at the other end. 4. Remove that digit from common peers of both ends.",
      "The chain normally runs through bivalue cells; the equal-digit endpoints define the elimination.",
      "Check that the internal cells support the required bivalue transitions and that the endpoint digit matches."
    ]
  },
  "AIC": {
    "zh": [
      "AIC 是强弱关系交替的通用链，可含同数、异数、区块或集合节点。",
      "强关系表示“前假则后真”，弱关系表示“两者不能同真”；交替后得到端点至少一真或矛盾结论。",
      "链的数学逻辑是强弱关系交替。强关系表示“两端至少一真”，弱关系表示“两端至多一真”；从链头假设为假开始，真假会沿链传播到链尾为真。于是链头与链尾至少一真，凡是同时与两端冲突的候选都不能成立；若首尾是同一目标，还可能直接出数或删数。",
      "① 找链头；② 按强弱交替读；③ 看链尾；④ 用端点共同影响或不连续点得结论。",
      "按线型读：实线强、虚线弱；结论在箭头或 => 后。",
      "检查强弱是否交替，链端是否支持给出的删数/出数。"
    ],
    "en": [
      "AIC is an alternating inference structure built from single candidates, grouped candidates, or logical set nodes.",
      "Strong links mean at least one endpoint is true; weak links mean the endpoints cannot both be true. Alternation forces a relation between the chain ends.",
      "Starting from one endpoint false, truth values propagate through alternating strong and weak relations until the other endpoint is forced true. Therefore the endpoints are not both false, and any candidate conflicting with both can be removed. Discontinuous loops may instead force a placement or an elimination at the break.",
      "1. Locate the chain head. 2. Follow strict strong/weak alternation. 3. Inspect the tail or discontinuity. 4. Apply the endpoint conclusion.",
      "Solid and dashed links encode the inference; the conclusion is normally written after the arrow.",
      "Verify link alternation and confirm that the two endpoints or loop break justify the exact placement or elimination."
    ]
  },
  "GroupedAIC": {
    "zh": [
      "Grouped AIC 把一组同候选格当成一个节点。",
      "组节点代表“这组里至少有一个成立”或“这组不能与另一节点同真”，从而延续 AIC。",
      "链的数学逻辑是强弱关系交替。强关系表示“两端至少一真”，弱关系表示“两端至多一真”；从链头假设为假开始，真假会沿链传播到链尾为真。于是链头与链尾至少一真，凡是同时与两端冲突的候选都不能成立；若首尾是同一目标，还可能直接出数或删数。",
      "① 找组节点；② 当成整体读链；③ 看相邻强弱关系；④ 应用端点结论。",
      "高亮可能是一片候选而不是单格；把它当成一个节点读。",
      "确认组内候选属于同一数字和同一区域限制。"
    ],
    "en": [
      "Grouped AIC is an alternating inference structure built from groups of same-digit candidates treated as single nodes.",
      "Strong links mean at least one endpoint is true; weak links mean the endpoints cannot both be true. Alternation forces a relation between the chain ends.",
      "Starting from one endpoint false, truth values propagate through alternating strong and weak relations until the other endpoint is forced true. Therefore the endpoints are not both false, and any candidate conflicting with both can be removed. Discontinuous loops may instead force a placement or an elimination at the break.",
      "1. Identify each group node. 2. Read it as one proposition. 3. Follow the alternating links. 4. Apply the endpoint conclusion.",
      "A highlighted region may represent one logical node rather than one cell.",
      "Candidates inside a group must share the relevant house and digit constraint."
    ]
  },
  "ComplexAIC": {
    "zh": [
      "Complex AIC 允许 ALS、AHS、Almost Fish、Fireworks 等复杂节点进入链。",
      "复杂节点内部提供一个可靠的强/弱关系，外部仍按 AIC 交替规则读。",
      "链的数学逻辑是强弱关系交替。强关系表示“两端至少一真”，弱关系表示“两端至多一真”；从链头假设为假开始，真假会沿链传播到链尾为真。于是链头与链尾至少一真，凡是同时与两端冲突的候选都不能成立；若首尾是同一目标，还可能直接出数或删数。",
      "① 找复杂节点；② 看节点间强弱；③ 沿链读到端点；④ 应用共同结论。",
      "高亮会同时出现线和椭圆/外框；先把复杂结构压缩成节点。",
      "不要要求每个节点都是单候选；重点是节点之间关系是否清楚。"
    ],
    "en": [
      "Complex AIC is an alternating inference structure built from ALS, AHS, Almost Fish, Fireworks, and other composite nodes.",
      "Strong links mean at least one endpoint is true; weak links mean the endpoints cannot both be true. Alternation forces a relation between the chain ends.",
      "Starting from one endpoint false, truth values propagate through alternating strong and weak relations until the other endpoint is forced true. Therefore the endpoints are not both false, and any candidate conflicting with both can be removed. Discontinuous loops may instead force a placement or an elimination at the break.",
      "1. Compress each complex structure into its stated node relation. 2. Follow strong/weak alternation. 3. Reach the endpoint. 4. Apply the common consequence.",
      "Lines may connect outlined sets or regions; read each complex node's internal implication first.",
      "A node need not be one candidate, but every advertised strong or weak relation must be valid."
    ]
  },
  "CellRegionFC": {
    "zh": [
      "格/区域强制链从一个格子或区域的所有可能分支出发。",
      "如果每个分支最终都得到同一个结论，该结论就不依赖分支选择，必然成立。",
      "Kazusa 的强制链说明强调它不是普通头尾取交集的链，而是完备分支推理。对某个格或区域，所有可能候选/位置必须有且只有一个成立；如果逐一假设每个分支后都会推出同一个删数或同一个出数，那么无论真实分支是哪一个，该共同结论都必然成立。归并强制链、鳍链、动态强制链只是分支组织方式不同。",
      "① 找起始格/区域；② 分别读各分支；③ 找共同结果；④ 应用共同结果。",
      "高亮会有多条分支；不要只看第一条链。",
      "核对所有分支是否都指向同一删数或出数。"
    ],
    "en": [
      "Cell/Region Forcing Chain starts from every possible value of one cell or every possible position of one digit in a house.",
      "If every complete branch reaches the same placement or elimination, that conclusion is true regardless of which branch is the real one.",
      "The branch set is exhaustive and mutually exclusive. Since one branch must be true, any result shared by all branches is logically forced. Merged, finned, and dynamic forcing chains differ only in branch organization.",
      "1. Identify the starting cell or region. 2. Read every branch. 3. Find the shared result. 4. Apply that result.",
      "Several branches may be drawn; no single branch alone proves the conclusion.",
      "Confirm that all possible starting cases are represented and that every branch yields the same conclusion."
    ]
  },
  "Whip": {
    "zh": [
      "Whip 是线性强制结构，像一条有方向的链，逐步排除起点候选。",
      "假设目标候选成立会沿链迫使后续节点，最终导致某个必要候选无处可去。",
      "Whip 是“假设目标候选为真会走到矛盾”的线性反证链。链上每一层都用已知强弱关系逼迫下一步；若最终导致某格无候选、某区域某数字无位置，或同一区域重复，则最初目标候选不能为真，所以可以删除。",
      "① 看被删候选；② 假设它成立；③ 沿主链读后果；④ 到矛盾处确认删除。",
      "高亮主链为重点，通常有明确起点和终点矛盾。",
      "顺着链方向读，不要把旁边无关候选纳入主链。"
    ],
    "en": [
      "Whip is a directed linear contradiction chain used to eliminate its starting candidate.",
      "Assuming the target true successively forces later nodes until a cell, house, or candidate requirement becomes impossible.",
      "Each step follows a valid strong or weak implication. A final contradiction means the initial assumption has no solution, so the target candidate is false.",
      "1. Start at the elimination candidate. 2. Assume it true. 3. Follow the main chain. 4. Verify the terminal contradiction.",
      "The directed main chain and its contradiction endpoint are the key highlights.",
      "Follow the displayed direction and do not import unrelated nearby candidates into the proof."
    ]
  },
  "GWhip": {
    "zh": [
      "g-Whip 是带分组节点的 Whip。",
      "分组节点表示多个位置共同承担一个候选，其他读法与 Whip 相同。",
      "g-Whip 把 Whip 的单格节点推广为分组节点。分组仍表示同一个逻辑命题，例如某数字在某一组格中至少一处成立；如果假设目标成立后，分组链最终造成区域无落点或候选冲突，目标候选就被反证删除。",
      "① 看被删候选；② 沿分组主链读；③ 找矛盾点；④ 删除起点候选。",
      "高亮会出现组节点；组节点当成一个整体。",
      "确认分组候选位于同一区域约束内。"
    ],
    "en": [
      "g-Whip is a Whip containing grouped logical nodes.",
      "A group represents several locations jointly satisfying one proposition; the contradiction proof otherwise follows ordinary Whip logic.",
      "Assuming the target true forces grouped and single nodes until a digit has no location, a cell has no candidate, or another contradiction occurs.",
      "1. Start from the target. 2. Read grouped nodes as single propositions. 3. Follow the directed chain. 4. Confirm the contradiction and eliminate the target.",
      "Grouped candidate regions should be read as one node.",
      "Each group must be valid under a common house and digit constraint."
    ]
  },
  "DynamicChain": {
    "zh": [
      "动态链允许链中产生新的临时结论，再继续推理。",
      "它仍是确定逻辑：每个临时后果都由前面假设强制推出，最终得到共同结论或矛盾。",
      "Dynamic Chain 允许在假设过程中继续使用中间推出的出数/删数。它的用户级逻辑仍是反证：假设某候选成立后，所有后续推理都是确定逻辑；若确定逻辑最终矛盾，则初始假设必假。",
      "① 看起始假设；② 看动态推出的中间结论；③ 看最终矛盾/共同点；④ 应用结论。",
      "高亮可能包含较长路径和多层分支。",
      "用户核对时重点看最终共同结论，不必手工复原所有搜索路径。"
    ],
    "en": [
      "Dynamic Chain may use temporary placements and eliminations derived during the proof and then continue from them.",
      "Every temporary result is forced by the initial assumption; if the accumulated deterministic consequences end in contradiction, the assumption is false.",
      "This remains proof by contradiction, but the proof state evolves. No guessed branch is accepted: each intermediate deduction must follow from earlier forced consequences.",
      "1. Identify the starting assumption. 2. Read the temporary deductions in order. 3. Locate the final contradiction or common result. 4. Apply the reported conclusion.",
      "The path may be long and may contain nested branches or intermediate marks.",
      "For manual checking, prioritize the final contradiction and the dependency of each temporary result rather than recreating the search order."
    ]
  },
  "Braid": {
    "zh": [
      "Braid 是比 Whip 更允许分支的强制证明。",
      "目标候选若成立，会在多个可选路径中仍不可避免地走向矛盾，因此目标可删。",
      "Braid 是比 Whip 更宽的反证证明。假设目标候选成立后，每一层不只保留一条线性后继，而是允许多个候选共同承担“逃生分支”；若所有分支最终都被堵死，说明目标成立会让盘面无解，因此目标可删。",
      "① 看被删候选；② 读主链；③ 查看旁支如何封堵替代选择；④ 到矛盾点确认删除。",
      "高亮通常有主链和旁支；主链表示证明骨架，旁支表示必要支撑。",
      "不要把所有分支都当成同一条线；按系统给出的主链/分支关系读。"
    ],
    "en": [
      "Braid is a broader contradiction proof than a linear Whip and allows several supporting branches.",
      "Assuming the target true leaves multiple possible escape paths, but the braid shows that every path is eventually blocked.",
      "The main implication skeleton plus side branches exhausts all alternatives. If every alternative under the initial assumption ends in contradiction, the target is false.",
      "1. Start from the target. 2. Follow the main strand. 3. Inspect side branches that close alternative choices. 4. Confirm that no legal branch remains.",
      "The main strand and support branches have different roles; do not read them as one simple chain.",
      "The elimination must depend on the complete braid, not on one isolated weak link."
    ]
  },
  "GBraid": {
    "zh": [
      "g-Braid 是带分组节点的 Braid。",
      "分组节点把多个候选位置合并为一个证明节点，帮助表达区域级强制关系。",
      "g-Braid 是 Braid 的分组版本。它把若干同数字同区域的位置合成一个节点，但证明目标不变：假设目标成立后，所有可能分支都被强制关系、弱关系和区域容量排除，最终没有合法完成方式。",
      "① 看目标候选；② 找主链；③ 找分组/旁支；④ 确认所有逃路被封堵。",
      "高亮可能更密集；先识别分组节点，再看主链/分支。",
      "确认删数由整套 braid 证明，而非某单条弱连接独立推出。"
    ],
    "en": [
      "g-Braid is a Braid whose proof may use grouped nodes.",
      "Grouped nodes compress house-level alternatives while the braid blocks every completion under the target assumption.",
      "Assuming the target true, strong, weak, grouped, and capacity relations eliminate all possible branches, leaving no legal completion.",
      "1. Identify the target. 2. Find the main strand. 3. Read grouped and side branches. 4. Verify that every escape route is closed.",
      "Dense highlights should be decomposed into group nodes, the main strand, and supporting branches.",
      "Use the whole grouped braid proof; no single branch should be treated as sufficient unless it independently reaches contradiction."
    ]
  },
  "SKLoop": {
    "zh": [
      "SK Loop 与 Domino Loop 是同一技巧。本项目搜索固定 8 个分组链接段，按行、宫、列、宫交替闭合；每段可承载一个或多个数字。",
      "几何段数固定为 8，但每个“数字 + house”组合分别计作一个 Link 名额。主体格 Truth 数与所有段合计 Link 名额相等，形成严格 Rank 0。",
      "设 8 段为 L₁…L₈，各段携带数字集合 Dᵢ。LinkSlotCount=Σ|Dᵢ|，并要求 CellCount=LinkSlotCount。标题中的“16 Links”表示数字-house Link 名额，不表示 16 个几何段。",
      "1. 确认 SegmentCount=8。2. 读取每段数字组。3. 逐个计算数字-house Link 名额。4. 核对 CellCount=LinkSlotCount。5. 删除抢占 Link 容量的候选。",
      "LoopBody、8 个 Link 段与删数分层显示；一段内的多个数字作为一个分组 Link 阅读。",
      "SK Loop 就是 Domino Loop；它是严格 Rank 0 八段闭环。必须区分链接段数与 Link 名额数。"
    ],
    "en": [
      "SK Loop and Domino Loop are the same technique. The detector uses exactly eight grouped link segments alternating through rows, boxes, columns, and boxes; one segment may carry several digits.",
      "The geometric segment count is fixed at eight, while every digit-house pair counts as one Link slot. Body cell truths equal the total Link slots, giving strict rank 0.",
      "Let the eight segments be L1...L8 with digit sets Di. LinkSlotCount is the sum of |Di|, and CellCount must equal LinkSlotCount. '16 Links' in the title means digit-house Link slots, not sixteen geometric segments.",
      "1. Confirm SegmentCount=8. 2. Read each segment's digit set. 3. Count digit-house Link slots. 4. Verify CellCount=LinkSlotCount. 5. Remove outside candidates that steal link capacity.",
      "Display LoopBody, the eight Link segments, and eliminations separately. Treat multiple digits on one segment as one grouped Link role.",
      "SK Loop is Domino Loop and is a strict rank-0 eight-segment loop. Keep segment count separate from Link-slot count."
    ]
  },
  "MSLS": {
    "zh": [
      "本项目的 MSLS 分为 Exact Rank-0、Advanced Rank-0 和 Advanced with Attachment。",
      "Exact 逐数字选择最低成本的行、列或宫覆盖；Advanced 还枚举浮动数字的行侧/列侧分配，并可吸收 Attachment。",
      "Core 的 CellCount 与最终 LinkCount 相等时容量满载。结构外同 Link-house 候选抢占容量，结构内被多个 Link 重复覆盖的候选形成自噬超额。",
      "1. 确认 Core。2. 比较每个数字的覆盖成本。3. Advanced 分支核对浮动数字和 Attachment。4. 核对 CellCount=LinkCount。5. 应用外部或自噬删数。",
      "Core、Attachment、实际 Link、PermutableDigits 与删数分层显示。",
      "Exact、Advanced、Advanced with Attachment 是不同搜索路径；只解释当前步骤实际输出的 Branch。"
    ],
    "en": [
      "This project has Exact Rank-0, Advanced Rank-0, and Advanced with Attachment MSLS paths.",
      "Exact selects the cheapest row, column, or box cover for each digit. Advanced also enumerates row-side/column-side choices for floating digits and may absorb attachment cells.",
      "When Core CellCount equals final LinkCount, capacity is saturated. Outside candidates in a selected link house steal capacity, while candidates covered by multiple links are cannibal overfills.",
      "1. Confirm the Core. 2. Compare cover cost for each digit. 3. For Advanced, verify floating-digit choices and Attachments. 4. Check CellCount=LinkCount. 5. Apply outside or cannibal eliminations.",
      "Display Core, Attachment, actual Links, PermutableDigits, and eliminations separately.",
      "Exact, Advanced, and Advanced with Attachment are distinct search paths. Explain only the Branch emitted by the step."
    ]
  },
  "RankMultifish": {
    "zh": [
      "Multi-Fish/复数鱼是 Kazusa 秩理论里的零秩强弱区域覆盖结构，是“鱼”的强弱区域视角推广，可以同时涉及多个数字和多类区域。",
      "每个强区域都要求一个候选实例；弱区域最多容纳一个实例。当强区域数量与弱区域覆盖次数相等且候选被完整覆盖时，弱区域容量被占满，额外候选可删。",
      "Kazusa 的秩理论把强区域理解为“能且仅能填一个实例”，弱区域理解为“最多填一个实例”，rank 是最多容纳次数与实际必须填入次数的差。复数鱼把普通鱼的 base-cover 推广到多个数字、行、列、宫和格。若强区域数量与弱区域容量相等，结构内候选又被完整覆盖，就形成 Rank 0：任何弱区域中的额外候选若成立，都会占用本该留给必要实例的容量，从而造成弱区域超额或强区域无落点，因此可删。",
      "① 看参与数字；② 数强区域；③ 数弱区域；④ 确认精确覆盖；⑤ 删除弱区域中的额外候选。",
      "强区域通常按候选染色，弱区域按行/列/宫/格背景或外框显示；先按强弱区域读，不按普通单数字鱼形状读。",
      "重点核对强弱区域数量是否锁住，以及删数是否位于弱区域覆盖的额外位置。"
    ],
    "en": [
      "Multi-Fish in rank logic is a Rank-0 cover structure that may involve several digits and several sector types.",
      "Every strong sector requires one true instance, while each weak sector can hold at most one. Equal required and available counts fill all weak-sector capacity.",
      "Rank is weak-sector capacity minus mandatory strong-sector instances. At Rank 0 with complete coverage, any extra candidate in a weak sector consumes capacity reserved for a required instance and is therefore false.",
      "1. Identify all involved digits. 2. Count strong sectors. 3. Count weak sectors. 4. Verify exact coverage and Rank 0. 5. Remove extra weak-sector candidates.",
      "Read the strong and weak sector colouring rather than expecting a conventional single-digit fish shape.",
      "Confirm the sector count and complete coverage, and verify that every elimination is an extra candidate in a covered weak sector."
    ]
  },
  "BlossomLoop": {
    "zh": [
      "绽放环是一种介于标准连续环和网之间的 Rank 0 环状结构。它带有动态分支和强制/毛刺分支，分支像花朵一样从主环展开，因此称为绽放环。",
      "标准绽放环中，每一处原本看似弱关系的位置，都可以通过动态链或强制链补成强关系；因此它能像连续环一样，对每个弱关系位置产生删数。",
      "从秩理论看，环内强区域 Truth 表示至少一个候选为真，弱区域 Link 表示最多一个候选为真。标准绽放环的 Truth 数与 Link 数相等，即 Rank = 0，所以结构内真候选数量被上下界同时夹住：至少要满足所有 Truth，至多只能装入所有 Link。两者相等时，每个弱区域必须恰好有一个真候选。若外部候选成立并破坏某个弱区域或分支配额，就会导致 Truth 无法满足、Link 容量超限，或沿动态/强制分支绕回矛盾，因此该候选可删。",
      "① 先找主环；② 标出动态分支与强制/毛刺分支；③ 检查分开和汇合的节点是否整体按强/弱区域连接；④ 数 Truth 与 Link 是否相等；⑤ 对每处弱关系按连续环式规则核对删数。",
      "主环可先按连续环读；分支不是额外装饰，而是用来证明某些断点/弱关系在整体上可当强关系使用。动态分支按动态链读，强制分支按毛刺/多毛刺链读。",
      "不要把绽放环写成普通 AIC Loop，也不要简单当成 Death Blossom 闭合版。关键是 Rank = 0，以及每个分支的分开、汇合节点能否把所有弱关系补成强关系。"
    ],
    "en": [
      "Blossom Loop is a Rank-0 loop/network between a continuous loop and a net, with dynamic and forcing branches blooming from the main loop.",
      "Each apparently weak break is reinforced by a dynamic or forcing branch, allowing the overall structure to behave like a continuous loop.",
      "Truth sectors require at least one true candidate and Link sectors allow at most one. At Rank 0 the lower and upper bounds are equal, so every link capacity is exactly used. An outside target that disrupts a link or branch quota makes a Truth unsatisfied or a Link overfull and is false.",
      "1. Find the main loop. 2. Mark dynamic and forcing/burr branches. 3. Verify how branches split and rejoin. 4. Count Truths and Links. 5. Apply continuous-loop-style eliminations at justified weak links.",
      "The main loop is the skeleton; branches are proof components that turn breaks into effective strong relations.",
      "Do not describe it as an ordinary AIC loop or merely a closed Death Blossom. Rank 0 and every branch reinforcement must be verified."
    ]
  },
  "JE": {
    "zh": [
      "Junior Exocet 以 Base 真数字由两侧 Target 承接为主干；同一搜索实体还执行多种独立检查。",
      "建立 Base、Targets 与 Cross/S-cells 配额后，只应用实际触发的 Target Check、X-Rule、Mirror、Locked Member、True Base、JEPOM 等检查。",
      "每个 Check 有独立前提和删数集合；未输出的检查不得补入证明。Double JExocet 与 Almost JE4 也按各自实际角色处理。",
      "1. 确认 BaseCandidates。2. 区分 Targets 与 Cross/S-cells。3. 读取每个 Check。4. 核对其角色与删数。5. 应用实际结论。",
      "Base、Target Q/R、Cross、Mirror、Locked Member、True Base 等分层显示。",
      "同一步可触发多个 Check；动态教程必须完整列出实际检查，不能套用整套 JE 规则。"
    ],
    "en": [
      "Junior Exocet is built on true base digits being carried by the two target sides; the same search entity also runs several independent checks.",
      "After the Base, Targets, and Cross/S-cell quota is established, apply only checks actually triggered: Target Check, X-Rule, Mirror, Locked Member, True Base, JEPOM, and others.",
      "Every Check has its own prerequisites and elimination set. Absent checks must not be added. Double JExocet and Almost JE4 use their own emitted roles.",
      "1. Confirm BaseCandidates. 2. Separate Targets from Cross/S-cells. 3. Read every Check. 4. Match it to roles and eliminations. 5. Apply the actual conclusion.",
      "Display Base, Target Q/R, Cross, Mirror, Locked Member, True Base, and other roles separately.",
      "One step may trigger several checks. The tutorial must list all actual checks and must not inherit the entire JE rule set."
    ]
  },
  "SeniorExocet": {
    "zh": [
      "Senior Exocet 允许多格 Target、Endo Target、Target-line AHS 和调整后的 Cross-Line/S-cell 集合。",
      "实际检查包括 Cross-Line Need、Target-House Lock、Non-Base Target Cleanup、True Base、Mirror、Incompatible Base、X-Rule、Potential Target Cover House 等。",
      "各检查独立约束 Base→Target 承接和 S-cell 容量；只有本步实际触发的 Check 构成证明。",
      "1. 找 Base。2. 区分 TargetGroup 与 Cross/S-cells。3. 读取全部 Check。4. 分别核对锁定、镜像、AHS、X-Rule 或覆盖宫。5. 应用删数。",
      "Base、TargetGroup A/B、Cross、Locked Non-base 与检查结果分层显示。",
      "不能按 Franken/Mutant/Advanced 外形补入未输出规则；每个删数必须追到具体 Check。"
    ],
    "en": [
      "Senior Exocet permits multi-cell targets, endo-targets, target-line AHS, and adjusted cross-line/S-cell sets.",
      "Actual checks include Cross-Line Need, Target-House Lock, Non-Base Target Cleanup, True Base, Mirror, Incompatible Base, X-Rule, and Potential Target Cover House.",
      "Each check independently constrains base-to-target carrying and S-cell capacity. Only checks emitted by this step belong to its proof.",
      "1. Find the Base. 2. Separate target groups from Cross/S-cells. 3. Read every Check. 4. Verify locks, mirrors, AHS, X-Rule, or cover-house conditions. 5. Apply eliminations.",
      "Display Base, TargetGroup A/B, Cross, locked non-base candidates, and check results separately.",
      "Do not infer rules from a Franken, Mutant, Complex, or Advanced shape. Every elimination must trace to a concrete emitted Check."
    ]
  },
  "WeakExocet": {
    "zh": [
      "Weak Exocet 只保留当前弱结构能证明的部分 Base→Target 同步，并输出 WeakSeat、YLock 及实际触发的检查。",
      "Y-lock 表示某个基准数字锁定在 Y 区。Target Cells Check 是 T 格检查；Mirror Check 是 M 格检查，不是 T 邻规则。只有显式输出 Adjacent Target 时才称 T 邻。",
      "T 格检查删除目标格中的不兼容候选；Z 区检查删除 Z 格中的非基准候选；W 区检查删除满足容量条件位置中的基准候选；M 格检查利用 Target 与镜面节点删除不兼容候选。",
      "1. 确认 BaseCandidates、Base 与 WeakSeat。2. 核对 YLock/YArea。3. 分别读取 TCheckTargets、ZZoneTargets、WZoneTargets、MNodes/MCheckTargets。4. 只执行实际 Check。5. 应用对应删数。",
      "Base、Targets、Cross、WeakSeat、YArea、ZZone、WZoneTargets、MNodes 与各删数目标分层显示。",
      "已有一条 Y-lock+Z 区真实样例和一条 T格+Z区+W区+M格多检查真实样例；动态教程必须按实际 Check 选择性显示。"
    ],
    "en": [
      "Weak Exocet retains only the partial Base-to-Target synchronization proved by the current weak structure and emits the WeakSeat, YLock, and checks actually triggered.",
      "Y-lock means a base digit is locked in the Y area. Target Cells Check is the T-cell check; Mirror Check is the M-cell check, not the Adjacent-Target rule. Use Adjacent Target only when explicitly emitted.",
      "The T-cell check removes incompatible target candidates; the Z-zone check removes non-base candidates from Z cells; the W-zone check removes base candidates where its capacity condition holds; the M-cell check uses targets and mirror nodes to remove incompatible candidates.",
      "1. Confirm BaseCandidates, Base, and WeakSeat. 2. Verify YLock/YArea. 3. Read TCheckTargets, ZZoneTargets, WZoneTargets, and MNodes/MCheckTargets. 4. Apply only actual Checks. 5. Apply their eliminations.",
      "Display Base, Targets, Cross, WeakSeat, YArea, ZZone, WZoneTargets, MNodes, and each target role separately.",
      "The corpus now has one real Y-lock+Z-zone sample and one real multi-check T-cell+Z-zone+W-zone+M-cell sample. The tutorial must remain selective."
    ]
  },
  "BruteForce": {
    "zh": [
      "BruteForce 是 Verified-Solution Placement：先验证完整终解，再读取一个未解格的正确数字作为末端兜底。",
      "搜索器优先选择候选数较少的未解格，并从 CompleteSolution 读取落数；不是把一次猜测包装成局部逻辑。",
      "可靠性来自完整终解验证，而不是局部结构证明；本步只报告终解落数。",
      "1. 确认逻辑技巧无结果。2. 完整求解并验证。3. 选择候选较少的未解格。4. 从终解读取并落数。",
      "只显示所选格和最终落数，不制造枢轴、链、数组等局部结构。",
      "BruteForce 不参与技巧训练；坚持逻辑解题时应调整配置或查看更早步骤。"
    ],
    "en": [
      "BruteForce is a Verified-Solution Placement: verify the complete solution first, then read one unsolved cell from it as the terminal fallback.",
      "The detector prefers an unsolved cell with few candidates and reads its value from CompleteSolution. It does not disguise one guess as local logic.",
      "Reliability comes from verification of the full solution, not a local structural proof. The step reports only the solved placement.",
      "1. Confirm logical techniques have no result. 2. Solve and verify the full grid. 3. Select an unsolved cell with few candidates. 4. Read and place its solved digit.",
      "Display only the selected cell and final placement; do not invent pivots, chains, or subsets.",
      "BruteForce is excluded from technique training. For a logic-only solve, change the configuration or inspect an earlier step."
    ]
  },

};
