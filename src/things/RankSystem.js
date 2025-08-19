const ranks = [
  { min: 0, max: 5, title: "Newbie" },
  { min: 6, max: 10, title: "Apprentice" },
  { min: 11, max: 15, title: "Rookie" },
  { min: 16, max: 20, title: "Runner" },
  { min: 21, max: 25, title: "Acrobat" },
  { min: 26, max: 30, title: "Ninja-in-Training" },
  { min: 31, max: 35, title: "Blade Master" },
  { min: 36, max: 40, title: "Shadow Warrior" },
  { min: 41, max: 45, title: "Combo King" },
  { min: 46, max: 50, title: "Platform Ninja" },
  { min: 51, max: 55, title: "Flash Conduit" },
  { min: 56, max: 60, title: "Gravity God" },
  { min: 61, max: 65, title: "Omega Runner" },
  { min: 66, max: 70, title: "Storm Shadow" },
  { min: 71, max: 75, title: "Conduit Champion" },
  { min: 76, max: 80, title: "Zenith" },
  { min: 81, max: 85, title: "Ascendant" },
  { min: 86, max: 90, title: "Mythical Shinobi" },
  { min: 91, max: 95, title: "Legend Incarnate" },
  { min: 96, max: 99, title: "Gangstar" },
  { min: 100, max: Infinity, title: "Super Insane Master of All" }
];

export function getRank(money) {
  if (typeof money !== 'number' || isNaN(money)) {
    return "_";
  }
  const findRank = ranks.find(rank => money >= rank.min && money <= rank.max);
  return findRank?.title || "_";
}