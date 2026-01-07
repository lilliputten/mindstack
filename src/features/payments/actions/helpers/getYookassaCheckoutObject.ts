import { YooCheckout } from '@a2seven/yoo-checkout';

import { yookassaSecretKey, yookassaShopId } from '@/config/envServer';

export function getYookassaCheckoutObject() {
  return new YooCheckout({ shopId: yookassaShopId, secretKey: yookassaSecretKey });
}
