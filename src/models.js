function sexFromLabelsJSON(labels) {
  if (labels.find(label => label.name === '男性')) {
    return 1;
  } else if (labels.find(label => label.name === '女性')) {
    return 2;
  }
  return 0;
}

class Stats {
  constructor(counts = {}) {
    this.counts = counts;
    this.total = Object.values(counts).reduce((acc, crr) => acc + crr, 0);
  }

  count(name) {
    return this.counts[name] || 0;
  }

  normalizedCount(name) {
    if (this.total === 0) {
      return 0;
    }
    return this.count(name) / this.total;
  }

  static tryFromJSONCodeBlock(md) {
    md = md.trim();
    const re = /^```json\n([\s\S]*)\n```$/;
    const found = md.match(re);
    if (found) {
      try {
        const statsJSON = JSON.parse(found[1]);
        return new Stats(statsJSON);
      } catch (e) {
        console.log(e);
      }
    }
    return new Stats();
  }
}

function assignRolesToUsers(users, roles) {
  const assignments = [];
  while (roles.length > 0) {
    const role = roles.shift();

    if (role.sex !== 0) {
      const sUsers = users.filter(u => u.sex === role.sex);
      if (sUsers.length > 0) {
        sUsers.sort(
          (a, b) =>
            a.stats.normalizedCount(role.name) -
            b.stats.normalizedCount(role.name)
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
        a.stats.normalizedCount(role.name) - b.stats.normalizedCount(role.name)
    );
    assignments.push({
      user: users.shift(),
      role
    });
  }

  for (const user of users) {
    assignments.push({
      user,
      role: new Role('なし')
    });
  }

  // To refer itself by `this`, avoid an arrow function syntax
  assignments.toJSON = function() {
    return this.map(({ user, role }) => ({
      user: user.name,
      role: role.name,
      id: user.id
    }));
  };

  return assignments;
}

class User {
  constructor(id, name, sex = 0, stats = {}) {
    this.id = id;
    this.name = name;
    this.sex = sex;
    this.stats = stats;
  }

  static fromCardJSON(card) {
    const sex = sexFromLabelsJSON(card.labels);
    const stats = Stats.tryFromJSONCodeBlock(card.desc);
    return new User(card.id, card.name, sex, stats);
  }
}

class Role {
  constructor(name, sex = 0) {
    this.name = name;
    this.sex = sex;
  }

  static fromCardJSON(card) {
    return new Role(card.name, sexFromLabelsJSON(card.labels));
  }
}

function fromListsJSON(json) {
  let users = [];
  let roles = [];

  const usersList = json.filter(list => list.name === 'する人')[0];
  const rolesList = json.filter(list => list.name === 'する仕事')[0];

  if (usersList) {
    users = usersList.cards.map(User.fromCardJSON);
  }
  if (rolesList) {
    roles = rolesList.cards.map(Role.fromCardJSON);
  }

  return [users, roles];
}

module.exports = {
  assignRolesToUsers,
  fromListsJSON,
  Role,
  Stats,
  User
};
