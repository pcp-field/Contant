# مُصمّم فطين — بديل HCTI مجاني وبلا حدود

خدمة تحوّل HTML إلى صورة PNG بجودة عالية (Chrome حقيقي)، وتستضيف الصورة وترجّع **رابطًا عامًّا** —
بنفس شكل ردّ HCTI (`{ "url": "..." }`) تمامًا، فلا يتغيّر أي شيء آخر في n8n.

## ليش؟
- مجاني للأبد (ضمن حدود Vercel Hobby السخية) وبلا اشتراك.
- جودة أعلى: Chromium حقيقي + الخطوط المضمّنة تظهر مضبوطة.
- الصور تُحفظ على Vercel Blob (روابط دائمة) — تشتغل مع نشر إنستقرام.

## خطوات النشر (٥ دقائق، مرة وحدة)
1. ادخل https://vercel.com وسجّل دخول بحساب GitHub (مجاني).
2. **Add New → Project** → استورد مستودع `pcp-field/Contant`.
3. في إعداد المشروع، اضبط **Root Directory** = `render-service`.
4. اضغط **Deploy** وانتظر ينتهي.
5. فعّل التخزين: من صفحة المشروع → **Storage → Create → Blob** → اربطه بالمشروع.
   (هذا يضيف متغيّر البيئة `BLOB_READ_WRITE_TOKEN` تلقائيًا.)
6. أعد النشر (**Redeploy**) عشان يلتقط متغيّر Blob.
7. رابطك صار: `https://<اسم-مشروعك>.vercel.app/api/render`
   - تأكد: افتحه بالمتصفح (GET) لازم يرجّع `{"ok":true,...}`.

## ربطه في n8n (عقدة "HCTI API" — تعديل بسيط)
- **URL** → `https://<اسم-مشروعك>.vercel.app/api/render`
- **Authentication** → `None` (احذف الـ Basic Auth القديم).
- **Send Body** → JSON، والمحتوى:
  ```
  ={{ JSON.stringify({ html: $json.html, width: 1080, height: 1350, scale: 2 }) }}
  ```
- الباقي زيّه (يرجّع `{ url }`، وعقدة "Download Image" و نشر إنستقرام يشتغلون بدون تغيير).

## اختبار سريع
```bash
curl -X POST https://<اسم-مشروعك>.vercel.app/api/render \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1 style=\"font-family:sans-serif\">مرحبا فطين</h1>"}'
```
المفروض يرجّع `{ "url": "https://....png" }`.
