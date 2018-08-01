import 'core-js/fn/array/find';
import 'core-js/fn/array/includes';

import { ListJSON } from '../models/trello';
import User from '../models/User';
import config from '../config';
import Result from './Result';
import TrelloClient from './TrelloClient';

interface Properties {
  trelloKey: string;
  trelloToken: string;
}

export function archiveOldResults() {
  const trello = _newClient();
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

export function updateUserStatsFromResults() {
  const trello = _newClient();
  const lists = trello.getLists(config.idBorad);

  const resultsList = lists.find(list => list.id === config.idResultsList);
  if (!resultsList) {
    console.error(`list ${config.idResultsList} not found`);
    return;
  }

  const results = resultsList.cards.map(Result.fromJSON);
  results.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const users = _getUsersFromLists(lists);

  for (const result of results) {
    for (const assignment of result.assignments) {
      if (!assignment.userId) {
        continue;
      }
      const user = users[assignment.userId];
      if (!user) {
        continue;
      }
      if (user.updatedAt && user.updatedAt >= result.createdAt) {
        continue;
      }
      user.wasAssignedTo(assignment.roleId, result.createdAt);
    }
  }

  for (const id in users) {
    const user = users[id];
    if (user.dirty) {
      trello.putCard(id, { desc: user.newDesc() });
    }
  }
}

function _newClient(): TrelloClient {
  const {
    trelloKey,
    trelloToken
  } = PropertiesService.getScriptProperties().getProperties() as Properties;
  return new TrelloClient(trelloKey, trelloToken);
}

function _getUsersFromLists(lists: ListJSON[]): { [id: string]: User } {
  const users: { [id: string]: User } = {};
  const usersLists = lists.filter(list =>
    config.idUsersLists.includes(list.id)
  );
  for (const list of usersLists) {
    for (const card of list.cards) {
      const user = User.fromJSON(card);
      users[user.id] = user;
    }
  }
  return users;
}
