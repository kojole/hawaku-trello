const Promise = window.TrelloPowerUp.Promise;

const WHITE_ICON =
  'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-white.svg';
const BLACK_ICON =
  'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-black.svg';

function doAssign(t, opts) {
  console.log('doAssign start');

  // return t.lists('all').then(function(lists) {
  //   console.log(JSON.stringify(lists, null, 2));
  // });

  window.Trello.authorize({
    type: 'popup',
    name: 'hawaku-trello',
    scope: {
      read: 'true',
      write: 'true'
    },
    expiration: 'never',
    success: () => {
      console.log('Authentication succeeded');
    },
    error: () => {
      console.log('Authentication failed');
    }
  });

  console.log('doAssign end');
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
