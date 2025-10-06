# Postman Setup for Clover Webhook

## Step-by-Step Postman Configuration

### Request Details

**Method:** `POST`

**URL:** 
```
https://sandbox.dev.clover.com/v3/merchants/526163795887/webhooks
```

---

### Headers Tab

Add these headers:

| Key | Value |
|-----|-------|
| `Content-Type` | `application/json` |
| `Authorization` | `Bearer 9a135bb3-8049-d54a-91d6-67a08b2dc9c9` |

---

### Body Tab

1. Select **"raw"**
2. Select **"JSON"** from the dropdown
3. Paste this JSON:

```json
{
  "url": "https://www.chowmaharlika.com/api/clover/webhooks",
  "eventTypes": [
    "ORDER_CREATED",
    "PAYMENT_PROCESSED",
    "PAYMENT_AUTHORIZED",
    "PAYMENT_DECLINED",
    "PAYMENT_FAILED"
  ]
}
```

---

### Expected Response

If successful, you should get a `200 OK` or `201 Created` response with webhook details.

---

## Alternative: Simpler Method via Clover Dashboard

Instead of using Postman, you can also:

1. Go to your Clover App Settings
2. Find the "Webhooks" section
3. Click "Set a Webhook URL"
4. Enter: `https://www.chowmaharlika.com/api/clover/webhooks`
5. Click "Send Verification Code"
6. Check Vercel logs for the verification code
7. Enter the code and click "Verify"

---

## Troubleshooting

### If you get a 404 or authentication error:
- Make sure you're using the correct API token
- Verify the merchant ID is correct (526163795887)
- Check that you're using the sandbox URL if in sandbox mode

### If webhook verification fails:
- Check that your app is deployed on Vercel
- Verify the webhook URL is accessible: `https://www.chowmaharlika.com/api/clover/webhooks`
- Check Vercel function logs for any errors
