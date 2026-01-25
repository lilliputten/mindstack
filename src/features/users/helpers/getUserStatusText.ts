import { TTranslator } from '@/i18n';
import { TUser } from '@/features/users/types';

export function getUserStatusText(user?: TUser, t?: TTranslator) {
  /* // Grades
   * GUEST
   * BASIC
   * PRO
   * PREMIUM
   * UNLIMITED
   */

  if (!user || user.grade === 'GUEST') {
    return t?.('UserStatusText.GuestUser');
  }

  if (user.role === 'ADMIN') {
    return t?.('UserStatusText.Administrator');
  }

  if (user.grade === 'PRO') {
    return t?.('UserStatusText.ProUser');
  }
  if (user.grade === 'PREMIUM') {
    return t?.('UserStatusText.PremiumUser');
  }
  if (user.grade === 'UNLIMITED') {
    return t?.('UserStatusText.UnlimitedUser');
  }

  // BASIC
  return t?.('UserStatusText.LoggedUser');
}
