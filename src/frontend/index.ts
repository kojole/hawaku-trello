import * as Bluebird from 'bluebird';

import config from '@/config';
import { assignment } from '../models/assignment';
import {
  assignRolesToUsers,
  fromListsJSON,
  fromListsJSONAll
} from '../models/index';
import { CardJSON, ListJSON, parseDesc, toDesc } from '../models/trello';

declare const Trello: any;
declare const TrelloPowerUp: any;
const Promise = TrelloPowerUp.Promise;

const icons = {
  plus: 'https://design.trello.com/img/icons/v3/plus.svg',
  remove: 'https://design.trello.com/img/icons/v3/remove.svg'
};

const WHITE_ICON =
  'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-white.svg';
const BLACK_ICON =
  'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-black.svg';

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
        let [users, roles] = fromListsJSONAll(lists);

        users = users.filter(
          user => !assignments.find(assignment => assignment.userId === user.id)
        );
        roles = roles.filter(
          role => !assignments.find(assignment => assignment.roleId === role.id)
        );

        if (users.length === 0) {
          console.log('No extra users');
          return;
        }
        if (roles.length === 0) {
          console.log('No extra roles');
          return;
        }

        return t.popup({
          title: '当番を追加する',
          url: './add-assignment.html',
          args: { id: card.id, users, roles, assignments }
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

function cardBadges(t: any) {
  return t.card('id', 'desc', 'labels', 'idList').then((card: CardJSON) => {
    if (!config.idUsersLists.includes(card.idList as string)) {
      return [];
    }

    if (!card.labels.map(label => label.id).includes(config.idNewcomerLabel)) {
      return [];
    }

    return t.lists('all').then((lists: ListJSON[]) => {
      let roles = fromListsJSONAll(lists)[1];

      // TODO: dedup roles

      // Delete roles to have already done
      const { stats }: { stats?: { [id: string]: number } } =
        parseDesc(card.desc) || {};
      if (stats) {
        roles = roles.filter(role => stats[role.id] === undefined);
      }

      const badges = [];
      if (roles.length > 0) {
        badges.push({
          text: `残り${roles.length}`,
          color: 'yellow'
        });
      }
      return badges;
    });
  });
}

TrelloPowerUp.initialize({
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
  'card-badges': cardBadges,
  'card-buttons': (_t: any) => [
    {
      icon: icons.plus,
      text: '当番を追加する',
      callback: addAssignment,
      condition: 'edit'
    },
    {
      icon: icons.remove,
      text: '当番を削除する',
      callback: deleteAssignment,
      condition: 'edit'
    }
  ]
});
