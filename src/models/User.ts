import { sex, sexFromJSON } from './sex';
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
  constructor(
    public id: string,
    public name: string,
    public sex: sex,
    public stats: Stats,
    public updatedAt?: Date
  ) {}

  static fromJSON(card: CardJSON): User {
    const sex = sexFromJSON(card);
    const { stats, updatedAt } = User.metaFromDesc(card.desc);
    return new User(card.id, card.name, sex, stats, updatedAt);
  }

  static metaFromDesc(desc: string): Meta {
    const descJSON = parseDesc(desc);
    const meta: Meta = { stats: new Stats({}) };
    if (descJSON.hasOwnProperty('stats')) {
      meta.stats = new Stats((<MetaJSON>descJSON).stats);
    }
    if (descJSON.hasOwnProperty('updatedAt')) {
      meta.updatedAt = new Date((<MetaJSON>descJSON).updatedAt);
    }
    return meta;
  }
}
