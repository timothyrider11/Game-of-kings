export const artifactVault = [
  "Longclaw", "Dark Sister", "Blackfyre", "Heartsbane", "Ice", "Dawn", "Oathkeeper", "Widow's Wail", "Lady Forlorn", "Red Rain",
  "Brightroar", "Lamentation", "Orphan-Maker", "Truth", "Vigilance", "Dragonbone Bow", "Dragon Eggs", "Aegon's Crown", "Jaehaerys' Crown", "Robb Stark's Crown",
  "The Conqueror's Seal", "The Hand's Chain", "Targaryen Royal Signet", "Hightower Star Map", "Glass Candle", "Horn of Winter", "Dragonbinder", "Weirwood Crown",
  "Valyrian Steel Dagger", "Catspaw Dagger", "Needle", "Robert's Warhammer", "Ruby Ford Rubies", "Rhaegar's Silver Harp", "The Painted Table", "The Iron Throne Shard",
  "Nymeria's War Banner", "Rhoynar Sun Spear", "Golden Company Contract", "Blackfyre War Standard", "Faceless Iron Coin", "Maester's Valyrian Link", "Night's Watch Horn",
  "Ravenry Master Key", "Oldtown Observatory Lens", "Dornish Treaty Scroll", "Kingsguard White Cloak", "Seastone Chair Fragment", "Driftwood Crown", "Ancient Royal Seal",
];

export function rollArtifact(chance = 0.01) {
  if (Math.random() >= chance) return null;
  return artifactVault[Math.floor(Math.random() * artifactVault.length)];
}
