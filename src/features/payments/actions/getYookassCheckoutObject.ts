import { YooCheckout } from '@a2seven/yoo-checkout';

import { youkassaSecretKey, youkassaShopId } from '../constants/yookassa-payment-constants';

export function getYookassCheckoutObject() {
  return new YooCheckout({ shopId: youkassaShopId, secretKey: youkassaSecretKey });
}
