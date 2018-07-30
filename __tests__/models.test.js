const Models = require('../src/models');
const { Role, Stats, User } = Models;

const defaultDate = new Date('2018-07-27T04:44:00.000Z');

const defaultUsers = () => [
  new User(
    '5b51661ec2b420659dc08d57',
    'アリス',
    2,
    new Stats({
      女子トイレ: 50,
      掃除機: 20,
      ゴミ捨て: 30
    }),
    defaultDate
  ),
  new User(
    '5b51661f2184355a03c31e84',
    'ボブ',
    1,
    new Stats({
      男子トイレ: 20,
      掃除機: 30,
      ゴミ捨て: 50
    }),
    defaultDate
  ),
  new User(
    '5b516654a16c303c6f577070',
    'キャロル',
    2,
    new Stats({
      女子トイレ: 2,
      掃除機: 3,
      ゴミ捨て: 5
    }),
    defaultDate
  ),
  new User(
    '5b516661a43df26ebdbe5468',
    'デイブ',
    1,
    new Stats({
      男子トイレ: 5,
      掃除機: 3,
      ゴミ捨て: 2
    }),
    defaultDate
  )
];

const defaultRoles = () => [
  new Role('5b51670ec35c9188eedd0e20', '男子トイレ', 1),
  new Role('5b516711d804bab6fd6e80d7', '女子トイレ', 2),
  new Role('5b5167133013db7d86329ec8', '掃除機'),
  new Role('5b51671dbc6c6a7d5bcec539', 'ゴミ捨て')
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
      userId: '5b51661f2184355a03c31e84',
      roleId: '5b51670ec35c9188eedd0e20'
    },
    {
      user: 'キャロル',
      role: '女子トイレ',
      userId: '5b516654a16c303c6f577070',
      roleId: '5b516711d804bab6fd6e80d7'
    },
    {
      user: 'アリス',
      role: '掃除機',
      userId: '5b51661ec2b420659dc08d57',
      roleId: '5b5167133013db7d86329ec8'
    },
    {
      user: 'デイブ',
      role: 'ゴミ捨て',
      userId: '5b516661a43df26ebdbe5468',
      roleId: '5b51671dbc6c6a7d5bcec539'
    }
  ]);
});
