import { CardJSON, parseDesc } from '../models/trello';
import { assignment } from '../models/assignment';

export default class Result {
  constructor(public assignments: assignment[], public createdAt: Date) {}

  static fromJSON(card: CardJSON): Result {
    const assignments: assignment[] = parseDesc(card.desc) || [];

    // Delete weekday to parse date string
    // https://stackoverflow.com/a/41418590
    const createdAt = new Date(card.name.replace(/\(.\)/, ''));

    return new Result(assignments, createdAt);
  }
}
