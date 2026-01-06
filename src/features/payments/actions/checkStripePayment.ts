'use server';

import Stripe from 'stripe';

import { stripeSecretKey } from '@/config/envServer';
import { CustomAPIError } from '@/lib/errors';
import { getErrorText } from '@/lib/helpers';
import { getCurrentUser } from '@/lib/session';

export interface TCheckStripePaymentParams {
  paymentId: string;
  uniqueKey: string; // Idempotency key
}

export async function checkStripePayment(params: TCheckStripePaymentParams) {
  const { paymentId } = params;

  const user = await getCurrentUser();
  if (!user?.id) {
    throw new CustomAPIError('Cannot proceed payments for unauthorized users');
  }

  try {
    const stripeConfig: Stripe.StripeConfig = {
      // apiVersion: '2022-11-15',
    };
    const stripe = new Stripe(stripeSecretKey, stripeConfig);

    const result = await stripe.checkout.sessions.retrieve(paymentId, {
      expand: ['payment_intent'],
    });

    /* // Sample result data:
     * {
     *   "id": "cs_test_a1wuiKIARBw24v9bHuoCfBz8j4JLBANGnz1qUGEEp3zMxl9t7SpifxoFw5",
     *   "object": "checkout.session",
     *   "adaptive_pricing": {
     *     "enabled": true
     *   },
     *   "after_expiration": null,
     *   "allow_promotion_codes": null,
     *   "amount_subtotal": 200,
     *   "amount_total": 200,
     *   "automatic_tax": {
     *     "enabled": false,
     *     "liability": null,
     *     "provider": null,
     *     "status": null
     *   },
     *   "billing_address_collection": null,
     *   "branding_settings": {
     *     "background_color": "#22224a",
     *     "border_style": "rounded",
     *     "button_color": "#4488ff",
     *     "display_name": "Mind Stack Trainer",
     *     "font_family": "default",
     *     "icon": {
     *       "file": "file_1SmYyML41uPceS6JOL1mVax9",
     *       "type": "file"
     *     },
     *     "logo": {
     *       "file": "file_1SmYy8L41uPceS6JTfvdZ93P",
     *       "type": "file"
     *     }
     *   },
     *   "cancel_url": "http://localhost:3000/pricing/choose/pro-month/cancel/stripe-72i3",
     *   "client_reference_id": null,
     *   "client_secret": null,
     *   "collected_information": null,
     *   "consent": null,
     *   "consent_collection": null,
     *   "created": 1767702792,
     *   "currency": "usd",
     *   "currency_conversion": null,
     *   "custom_fields": [],
     *   "custom_text": {
     *     "after_submit": null,
     *     "shipping_address": null,
     *     "submit": null,
     *     "terms_of_service_acceptance": null
     *   },
     *   "customer": null,
     *   "customer_account": null,
     *   "customer_creation": "if_required",
     *   "customer_details": {
     *     "address": {
     *       "city": null,
     *       "country": "RU",
     *       "line1": null,
     *       "line2": null,
     *       "postal_code": null,
     *       "state": null
     *     },
     *     "business_name": null,
     *     "email": "dmia@yandex.ru",
     *     "individual_name": null,
     *     "name": "test",
     *     "phone": null,
     *     "tax_exempt": "none",
     *     "tax_ids": []
     *   },
     *   "customer_email": null,
     *   "discounts": [],
     *   "expires_at": 1767789191,
     *   "invoice": null,
     *   "invoice_creation": {
     *     "enabled": false,
     *     "invoice_data": {
     *       "account_tax_ids": null,
     *       "custom_fields": null,
     *       "description": null,
     *       "footer": null,
     *       "issuer": null,
     *       "metadata": {},
     *       "rendering_options": null
     *     }
     *   },
     *   "livemode": false,
     *   "locale": null,
     *   "metadata": {
     *     "subscriptionType": "PRO-MONTH",
     *     "uniqueKey": "72i3",
     *     "userId": "cmju7mvl60009nvr4xdpfi70s"
     *   },
     *   "mode": "payment",
     *   "origin_context": null,
     *   "payment_intent": {
     *     "id": "pi_3SmZS9L41uPceS6J1SKu0bbf",
     *     "object": "payment_intent",
     *     "amount": 200,
     *     "amount_capturable": 0,
     *     "amount_details": {
     *       "shipping": {
     *         "amount": 0,
     *         "from_postal_code": null,
     *         "to_postal_code": null
     *       },
     *       "tax": {
     *         "total_tax_amount": 0
     *       },
     *       "tip": {}
     *     },
     *     "amount_received": 200,
     *     "application": null,
     *     "application_fee_amount": null,
     *     "automatic_payment_methods": null,
     *     "canceled_at": null,
     *     "cancellation_reason": null,
     *     "capture_method": "automatic_async",
     *     "client_secret": "pi_3SmZS9L41uPceS6J1SKu0bbf_secret_oPQbDWwGvVGUxDY5FWUI9WR6E",
     *     "confirmation_method": "automatic",
     *     "created": 1767702817,
     *     "currency": "usd",
     *     "customer": null,
     *     "customer_account": null,
     *     "description": null,
     *     "excluded_payment_method_types": null,
     *     "last_payment_error": null,
     *     "latest_charge": "ch_3SmZS9L41uPceS6J1PI0zUxK",
     *     "livemode": false,
     *     "metadata": {},
     *     "next_action": null,
     *     "on_behalf_of": null,
     *     "payment_details": {
     *       "customer_reference": null,
     *       "order_reference": "prod_Tk3YrFMt0X8T2x"
     *     },
     *     "payment_method": "pm_1SmZS9L41uPceS6JyMmTR3u5",
     *     "payment_method_configuration_details": null,
     *     "payment_method_options": {
     *       "card": {
     *         "installments": null,
     *         "mandate_options": null,
     *         "network": null,
     *         "request_three_d_secure": "automatic"
     *       }
     *     },
     *     "payment_method_types": [
     *       "card"
     *     ],
     *     "processing": null,
     *     "receipt_email": "dmia@yandex.ru",
     *     "review": null,
     *     "setup_future_usage": null,
     *     "shipping": null,
     *     "source": null,
     *     "statement_descriptor": null,
     *     "statement_descriptor_suffix": null,
     *     "status": "succeeded",
     *     "transfer_data": null,
     *     "transfer_group": null
     *   },
     *   "payment_link": null,
     *   "payment_method_collection": "if_required",
     *   "payment_method_configuration_details": null,
     *   "payment_method_options": {
     *     "card": {
     *       "request_three_d_secure": "automatic"
     *     }
     *   },
     *   "payment_method_types": [
     *     "card"
     *   ],
     *   "payment_status": "paid",
     *   "permissions": null,
     *   "phone_number_collection": {
     *     "enabled": false
     *   },
     *   "recovered_from": null,
     *   "saved_payment_method_options": null,
     *   "setup_intent": null,
     *   "shipping_address_collection": null,
     *   "shipping_cost": null,
     *   "shipping_options": [],
     *   "status": "complete",
     *   "submit_type": null,
     *   "subscription": null,
     *   "success_url": "http://localhost:3000/pricing/choose/pro-month/success/stripe-72i3",
     *   "total_details": {
     *     "amount_discount": 0,
     *     "amount_shipping": 0,
     *     "amount_tax": 0
     *   },
     *   "ui_mode": "hosted",
     *   "url": null,
     *   "wallet_options": null
     * }
     */

    const { payment_status: status } = result;

    const isPaid = status === 'paid';

    const resultData = {
      status,
      isPaid,
    };

    return resultData;
  } catch (error) {
    const message = 'Error checking stripe payment';
    const details = getErrorText(error);
    const comboMsg = [message, details].filter(Boolean).join(': ');
    // eslint-disable-next-line no-console
    console.error('[checkStripePayment]', comboMsg, {
      error,
      paymentId,
    });
    debugger; // eslint-disable-line no-debugger
    // Re-throw errors from checkAllowedAIGenerations or other errors
    throw error;
  }
}
