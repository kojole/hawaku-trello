import { sex, sexFromJSON } from './sex';
import Role from './Role';
import Stats from './Stats';
import { CardJSON, parseDesc } from './trello';

interface MetaJSON {
  stats: { [roleId: string]: number };
  updatedAt: string;
}

interface Meta {
  stats: Stats;
  updatedAt?: Date;
}

export default class User {
  dirty = false;

  constructor(
    public id: string,
    public name: string,
    public sex: sex,
    public stats: Stats,
    public updatedAt?: Date
  ) {}

  newDesc(): string {
    const meta = { stats: this.stats, updatedAt: this.updatedAt };
    return '```json\n' + JSON.stringify(meta, null, 2) + '\n```';
  }

  undoneRoles(roles: Role[]): Role[] {
    return roles.filter(
      role =>
        !role.dup &&
        (role.sex === 0 || role.sex === this.sex) &&
        this.stats.counts[role.id] === undefined
    );
  }

  wasAssignedTo(id: string, date: Date) {
    this.stats.increment(id);
    this.updatedAt = date;
    this.dirty = true;
  }

  static fromJSON(card: CardJSON): User {
    const sex = sexFromJSON(card);
    const { stats, updatedAt } = User.metaFromDesc(card.desc);
    return new User(card.id, card.name, sex, stats, updatedAt);
  }

  static metaFromDesc(desc: string): Meta {
    const descJSON: { stats?: any; updatedAt?: any } = parseDesc(desc) || {};
    const meta: Meta = { stats: new Stats({}) };
    if (descJSON.stats) {
      meta.stats = new Stats((<MetaJSON>descJSON).stats);
    }
    if (descJSON.updatedAt) {
      meta.updatedAt = new Date((<MetaJSON>descJSON).updatedAt);
    }
    return meta;
  }
}
