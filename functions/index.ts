interface Properties {
  trelloKey: string;
  trelloToken: string;
}

const idBorad = '5b516576029770d195c0f7c2';
const idRolesLists = ['5b5165fe95d13ee66c371780', '5b5166047c970409cc702289'];
const idUsersLists = ['5b5166096459a827d1a19b51', '5b5167e3d3198ab3702e5f2e'];

function initializeUsers() {
  const {
    trelloKey,
    trelloToken
  } = PropertiesService.getScriptProperties().getProperties() as Properties;

  const trello = new Trello(trelloKey, trelloToken);
  const lists = trello.getLists(idBorad);

  const rolesLists = lists.filter(list => idRolesLists.includes(list.id));
  const roleNames = rolesLists
    .reduce(
      (names: string[], list) =>
        names.concat(list.cards.map(card => card.name)),
      []
    )
    .filter((value, index, array) => array.indexOf(value) === index);

  const usersLists = lists.filter(list => idUsersLists.includes(list.id));
  const users = usersLists.reduce(
    (users: User[], list) => users.concat(list.cards.map(User.fromJSON)),
    []
  );

  for (const user of users) {
    for (const roleName of roleNames) {
      if (!user.stats.hasOwnProperty(roleName)) {
        user.stats[roleName] = 0;
        user.dirty = true;
      }
    }
  }

  const now = new Date();
  for (const user of users) {
    if (user.dirty) {
      user.updatedAt = now;
      const desc = user.newDesc();
      if (desc !== user.desc) {
        trello.putCard(user.id, { desc });
      }
    }
  }
}
