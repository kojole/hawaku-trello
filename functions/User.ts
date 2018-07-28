interface UserMetaJSON {
  stats: { [role: string]: number };
  updatedAt: string;
}

interface UserMeta {
  stats: { [role: string]: number };
  updatedAt?: Date;
}

class User {
  dirty = false;

  constructor(
    public id: string,
    public name: string,
    public desc: string,
    public stats: { [role: string]: number },
    public updatedAt?: Date
  ) {}

  newDesc(): string {
    const meta = { stats: this.stats, updatedAt: this.updatedAt };
    return '```json\n' + JSON.stringify(meta, null, 2) + '\n```';
  }

  static fromJSON(card: CardJSON): User {
    const { stats, updatedAt } = User.metaFromDesc(card.desc);
    return new User(card.id, card.name, card.desc, stats, updatedAt);
  }

  static metaFromDesc(desc: string): UserMeta {
    desc = desc.trim();
    const re = /^```json\n([\s\S]*)\n```$/;
    const found = desc.match(re);
    if (found) {
      try {
        const { stats, updatedAt } = JSON.parse(found[1]) as UserMetaJSON;
        return {
          stats,
          updatedAt: new Date(updatedAt)
        };
      } catch (_e) {}
    }
    return {
      stats: {}
    };
  }
}
