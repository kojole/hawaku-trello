export interface CardJSON {
  id: string;
  name: string;
  desc: string;
  labels: LabelJSON[];
  idLabels?: string[];
  idList?: string;
}

export interface LabelJSON {
  id: string;
}

export interface ListJSON {
  id: string;
  name: string;
  cards: CardJSON[];
}

export function parseDesc(desc: string): any {
  const jsonString =
    desc
      .trim()
      .split('\n\n')
      .pop() || '';
  const re = /^```json\n([\s\S]*)\n```$/;
  const found = jsonString.match(re);
  if (found) {
    try {
      return JSON.parse(found[1]);
    } catch (e) {
      console.error(e);
    }
  }
  return null;
}

export function toDesc<T>(object: T, display?: (object: T) => string): string {
  const jsonString = '```json\n' + JSON.stringify(object, null, 2) + '\n```';
  if (display) {
    return display(object) + '\n\n' + jsonString;
  }
  return jsonString;
}
