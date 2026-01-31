https://github.com/lilliputten/mindstack/issues/68
Complete static pages content
Branch: 68-correct-prices
2026.01.31

PR Title: Issue #68: Updated logo, translations, pricing calculations, and routing

- Updated app logo images
- Minor changes include:
    - Updated broken translations
    - Used unified rich text translation data on PricingChoosePage
    - Fixed remaining text-overflow issues
- Updated prices calculation on the PricingChoosePage
- Added dynamic redirect for /prices/choose (without tariff id) to /prices
- Updated base price (proSubscriptionMonthlyBasePrice) and price multipliers for derived currencies (RUB, TGSTAR)
