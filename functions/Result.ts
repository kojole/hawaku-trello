interface Assignment {
  user: string;
  role: string;
  userId: string | null;
  roleId: string;
}

class Result {
  constructor(public assignments: Assignment[], public createdAt: Date) {}

  static fromJSON(card: CardJSON): Result {
    const assignments = Result.assignmentsFromDesc(card.desc);

    // Delete weekday to parse date string
    // https://stackoverflow.com/a/41418590
    const createdAt = new Date(card.name.replace(/\(.\)/, ''));

    return new Result(assignments, createdAt);
  }

  static assignmentsFromDesc(desc: string): Assignment[] {
    desc = desc.trim();
    const re = /^```json\n([\s\S]*)\n```$/;
    const found = desc.match(re);
    if (found) {
      try {
        return JSON.parse(found[1]) as Assignment[];
      } catch (_e) {}
    }
    return [];
  }
}
