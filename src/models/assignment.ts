import Role from './Role';
import User from './User';

export type assignment = {
  user: string;
  role: string;
  userId: string | null;
  roleId: string;
};

export function assignmentFrom(
  user: User | null,
  role: Role | null
): assignment {
  return {
    user: user ? user.name : 'なし',
    role: role ? role.name : 'なし',
    userId: user ? user.id : null,
    // Use `NULL` string for ID
    roleId: role ? role.id : 'NULL'
  };
}
