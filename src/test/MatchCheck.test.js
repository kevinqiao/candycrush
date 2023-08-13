import { checkForMatches, initGame } from "../service/GameEngine";

test("matches", () => {
  console.log("matches");
  const cells = initGame();
  const matches = checkForMatches(cells);
});
