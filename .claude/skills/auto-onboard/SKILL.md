---
name: auto-onboard
description: يمشي معك خطوة بخطوة لإعداد نظام Instagram Carousel Creator بالكامل (تيليقرام + Claude + HCTI + Google Sheets + إنستقرام + n8n) لين تنشر أول كاروسيل. استخدمه عند بدء الإعداد أو عند طلب "ابي ابدأ".
---

# سكل الإعداد التفاعلي — Instagram Carousel Creator

هدفك: تمشي مع المستخدم **خطوة بخطوة** لين ينشر أول كاروسيل، بدون ما تغرقه بالتفاصيل دفعة وحدة. اسأل خطوة، انتظر يخلّصها، ثم انتقل للي بعدها.

## قواعد التعامل
- تكلّم باللهجة العربية الواضحة/الخليجية، ودّي ومختصر.
- **خطوة وحدة في كل رسالة.** لا تعطيه 3 خطوات مرة وحدة.
- بعد كل خطوة اطلب منه يأكد (مثلاً: "جاهز؟ قل تم") قبل تنتقل.
- إذا علق، فكّك المشكلة وارجع للخطوة اللي وقف عندها.
- كل المفاتيح والأسرار تبقى عند المستخدم — لا تطلب منه ينشرها في أي مكان عام.

## الملفات في الحزمة
- `clean-workflow.json` — الـ workflow الجاهز للاستيراد على n8n.
- `clean-template.csv` — أعمدة Google Sheet (استورده كـ Sheet جديد باسم تبويب `Drafts`).
- `README.md` — النظرة العامة.

## قبل ما تبدأ — اعرض القائمة
اعرض عليه الحسابات المطلوبة (مرة وحدة، 30-45 دقيقة):
| الحساب | الكلفة |
|--------|--------|
| n8n Cloud (أو self-hosted) | $20/شهر أو مجاناً |
| Anthropic API | ~$5-10/شهر |
| HCTI (صور) | مجاني 50 صورة/شهر |
| Telegram Bot | مجاني |
| Google Sheets | مجاني |
| Instagram Business + Meta Developer | مجاني |

اسأله: "جاهز نبدأ؟ راح نمشي حساب حساب."

---

## المرحلة 1 — بوت تيليقرام
1. افتح تيليقرام وابحث عن **@BotFather**.
2. أرسل `/newbot` → اختر اسم → اختر username ينتهي بـ `bot`.
3. راح يعطيك **Token** بالشكل `123456:ABC-...`.
4. اطلب منه ينسخ الـ Token ويحفظه (بيستخدمه في n8n لاحقاً).
✅ تأكيد: "معك الـ Token؟"

## المرحلة 2 — مفتاح Anthropic API
1. روح [console.anthropic.com](https://console.anthropic.com) → سجّل دخول.
2. **Billing** → أضف بطاقة (لازم، بدونها بيطلع خطأ 401/402).
3. **API Keys** → Create Key → انسخ المفتاح `sk-ant-...`.
✅ تأكيد: "معك مفتاح Anthropic والبطاقة مسجّلة؟"
> النظام يستخدم موديل `claude-sonnet-4-6` (اقتصادي). تقدر تغيّره لاحقاً من نود "Generate Slides".

## المرحلة 3 — حساب HCTI (تحويل HTML لصور)
1. روح [htmlcsstoimage.com](https://htmlcsstoimage.com) → سجّل (مجاني 50 صورة/شهر).
2. من Dashboard انسخ **User ID** و **API Key**.
✅ تأكيد: "معك User ID و API Key من HCTI؟"

## المرحلة 4 — Google Sheet
1. استورد `clean-template.csv` إلى Google Drive (أو أنشئ Sheet جديد).
2. سمِّ تبويب البيانات **`Drafts`** (مهم — بنفس الاسم).
3. تأكد الأعمدة بالترتيب: `chatId, topic, slides, caption, images, status`.
4. انسخ **Sheet ID** من الرابط (الجزء بين `/d/` و `/edit`).
✅ تأكيد: "الشيت جاهز باسم تبويب Drafts ومعك الـ Sheet ID؟"

## المرحلة 5 — إنستقرام Business + Meta Developer
هذي أطول مرحلة، خذها بهدوء:
1. حوّل حساب إنستقرام إلى **Professional/Business** (من إعدادات إنستقرام).
2. اربطه بصفحة **Facebook Page**.
3. روح [developers.facebook.com](https://developers.facebook.com) → Create App → نوع **Business**.
4. أضف منتج **Instagram Graph API**.
5. من **Graph API Explorer** ولّد **Access Token** بالصلاحيات:
   `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`.
6. احصل على **Instagram User ID** (عبر `/me/accounts` ثم `instagram_business_account`).
✅ تأكيد: "معك Access Token و Instagram User ID؟"
> نصيحة: ولّد **Long-Lived Token** (60 يوم) بدل القصير.

## المرحلة 6 — n8n: استيراد وربط
1. سجّل في [n8n.cloud](https://n8n.cloud) أو استخدم self-hosted.
2. **Import from File** → اختر `clean-workflow.json`.
3. أنشئ الـ Credentials واربطها بالنودات (كل النودات المعلّمة `REPLACE_..._CRED`):
   - **Telegram Bot**: الـ Token من المرحلة 1.
   - **Anthropic API**: نوع Header Auth — الاسم `x-api-key` والقيمة مفتاح `sk-ant-...`. (أو استخدم بيانات اعتماد Anthropic المدمجة إن وُجدت).
   - **Google Sheets**: OAuth2 وربط حساب جوجل.
   - **HCTI**: نوع Basic Auth — Username = User ID، Password = API Key.
4. استبدل `REPLACE_SHEET_ID` في نودات Google Sheets بالـ Sheet ID.
5. لإنستقرام: افتح إعدادات الـ workflow → **Variables/Environment** وأضف:
   - `IG_USER_ID` = Instagram User ID
   - `IG_ACCESS_TOKEN` = Access Token
   (أو عدّلها مباشرة في نود "Prep Publish").
6. **Activate** الـ workflow (يفعّل الـ webhook لتيليقرام).
✅ تأكيد: "كل الـ Credentials مربوطة والـ workflow مفعّل؟"

## المرحلة 7 — التجربة الأولى 🎉
1. افتح محادثة البوت في تيليقرام.
2. أرسل موضوع، مثلاً: `أخبار التصوير`.
3. بتستلم النص → رد: `اعتمد`.
4. بتستلم روابط الصور → رد: `انشر`.
5. الكاروسيل بينشر على إنستقرام 🚀
✅ إذا نجح: "مبروك! نظامك شغّال." 

---

## استكشاف الأخطاء الشائعة
- **401 من Anthropic**: البطاقة مو مسجّلة أو المفتاح غلط → تأكد من Billing.
- **الصور ما تطلع**: تحقق من بيانات HCTI (Basic Auth: User ID / API Key)، وتجاوزت الحد المجاني؟
- **Google Sheets error**: اسم التبويب لازم `Drafts` والأعمدة مطابقة.
- **إنستقرام لا ينشر**: الـ Access Token منتهي (ولّد Long-Lived)، أو الصلاحيات ناقصة، أو الحساب مو Business.
- **البوت ما يرد**: الـ workflow مو Active، أو الـ Telegram credential غلط.
- **رد Claude مو JSON**: نود "Parse Slides" يعالج أغلب الحالات؛ إذا تكرر، قلّل تعقيد الموضوع.

## البنية باختصار
```
تيليقرام → Router (موضوع/اعتمد/انشر)
  موضوع → Claude يكتب 6 سلايدات → حفظ بالشيت → إرسال النص
  اعتمد → قراءة الشيت → بناء 6 HTML → HCTI صور → حفظ → معاينة
  انشر  → قراءة الصور → Instagram Graph API (عناصر → كاروسيل → نشر) → تأكيد
```
