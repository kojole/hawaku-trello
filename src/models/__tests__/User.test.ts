import Role from '../Role';
import Stats from '../Stats';
import { parseDesc } from '../trello';
import User from '../User';

const defaultDate = new Date('2018-07-27T04:44:00.000Z');

test('.newDesc()', () => {
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

test('.undoneRoles()', () => {
  const stats = {
    role4: 0,
    role5: 1,
    role6: 2
  };
  const user = new User('_id', '_name', 1, new Stats(stats));

  const roles = [
    new Role('role0', '_name', 0),
    new Role('role1', '_name', 1),
    new Role('role2', '_name', 2),
    new Role('role3', '_name', 0, true),
    new Role('role4', '_name', 0),
    new Role('role5', '_name', 0),
    new Role('role6', '_name', 0)
  ];
  const helpRoles = user.undoneRoles(roles);

  expect(helpRoles).toEqual([roles[0], roles[1]]);
});
