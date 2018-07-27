const Models = require('./models');

const Trello = window.Trello;
const Promise = window.TrelloPowerUp.Promise;

const WHITE_ICON =
  'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-white.svg';
const BLACK_ICON =
  'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-black.svg';

function authorize() {
  return new Promise((resolve, reject) => {
    Trello.authorize({
      type: 'popup',
      name: 'hawaku-trello',
      scope: {
        write: true
      },
      expiration: 'never',
      success: resolve,
      error: () => {
        console.log('Authentication failed');
        reject();
      }
    });
  });
}

function doAssign(t, opts) {
  return authorize()
    .then(() => t.lists('all'))
    .then(lists => {
      const [users, roles] = Models.fromListsJSON(lists);
      if (users.length === 0) {
        console.log('No users');
        return;
      }
      if (roles.length === 0) {
        console.log('No roles');
        return;
      }

      const assignments = Models.assignRolesToUsers(users, roles);
      if (assignments.length === 0) {
        console.log('Failed to assign');
        return;
      }

      const idList = '5b5a79e5f664ffca9b1fc57c';
      const name = new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        weekday: 'short'
      }).format(new Date());
      const desc = '```json\n' + JSON.stringify(assignments, null, 2) + '\n```';

      return new Promise((resolve, reject) =>
        Trello.post(
          'cards',
          { idList, name, desc, pos: 'top' },
          resolve,
          reject
        )
      );
    });
}

window.TrelloPowerUp.initialize({
  'board-buttons': function(t, opts) {
    return [
      {
        icon: {
          dark: WHITE_ICON,
          light: BLACK_ICON
        },
        text: '当番を決める！',
        callback: doAssign,
        condition: 'edit'
      }
    ];
  }
});
