import config from '@/config';
import { assignment, assignmentFrom } from './assignment';
import Role from './Role';
import { ListJSON } from './trello';
import User from './User';
import { shuffle } from '../random';

export function fromListsJSON(lists: ListJSON[]): [User[], Role[]] {
  const usersList = lists.find(list => list.id === config.idUsersLists[0]);
  const rolesList = lists.find(list => list.id === config.idRolesLists[0]);
  return [
    usersList ? usersList.cards.map(User.fromJSON) : [],
    rolesList ? rolesList.cards.map(Role.fromJSON) : []
  ];
}

export function fromListsJSONAll(lists: ListJSON[]): [User[], Role[]] {
  const usersLists = lists.filter(list =>
    config.idUsersLists.includes(list.id)
  );
  const rolesLists = lists.filter(list =>
    config.idRolesLists.includes(list.id)
  );

  return [
    ([] as User[]).concat(
      ...usersLists.map(list => list.cards.map(User.fromJSON))
    ),
    ([] as Role[]).concat(
      ...rolesLists.map(list => list.cards.map(Role.fromJSON))
    )
  ];
}

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
