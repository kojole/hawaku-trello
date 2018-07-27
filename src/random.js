function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function shuffle(array) {
  for (let i = 0; i < array.length - 1; i++) {
    const j = randomInt(i, array.length);
    if (i !== j) {
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

module.exports = {
  shuffle
};
