interface Properties {
  trelloKey: string;
  trelloToken: string;
}

function updateUserStatsFromResults() {
  const {
    trelloKey,
    trelloToken
  } = PropertiesService.getScriptProperties().getProperties() as Properties;

  const trello = new Trello(trelloKey, trelloToken);
  const lists = trello.getLists(config.idBorad);

  // Can't use Array.find
  const resultsList = lists.filter(list => list.id === config.idResultsList)[0];
  const results = resultsList.cards.map(card => Result.fromJSON(card));
  results.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const users = _getUsersFromLists(lists);

  for (const result of results) {
    for (const assignment of result.assignments) {
      const user = users[assignment.id];
      if (!user) {
        continue;
      }
      if (user.updatedAt && user.updatedAt >= result.createdAt) {
        continue;
      }
      user.wasAssignedTo(assignment.role, result.createdAt);
    }
  }

  for (const id in users) {
    const user = users[id];
    if (user.dirty) {
      trello.putCard(id, { desc: user.newDesc() });
    }
  }
}

function _getUsersFromLists(lists: ListJSON[]): { [id: string]: User } {
  const users = {};
  const usersLists = lists.filter(
    list =>
      list.id === config.idUsersLists[0] || list.id === config.idUsersLists[1]
  );
  for (const list of usersLists) {
    for (const card of list.cards) {
      const user = User.fromJSON(card);
      users[user.id] = user;
    }
  }
  return users;
}
