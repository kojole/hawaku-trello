const Models = require('../src/models');
const { Role, Stats, User } = Models;

const defaultUsers = () => [
  new User(
    '5b51661ec2b420659dc08d57',
    'アリス',
    2,
    new Stats({
      女子トイレ: 50,
      掃除機: 20,
      ゴミ捨て: 30
    })
  ),
  new User(
    '5b51661f2184355a03c31e84',
    'ボブ',
    1,
    new Stats({
      男子トイレ: 20,
      掃除機: 30,
      ゴミ捨て: 50
    })
  ),
  new User(
    '5b516654a16c303c6f577070',
    'キャロル',
    2,
    new Stats({
      女子トイレ: 2,
      掃除機: 3,
      ゴミ捨て: 5
    })
  ),
  new User(
    '5b516661a43df26ebdbe5468',
    'デイブ',
    1,
    new Stats({
      男子トイレ: 5,
      掃除機: 3,
      ゴミ捨て: 2
    })
  )
];

const defaultRoles = () => [
  new Role('男子トイレ', 1),
  new Role('女子トイレ', 2),
  new Role('掃除機'),
  new Role('ゴミ捨て')
];

test('fromListsJSON', () => {
  const json = require('./fixtures/lists.json');
  const [users, roles] = Models.fromListsJSON(json);

  expect(users).toEqual(defaultUsers());
  expect(roles).toEqual(defaultRoles());
});

test('assignRolesToUsers', () => {
  const assignments = Models.assignRolesToUsers(defaultUsers(), defaultRoles());
  const json = assignments.toJSON();

  expect(json).toEqual([
    {
      user: 'ボブ',
      role: '男子トイレ',
      id: '5b51661f2184355a03c31e84'
    },
    {
      user: 'キャロル',
      role: '女子トイレ',
      id: '5b516654a16c303c6f577070'
    },
    {
      user: 'アリス',
      role: '掃除機',
      id: '5b51661ec2b420659dc08d57'
    },
    {
      user: 'デイブ',
      role: 'ゴミ捨て',
      id: '5b516661a43df26ebdbe5468'
    }
  ]);
});
