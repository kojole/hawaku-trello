import Role from './Role';
import { ListJSON } from './trello';
import User from './User';
import config from '../config';
import { shuffle } from '../random';

export function fromListsJSON(lists: ListJSON[]): [User[], Role[]] {
  const usersList = lists.find(list => list.id === config.idUsersLists[0]);
  const rolesList = lists.find(list => list.id === config.idRolesLists[0]);
  return [
    usersList ? usersList.cards.map(User.fromJSON) : [],
    rolesList ? rolesList.cards.map(Role.fromJSON) : []
  ];
}

type Assignments = Array<{
  user: { name: string; id: string | null };
  role: { name: string; id: string };
}> & {
  toJSON(): any;
};

export function assignRolesToUsers(users: User[], roles: Role[]): Assignments {
  const assignments: Assignments = Object.assign([], {
    // To refer itself by `this`, avoid an arrow function syntax
    toJSON: function(): any {
      return (<Assignments>this).map(({ user, role }) => ({
        user: user.name,
        role: role.name,
        userId: user.id,
        roleId: role.id
      }));
    }
  });

  shuffle(users);

  for (const role of roles) {
    if (users.length === 0) {
      assignments.push({
        user: {
          name: 'なし',
          id: null
        },
        role
      });
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
        assignments.push({
          user,
          role
        });
        users = users.filter(u => u.id !== user.id);
        continue;
      }
    }

    users.sort(
      (a, b) =>
        a.stats.normalizedCount(role.id) - b.stats.normalizedCount(role.id)
    );
    assignments.push({
      user: users.shift() as User,
      role
    });
  }

  for (const user of users) {
    assignments.push({
      user,
      role: Role.none()
    });
  }

  return assignments;
}
