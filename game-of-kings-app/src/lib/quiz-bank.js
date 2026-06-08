const QUIZ_INTERVAL_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

const seatFacts = [
  ["House Stark", "Winterfell", "The North"], ["House Lannister", "Casterly Rock", "The Westerlands"], ["House Baratheon", "Storm's End", "The Stormlands"],
  ["House Targaryen", "Dragonstone", "The Crownlands"], ["House Tyrell", "Highgarden", "The Reach"], ["House Martell", "Sunspear", "Dorne"],
  ["House Arryn", "The Eyrie", "The Vale"], ["House Tully", "Riverrun", "The Riverlands"], ["House Greyjoy", "Pyke", "The Iron Islands"],
  ["House Hightower", "Oldtown", "The Reach"], ["House Manderly", "White Harbor", "The North"], ["House Bolton", "The Dreadfort", "The North"],
  ["House Frey", "The Twins", "The Riverlands"], ["House Dayne", "Starfall", "Dorne"], ["House Tarly", "Horn Hill", "The Reach"],
  ["House Royce", "Runestone", "The Vale"], ["House Connington", "Griffin's Roost", "The Stormlands"], ["House Dondarrion", "Blackhaven", "The Stormlands"],
  ["House Swann", "Stonehelm", "The Stormlands"], ["House Velaryon", "High Tide", "The Crownlands"], ["House Blackwood", "Raventree Hall", "The Riverlands"],
  ["House Bracken", "Stone Hedge", "The Riverlands"], ["House Lefford", "Golden Tooth", "The Westerlands"], ["House Clegane", "Clegane's Keep", "The Westerlands"],
  ["House Crakehall", "Crakehall", "The Westerlands"], ["House Redwyne", "The Arbor", "The Reach"], ["House Rowan", "Goldengrove", "The Reach"],
  ["House Florent", "Brightwater Keep", "The Reach"], ["House Beesbury", "Honeyholt", "The Reach"], ["House Fowler", "Skyreach", "Dorne"],
  ["House Yronwood", "Yronwood", "Dorne"], ["House Allyrion", "Godsgrace", "Dorne"], ["House Toland", "Ghost Hill", "Dorne"],
];

const loreFacts = [
  ["The Iron Throne", "King's Landing", "royal rule"], ["The Wall", "Castle Black", "the Night's Watch"], ["The Citadel", "Oldtown", "maesters"],
  ["The Seastone Chair", "Pyke", "the ironborn"], ["The Painted Table", "Dragonstone", "war planning"], ["The Bloody Gate", "The Vale", "mountain defense"],
  ["The Gods Eye", "Harrenhal", "the Riverlands"], ["The Red Keep", "King's Landing", "the crown"], ["The Hightower", "Oldtown", "beacon and watch"],
  ["Moat Cailin", "The Neck", "northern defense"], ["The Arbor", "The Reach", "wine and fleets"], ["Starfall", "Dorne", "House Dayne"],
];

const artifactFacts = [
  ["Longclaw", "House Mormont"], ["Heartsbane", "House Tarly"], ["Dawn", "House Dayne"], ["Blackfyre", "House Targaryen"],
  ["Dark Sister", "House Targaryen"], ["Ice", "House Stark"], ["Red Rain", "House Drumm"], ["Lady Forlorn", "House Corbray"],
];

const dragonFacts = [
  ["Balerion", "the Black Dread"], ["Vhagar", "one of the oldest conquest-era dragons"], ["Meraxes", "Rhaenys Targaryen's dragon"],
  ["Caraxes", "the Blood Wyrm"], ["Syrax", "Rhaenyra Targaryen's dragon"], ["Sunfyre", "Aegon II's dragon"],
  ["Meleys", "the Red Queen"], ["Seasmoke", "a Velaryon-linked dragon"], ["Tessarion", "the Blue Queen"], ["Vermax", "Jacaerys Velaryon's dragon"],
];

function hashText(value) {
  return value.split("").reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 17);
}

function seededShuffle(items, seed) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = hashText(`${seed}-${index}`) % (index + 1);
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function wrongOptions(correct, pool, seed, count = 3) {
  return seededShuffle(pool.filter((item) => item !== correct), seed).slice(0, count);
}

function question(text, correct, wrongPool, seed) {
  return [text, seededShuffle([correct, ...wrongOptions(correct, wrongPool, seed)], `${seed}-answers`), correct];
}

function buildQuizBank() {
  const housePool = seatFacts.map(([house]) => house);
  const seatPool = seatFacts.map(([, seat]) => seat);
  const regionPool = [...new Set(seatFacts.map(([, , region]) => region))];
  const artifactPool = artifactFacts.map(([artifact]) => artifact);
  const artifactHousePool = artifactFacts.map(([, house]) => house);
  const dragonPool = dragonFacts.map(([dragon]) => dragon);
  const dragonCluePool = dragonFacts.map(([, clue]) => clue);
  const bank = [];

  seatFacts.forEach(([house, seat, region], index) => {
    bank.push(question(`Which castle or city is the seat of ${house}?`, seat, seatPool, `seat-${index}`));
    bank.push(question(`Which house is seated at ${seat}?`, house, housePool, `house-${index}`));
    bank.push(question(`Which region contains ${seat}?`, region, regionPool, `region-${index}`));
    bank.push(question(`${seat} belongs most closely to which region?`, region, regionPool, `realm-${index}`));
  });

  loreFacts.forEach(([name, answer, clue], index) => {
    bank.push(question(`${name} is most closely tied to what place?`, answer, seatPool, `lore-place-${index}`));
    bank.push(question(`Which subject is ${name} known for?`, clue, loreFacts.map(([, , item]) => item), `lore-clue-${index}`));
  });

  artifactFacts.forEach(([artifact, house], index) => {
    bank.push(question(`Which house is most associated with ${artifact}?`, house, artifactHousePool, `artifact-house-${index}`));
    bank.push(question(`Which artifact is associated with ${house}?`, artifact, artifactPool, `artifact-name-${index}`));
  });

  dragonFacts.forEach(([dragon, clue], index) => {
    bank.push(question(`Which dragon is known as or described as ${clue}?`, dragon, dragonPool, `dragon-${index}`));
    bank.push(question(`${dragon} is best matched with which clue?`, clue, dragonCluePool, `dragon-clue-${index}`));
  });

  const expanded = [];
  for (let index = 0; expanded.length < 1000; index += 1) {
    const base = bank[index % bank.length];
    expanded.push([
      base[0],
      seededShuffle(base[1], `expanded-${index}`),
      base[2],
    ]);
  }

  return expanded;
}

export const quizQuestionBank = buildQuizBank();

export function getQuizCycle(now = Date.now()) {
  const cycle = Math.floor(now / (QUIZ_INTERVAL_DAYS * DAY_MS));
  const selected = seededShuffle(quizQuestionBank, `quiz-cycle-${cycle}`).slice(0, 10);

  return {
    key: `quiz-${cycle}`,
    title: `Realm Lore Trial ${cycle + 1}`,
    category: "Rotating Lore Quiz",
    questions: selected,
    nextAt: (cycle + 1) * QUIZ_INTERVAL_DAYS * DAY_MS,
    bankSize: quizQuestionBank.length,
  };
}
