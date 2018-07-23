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
  console.log('doAssign start');

  // return t.lists('all').then(function(lists) {
  //   console.log(JSON.stringify(lists, null, 2));
  // });

  return authorize().then(() => {
    return new Promise((resolve, reject) =>
      Trello.post(
        'cards',
        { idList: '5b5165fe95d13ee66c371780', name: 'new card!' },
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
