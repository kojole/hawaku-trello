import config from '@/config';
import { assignment, assignmentFrom } from './assignment';
import Role from './Role';
import { ListJSON, CardJSON } from './trello';
import User from './User';
import { shuffle } from '../random';

type listPredicate = (list: ListJSON) => boolean;

function fromListsJSONFn<T>(
  idLists: string[],
  fromJSON: (card: CardJSON) => T
): (lists: ListJSON[], all?: boolean) => T[] {
  return (lists, all = false) => {
    const predicate: listPredicate = all
      ? list => idLists.includes(list.id)
      : list => idLists[0] === list.id;
    return ([] as T[]).concat(
      ...lists.filter(predicate).map(list => list.cards.map(fromJSON))
    );
  };
}

export const rolesFromListsJSON = fromListsJSONFn(
  config.idRolesLists,
  Role.fromJSON
);

export const usersFromListsJSON = fromListsJSONFn(
  config.idUsersLists,
  User.fromJSON
);

export function assignRolesToUsers(users: User[], roles: Role[]): assignment[] {
  const assignments: assignment[] = [];

  shuffle(users);

  for (const role of roles) {
    if (users.length === 0) {
      assignments.push(assignmentFrom(null, role));
      continue;
    }

    if (role.sex !== 0) {
      const sUsers = users.filter(u => u.sex === role.sex);
      if (sUsers.length > 0) {
        sUsers.sort(
          (a, b) =>
            a.stats.normalizedCount(role.id) - b.stats.normalizedCount(role.id)
        );

        const user = sUsers[0];
        assignments.push(assignmentFrom(user, role));
        users = users.filter(u => u.id !== user.id);
        continue;
      }
    }

    users.sort(
      (a, b) =>
        a.stats.normalizedCount(role.id) - b.stats.normalizedCount(role.id)
    );
    assignments.push(assignmentFrom(users.shift() as User, role));
  }

  for (const user of users) {
    assignments.push(assignmentFrom(user, null));
  }

  return assignments;
}
