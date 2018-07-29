interface Properties {
  trelloKey: string;
  trelloToken: string;
}

function archiveOldResults() {
  const trello = _newTrello();
  const cards = trello.getCards(config.idResultsList);

  // Archive 1-week old cards
  const threshold = 7 * 24 * 60 * 60 * 1000;
  const now = new Date();

  for (const card of cards) {
    const result = Result.fromJSON(card);
    if (now.getTime() - result.createdAt.getTime() > threshold) {
      trello.putCard(card.id, { closed: 'true' });
    }
  }
}

function updateUserStatsFromResults() {
  const trello = _newTrello();
  const lists = trello.getLists(config.idBorad);

  // Can't use Array.find
  const resultsList = lists.filter(list => list.id === config.idResultsList)[0];
  const results = resultsList.cards.map(Result.fromJSON);
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

function _newTrello(): Trello {
  const {
    trelloKey,
    trelloToken
  } = PropertiesService.getScriptProperties().getProperties() as Properties;
  return new Trello(trelloKey, trelloToken);
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
