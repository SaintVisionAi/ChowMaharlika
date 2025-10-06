# ChowMaharlika Backend Architecture 🏆

## Current State: What You Have Built ✅

### **Technology Stack**
- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL with RLS)
- **POS Integration**: Clover API
- **AI Engine**: Claude 3.5 Sonnet (Anthropic)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS (Deep charcoal #0f0f0f + Gold theme)

---

## **Database Schema (Supabase)**

### **Core Tables**
```sql
✅ profiles              # User accounts (email, phone, name)
✅ loyalty_points        # Rewards system (points, tier, total_spent)
✅ products              # Inventory synced from Clover
✅ orders                # Customer orders
✅ order_items           # Line items per order
✅ cart_items            # Persistent shopping cart
✅ support_tickets       # Customer service tickets
✅ support_messages      # Ticket conversation threads
✅ delivery_orders       # 3rd party platform integration
```

### **Key Fields**
- All tables use UUID primary keys
- RLS (Row Level Security) enabled on all tables
- `clover_id` fields link products/orders to POS
- Timestamps: `created_at`, `updated_at`

---

## **API Routes (Currently Implemented)**

### **AI Assistant** 🤖
```
✅ /api/ai/chat (POST)
   - Powered by Claude 3.5 Sonnet
   - Real-time streaming responses
   - Context-aware (user cart, order history, inventory)
   - Rate limited (20 req/min)
   - Product cache (60s TTL)
```

### **Clover POS Integration** 💳
```
✅ /api/clover/sync (POST)           # Sync inventory from Clover
✅ /api/clover/orders (POST)         # Create orders in Clover
✅ /api/clover/payment (POST)        # Process payments
✅ /api/clover/webhooks (POST)       # Receive Clover events
```

### **Delivery Platforms** 🚚
```
✅ /api/delivery/webhook (POST)      # Receive delivery platform webhooks
✅ /api/delivery/orders/[id] (GET)   # Get delivery order status
```

### **Products**
```
✅ /api/products/update-images (POST) # Bulk image updates
```

---

## **Frontend Components**

### **AI Assistant** 🤖
**File**: `components/ai-assistant.tsx`
- **Current Name**: SaintChow
- Floating chat button (gold sparkle icon)
- Full chat interface with streaming responses
- Product recommendation cards (add to cart)
- Conversation history (localStorage)
- Markdown rendering support
- Copy message functionality

### **Support System** 🎫
**File**: `components/support-ticket-form.tsx`
- Ticket submission form
- Categories: order, product, delivery, payment, account, other
- Priority levels: low, medium, high, urgent
- Requires authentication

### **Admin Dashboard** 👑
```
components/admin/
  ✅ clover-sync.tsx              # Manual inventory sync
  ✅ orders-table.tsx             # View all orders
  ✅ products-table.tsx           # Manage products
  ✅ support-tickets-table.tsx    # View/respond to tickets
  ✅ delivery-orders-table.tsx    # Track delivery orders
```

---

## **Data Flows**

### **1. Inventory Management**
```
Admin → /api/clover/sync → Clover API → Supabase products table → Frontend
```

### **2. Order Processing**
```
Customer → Cart → Checkout → Supabase orders table → /api/clover/orders → Clover POS
```

### **3. AI Shopping Assistant (SaintChow)**
```
Customer → Chat input → /api/ai/chat → Claude API → Streaming response → Frontend
                                    ↓
                    Context: Cart + Orders + Inventory
```

### **4. Support Tickets**
```
Customer → Support form → Supabase support_tickets → Admin dashboard → Manual response
```

---

## **Environment Variables (Required)**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clover POS
CLOVER_MERCHANT_ID=526163795887
CLOVER_API_KEY=201e59e6-682a-6a2d-b481-632de79ad2fe
CLOVER_BASE_URL=https://api.clover.com

# AI (Anthropic Claude)
ANTHROPIC_API_KEY=

# Delivery Platforms (Placeholder)
GRUBHUB_API_KEY=
DOORDASH_API_KEY=
UBEREATS_API_KEY=
```

---

## **What You Want: SaintAthena Full-Service AI Agent** 🏆

### **Vision**
Transform the current **SaintChow** (shopping assistant) into **SaintAthena** - a comprehensive customer service AI that handles:

✅ Shopping assistance (already implemented)
🔄 **Order tracking & management**
🔄 **Email processing & responses**
🔄 **Account management**
🔄 **Support ticket resolution**
🔄 **Refunds & modifications**
🔄 **Sign-up assistance**

---

## **Missing Components for SaintAthena** 🚧

### **1. Enhanced AI Backend**
**File**: `app/api/ai/athena/route.ts` (new)
```typescript
// Expanded capabilities:
- Multi-context awareness (orders, tickets, profile)
- Action execution (cancel order, issue refund)
- Email content generation
- Ticket auto-triage
- Sentiment analysis
```

### **2. Email Processing System**
```
📧 Inbound email handling
   - Parse customer emails
   - Extract intent (order issue, question, complaint)
   - Route to SaintAthena for response generation
   - Auto-create support tickets

📤 Outbound email management
   - Order confirmations
   - Status updates
   - Promotional emails
   - Support responses
```

**Required**:
- Email service integration (SendGrid, Postmark, or AWS SES)
- Webhook endpoint for inbound emails
- Email template system

### **3. Order Management API Extensions**
**New routes needed**:
```typescript
POST /api/orders/[id]/cancel       # Cancel order
POST /api/orders/[id]/modify       # Modify order items
POST /api/orders/[id]/refund       # Issue refund
GET  /api/orders/[id]/track        # Get tracking info
POST /api/orders/[id]/reorder      # Quick reorder
```

### **4. Account Management Extensions**
**New routes needed**:
```typescript
POST /api/auth/password-reset      # Password reset flow
PUT  /api/profile/preferences      # Update user preferences
GET  /api/profile/history          # Full order + support history
POST /api/profile/delete           # Account deletion (GDPR)
```

### **5. AI-Powered Support System**
**Enhancements needed**:
```typescript
POST /api/support/auto-resolve     # AI attempts resolution
POST /api/support/escalate         # AI escalates to human
GET  /api/support/suggest          # AI suggests solutions
POST /api/support/email-response   # Generate email response
```

### **6. Conversation Memory System**
**Database additions**:
```sql
-- Store AI conversation context
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  session_id TEXT,
  context JSONB,  -- Cart, orders, preferences
  messages JSONB, -- Full conversation
  resolved BOOLEAN DEFAULT false,
  actions_taken JSONB, -- Log of actions AI performed
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Track AI actions for audit
CREATE TABLE ai_actions_log (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES ai_conversations(id),
  action_type TEXT, -- 'refund', 'cancel', 'email_sent'
  details JSONB,
  success BOOLEAN,
  created_at TIMESTAMPTZ
);
```

### **7. Enhanced AI System Prompt**
Update SaintAthena to have expanded capabilities:
```
You are SaintAthena, the all-knowing AI assistant for Maharlika.

Capabilities:
- Product recommendations & shopping
- Order tracking & modification
- Issue refunds & cancellations
- Answer support tickets
- Manage user accounts
- Draft email responses
- Escalate complex issues

Actions you can take:
- cancel_order(order_id)
- issue_refund(order_id, amount)
- modify_order(order_id, changes)
- update_profile(user_id, fields)
- create_ticket(details)
- resolve_ticket(ticket_id, solution)
- send_email(recipient, content)
```

---

## **Implementation Roadmap** 🗺️

### **Phase 1: Core Enhancements** (Week 1-2)
- [ ] Rename SaintChow → SaintAthena in UI
- [ ] Expand AI system prompt with new capabilities
- [ ] Add order management API routes
- [ ] Implement AI action execution framework
- [ ] Create conversation memory tables

### **Phase 2: Email Integration** (Week 3)
- [ ] Set up email service (SendGrid/Postmark)
- [ ] Create inbound email webhook
- [ ] Build email parser + intent detection
- [ ] Implement auto-response system
- [ ] Add email templates

### **Phase 3: Enhanced Support** (Week 4)
- [ ] AI-powered ticket triage
- [ ] Auto-resolution for common issues
- [ ] Escalation logic
- [ ] Admin dashboard for AI oversight
- [ ] Response quality scoring

### **Phase 4: Account Management** (Week 5)
- [ ] Profile management APIs
- [ ] Password reset flow
- [ ] Account deletion (GDPR compliance)
- [ ] Preference management
- [ ] Privacy controls

### **Phase 5: Testing & Refinement** (Week 6)
- [ ] End-to-end testing
- [ ] AI prompt tuning
- [ ] Performance optimization
- [ ] User feedback collection
- [ ] Analytics dashboard

---

## **Technical Considerations**

### **Security**
- All AI actions must be audited in `ai_actions_log`
- Rate limiting on all AI endpoints
- Financial actions (refunds) require human approval flag
- Sensitive operations need additional verification

### **Performance**
- Cache frequently accessed data (products, user profiles)
- Use streaming for AI responses
- Implement request queuing for high load
- Consider CDN for static assets

### **Monitoring**
- Track AI response quality
- Monitor action success rates
- Alert on anomalies (high refund rate)
- User satisfaction scoring

---

## **Current Pain Points to Address** 🔧

1. **Support tickets are manual** → AI auto-resolution
2. **No email automation** → Full email processing pipeline
3. **Limited order management** → Cancel/modify/refund APIs
4. **Separate systems** → Unified SaintAthena interface
5. **No conversation memory** → Persistent context across sessions

---

## **Success Metrics** 📊

- **AI Resolution Rate**: % of tickets resolved without human intervention
- **Response Time**: Average time to first response
- **Customer Satisfaction**: CSAT score for AI interactions
- **Order Issue Resolution**: Time to resolve order problems
- **Email Automation Rate**: % of emails handled automatically

---

**Ready to build, brother?** 🏆

Next steps:
1. Approve this architecture
2. Start with Phase 1 (Core Enhancements)
3. Deploy incrementally to production
