import Stats from '../Stats';
import { parseDesc } from '../trello';
import User from '../User';

const defaultDate = new Date('2018-07-27T04:44:00.000Z');

test('.newDesc', () => {
  const stats = {
    role1: 1,
    role2: 2,
    role3: 3
  };
  const user = new User('_id', '_name', 0, new Stats(stats), defaultDate);
  const desc = user.newDesc();
  const descJSON = parseDesc(desc);

  expect(descJSON).toHaveProperty('stats', stats);
  expect(descJSON).toHaveProperty('updatedAt', defaultDate.toISOString());
});
