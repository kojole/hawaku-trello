import * as Bluebird from 'bluebird';
import { app, h } from 'hyperapp';

import { assignment, assignmentFrom } from '../models/assignment';
import Role from '../models/Role';
import { CardJSON, toDesc } from '../models/trello';
import User from '../models/User';

declare const Trello: any;
declare const TrelloPowerUp: any;
const Promise = TrelloPowerUp.Promise;
const t = TrelloPowerUp.iframe();

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

const id: string = t.arg('id');
const users: User[] = t.arg('users');
const roles: Role[] = t.arg('roles');
const assignments: assignment[] = t.arg('assignments');

interface State {
  selectedRoleIndex: number | null;
  selectedUserIndex: number | null;
}

const state: State = {
  selectedRoleIndex: null,
  selectedUserIndex: null
};

const actions = {
  selectRole: (i: number) => ({
    selectedRoleIndex: i
  }),
  selectUser: (i: number) => ({
    selectedUserIndex: i
  })
};

type Actions = typeof actions;

const view = (state: State, actions: Actions) =>
  h(
    'div',
    {
      oncreate: () => t.sizeTo('#app')
    },
    [
      h('div', { class: 'list' }, [
        h('h2', { class: 'list-title' }, '人'),
        ...users.map((user, i) =>
          h(
            'div',
            {
              class: 'list-item',
              onclick: () => actions.selectUser(i)
            },
            [
              h('input', {
                id: `user-${i}`,
                type: 'radio',
                checked: i === state.selectedUserIndex
              }),
              h('label', { for: `user-${i}` }, user.name)
            ]
          )
        )
      ]),
      h('div', { class: 'list' }, [
        h('h2', { class: 'list-title' }, '仕事'),
        ...roles.map((role, i) =>
          h(
            'div',
            {
              class: 'list-item',
              onclick: () => actions.selectRole(i)
            },
            [
              h('input', {
                id: `role-${i}`,
                type: 'radio',
                checked: i === state.selectedRoleIndex
              }),
              h('label', { for: `role-${i}` }, role.name)
            ]
          )
        )
      ]),
      h(
        'button',
        {
          class: 'list-submit mod-primary',
          disabled:
            state.selectedRoleIndex === null ||
            state.selectedUserIndex === null,
          onclick: () => {
            if (
              state.selectedRoleIndex === null ||
              state.selectedUserIndex === null
            ) {
              return;
            }
            assignments.push(
              assignmentFrom(
                users[state.selectedUserIndex] as User,
                roles[state.selectedRoleIndex] as Role
              )
            );
            const desc = toDesc(assignments);
            authorize().then(() =>
              new Promise((resolve: any, reject: any) =>
                Trello.put(
                  `cards/${id}`,
                  { desc },
                  (card: CardJSON) => {
                    console.log('PUT success:', card.id);
                    resolve();
                  },
                  (e: any) => {
                    console.error(e);
                    reject();
                  }
                )
              ).finally(() => t.closePopup())
            );
          }
        },
        '追加'
      )
    ]
  );

const container = document.getElementById('app');
app(state, actions, view, container);
