import { app, h } from 'hyperapp';

import { assignmentFrom } from '../models/assignment';
import Role from '../models/Role';
import { CardJSON, toDesc } from '../models/trello';
import User from '../models/User';

declare const Trello: any;
declare const TrelloPowerUp: any;
const Promise = TrelloPowerUp.Promise;
const t = TrelloPowerUp.iframe();

const id: string = t.arg('id');
const users: User[] = t.arg('users');
const roles: Role[] = t.arg('roles');
const assignments = t.arg('assignments');

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
  h('div', {}, [
    h('div', {}, [
      h('h1', {}, '人'),
      ...users.map((user, i) =>
        h('div', { onclick: () => actions.selectUser(i) }, [
          h('input', {
            id: `user-${i}`,
            type: 'radio',
            checked: i === state.selectedUserIndex
          }),
          h('label', { for: `user-${i}` }, user.name)
        ])
      )
    ]),
    h('div', {}, [
      h('h1', {}, '仕事'),
      ...roles.map((role, i) =>
        h('div', { onclick: () => actions.selectRole(i) }, [
          h('input', {
            id: `role-${i}`,
            type: 'radio',
            checked: i === state.selectedRoleIndex
          }),
          h('label', { for: `role-${i}` }, role.name)
        ])
      )
    ]),
    h(
      'button',
      {
        className: 'mod-primary',
        disabled:
          state.selectedRoleIndex === null || state.selectedUserIndex === null,
        onClick: () => {
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
          new Promise((resolve: any, reject: any) =>
            Trello.put(
              `cards/${id}`,
              { desc },
              (card: CardJSON) => {
                console.log('PUT success:', card.id);
                resolve();
              },
              reject
            )
          ).finally(() => t.closePopup());
        }
      },
      '追加'
    )
  ]);

const container = document.getElementById('app');
app(state, actions, view, container);
