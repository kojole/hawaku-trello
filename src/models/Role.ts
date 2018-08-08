import config from '@/config';
import { sex, sexFromJSON } from './sex';
import { CardJSON } from './trello';

export default class Role {
  constructor(
    public id: string,
    public name: string,
    public sex: sex = 0,
    public dup: boolean = false
  ) {}

  static fromJSON(card: CardJSON): Role {
    const dup = Boolean(
      card.labels.find(label => label.id === config.idDupRoleLabel)
    );
    return new Role(card.id, card.name, sexFromJSON(card), dup);
  }
}
