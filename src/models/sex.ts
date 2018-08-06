import config from '@/config';
import { CardJSON } from './trello';

export type sex = 0 | 1 | 2;

export function sexFromJSON(card: CardJSON): sex {
  const ids = card.idLabels
    ? card.idLabels
    : card.labels.map(label => label.id);
  if (ids.includes(config.idMaleLabel)) {
    return 1;
  } else if (ids.includes(config.idFemaleLabel)) {
    return 2;
  }
  return 0;
}
