function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function shuffle(array: any[]) {
  for (let i = 0; i < array.length - 1; i++) {
    const j = randomInt(i, array.length);
    if (i !== j) {
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
