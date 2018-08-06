import * as Bluebird from 'bluebird';

import config from '@/config';
import { assignment } from '../models/assignment';
import {
  assignRolesToUsers,
  fromListsJSON,
  fromListsJSONAll
} from '../models/index';
import { CardJSON, ListJSON, parseDesc, toDesc } from '../models/trello';

const Trello = (<any>window).Trello;
const Promise = (<any>window).TrelloPowerUp.Promise;

const WHITE_ICON =
  'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-white.svg';
const BLACK_ICON =
  'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-black.svg';
const GRAY_ICON =
  'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg';

function authorize(): Bluebird<any> {
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

function doAssign(t: any) {
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
      const desc = toDesc(assignments);

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

function addAssignment(t: any) {
  return t.card('id', 'desc', 'idList').then((card: CardJSON) => {
    if (card.idList !== config.idResultsList) {
      console.log('Not a result card');
      return;
    }

    let assignments: assignment[] = parseDesc(card.desc) || [];
    if (!Array.isArray(assignments)) {
      // Parse error
      assignments = [];
    }

    return authorize()
      .then(() => t.lists('all'))
      .then((lists: ListJSON[]) => {
        const [users, roles] = fromListsJSONAll(lists);

        return t.popup({
          title: '当番を追加する',
          url: './add-assignment.html',
          args: { id: card.id, users, roles, assignments },
          height: 300
        });
      });
  });
}

function deleteAssignment(t: any) {
  return t.card('id', 'desc', 'idList').then((card: CardJSON) => {
    if (card.idList !== config.idResultsList) {
      console.log('Not a result card');
      return;
    }

    const assignments: assignment[] = parseDesc(card.desc) || [];
    if (!Array.isArray(assignments) || assignments.length === 0) {
      console.log('No assignments');
      return;
    }

    return t.popup({
      title: '当番を削除する',
      items: assignments.map((assignment, index) => ({
        text: `${assignment.user} - ${assignment.role}`,
        callback: (t: any) => {
          assignments.splice(index, 1);
          const desc = toDesc(assignments);

          return authorize()
            .then(
              () =>
                new Promise((resolve: any, reject: any) =>
                  Trello.put(
                    `cards/${card.id}`,
                    { desc },
                    (card: CardJSON) => {
                      console.log('PUT success:', card.id);
                      resolve();
                    },
                    reject
                  )
                )
            )
            .finally(() => t.closePopup());
        }
      }))
    });
  });
}

(<any>window).TrelloPowerUp.initialize({
  'board-buttons': (_t: any) => [
    {
      icon: {
        dark: WHITE_ICON,
        light: BLACK_ICON
      },
      text: '当番を決める！',
      callback: doAssign,
      condition: 'edit'
    }
  ],
  'card-buttons': (_t: any) => [
    {
      icon: GRAY_ICON,
      text: '当番を追加する',
      callback: addAssignment,
      condition: 'edit'
    },
    {
      icon: GRAY_ICON,
      text: '当番を削除する',
      callback: deleteAssignment,
      condition: 'edit'
    }
  ]
});
