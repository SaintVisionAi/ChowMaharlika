# 🚀 QUICK START - Test SaintAthena Now!

## ⚡ **5-MINUTE SETUP**

### **Step 1: Copy Environment Variables** (1 min)
```bash
# Copy example to .env.local
cp .env.example .env.local

# Edit with your Vercel values
nano .env.local
```

**What to copy from Vercel:**
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY  
- ANTHROPIC_API_KEY

### **Step 2: Install Dependencies** (2 mins)
```bash
pnpm install
```

### **Step 3: Run Database Migration** (1 min)
```bash
# Option A: Via Supabase Dashboard
# 1. Go to https://supabase.com/dashboard
# 2. Select your project
# 3. Go to SQL Editor
# 4. Copy contents of scripts/009_add_order_management.sql
# 5. Click "Run"

# Option B: Via command line (if you have direct access)
# psql <your-connection-string> -f scripts/009_add_order_management.sql
```

### **Step 4: Start Dev Server** (1 min)
```bash
pnpm dev
```

---

## 🧪 **TESTING CHECKLIST**

### **Test 1: AI Chat Works** ✅
1. Open http://localhost:3000
2. Click the gold sparkle button (bottom right)
3. Type "Hello SaintAthena"
4. You should see a response

**Expected:** SaintAthena introduces herself and offers help

### **Test 2: Order History API** ✅
```bash
# Open new terminal
curl http://localhost:3000/api/orders/history
```

**Expected:** JSON response with pagination (or empty array if no orders)

### **Test 3: AI Tool Calling** ✅
1. In the chat, type: "Show me my order history"
2. Watch browser console (F12)
3. Look for: `tool_use` in the stream

**Expected:** Console shows Claude wants to use `get_order_history` tool

### **Test 4: Action Logging** ✅
```bash
curl -X POST http://localhost:3000/api/ai/actions \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "get_order_history",
    "action_data": {"page": 1, "limit": 10}
  }'
```

**Expected:** Returns `{"success": true, "action_id": "uuid", "status": "pending"}`

---

## 🎤 **OPTIONAL: Add Voice** (If you have Azure key)

### **Install Voice SDK** (30 seconds)
```bash
pnpm add microsoft-cognitiveservices-speech-sdk
```

### **Add to .env.local**
```bash
AZURE_SPEECH_KEY=your-azure-key
AZURE_SPEECH_REGION=eastus
```

### **Create Voice Files** (See VOICE_ACCESSIBILITY.md)
1. Copy `lib/voice/azure-speech.ts` code
2. Copy `app/api/voice/recognize/route.ts` code
3. Copy `app/api/voice/synthesize/route.ts` code
4. Copy `components/voice-button.tsx` code

---

## 🐛 **TROUBLESHOOTING**

### **Problem: "Module not found" errors**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
pnpm install
```

### **Problem: "Supabase connection failed"**
```bash
# Check your .env.local has correct URL and keys
cat .env.local | grep SUPABASE

# Test connection
curl https://bezyjavdabjynvsblpwp.supabase.co
```

### **Problem: "Migration failed"**
- Make sure you're using the right Supabase project
- Check if tables already exist
- Try running migrations one by one

### **Problem: TypeScript errors**
```bash
# Regenerate types
pnpm supabase gen types typescript --local > types/supabase.ts

# Or ignore for now
# (errors are set to be ignored in next.config.js)
```

---

## 📊 **VERIFY DATABASE**

### **Check Tables Created**
```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected tables:**
- ai_actions ✅
- ai_conversations ✅
- cart_items ✅
- delivery_orders ✅
- loyalty_points ✅
- order_items ✅
- orders ✅
- products ✅
- profiles ✅
- support_messages ✅
- support_tickets ✅

### **Check Order Cancellation Fields**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders'
AND column_name IN ('cancelled_at', 'cancellation_reason', 'cancelled_by');
```

**Expected:** 3 rows returned

---

## 🎯 **WHAT TO TRY**

### **Scenario 1: Product Recommendations**
- Ask: "What's good for grilling?"
- Expected: Product recommendations with prices

### **Scenario 2: Order History**  
- Ask: "Show my orders"
- Expected: Tool use detected (check console)

### **Scenario 3: Order Cancellation**
- Ask: "Cancel my last order"
- Expected: Tool use for `cancel_order` (needs confirmation UI)

---

## 📱 **MOBILE TESTING**

```bash
# Get your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Update .env.local
CORS_ORIGIN=http://YOUR_IP:3000

# Restart server
pnpm dev

# Test on phone
# Open: http://YOUR_IP:3000
```

---

## 🚀 **DEPLOY TO VERCEL**

```bash
# Commit changes
git add .
git commit -m "feat: Phase 1 & 2 complete - Order management + AI actions"

# Push to trigger deploy
git push origin main

# Or manual deploy
vercel --prod
```

### **Add Environment Variables to Vercel**
```bash
# Via CLI
vercel env add AZURE_SPEECH_KEY
vercel env add AZURE_SPEECH_REGION

# Or via dashboard
# https://vercel.com/your-project/settings/environment-variables
```

---

## ✅ **SUCCESS CRITERIA**

**You'll know it's working when:**
- ✅ SaintAthena responds in chat
- ✅ Console shows `tool_use` events
- ✅ `/api/orders/history` returns data
- ✅ `/api/ai/actions` logs actions
- ✅ Database has new tables
- ✅ No console errors

---

## 🎉 **YOU'RE READY!**

Once these tests pass, you have:
- ✅ Full order management backend
- ✅ AI action framework
- ✅ Tool calling infrastructure
- ✅ Action logging & audit trail
- ⏳ Just need 20 lines of frontend code (confirmation UI)

**Next:** Add voice or test with real orders! 🚀
