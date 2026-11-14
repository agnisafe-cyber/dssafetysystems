# DS Safety Systems — WhatsApp Agent

A WhatsApp Cloud API webhook assistant for DS Safety Systems. It answers routine business questions using the supplied business facts and helps collect customer enquiry/booking details. It does **not** confirm appointments, orders, prices, stock, or delivery.

## Business details preloaded
- **Business:** DS Safety Systems
- **Phone:** +91 98187 01683
- **Address:** Ground floor, Kalka Ji, 1420/13, Block 4, Govindpuri Extension, Chittaranjan Park, New Delhi, Delhi 110019
- **Hours:** 9:00 AM–9:00 PM, as shown on the supplied Google Business Profile
- **Website:** https://agnisafe-cyber.github.io/dssafetysystems/
- **ABC dry-powder extinguisher capacities:** 2 kg, 4 kg, 6 kg and 9 kg

## Deployment requirements
This repository is hosted on GitHub Pages, which is static hosting and cannot run a WhatsApp webhook. The Worker must be deployed to Cloudflare Workers (or another server capable of receiving HTTPS webhooks). A real WhatsApp connection also requires a Meta WhatsApp Business Platform app and its approved business phone number.

1. Create a Cloudflare account and a Worker named `ds-safety-whatsapp-agent`.
2. Create a Cloudflare KV namespace and bind it to the Worker as `CHAT_STATE`. Replace the placeholder KV namespace ID in `wrangler.toml`.
3. Add these Worker secrets/variables in Cloudflare:
   - `WHATSAPP_VERIFY_TOKEN` — choose a long random value; use the same value in Meta webhook setup.
   - `WHATSAPP_ACCESS_TOKEN` — Meta WhatsApp Cloud API access token.
   - `PHONE_NUMBER_ID` — Meta phone number ID (not the visible phone number).
   - `OPENAI_API_KEY` — OpenAI API key.
   - Optional variable `OPENAI_MODEL` — defaults to `gpt-4o-mini`.
4. Deploy the Worker. Set the Meta webhook callback URL to `https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/webhook`, enter the same verify token, and subscribe to the `messages` webhook field.
5. Configure the Meta app, WhatsApp Business account, phone number, and production access according to Meta's current onboarding requirements. Test with an allowed recipient before enabling customer traffic.

## Local/deploy commands
Install Wrangler, then run:
```bash
npm install -g wrangler
wrangler login
wrangler kv namespace create CHAT_STATE
# Copy the returned namespace ID into wrangler.toml
wrangler secret put WHATSAPP_VERIFY_TOKEN
wrangler secret put WHATSAPP_ACCESS_TOKEN
wrangler secret put PHONE_NUMBER_ID
wrangler secret put OPENAI_API_KEY
wrangler deploy
```

## Important
- **Not live yet:** the code is committed to the website repository, but no Cloudflare Worker or Meta webhook has been deployed/connected from this repository.
- Never put API tokens or secrets in GitHub files.
- The assistant stores short chat history in KV for up to 14 days. Set appropriate privacy notices and retention practices before production use.
- WhatsApp's customer-service window, template-message rules, Meta policies, and applicable local requirements still apply.
- Human staff should verify every booking/enquiry and all commercial details.
