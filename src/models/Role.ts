import { sex, sexFromJSON } from './sex';
import { CardJSON } from './trello';

export default class Role {
  constructor(public id: string, public name: string, public sex: sex = 0) {}

  static fromJSON(card: CardJSON): Role {
    return new Role(card.id, card.name, sexFromJSON(card));
  }
}
