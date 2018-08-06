(() => {
  // const _Promise = (<any>window).TrelloPowerUp.Promise;
  const t = (<any>window).TrelloPowerUp.iframe();
  // const Trello = (<any>window).Trello;

  const users = t.arg('users');
  const roles = t.arg('roles');
  const assignments = t.arg('assignments');

  console.log(users);
  console.log(roles);
  console.log(assignments);
})();
