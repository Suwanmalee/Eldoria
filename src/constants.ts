export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const CONTRACT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function owner() view returns (address)",
  "function nextTokenId() view returns (uint256)",
  "function weapons(uint256) view returns (string itemName, string description, string image, bool isUsed, address owner)",
  "function ownerWeapons(address, uint256) view returns (uint256)",
  "function imageMinted(string) view returns (bool)",
  "function mintWeapon(address to, string itemName, string description, string image) public",
  "function getMyWeapons() view returns (tuple(string itemName, string description, string image, bool isUsed, address owner)[])",
  "function markAsUsed(uint256 tokenId) public",
  "function useWeapon(uint256 tokenId) public",
  "function getWeapon(uint256 tokenId) view returns (tuple(string itemName, string description, string image, bool isUsed, address owner))"
];

export const MONSTERS = [
  {
    name: "Soul Wraith",
    image: "https://res.cloudinary.com/dkyzhwy4w/image/upload/v1760089759/soul_wraith_alt_jibnvu.png",
    hp: 100,
    maxHp: 100,
    atk: 10,
    def: 5
  },
  {
    name: "Tormented Ghoul",
    image: "https://res.cloudinary.com/dkyzhwy4w/image/upload/v1760089760/tormented_ghoul_alt_bv0wkn.png",
    hp: 120,
    maxHp: 120,
    atk: 12,
    def: 8
  },
  {
    name: "Undead Knight",
    image: "https://res.cloudinary.com/dkyzhwy4w/image/upload/v1760089760/undead_knight_alt_zfkml3.png",
    hp: 150,
    maxHp: 150,
    atk: 15,
    def: 12
  },
  {
    name: "Grave Titan",
    image: "https://res.cloudinary.com/dkyzhwy4w/image/upload/v1760089753/grave_titan_alt_fapkid.png",
    hp: 300,
    maxHp: 300,
    atk: 25,
    def: 20
  },
  {
    name: "Zombie Mage",
    image: "https://res.cloudinary.com/dkyzhwy4w/image/upload/v1760089767/zombie_mage_alt_qcejvr.png",
    hp: 110,
    maxHp: 110,
    atk: 20,
    def: 5
  }
];

export const CARDS = [
  { id: 1, name: "Strike", type: "ATK", value: 15, image: "https://res.cloudinary.com/dp9xmkdvd/image/upload/v1774592653/card1_hrglra.png" },
  { id: 2, name: "Shield", type: "DEF", value: 10, image: "https://res.cloudinary.com/dp9xmkdvd/image/upload/v1774592653/card2_qckrxt.png" },
  { id: 3, name: "Heavy Blow", type: "ATK", value: 25, image: "https://res.cloudinary.com/dp9xmkdvd/image/upload/v1774592653/card3_id1bya.png" },
  { id: 4, name: "Guard", type: "DEF", value: 15, image: "https://res.cloudinary.com/dp9xmkdvd/image/upload/v1774592653/card4_ayja0l.png" },
  { id: 5, name: "Berserk", type: "ATK", value: 40, image: "https://res.cloudinary.com/dp9xmkdvd/image/upload/v1774592653/card5_lhq4w8.png" },
  { id: 6, name: "Iron Wall", type: "DEF", value: 30, image: "https://res.cloudinary.com/dp9xmkdvd/image/upload/v1774592653/card6_nvy664.png" }
];

export const BACKGROUND_IMAGE = "https://res.cloudinary.com/dkyzhwy4w/image/upload/v1760088968/background_me6s3b.jpg";

export const WEAPON_POOL = [
  { name: "Soul Reaver", description: "A blade that thirsts for spectral essence.", image: "https://res.cloudinary.com/dkyzhwy4w/image/upload/v1760089759/soul_wraith_alt_jibnvu.png" },
  { name: "Ghoul Smasher", description: "Heavy mace designed to crush the undead.", image: "https://res.cloudinary.com/dkyzhwy4w/image/upload/v1760089760/tormented_ghoul_alt_bv0wkn.png" },
  { name: "Knight's Honor", description: "The sword of a fallen hero.", image: "https://res.cloudinary.com/dkyzhwy4w/image/upload/v1760089760/undead_knight_alt_zfkml3.png" },
  { name: "Titan's Bane", description: "A weapon forged to fell giants.", image: "https://res.cloudinary.com/dkyzhwy4w/image/upload/v1760089753/grave_titan_alt_fapkid.png" },
  { name: "Mage's Staff", description: "Infused with dark necrotic energy.", image: "https://res.cloudinary.com/dkyzhwy4w/image/upload/v1760089767/zombie_mage_alt_qcejvr.png" }
];
