import config from './config';
import { assignRolesToUsers, fromListsJSON } from './models';
import { CardJSON, ListJSON } from './models/trello';

const Trello = (<any>window).Trello;
const Promise = (<any>window).TrelloPowerUp.Promise;

const WHITE_ICON =
  'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-white.svg';
const BLACK_ICON =
  'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-black.svg';

function authorize(): PromiseLike<any> {
  return new Promise((resolve: any, reject: any) => {
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

function doAssign(t: any, _opts: any) {
  return authorize()
    .then(() => t.lists('all'))
    .then((lists: ListJSON[]) => {
      const [users, roles] = fromListsJSON(lists);
      if (users.length === 0) {
        console.log('No users');
        return;
      }
      if (roles.length === 0) {
        console.log('No roles');
        return;
      }
      const assignments = assignRolesToUsers(users, roles);

      const idList = config.idResultsList;
      const name = new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }).format(new Date());
      const desc = '```json\n' + JSON.stringify(assignments, null, 2) + '\n```';

      return new Promise((resolve: any, reject: any) =>
        Trello.post(
          'cards',
          { idList, name, desc, pos: 'top' },
          (card: CardJSON) => {
            console.log('POST success:', card.id);
            // Wait for the newly created card to appear
            setTimeout(() => {
              t.showCard(card.id);
              resolve();
            }, 500);
          },
          reject
        )
      );
    });
}

(<any>window).TrelloPowerUp.initialize({
  'board-buttons': function(_t: any, _opts: any) {
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
