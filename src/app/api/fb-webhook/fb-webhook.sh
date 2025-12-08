#!/bin/bash

# LOCAL Next.js dev server
WEBHOOK_URL="http://localhost:3000/api/fb-webhook"

echo "--------------------------------------------"
echo "Testing GET Verification (Next.js webhook)"
echo "--------------------------------------------"

curl -X GET "$WEBHOOK_URL?hub.mode=subscribe&hub.verify_token=limbu123&hub.challenge=123456" \
  -H "Content-Type: application/json"

echo ""
echo "--------------------------------------------"
echo "Testing POST WhatsApp Webhook Event (Next.js)"
echo "--------------------------------------------"

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [
      {
        "id": "TEST_WA_ACCOUNT",
        "changes": [
          {
            "value": {
              "messages": [
                {
                  "from": "919876543210",
                  "id": "wamid.TESTMESSAGE",
                  "timestamp": "1700000000",
                  "type": "text",
                  "text": {
                    "body": "Hello from Next.js cURL script!"
                  }
                }
              ]
            },
            "field": "messages"
          }
        ]
      }
    ]
  }'

echo ""
echo "--------------------------------------------"
echo "Webhook Test Complete"
echo "--------------------------------------------"
