interface Counts {
  [id: string]: number;
}

export default class Stats {
  total: number;

  constructor(private counts: Counts) {
    this.total = Object.values(counts).reduce((acc, crr) => acc + crr, 0);
  }

  count(id: string): number {
    return this.counts[id] || 0;
  }

  normalizedCount(id: string): number {
    if (this.total === 0) {
      return 0;
    }
    return this.count(id) / this.total;
  }
}
