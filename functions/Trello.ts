interface Params {
  [key: string]: string;
}

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

  getCards(idList: string): CardJSON[] {
    const url = `${this.endpoint}lists/${idList}/cards`;
    const params = { fields: 'name,desc' };
    const contentText = this.fetch('get', url, params);
    return JSON.parse(contentText);
  }

  getLists(idBoard: string): ListJSON[] {
    const url = `${this.endpoint}boards/${idBoard}/lists`;
    const params = {
      cards: 'open',
      fields: 'name',
      card_fields: 'name,desc,idLabels'
    };
    const contentText = this.fetch('get', url, params);
    return JSON.parse(contentText);
  }

  postCard(params: Params) {
    const url = `${this.endpoint}cards`;
    this.fetch('post', url, params);
  }

  putCard(idCard: string, params: Params) {
    const url = `${this.endpoint}cards/${idCard}`;
    this.fetch('put', url, params);
  }

  private fetch(
    method: 'get' | 'post' | 'put',
    url: string,
    params: Params = {}
  ): string {
    params = { ...params, ...this.credentials };

    const res = UrlFetchApp.fetch(url + _toQuery(params), {
      method,
      contentType: 'application/json',
      muteHttpExceptions: true
    });

    const responseCode = res.getResponseCode();
    const contentText = res.getContentText();
    if (responseCode !== 200) {
      throw new Error(
        `${method.toUpperCase()} ${url} ${responseCode} ${contentText}`
      );
    }

    Logger.log(`${method.toUpperCase()} ${url}`);
    return contentText;
  }
}

function _toQuery(params: Params) {
  return (
    '?' +
    Object.keys(params)
      .map(k => k + '=' + encodeURIComponent(params[k]))
      .join('&')
  );
}
