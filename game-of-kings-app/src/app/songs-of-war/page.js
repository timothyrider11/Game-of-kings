"use client";

import { useMemo, useState } from "react";
import SiteNav from "../../components/SiteNav";

const battles = [
  {
    name: "The War for the Dawn",
    era: "Age of Heroes",
    conflict: "The Long Night",
    location: "The lands beyond memory",
    result: "The Others were driven back and the Wall became the realm's northern warning.",
    forces: "The living, legendary heroes, and the powers of winter",
    story:
      "The oldest song of war is half history and half nightmare. During the Long Night, the world was said to have gone cold and black while the dead walked under a sky without mercy. The tale survives because the living endured: by fire, old magic, desperate alliances, and the kind of courage that becomes religion after enough centuries pass.",
  },
  {
    name: "First Men and Children of the Forest",
    era: "Dawn Age",
    conflict: "The Coming of the First Men",
    location: "Across Westeros",
    result: "The Pact ended generations of bloodshed and divided sacred places from human kingdoms.",
    forces: "First Men settlers and the children of the forest",
    story:
      "Before castles had names, bronze-bearing First Men crossed into Westeros and cut into woods the children held sacred. The war that followed was not one battle but a long wound across rivers, groves, and hills. It ended at the Isle of Faces with the Pact, a peace old enough that even maesters argue over what was promised.",
  },
  {
    name: "The Andal Invasions",
    era: "Age of Heroes",
    conflict: "Andal Conquest of Westeros",
    location: "The Vale, Riverlands, Stormlands, and beyond",
    result: "The Andals reshaped most southern kingdoms while the North held to the old ways.",
    forces: "Andal warlords against First Men kingdoms",
    story:
      "The Andals came with steel, the Faith, and banners bright enough to frighten older kings. Their invasion rolled unevenly across the continent: swift in the Vale, bloody in the Riverlands, stubborn in the Stormlands, and broken against the North. The wars left Westeros with new gods, new houses, and old grudges wearing fresh crowns.",
  },
  {
    name: "Nymeria's War in Dorne",
    era: "Rhoynar Migration",
    conflict: "Unification of Dorne",
    location: "Dorne",
    result: "Nymeria and House Martell unified Dorne under Sunspear.",
    forces: "Rhoynar exiles and House Martell against rival Dornish kings",
    story:
      "Nymeria arrived not as a conqueror with spare armies, but as an exile with ships, survivors, and a will hard enough to change a kingdom. By joining House Martell, she turned scattered Dornish rivalries into a long campaign of unity. The wars made Dorne different from the rest of Westeros: proud, mixed in blood and custom, and difficult to break.",
  },
  {
    name: "Burning of Harrenhal",
    era: "Aegon's Conquest",
    conflict: "Conquest of the Riverlands and Iron Islands",
    location: "Harrenhal",
    result: "Harren the Black died and the largest castle in Westeros became a warning.",
    forces: "Aegon Targaryen and Balerion against House Hoare",
    story:
      "Harrenhal had been built to declare that stone could defy kings. Aegon answered with dragonfire. When Balerion rose over the towers, the fortress became less a castle than a furnace, and House Hoare burned with its pride. Every blackened wall still tells the same lesson: stone is strong, but dragons change the argument.",
  },
  {
    name: "Battle of Gulltown",
    era: "Aegon's Conquest",
    conflict: "Conquest of the Vale",
    location: "Gulltown",
    result: "The Arryn fleet was shattered and the Vale bent through diplomacy soon after.",
    forces: "Targaryen forces and Velaryon ships against the Vale",
    story:
      "The Vale's sea gate was tested early in the conquest. Gulltown resisted with ships and pride, but dragon-backed war had a way of making old defenses feel suddenly small. The battle opened the way for the quieter victory that followed, when the young King of the Vale chose wonder over ruin.",
  },
  {
    name: "The Last Storm",
    era: "Aegon's Conquest",
    conflict: "Fall of the Storm Kings",
    location: "Near Storm's End",
    result: "Argilac Durrandon died and Orys Baratheon became Lord of Storm's End.",
    forces: "Orys Baratheon against the Storm King",
    story:
      "Argilac the Arrogant rode into rain, mud, and the end of his line. The storm broke hard over both armies, turning the field into a brutal slog where crown and lineage mattered less than footing. Orys Baratheon won the day, took the daughter, and founded a house built from conquest, storm, and political mercy.",
  },
  {
    name: "Field of Fire",
    era: "Aegon's Conquest",
    conflict: "Targaryen conquest of the Reach and Westerlands",
    location: "The Reach",
    result: "Kings Mern Gardener and Loren Lannister were defeated by three dragons.",
    forces: "Aegon, Visenya, and Rhaenys Targaryen against the Reach and the Rock",
    story:
      "The Field of Fire was the battle where Westeros learned that numbers could lose to terror. Two kings brought the strength of the Reach and the Westerlands into one proud host, only to meet three dragons in open ground. House Gardener ended in ash, House Lannister survived by kneeling, and the age of independent southern kings died in smoke.",
  },
  {
    name: "First Dornish War",
    era: "Targaryen Rule",
    conflict: "Failed conquest of Dorne",
    location: "Dorne",
    result: "Dorne remained unconquered after years of raids, ambushes, and grief.",
    forces: "Targaryen crown forces against Dornish resistance",
    story:
      "The dragonlords could burn castles, but Dorne fought like sand in the hand: scattered, shifting, and impossible to hold. The war became a lesson in terrain, patience, and vengeance. Targaryen victories turned hollow when the Dornish refused to stand still long enough to be ruled.",
  },
  {
    name: "Battle Beneath the God's Eye",
    era: "Dance of the Dragons",
    conflict: "Targaryen Civil War",
    location: "Above the God's Eye",
    result: "Daemon and Aemond Targaryen died in one of the war's most legendary dragon duels.",
    forces: "Daemon on Caraxes against Aemond on Vhagar",
    story:
      "Some battles are armies. This one was two men, two dragons, and a lake waiting below. Caraxes and Vhagar met above the God's Eye in a clash remembered because it feels too sharp to soften into myth. The duel removed two of the Dance's most dangerous blades and left the realm staring at the cost of royal hatred.",
  },
  {
    name: "Battle at Rook's Rest",
    era: "Dance of the Dragons",
    conflict: "Targaryen Civil War",
    location: "Rook's Rest",
    result: "Rhaenys Targaryen died, Sunfyre was maimed, and the greens won at terrible cost.",
    forces: "Rhaenys and Meleys against Aegon, Aemond, Sunfyre, and Vhagar",
    story:
      "Rook's Rest was a trap with wings. Princess Rhaenys came to defend a castle and found enemy dragons waiting. She fought with the dignity of a queen who had been denied a crown, and her death became one of the Dance's bitter songs: a green victory paid for in royal blood, broken scales, and fear.",
  },
  {
    name: "Battle of the Gullet",
    era: "Dance of the Dragons",
    conflict: "Targaryen Civil War",
    location: "The Gullet and Driftmark",
    result: "Velaryon power was battered and the war grew crueler at sea.",
    forces: "Triarchy fleet and green allies against Velaryon and black forces",
    story:
      "The Gullet turned sea lanes into a slaughterhouse. Ships burned, dragons fell upon sails, and the Velaryon hold over the water was badly wounded. It was the sort of battle that maesters list in losses while families remember in empty chairs.",
  },
  {
    name: "Battle by the Lakeshore",
    era: "Dance of the Dragons",
    conflict: "Targaryen Civil War",
    location: "The Riverlands",
    result: "The riverlords won a massive victory remembered as the Fishfeed.",
    forces: "Riverlords and black loyalists against green western forces",
    story:
      "The Fishfeed earned its grim name because the dead were said to fill the waters and fields. It was a riverland answer to invasion: messy, crowded, and merciless. The battle broke a large western host and proved that the Riverlands, so often trampled, could still bite back.",
  },
  {
    name: "Butcher's Ball",
    era: "Dance of the Dragons",
    conflict: "Targaryen Civil War",
    location: "The Riverlands",
    result: "Ser Criston Cole was killed and a green army was destroyed.",
    forces: "Riverland black forces against Criston Cole's column",
    story:
      "The Butcher's Ball was not a graceful knightly ending. Criston Cole, once called Kingmaker, found himself hunted by the consequences he had helped unleash. The battle cut down his force and gave the Riverlands another red page in a war already soaked through.",
  },
  {
    name: "First Battle of Tumbleton",
    era: "Dance of the Dragons",
    conflict: "Targaryen Civil War",
    location: "Tumbleton",
    result: "Dragonseeds betrayed the blacks and the town was savaged.",
    forces: "Black loyalists against green forces and turncloak dragonriders",
    story:
      "Tumbleton was where trust went to die. The betrayal of dragonriders turned a battlefield into a sack, and the town paid for royal politics with fire, fear, and violation. After Tumbleton, even victory sounded like a door being barred from the inside.",
  },
  {
    name: "Second Battle of Tumbleton",
    era: "Dance of the Dragons",
    conflict: "Targaryen Civil War",
    location: "Tumbleton",
    result: "Several dragons and dragonriders died, helping bleed the Dance dry.",
    forces: "Rival black and green remnants with dragons on both sides",
    story:
      "The second fall of Tumbleton felt less like strategy and more like collapse. Ambition, revenge, and exhausted armies collided among ruins already wounded by the first battle. Dragons died with their riders, and the Dance moved closer to the terrible truth that no crown was worth what had been spent.",
  },
  {
    name: "Battle of the Kingsroad",
    era: "Dance of the Dragons",
    conflict: "Targaryen Civil War",
    location: "Near King's Landing",
    result: "The Lads defeated Borros Baratheon and opened the road to peace negotiations.",
    forces: "Riverland and northern black forces against stormland green forces",
    story:
      "The Kingsroad battle was fought by young commanders carrying old grief. Borros Baratheon marched for the greens and met riverlords hardened by years of devastation. His death helped close the Dance's final military chapter, though victory by then tasted more like exhaustion than triumph.",
  },
  {
    name: "Redgrass Field",
    era: "Blackfyre Rebellions",
    conflict: "First Blackfyre Rebellion",
    location: "The Reach",
    result: "Daemon Blackfyre died and Daeron II kept the Iron Throne.",
    forces: "Targaryen loyalists against Blackfyre rebels",
    story:
      "Redgrass Field was the battle of a dream that almost became a dynasty. Daemon Blackfyre fought with the glamour of a warrior king, but the loyalists held, and Bloodraven's arrows helped end the rebel claim. The field settled one war while planting enough bitterness for several more.",
  },
  {
    name: "Whitewalls",
    era: "Blackfyre Rebellions",
    conflict: "Second Blackfyre Rebellion",
    location: "Whitewalls",
    result: "A planned rebellion collapsed before becoming a true war.",
    forces: "Blackfyre conspirators against crown loyalists",
    story:
      "Whitewalls was more conspiracy than battle, but it belongs in the war songs because it shows how rebellions can die in whispers. Lords gathered, ambitions sharpened, and the crown's eyes found them before the realm could burn again. Sometimes the quiet victories save more lives than the loud ones.",
  },
  {
    name: "War of the Ninepenny Kings",
    era: "Targaryen Rule",
    conflict: "Fifth Blackfyre Rebellion",
    location: "The Stepstones",
    result: "Maelys Blackfyre died and the male Blackfyre line ended.",
    forces: "Westerosi crown forces against the Band of Nine",
    story:
      "The Stepstones campaign gave young knights old reputations. Barristan Selmy slew Maelys, Tywin Lannister hardened his name, and many future players in the realm earned scars before they earned titles. The Blackfyre threat ended in the east, but the men who fought there carried its lessons home.",
  },
  {
    name: "Battle of Summerhall",
    era: "Robert's Rebellion",
    conflict: "Robert's Rebellion",
    location: "Summerhall",
    result: "Robert Baratheon won early victories over loyalist forces.",
    forces: "Robert Baratheon against royalist stormlords",
    story:
      "At Summerhall, Robert began turning rebellion from outrage into momentum. He fought his way through loyalist lords who had chosen dragon over stag, winning the kind of early victories that make frightened allies stand taller. The rebellion still needed greater tests, but the storm had found its hammer.",
  },
  {
    name: "Battle of Ashford",
    era: "Robert's Rebellion",
    conflict: "Robert's Rebellion",
    location: "Ashford",
    result: "Robert suffered a setback against Randyll Tarly's forces.",
    forces: "Robert Baratheon against Tyrell and royalist forces",
    story:
      "Ashford proved Robert was not invincible. Randyll Tarly's victory checked the rebel advance and gave the crown a clean note in a war increasingly going wrong. It also showed why the Reach mattered: food, numbers, and disciplined commanders could still slow a legend.",
  },
  {
    name: "Battle of the Bells",
    era: "Robert's Rebellion",
    conflict: "Robert's Rebellion",
    location: "Stoney Sept",
    result: "Rebel forces saved Robert and defeated Jon Connington.",
    forces: "Rebel allies against royalist forces under Jon Connington",
    story:
      "At Stoney Sept, Robert hid while bells rang above a town being searched street by street. The rebels arrived in time, turning a hunt into a battle and a near disaster into a rallying cry. Jon Connington lost more than a fight that day; he lost the crown's chance to cut the rebellion's heart out early.",
  },
  {
    name: "Battle of the Trident",
    era: "Robert's Rebellion",
    conflict: "Robert's Rebellion",
    location: "The Ruby Ford",
    result: "Rhaegar Targaryen died and the rebellion effectively won the war.",
    forces: "Robert Baratheon's rebels against Rhaegar Targaryen's royal host",
    story:
      "The Trident is the rebellion's thunderclap. Rhaegar came with prophecy, command, and the last real hope of the dragon throne. Robert met him in the river with a warhammer, and when the rubies flew from the prince's armor, the realm knew the old dynasty was falling even before King's Landing opened its gates.",
  },
  {
    name: "Sack of King's Landing",
    era: "Robert's Rebellion",
    conflict: "Robert's Rebellion",
    location: "King's Landing",
    result: "The capital fell, Aerys II died, and Robert's victory became certain.",
    forces: "Lannister forces entering the city against Targaryen loyalists",
    story:
      "The Sack of King's Landing was victory stripped of honor. Tywin Lannister arrived late and entered as ally, conqueror, and judge all at once. The city fell into blood and looting, the Mad King died by Jaime's hand, and the new regime was born with ghosts already standing beside the throne.",
  },
  {
    name: "Siege of Storm's End",
    era: "Robert's Rebellion",
    conflict: "Robert's Rebellion",
    location: "Storm's End",
    result: "Stannis Baratheon held the castle until relieved by Eddard Stark.",
    forces: "Baratheon defenders against Tyrell and Redwyne besiegers",
    story:
      "Storm's End endured not through glory, but hunger. Stannis held the walls while the Reach tried to starve the rebellion's home into surrender. Davos Seaworth's onions became legend because survival sometimes arrives in a smuggler's boat instead of a knight's charge.",
  },
  {
    name: "Siege of Pyke",
    era: "Greyjoy Rebellion",
    conflict: "Greyjoy Rebellion",
    location: "Pyke",
    result: "Balon Greyjoy's rebellion was crushed and Theon was taken as ward.",
    forces: "Royal forces under Robert Baratheon against Ironborn rebels",
    story:
      "Pyke fell to a realm that had no patience for another crown. Robert's forces battered the Iron Islands into submission, and the Greyjoy rebellion ended with broken walls and a child carried away as hostage. The sea remained ironborn, but the throne reminded them who ruled the shore.",
  },
  {
    name: "Battle at the Golden Tooth",
    era: "War of the Five Kings",
    conflict: "Lannister invasion of the Riverlands",
    location: "Golden Tooth",
    result: "Jaime Lannister defeated riverland forces and opened the road east.",
    forces: "Lannister army against House Vance and House Piper",
    story:
      "The Golden Tooth was the first hard shove of Lannister power into the Riverlands. Jaime's victory cracked the gate between west and river, setting villages, castles, and grudges into motion. The war had begun to move from insult to invasion.",
  },
  {
    name: "Battle of the Green Fork",
    era: "War of the Five Kings",
    conflict: "Northern campaign south",
    location: "Green Fork of the Trident",
    result: "Tywin Lannister won tactically, while Robb Stark moved elsewhere.",
    forces: "Lannister forces against Roose Bolton's northern host",
    story:
      "The Green Fork was a battle with a hidden purpose. Roose Bolton bled men while Robb Stark slipped toward the true prize. Tywin won the field, but the war's rhythm shifted away from him, proving that a victory can still leave a commander a step behind.",
  },
  {
    name: "Battle of the Whispering Wood",
    era: "War of the Five Kings",
    conflict: "Northern campaign in the Riverlands",
    location: "Whispering Wood",
    result: "Robb Stark captured Jaime Lannister.",
    forces: "Northern and riverland forces against Jaime's Lannister host",
    story:
      "The Whispering Wood made Robb Stark a commander the realm had to respect. Using patience, terrain, and surprise, the Young Wolf trapped Jaime Lannister and shattered his aura of untouchable confidence. In one night, the North gained a hostage and a legend.",
  },
  {
    name: "Battle of the Camps",
    era: "War of the Five Kings",
    conflict: "Relief of Riverrun",
    location: "Riverrun",
    result: "Robb Stark broke the siege of Riverrun.",
    forces: "Northern and Tully forces against Lannister besiegers",
    story:
      "After the Whispering Wood, Robb struck again at the camps around Riverrun. The Lannister siege broke, Edmure Tully was freed from pressure, and riverlords who had been drowning in fear found air again. The victory crowned Robb in all but name before his men made it official.",
  },
  {
    name: "Battle of Oxcross",
    era: "War of the Five Kings",
    conflict: "Northern raid into the Westerlands",
    location: "Oxcross",
    result: "Robb Stark destroyed a Lannister host in the west.",
    forces: "Northern forces against Stafford Lannister's army",
    story:
      "Oxcross was a dawn slaughter born from speed and surprise. Robb carried the war into Lannister country and caught an army before it was ready to become one. For a moment, the lion's own hills heard wolf howls.",
  },
  {
    name: "Battle of the Blackwater",
    era: "War of the Five Kings",
    conflict: "Stannis Baratheon's attack on King's Landing",
    location: "Blackwater Bay",
    result: "King's Landing survived after wildfire and Tyrell-Lannister relief broke Stannis's assault.",
    forces: "Stannis Baratheon against Lannister and Tyrell defenders",
    story:
      "Blackwater was fire on water and panic on stone. Stannis brought ships, discipline, and a claim sharpened by law; the capital answered with wildfire, walls, and a late-arriving alliance. The battle saved Joffrey's throne, raised Tyrion's legend, and made the Tyrells kingmakers in silk.",
  },
  {
    name: "Battle of Duskendale",
    era: "War of the Five Kings",
    conflict: "Northern campaign after the Blackwater",
    location: "Duskendale",
    result: "Northern forces suffered a damaging defeat.",
    forces: "Northern forces against royalist and Lannister-aligned troops",
    story:
      "Duskendale was one of the war's quieter knives. The northern cause, already strained by distance and politics, lost men it could not easily replace. Not every turning point arrives with a king's death; some arrive as a bad march and a worse field.",
  },
  {
    name: "The Red Wedding",
    era: "War of the Five Kings",
    conflict: "Bolton-Frey-Lannister betrayal",
    location: "The Twins",
    result: "Robb Stark, Catelyn Stark, and much of the northern leadership were murdered.",
    forces: "Frey and Bolton conspirators against Stark guests",
    story:
      "The Red Wedding was not a battle in the honorable sense, but the war cannot be told without it. Guest right was butchered alongside kingship, music became a signal for murder, and the North's cause drowned in a feast hall. The realm learned that victory could wear wedding clothes.",
  },
  {
    name: "Battle of Castle Black",
    era: "War Beyond the Wall",
    conflict: "Mance Rayder's assault on the Wall",
    location: "Castle Black",
    result: "The Night's Watch held until Stannis Baratheon arrived.",
    forces: "Night's Watch defenders against the free folk host",
    story:
      "Castle Black was defended by too few men against a people desperate enough to climb the end of the world. Jon Snow's command was forged in fire, arrows, and impossible choices. The Watch survived, but only barely, and the battle revealed that the true danger was still marching behind the free folk.",
  },
  {
    name: "Battle of the Fist of the First Men",
    era: "War Beyond the Wall",
    conflict: "The Great Ranging",
    location: "Beyond the Wall",
    result: "The Night's Watch was devastated by the dead.",
    forces: "Night's Watch rangers against wights and the Others",
    story:
      "At the Fist, the old stories stopped being stories. The Night's Watch found itself surrounded by cold, darkness, and enemies that did not fear wounds. Survivors carried back more than terror; they carried proof that the wars of men were small beside winter.",
  },
  {
    name: "Hardhome",
    era: "War for the Dawn",
    conflict: "Rescue of the free folk",
    location: "Hardhome",
    result: "The dead overwhelmed the settlement while some free folk escaped by sea.",
    forces: "Jon Snow, Night's Watch allies, and free folk against the army of the dead",
    story:
      "Hardhome was a rescue that became a revelation. Jon Snow came for peace and evacuation; he left with the sight of the dead rising in numbers no wall could ignore. The battle's horror was not only who died, but how quickly death became recruitment.",
  },
  {
    name: "Battle of Winterfell",
    era: "Northern Wars",
    conflict: "Bolton rule in the North",
    location: "Winterfell",
    result: "House Stark retook Winterfell from House Bolton.",
    forces: "Stark loyalists and allies against Bolton forces",
    story:
      "The Battle of Winterfell was mud, arrows, panic, and the desperate return of a broken house. Jon Snow fought like a man buried alive before the Vale's arrival broke the Bolton line. When the banners changed on Winterfell's walls, the North had its heart back, though not without scars.",
  },
  {
    name: "Loot Train Attack",
    era: "Daenerys's War",
    conflict: "Targaryen invasion of Westeros",
    location: "The Reach road",
    result: "Daenerys destroyed a Lannister supply column with dragonfire and Dothraki cavalry.",
    forces: "Daenerys Targaryen against Lannister and Tarly forces",
    story:
      "The loot train attack showed Westeros what conquest looked like when a dragon queen stopped waiting. Dothraki riders hit the line like a storm, and Drogon's fire turned disciplined ranks into fleeing shadows. The battle made even hardened soldiers understand why old kings had knelt.",
  },
  {
    name: "The Long Night at Winterfell",
    era: "War for the Dawn",
    conflict: "The living against the dead",
    location: "Winterfell",
    result: "The Night King was destroyed and the dead collapsed.",
    forces: "The living alliance against the army of the dead",
    story:
      "Winterfell became the candle at the edge of the world. Dothraki flames vanished, walls buckled, crypts betrayed the living, and every house present learned the same fear. The war ended not with armies holding a line, but with one killing stroke in the godswood and a silence no survivor would ever fully trust.",
  },
  {
    name: "Burning of King's Landing",
    era: "Daenerys's War",
    conflict: "Fall of Cersei Lannister",
    location: "King's Landing",
    result: "Daenerys took the capital, but the city was devastated by dragonfire.",
    forces: "Daenerys Targaryen's forces against Cersei Lannister's defenders",
    story:
      "King's Landing fell after its bells rang for surrender, and that is why the day remains a wound instead of a triumph. The city's defenses broke, but mercy broke with them. Dragonfire swept through streets, soldiers, and smallfolk alike, leaving the Iron Throne won and morally ruined in the same breath.",
  },
].sort((a, b) => a.name.localeCompare(b.name));

function warSigilStyle(name) {
  const seed = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  const palettes = [
    ["#5e1114", "#0a0908", "#b7b3a8"],
    ["#263848", "#070807", "#8a6d3b"],
    ["#3a0d12", "#171412", "#a99d86"],
    ["#1f3028", "#050505", "#7b8180"],
  ];
  const [one, two, three] = palettes[seed % palettes.length];
  return {
    background: `radial-gradient(circle at 50% 22%, ${three} 0 5%, transparent 6%), radial-gradient(circle at 50% 42%, ${one} 0 21%, transparent 22%), linear-gradient(135deg, ${two}, #030303 72%)`,
    borderColor: three,
  };
}

export default function SongsOfWarPage() {
  const [selectedName, setSelectedName] = useState(battles[0].name);
  const selected = useMemo(() => battles.find((battle) => battle.name === selectedName) || battles[0], [selectedName]);
  const initials = selected.name
    .split(" ")
    .filter((word) => !["the", "of", "at"].includes(word.toLowerCase()))
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return (
    <main className="min-h-screen bg-[#070504] px-4 py-6 text-stone-100">
      <SiteNav className="-mx-4 -mt-6 mb-6" />

      <section className="mx-auto mt-6 grid max-w-7xl gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="gok-panel p-4">
          <p className="gok-eyebrow">Songs of War</p>
          <h1 className="mt-3 text-3xl font-normal uppercase tracking-[0.08em] text-[var(--gok-silver)]">
            Battle Chronicle
          </h1>
          <p className="gok-copy mt-3 text-sm leading-6">
            {"A clickable warbook of Westeros, from ancient shadow wars to dragonfire over King's Landing."}
          </p>
          <div className="mt-5 max-h-[68vh] overflow-y-auto pr-2">
            {battles.map((battle) => (
              <button
                key={battle.name}
                onClick={() => setSelectedName(battle.name)}
                className={`mb-2 block w-full border px-3 py-3 text-left transition ${
                  battle.name === selected.name
                    ? "border-[var(--gok-line-strong)] bg-[rgba(196,193,184,0.12)]"
                    : "border-[var(--gok-line)] bg-black/35 hover:border-[var(--gok-line-strong)]"
                }`}
              >
                <span className="block font-serif text-lg font-black text-[var(--gok-silver)]">{battle.name}</span>
                <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-[var(--gok-dim)]">{battle.era}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="gok-panel overflow-hidden p-0">
          <div className="grid min-h-[720px] lg:grid-cols-[minmax(0,1fr)_460px]">
            <div className="p-6 md:p-10">
              <p className="gok-eyebrow">War Song</p>
              <h2 className="mt-4 font-serif text-5xl font-black text-[var(--gok-silver)] md:text-7xl">{selected.name}</h2>
              <p className="mt-3 text-sm font-black uppercase tracking-[0.24em] text-red-300">{selected.conflict}</p>

              <div className="mt-8 border border-[#8a6d3b] bg-[#c7a976] p-6 text-[#21150b] shadow-[inset_0_0_38px_rgba(73,43,18,0.55)] md:p-8">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-[#4b2418]">Storybook Account</p>
                <p className="mt-4 font-serif text-2xl leading-10 md:text-3xl">{selected.story}</p>
              </div>

              <div className="gok-rule mt-6" />

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="border border-[var(--gok-line)] bg-black/45 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--gok-dim)]">Era</p>
                  <p className="mt-2 text-xl font-black text-[var(--gok-silver)]">{selected.era}</p>
                </div>
                <div className="border border-[var(--gok-line)] bg-black/45 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--gok-dim)]">Location</p>
                  <p className="mt-2 text-xl font-black text-[var(--gok-silver)]">{selected.location}</p>
                </div>
                <div className="border border-[var(--gok-line)] bg-black/45 p-4 sm:col-span-2">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--gok-dim)]">Forces</p>
                  <p className="mt-2 text-xl font-black text-[var(--gok-silver)]">{selected.forces}</p>
                </div>
                <div className="border border-[var(--gok-line)] bg-black/45 p-4 sm:col-span-2">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--gok-dim)]">Result</p>
                  <p className="mt-2 text-xl font-black text-[var(--gok-silver)]">{selected.result}</p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[460px] border-t border-[var(--gok-line)] bg-black/45 p-8 lg:border-l lg:border-t-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(94,17,20,0.24),transparent_34%),linear-gradient(180deg,transparent,rgba(0,0,0,0.62))]" />
              <div className="relative mx-auto mt-8 max-w-[340px] border border-[var(--gok-line)] bg-black/55 p-5">
                <p className="gok-eyebrow">Battle Dossier</p>
                <div className="mt-5 flex aspect-square items-center justify-center border-4 bg-black" style={warSigilStyle(selected.name)}>
                  <p className="font-serif text-7xl font-black text-[var(--gok-silver)]">{initials}</p>
                </div>
                <div className="mt-5 space-y-4">
                  <div className="border border-[var(--gok-line)] bg-black/45 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--gok-dim)]">Chronicle</p>
                    <p className="mt-2 font-serif text-2xl font-black text-[var(--gok-silver)]">{selected.name}</p>
                  </div>
                  <div className="border border-[var(--gok-line)] bg-black/45 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--gok-dim)]">Conflict</p>
                    <p className="mt-2 text-xl font-black text-[var(--gok-silver)]">{selected.conflict}</p>
                  </div>
                  <div className="border border-[var(--gok-line)] bg-black/45 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--gok-dim)]">Archive Count</p>
                    <p className="mt-2 text-xl font-black text-[var(--gok-silver)]">{battles.length} war songs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
