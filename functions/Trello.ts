interface ListJSON {
  id: string;
  name: string;
  cards: CardJSON[];
}

interface CardJSON {
  id: string;
  name: string;
  desc: string;
  idLabels: string[];
}

class Trello {
  private endpoint = 'https://api.trello.com/1/';
  private credentials: { key: string; token: string };

  constructor(key: string, token: string) {
    this.credentials = { key, token };
  }

  getLists(idBoard: string): ListJSON[] {
    const params = { ...this.credentials, cards: 'open' };
    const url = `${this.endpoint}boards/${idBoard}/lists`;

    const res = UrlFetchApp.fetch(url + _toQuery(params), {
      method: 'get',
      contentType: 'application/json',
      muteHttpExceptions: true
    });

    const responseCode = res.getResponseCode();
    const contentText = res.getContentText();
    if (responseCode !== 200) {
      throw new Error(`GET ${url} ${responseCode} ${contentText}`);
    }
    Logger.log(`GET ${url}`);
    return JSON.parse(contentText);
  }

  putCard(idCard: string, params: { [key: string]: any }) {
    params = { ...this.credentials, ...params };
    const url = `${this.endpoint}cards/${idCard}`;

    const res = UrlFetchApp.fetch(url + _toQuery(params), {
      method: 'put',
      contentType: 'application/json',
      muteHttpExceptions: true
    });

    const responseCode = res.getResponseCode();
    const contentText = res.getContentText();
    if (responseCode !== 200) {
      throw new Error(`PUT ${url} ${responseCode} ${contentText}`);
    }
    Logger.log(`PUT ${url}`);
  }
}

function _toQuery(params: { [key: string]: string }) {
  return (
    '?' +
    Object.keys(params)
      .map(k => k + '=' + encodeURIComponent(params[k]))
      .join('&')
  );
}
