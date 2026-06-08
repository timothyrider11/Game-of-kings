"use client";

import { useMemo, useState } from "react";
import SiteNav from "../../components/SiteNav";

const characters = [
  ["Aegon I Targaryen", "House Targaryen", "The Conqueror who forged the Seven Kingdoms with dragons, sisters, and fire. His legacy sits behind every royal claim in Westeros.", "Dragonlord King"],
  ["Aegon II Targaryen", "House Targaryen", "A disputed king of the Dance of the Dragons whose reign became a brutal lesson in succession, pride, and dragonfire.", "Contested King"],
  ["Aemond Targaryen", "House Targaryen", "The one-eyed rider of Vhagar, remembered for ferocity, grievance, and a dangerous hunger to prove himself.", "Rider of Vhagar"],
  ["Aemon Targaryen", "Night's Watch", "A maester of the Watch who chose duty over crowns and carried Targaryen memory quietly at Castle Black.", "Maester"],
  ["Aerys II Targaryen", "House Targaryen", "The Mad King whose paranoia and cruelty helped bring the Targaryen dynasty crashing down.", "Fallen King"],
  ["Alicent Hightower", "House Hightower", "A queen, mother, and political force whose court loyalties helped ignite the Dance of the Dragons.", "Green Queen"],
  ["Arya Stark", "House Stark", "A Stark daughter shaped by war, loss, Braavos, and a fierce refusal to become what others expected.", "Faceless Wolf"],
  ["Baela Targaryen", "House Targaryen", "A bold dragonrider of royal blood, known for courage, temper, and the fire of House Targaryen.", "Dragonrider"],
  ["Balon Greyjoy", "House Greyjoy", "Lord of the Iron Islands, stubborn in his dream of independence and old reaving glory.", "Lord Reaper"],
  ["Barristan Selmy", "Kingsguard", "A legendary knight whose honor and sword skill made him one of the great names of the Kingsguard.", "Bold Knight"],
  ["Beric Dondarrion", "House Dondarrion", "A lightning lord returned from death again and again, carrying a strange purpose through the war-torn Riverlands.", "Lightning Lord"],
  ["Bran Stark", "House Stark", "A broken boy who became something older and stranger, tied to memory, ravens, weirwoods, and the long sight.", "Three Eyed Raven"],
  ["Brienne of Tarth", "House Tarth", "A warrior of rare loyalty and uncommon honor, carrying vows through a realm that mocks what it needs most.", "Knight of Tarth"],
  ["Bronn", "Sellsword", "A sharp sellsword who survives by wit, timing, and knowing exactly what people are willing to pay for.", "Cutthroat Lord"],
  ["Brynden Rivers", "House Targaryen", "Bloodraven: bastard, sorcerer, spymaster, and greenseer whose thousand eyes watched the realm from shadow.", "Bloodraven"],
  ["Catelyn Stark", "House Tully", "Lady of Winterfell, mother of wolves, and a woman whose family loyalties shaped the early War of the Five Kings.", "Lady Stark"],
  ["Cersei Lannister", "House Lannister", "A queen of pride, fear, and ruthless love for her children, always fighting the walls closing around her.", "Lion Queen"],
  ["Criston Cole", "Kingsguard", "A knight whose broken loyalties and fierce pride helped turn court tension into civil war.", "Kingmaker"],
  ["Daemon Targaryen", "House Targaryen", "The Rogue Prince, dangerous and charismatic, as comfortable in war as in scandal.", "Rogue Prince"],
  ["Daenerys Targaryen", "House Targaryen", "The last dragon queen of exile, breaker of chains, and claimant whose mercy and fire became impossible to separate.", "Mother of Dragons"],
  ["Davos Seaworth", "House Seaworth", "An onion knight raised by honesty, loyalty, and a rare talent for telling kings what they do not want to hear.", "Onion Knight"],
  ["Eddard Stark", "House Stark", "Lord of Winterfell, remembered for honor, hard choices, and the dangerous cost of truth in King's Landing.", "Quiet Wolf"],
  ["Ellaria Sand", "Dorne", "A Dornish paramour whose grief and vengeance became tangled in the politics of Sunspear.", "Dornish Viper"],
  ["Gendry", "House Baratheon", "A royal bastard and smith whose bloodline carries more danger than he ever asked for.", "Storm-Blood Smith"],
  ["Gregor Clegane", "House Clegane", "The Mountain: a brutal instrument of terror whose name alone can empty a road.", "The Mountain"],
  ["Helaena Targaryen", "House Targaryen", "A gentle queen and dreamer whose strange words often sound like prophecy after the blood has already spilled.", "Dreaming Queen"],
  ["Jaime Lannister", "House Lannister", "Kingslayer, knight, brother, and man caught between reputation, love, shame, and a buried wish for honor.", "Golden Lion"],
  ["Jaqen H'ghar", "Faceless Men", "A servant of the Many-Faced God whose gifts come wrapped in riddles and death.", "Faceless Man"],
  ["Joffrey Baratheon", "House Baratheon", "A cruel boy king whose crown made every weakness sharper and every whim deadly.", "Boy King"],
  ["Jon Snow", "House Stark", "A bastard of Winterfell, brother of the Watch, and reluctant leader drawn again and again toward impossible duty.", "White Wolf"],
  ["Jorah Mormont", "House Mormont", "An exiled knight whose loyalty to Daenerys is marked by shame, longing, and stubborn courage.", "Exiled Bear"],
  ["Laena Velaryon", "House Velaryon", "A dragonrider of Driftmark, remembered for fire, pride, and the great dragon Vhagar.", "Sea Dragon"],
  ["Laenor Velaryon", "House Velaryon", "A dragonrider and heir of Driftmark, caught between duty, court expectation, and private truth.", "Velaryon Heir"],
  ["Larys Strong", "House Strong", "A quiet spider of Harrenhal, trading in secrets, patience, and the power of being underestimated.", "Clubfoot"],
  ["Loras Tyrell", "House Tyrell", "The Knight of Flowers, bright in tourneys and dangerous in the politics of beauty and reputation.", "Knight of Flowers"],
  ["Margaery Tyrell", "House Tyrell", "A queenly player of soft power, public kindness, and careful ambition.", "Rose Queen"],
  ["Melisandre", "Asshai", "A red priestess whose visions, fires, and certainty bring both miracles and ruin.", "Red Woman"],
  ["Mysaria", "Lys", "The White Worm, a listener in the walls of power whose whispers travel farther than armies.", "White Worm"],
  ["Nymeria", "Rhoynar", "A warrior queen who brought the Rhoynar to Dorne and reshaped a kingdom through exile and alliance.", "Rhoynar Queen"],
  ["Oberyn Martell", "House Martell", "The Red Viper of Dorne, brilliant, sensual, deadly, and unwilling to let old crimes sleep.", "Red Viper"],
  ["Otto Hightower", "House Hightower", "A calculating Hand whose patience and ambition helped steer the realm toward the Dance.", "Hand of the King"],
  ["Petyr Baelish", "House Baelish", "Littlefinger, a master of debt, desire, and chaos who climbs best when others are falling.", "Littlefinger"],
  ["Rhaegar Targaryen", "House Targaryen", "A silver prince of prophecy, song, and tragedy whose choices reshaped the realm.", "Dragon Prince"],
  ["Rhaenys Targaryen", "House Targaryen", "The Queen Who Never Was, a dragonrider of dignity, pride, and power denied.", "Queen Who Never Was"],
  ["Rhaenyra Targaryen", "House Targaryen", "Named heir to the Iron Throne, her claim became the burning heart of the Dance of the Dragons.", "Black Queen"],
  ["Robb Stark", "House Stark", "The Young Wolf, crowned by northern swords and undone by love, honor, and betrayal.", "Young Wolf"],
  ["Robert Baratheon", "House Baratheon", "A warrior king who won a throne with a hammer and lost himself in the peace that followed.", "Usurper King"],
  ["Sansa Stark", "House Stark", "A northern daughter who survives courts, cages, and cruelty by learning the shape of power.", "Lady of Winterfell"],
  ["Sandor Clegane", "House Clegane", "The Hound, scarred by fire and violence, with a hard shell around a stubborn human core.", "The Hound"],
  ["Stannis Baratheon", "House Baratheon", "A rigid claimant to the throne, defined by law, grievance, endurance, and terrible choices.", "The Mannis"],
  ["Theon Greyjoy", "House Greyjoy", "A ward, prince, betrayer, captive, and broken man searching for the name he can still live with.", "Turncloak"],
  ["Tormund Giantsbane", "Free Folk", "A loud-hearted free folk warrior whose stories are as large as his appetite for battle and life.", "Free Folk Champion"],
  ["Tyrion Lannister", "House Lannister", "A sharp mind in a hostile family, surviving by wit, wine, reading, and dangerous honesty.", "Imp of Casterly Rock"],
  ["Tywin Lannister", "House Lannister", "Lord of Casterly Rock, a ruthless architect of power who mistakes fear for permanence.", "Great Lion"],
  ["Varys", "King's Landing", "The Spider, a master of whispers who claims to serve the realm while moving unseen pieces.", "Master of Whisperers"],
  ["Viserys I Targaryen", "House Targaryen", "A king who wanted peace and family, but left behind a succession wound deep enough for dragons.", "Peaceful King"],
  ["Viserys III Targaryen", "House Targaryen", "The beggar king of exile, consumed by the throne he believed was stolen from him.", "Beggar King"],
  ["Ygritte", "Free Folk", "A fierce spearwife whose love and freedom challenged Jon Snow's vows and certainty.", "Spearwife"],
].sort(([a], [b]) => a.localeCompare(b));

const characterImages = {
  "Aegon I Targaryen": [{ kind: "Illustrated Reference", title: "Aegon I Targaryen", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/4/41/Aegon_the_Conqueror.png/revision/latest?cb=20171215014730" }],
  "Aegon II Targaryen": [{ kind: "Show Portrait", title: "Aegon II Targaryen", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/a/a1/AegonII-S3-Profile.png/revision/latest/scale-to-width-down/648?cb=20260522073705" }],
  "Aemond Targaryen": [{ kind: "Show Portrait", title: "Aemond Targaryen", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/4/4f/Aemond_Targaryen_S2.jpg/revision/latest/scale-to-width-down/684?cb=20240606091326" }],
  "Aemon Targaryen": [{ kind: "Show Portrait", title: "Aemon", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/3/32/Aemonepisode5.png/revision/latest?cb=20190427054732" }],
  "Aerys II Targaryen": [{ kind: "Show Portrait", title: "Aerys II Targaryen", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/4/47/Aerys_II_Targaryen_Mad_King.jpg/revision/latest/scale-to-width-down/742?cb=20170821102509" }],
  "Alicent Hightower": [{ kind: "Show Portrait", title: "Alicent Hightower", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/1/18/AlicentASfASInfobox.PNG/revision/latest?cb=20240621112258" }],
  "Arya Stark": [{ kind: "Show Portrait", title: "Arya Stark", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/b/be/AryaShipIronThrone.PNG/revision/latest?cb=20190520174300" }],
  "Baela Targaryen": [{ kind: "Show Portrait", title: "Baela Targaryen", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/8/8d/BaelaTargaryen2x03.PNG/revision/latest?cb=20240629002449" }],
  "Balon Greyjoy": [{ kind: "Show Portrait", title: "Balon Greyjoy", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/1/19/Balon-profile.png/revision/latest/scale-to-width-down/825?cb=20170420085750" }],
  "Barristan Selmy": [{ kind: "Show Portrait", title: "Barristan Selmy", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/1/1f/Barristan_Selmy_Sons_of_the_Harpy.jpg/revision/latest?cb=20150504180820" }],
  "Beric Dondarrion": [{ kind: "Show Portrait", title: "Beric Dondarrion", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/4/44/803_Beric_Promo_Crop.png/revision/latest?cb=20190503201035" }],
  "Bran Stark": [{ kind: "Show Portrait", title: "Bran Stark", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/8/81/KingBran.PNG/revision/latest?cb=20190520173855" }],
  "Brienne of Tarth": [{ kind: "Show Portrait", title: "Brienne of Tarth", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/a/a9/S8_Brienne_Profil.jpg/revision/latest?cb=20190423165941" }],
  "Bronn": [{ kind: "Show Portrait", title: "Bronn", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/f/f5/Bronn_S8E6.png/revision/latest?cb=20210722075802" }],
  "Brynden Rivers": [{ kind: "Show Portrait", title: "Brynden Rivers", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/a/a8/Oathbreaker_05.jpg/revision/latest/scale-to-width-down/561?cb=20170818202718" }],
  "Catelyn Stark": [{ kind: "Show Portrait", title: "Catelyn Stark", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/d/d8/CatelynS3Promo.jpg/revision/latest?cb=20190427043743" }],
  "Cersei Lannister": [{ kind: "Show Portrait", title: "Cersei Lannister", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/b/b0/CERSEIBATTLEOFKINGSLANDING.PNG/revision/latest?cb=20190906021534" }],
  "Criston Cole": [{ kind: "Show Portrait", title: "Criston Cole", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/d/d3/Criston_Hand_of_the_King.jpg/revision/latest/scale-to-width-down/585?cb=20240628122731" }],
  "Daemon Targaryen": [{ kind: "Show Portrait", title: "Daemon Targaryen", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/a/a0/Daemon_Targaryen_S2_Infobox.png/revision/latest/scale-to-width-down/711?cb=20231202204159" }],
  "Daenerys Targaryen": [{ kind: "Show Portrait", title: "Daenerys Targaryen", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/4/4f/Daenerys_Season_8.jpg/revision/latest/scale-to-width-down/541?cb=20190415212013" }],
  "Davos Seaworth": [{ kind: "Show Portrait", title: "Davos Seaworth", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/9/9d/DAVOSINFOBOXBELLS.PNG/revision/latest?cb=20190513052340" }],
  "Eddard Stark": [{ kind: "Show Portrait", title: "Eddard Stark", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/3/34/Eddard_Stark.jpg/revision/latest/scale-to-width-down/642?cb=20190701140812" }],
  "Ellaria Sand": [{ kind: "Show Portrait", title: "Ellaria Sand", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/4/4c/Ellaria_Sand_The_End.png/revision/latest/scale-to-width-down/598?cb=20170830014137" }],
  "Gendry": [{ kind: "Show Portrait", title: "Gendry Baratheon", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/7/7b/GendryBaratheon.png/revision/latest?cb=20190520221935" }],
  "Gregor Clegane": [{ kind: "Show Portrait", title: "Gregor Clegane", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/8/81/GregorGregorLightenedProfile.png/revision/latest?cb=20190724144505" }],
  "Helaena Targaryen": [{ kind: "Show Portrait", title: "Helaena Targaryen", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/6/60/HelaenaASfASInfobox.PNG/revision/latest?cb=20240621111347" }],
  "Jaime Lannister": [{ kind: "Show Portrait", title: "Jaime Lannister", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/5/51/JaimeLannisterSeason8.PNG/revision/latest?cb=20190207112813" }],
  "Jaqen H'ghar": [{ kind: "Show Portrait", title: "Jaqen H'ghar", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/d/da/The_Door_Jaqen_infobox.jpg/revision/latest/scale-to-width-down/580?cb=20160808073200" }],
  "Joffrey Baratheon": [{ kind: "Show Portrait", title: "Joffrey Baratheon", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/2/25/Joffrey_Season_4_Episode_2_TLATR.jpg/revision/latest/scale-to-width-down/541?cb=20210722092942" }],
  "Jon Snow": [{ kind: "Show Portrait", title: "Jon Snow", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/d/d0/JonSnow8x06.PNG/revision/latest?cb=20190714094440" }],
  "Jorah Mormont": [{ kind: "Show Portrait", title: "Jorah Mormont", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/2/26/Winterfell_ep_Jorah_s8.jpg/revision/latest?cb=20210722093523" }],
  "Laena Velaryon": [{ kind: "Show Portrait", title: "Laena Velaryon", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/a/ab/Laena_Velaryon_Official_Guide_3.jpg/revision/latest?cb=20220926034616" }],
  "Laenor Velaryon": [{ kind: "Show Portrait", title: "Laenor Velaryon", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/5/50/Laenor_Velaryon_Official_Guide_3.jpg/revision/latest?cb=20220926034629" }],
  "Larys Strong": [{ kind: "Show Portrait", title: "Larys Strong", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/7/76/Larys_Strong_S2.jpg/revision/latest/scale-to-width-down/671?cb=20240606091503" }],
  "Loras Tyrell": [{ kind: "Show Portrait", title: "Loras Tyrell", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/0/02/LorasTyrell5X06.PNG/revision/latest?cb=20181013200613" }],
  "Margaery Tyrell": [{ kind: "Show Portrait", title: "Margaery Tyrell", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/b/b5/Margaery_Tyrell_S6.png/revision/latest?cb=20210722163311" }],
  "Melisandre": [{ kind: "Show Portrait", title: "Melisandre", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/0/07/Melisandre_%28The_Queen%27s_Justice%29.png/revision/latest?cb=20170830235514" }],
  "Mysaria": [{ kind: "Show Portrait", title: "Mysaria", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/2/26/1x9_Mysaria.jpg/revision/latest/scale-to-width-down/683?cb=20221204124508" }],
  "Nymeria": [{ kind: "Illustrated Reference", title: "Nymeria", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/9/97/Nymeria_warrior_queen.png/revision/latest?cb=20150302195203" }],
  "Oberyn Martell": [{ kind: "Show Portrait", title: "Oberyn Martell", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/4/44/Oberyn-Martell-house-martell_s3.jpg/revision/latest/scale-to-width-down/518?cb=20190427200207" }],
  "Otto Hightower": [{ kind: "Show Portrait", title: "Otto Hightower", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/2/2a/Otto-S2.png/revision/latest?cb=20240621093634" }],
  "Petyr Baelish": [{ kind: "Show Portrait", title: "Petyr Baelish", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/9/9f/Profile-Littlefinger.png/revision/latest?cb=20170826005231" }],
  "Rhaegar Targaryen": [{ kind: "Show Portrait", title: "Rhaegar Targaryen", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/5/51/Rhaeger_main_infobox.png/revision/latest/scale-to-width-down/550?cb=20210722174123" }],
  "Rhaenys Targaryen": [{ kind: "Show Portrait", title: "Rhaenys Targaryen", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/3/39/S2_Rhaenys_Targaryen_Infobox.jpg/revision/latest/scale-to-width-down/708?cb=20240708102159" }],
  "Rhaenyra Targaryen": [{ kind: "Show Portrait", title: "Rhaenyra Targaryen", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/5/5f/Queen_Rhaenyra.jpg/revision/latest/scale-to-width-down/633?cb=20221024065800" }],
  "Robb Stark": [{ kind: "Show Portrait", title: "Robb Stark", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/5/50/S3E9_Robb_Stark_main.jpg/revision/latest/scale-to-width-down/588?cb=20160718071203" }],
  "Robert Baratheon": [{ kind: "Show Portrait", title: "Robert Baratheon", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/4/43/Robert_crop.png/revision/latest?cb=20210223122212" }],
  "Sansa Stark": [{ kind: "Show Portrait", title: "Sansa Stark", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/6/63/QueenSansa.PNG/revision/latest?cb=20210215100224" }],
  "Sandor Clegane": [{ kind: "Show Portrait", title: "Sandor Clegane", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/b/b5/SandorConfrontsGregor.PNG/revision/latest?cb=20210722093812" }],
  "Stannis Baratheon": [{ kind: "Show Portrait", title: "Stannis Baratheon", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/2/2f/StannisNew.png/revision/latest?cb=20210313165449" }],
  "Theon Greyjoy": [{ kind: "Show Portrait", title: "Theon Greyjoy", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/7/78/TheonS8E1.PNG/revision/latest?cb=20190415192721" }],
  "Tormund Giantsbane": [{ kind: "Show Portrait", title: "Tormund", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/9/97/Tormund_Profile.PNG/revision/latest?cb=20170818044433" }],
  "Tyrion Lannister": [{ kind: "Show Portrait", title: "Tyrion Lannister", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/9/95/HandoftheKingTyrionLannister.PNG/revision/latest?cb=20190520175204" }],
  "Tywin Lannister": [{ kind: "Show Portrait", title: "Tywin Lannister", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/7/71/Tywin_Lannister_4x08.jpg/revision/latest/scale-to-width-down/627?cb=20170830015346" }],
  "Varys": [{ kind: "Show Portrait", title: "Varys", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/f/ff/Varys8x05Dragonstone.PNG/revision/latest?cb=20190513041715" }],
  "Viserys I Targaryen": [{ kind: "Show Portrait", title: "Viserys I Targaryen", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/3/38/Viserys_I_Targaryen_Official_Guide.jpg/revision/latest?cb=20220826232345" }],
  "Ygritte": [{ kind: "Show Portrait", title: "Ygritte", source: "gameofthrones.fandom.com", src: "https://static.wikia.nocookie.net/gameofthrones/images/2/28/Ygritte-promotionals4pic.jpg/revision/latest/scale-to-width-down/601?cb=20170107042949" }],
};

function portraitStyle(name, house) {
  const seed = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  const palettes = [
    ["#5e1114", "#070807", "#8a6d3b"],
    ["#183c42", "#070807", "#b7b3a8"],
    ["#263848", "#101f19", "#68716f"],
    ["#3a0d12", "#151716", "#a99d86"],
    ["#4a3728", "#070807", "#8d9693"],
  ];
  const [one, two, three] = palettes[seed % palettes.length];
  return {
    background: `radial-gradient(circle at 50% 28%, ${three} 0 8%, transparent 9%), radial-gradient(circle at 50% 42%, ${one} 0 22%, transparent 23%), linear-gradient(135deg, ${two}, #030303 72%)`,
    borderColor: three,
    boxShadow: `inset 0 0 28px rgba(0,0,0,.72), 0 18px 38px rgba(0,0,0,.5)`,
  };
}

export default function ThreeEyedRavenPage() {
  const [selectedName, setSelectedName] = useState(characters[0][0]);
  const selected = useMemo(() => characters.find(([name]) => name === selectedName) || characters[0], [selectedName]);
  const [name, house, lore, title] = selected;
  const images = characterImages[name] || [];
  const primaryImage = images[0];
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <main className="min-h-screen bg-[#070504] px-4 py-6 text-stone-100">
      <SiteNav className="-mx-4 -mt-6 mb-6" />

      <section className="mx-auto mt-6 grid max-w-7xl gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="gok-panel p-4">
          <p className="gok-eyebrow">Three Eyed Raven</p>
          <h1 className="mt-3 text-3xl font-normal uppercase tracking-[0.08em] text-[var(--gok-silver)]">
            Character Archive
          </h1>
          <p className="gok-copy mt-3 text-sm leading-6">
            A raven-index of notable names, sorted alphabetically for quick browsing.
          </p>
          <div className="mt-5 max-h-[68vh] overflow-y-auto pr-2">
            {characters.map(([characterName, characterHouse]) => (
              <button
                key={characterName}
                onClick={() => setSelectedName(characterName)}
                className={`mb-2 block w-full border px-3 py-3 text-left transition ${
                  characterName === name
                    ? "border-[var(--gok-line-strong)] bg-[rgba(196,193,184,0.12)]"
                    : "border-[var(--gok-line)] bg-black/35 hover:border-[var(--gok-line-strong)]"
                }`}
              >
                <span className="block font-serif text-lg font-black text-[var(--gok-silver)]">{characterName}</span>
                <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-[var(--gok-dim)]">{characterHouse}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="gok-panel overflow-hidden p-0">
          <div className="grid min-h-[720px] lg:grid-cols-[minmax(0,1fr)_460px]">
            <div className="p-6 md:p-10">
              <p className="gok-eyebrow">Raven File</p>
              <h2 className="mt-4 font-serif text-5xl font-black text-[var(--gok-silver)] md:text-7xl">{name}</h2>
              <p className="mt-3 text-sm font-black uppercase tracking-[0.24em] text-red-300">{title}</p>
              <div className="mt-6 overflow-hidden border border-[var(--gok-line)] bg-black/60 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                {primaryImage ? (
                  <img src={primaryImage.src} alt={name} className="max-h-[460px] w-full object-cover object-top" />
                ) : (
                  <div className="flex min-h-80 items-center justify-center" style={portraitStyle(name, house)}>
                    <p className="font-serif text-7xl font-black text-[var(--gok-silver)]">{initials}</p>
                  </div>
                )}
                <div className="border-t border-[var(--gok-line)] bg-black/72 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--gok-dim)]">
                    {primaryImage ? `${primaryImage.kind} from ${primaryImage.source}` : "Styled raven archive portrait"}
                  </p>
                </div>
              </div>
              <div className="gok-rule mt-6" />
              <div className="mt-8 border border-[#8a6d3b] bg-[#c7a976] p-6 text-[#21150b] shadow-[inset_0_0_38px_rgba(73,43,18,0.55)] md:p-8">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-[#4b2418]">Recorded Lore</p>
                <p className="mt-4 font-serif text-2xl leading-10 md:text-3xl">{lore}</p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="border border-[var(--gok-line)] bg-black/45 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--gok-dim)]">Affiliation</p>
                  <p className="mt-2 text-xl font-black text-[var(--gok-silver)]">{house}</p>
                </div>
                <div className="border border-[var(--gok-line)] bg-black/45 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--gok-dim)]">Archive Order</p>
                  <p className="mt-2 text-xl font-black text-[var(--gok-silver)]">Alphabetical</p>
                </div>
              </div>
              <div className="mt-6 border border-[var(--gok-line)] bg-black/45 p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--gok-dim)]">Visual Records</p>
                <p className="mt-2 text-sm leading-6 text-[rgba(210,205,194,0.62)]">
                  Portraits are pulled from public Thrones wiki image records where available. Some ancient or book-first figures use illustrated references instead of show stills.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {images.length ? (
                    images.map((image) => (
                      <div
                        key={`${image.kind}-${image.src}`}
                        className="border border-[var(--gok-line)] bg-black/50 p-3 transition hover:border-[var(--gok-line-strong)]"
                      >
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">{image.kind}</p>
                        <p className="mt-1 text-sm font-bold text-[var(--gok-silver)]">{image.title}</p>
                        <p className="mt-1 text-xs text-[var(--gok-dim)]">{image.source}</p>
                      </div>
                    ))
                  ) : (
                    <div className="border border-[var(--gok-line)] bg-black/50 p-3">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--gok-dim)]">Pending Image</p>
                      <p className="mt-1 text-sm text-[rgba(210,205,194,0.62)]">No clean public image URL found yet. The raven keeps a styled archive portrait for now.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="relative min-h-[460px] border-t border-[var(--gok-line)] bg-black/45 p-8 lg:border-l lg:border-t-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(196,193,184,0.16),transparent_34%),linear-gradient(180deg,transparent,rgba(0,0,0,0.58))]" />
              <div className="relative mx-auto mt-8 aspect-[3/4] max-w-[340px] overflow-hidden border-4 bg-black" style={portraitStyle(name, house)}>
                {primaryImage ? (
                  <img src={primaryImage.src} alt={name} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <>
                    <div className="absolute inset-x-[24%] top-[16%] aspect-square rounded-full border border-[rgba(196,193,184,0.3)] bg-[radial-gradient(circle_at_38%_28%,rgba(255,255,255,0.28),transparent_18%),linear-gradient(135deg,#8d9693,#2b2116)]" />
                    <div className="absolute inset-x-[18%] bottom-[18%] h-[42%] rounded-t-[50%] border border-[rgba(196,193,184,0.18)] bg-[linear-gradient(135deg,rgba(94,17,20,.9),rgba(7,8,7,.95))]" />
                  </>
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.92))]" />
                <div className="absolute inset-x-6 bottom-6 border border-[rgba(196,193,184,0.3)] bg-black/72 px-4 py-3 text-center">
                  <p className="font-serif text-3xl font-black text-[var(--gok-silver)]">{name}</p>
                  <p className="mt-1 text-[0.62rem] font-black uppercase tracking-[0.2em] text-[var(--gok-dim)]">
                    {primaryImage ? primaryImage.kind : `Raven Portrait ${initials}`}
                  </p>
                </div>
              </div>
              {images.length > 1 && (
                <div className="relative mt-5 grid grid-cols-2 gap-3">
                  {images.slice(1).map((image) => (
                    <div key={image.src} className="aspect-[4/3] overflow-hidden border border-[var(--gok-line)] bg-black">
                      <img src={image.src} alt={`${name} ${image.kind}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
