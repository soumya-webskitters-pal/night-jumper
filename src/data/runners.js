export const runners = [
  {
    id: "tron",
    name: "Tron Legend",
    detail: "Neon runner · Default",
    image: "/players/neon_runner_animations_set/player1.png",
    avatar: "runner-avatar-tron",
  },
  {
    id: "sonic",
    name: "Sonic Blue",
    detail: "Sonic runners adventure",
    image: "/players/animations_sonic_-_sonic_runners_adventure_model/player2.png",
    avatar: "runner-avatar-sonic",
  },
  {
    id: "tails",
    name: "Sonic Yellow",
    detail: "Tails runners adventure",
    image: "/players/animations_tails_-_sonic_runners_adventure/player3.png",
    avatar: "runner-avatar-tails",
  },
  {
    id: "spiderman",
    name: "Spider-Man",
    detail: "Web runner",
    image: "/players/spider-man/player7.png",
    avatar: "runner-avatar-spiderman",
  },
  {
    id: "nicky",
    name: "Nicky",
    detail: "Casual city runner",
    image: "/players/nicky/player4.png",
    avatar: "runner-avatar-nicky",
  },
  {
    id: "chacha",
    name: "Cha Cha",
    detail: "Street runner",
    image: "/players/cha_cha/player5.png",
    avatar: "runner-avatar-chacha",
  },
  {
    id: "zombie",
    name: "Diaper Zombie",
    detail: "Undead runner",
    image: "/players/diaper_zombie/player6.png",
    avatar: "runner-avatar-zombie",
  },
];

export const runnerById = Object.fromEntries(
  runners.map((runner) => [runner.id, runner]),
);

export const runnerSources = {
  tron: "players/neon_runner_animations_set/scene.gltf",
  sonic: "players/animations_sonic_-_sonic_runners_adventure_model/scene.gltf",
  tails: "players/animations_tails_-_sonic_runners_adventure/scene.gltf",
  nicky: "players/nicky/scene.gltf",
  chacha: "players/cha_cha/scene.gltf",
  zombie: "players/diaper_zombie/scene.gltf",
  spiderman: "players/spider-man/scene.gltf",
};
