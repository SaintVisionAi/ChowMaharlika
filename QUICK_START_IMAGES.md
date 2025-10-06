# 🚀 Quick Start: Get Real Product Images (FREE!)

**Time**: 10 minutes setup + 2 hours generation  
**Cost**: $0 (100% FREE)  
**Result**: ~1,200-1,400 real product photos

---

## ⚡ **3-Step Process**

### **Step 1: Get Unsplash API Key** (2 minutes)

1. Open: https://unsplash.com/developers
2. Click "Register as a developer" (free account)
3. Create new application:
   - **Name**: Maharlika Product Images
   - **Description**: Product photos for online grocery store
4. Copy your **Access Key** (starts with something like: `abc123xyz...`)

---

### **Step 2: Add Key to Project** (1 minute)

Open `.env.local` in your editor and find this line:
```bash
UNSPLASH_ACCESS_KEY=YOUR_KEY_WILL_GO_HERE
```

Replace `YOUR_KEY_WILL_GO_HERE` with your actual key:
```bash
UNSPLASH_ACCESS_KEY=abc123xyz_your_actual_key_here
```

**Save the file!**

---

### **Step 3: Generate Images** (Choose One)

#### **Option A: Test First** (Recommended - 2 minutes)

Try it with 10 products first to see how it works:

```bash
cd /Users/saintsrow/projects/ChowMaharlika
npx tsx scripts/generate-images.ts
```

You'll see results like:
```
✅ Fresh Shrimp - Found image!
✅ Salmon Fillet - Found image!
❌ ABC Brand Soy Sauce - Using placeholder
...
```

#### **Option B: Full Generation** (1-2 hours)

Process all products (runs overnight):

```bash
npx tsx scripts/generate-images.ts --full
```

This will:
- Search Unsplash for each product
- Find ~1,200-1,400 real photos
- Update your database automatically
- Keep gradients for products without matches

---

## 📊 **What to Expect**

### **Products That WILL Get Real Photos**:
✅ Fresh Shrimp  
✅ Salmon  
✅ Rice  
✅ Tomatoes  
✅ Bread  
✅ Milk  
✅ Eggs  
✅ Coffee  
✅ Most seafood  
✅ Most produce  

### **Products That KEEP Gradients**:
⭕ "ABC Brand Filipino Sauce 500ml"  
⭕ Specific brand names  
⭕ Very specific product variations  

**This is perfect!** You get real photos where they exist, beautiful gradients for the rest.

---

## 🎯 **Expected Results**

| Category | Products | Real Photos | Gradients |
|----------|----------|-------------|-----------|
| Seafood | 629 | ~440 (70%) | 189 |
| Produce | 58 | ~46 (80%) | 12 |
| Bakery | 40 | ~28 (70%) | 12 |
| Meat | 20 | ~12 (60%) | 8 |
| Dairy | 11 | ~6 (55%) | 5 |
| Grocery | 2,152 | ~700 (32%) | 1,452 |
| **TOTAL** | **2,910** | **~1,232** | **1,678** |

**Bottom Line**: ~42% real photos, 58% gradients = Perfect hybrid!

---

## 💰 **Cost Breakdown**

- Unsplash API: **$0** ✅
- Image storage: **$0** (URLs only) ✅
- Bandwidth: **$0** (Unsplash CDN) ✅
- Maintenance: **$0** ✅

**Total Cost: $0 forever!**

---

## ⏱️ **Timeline**

| Task | Time |
|------|------|
| Get Unsplash key | 2 min |
| Add to .env.local | 1 min |
| Test run (10 products) | 2 min |
| Review results | 2 min |
| Run full generation | 1-2 hrs |
| **TOTAL** | **~2 hours** |

💡 **Tip**: Run the full generation overnight!

---

## 🔍 **Monitoring Progress**

While it's running, you'll see:
```bash
[ImageGen] Found Unsplash image for: Fresh Shrimp
[ImageGen] ✓ Updated: Fresh Shrimp
[ImageGen] Found Unsplash image for: Salmon Fillet
[ImageGen] ✓ Updated: Salmon Fillet
[ImageGen] No image found for: ABC Brand Sauce
[ImageGen] ✓ Updated: ABC Brand Sauce (placeholder)
[ImageGen] Progress: 50/500
```

---

## ✅ **Verify Results**

After generation completes, check in Supabase:

```sql
SELECT 
  category,
  COUNT(*) as total,
  SUM(CASE WHEN image_url LIKE '%unsplash%' THEN 1 ELSE 0 END) as real_photos,
  SUM(CASE WHEN image_url LIKE '%placehold%' THEN 1 ELSE 0 END) as placeholders
FROM products
GROUP BY category;
```

---

## 🚨 **Troubleshooting**

### **"API key not configured"**
- Double-check `.env.local` has your key
- Make sure no extra spaces
- Restart script after adding key

### **"Rate limit exceeded"**
- Unsplash free tier: 50 requests/hour
- Script automatically waits between batches
- Just let it run, it will continue

### **"No images found"**
- Normal for branded products
- They'll use beautiful gradient placeholders
- Still looks professional!

---

## 🎉 **You're Done!**

After running the script:
1. ✅ ~1,200 products have real photos
2. ✅ ~1,700 products have gradients
3. ✅ All 100% free
4. ✅ Professional appearance
5. ✅ Zero maintenance

**Your store now looks amazing!** 🎨

---

## 📞 **Need Help?**

Check these files:
- Full guide: `IMAGE_GENERATION_GUIDE.md`
- POS integration: `POS_INTEGRATION_GUIDE.md`
- Catalog system: `CATALOG_SYSTEM.md`

---

**Ready? Let's do it!** 🚀

```bash
npx tsx scripts/generate-images.ts
```
