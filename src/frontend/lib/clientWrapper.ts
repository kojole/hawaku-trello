import * as Bluebird from 'bluebird';
import { CardJSON } from '../../models/trello';

export function authorize(
  trello: any,
  bluebird: typeof Bluebird
): Bluebird<void> {
  return new bluebird((resolve, reject) =>
    trello.authorize({
      type: 'popup',
      name: 'hawaku-trello',
      scope: {
        write: true
      },
      expiration: 'never',
      success: resolve,
      error: () => {
        console.error('Authentication failed');
        reject();
      }
    })
  );
}

export function put(
  trello: any,
  path: string,
  params: any,
  bluebird: typeof Bluebird
): Bluebird<void> {
  return authorize(bluebird, trello).then(
    () =>
      new bluebird((resolve, reject) =>
        trello.put(
          path,
          params,
          (card: CardJSON) => {
            console.log('PUT success:', card.id);
            resolve();
          },
          reject
        )
      )
  );
}
