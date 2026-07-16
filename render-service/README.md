# مُصمّم فطين — صور (كاروسيل) + ريل متحرّك، مجاني وبلا حدود

خدمة واحدة تسوّي شيئين، وترفع الناتج على **Cloudinary** وترجّع رابطًا دائمًا:

| المسار | يسوّي | الرد |
|--------|-------|------|
| `POST /render` | HTML → صورة PNG (بديل HCTI بالضبط) | `{ "url": "...png" }` |
| `POST /reel`   | محتوى السلايدات → **فيديو MP4 متحرّك** | `{ "url": "...mp4" }` |
| `GET /`        | فحص الصحة | `{ "ok": true }` |

- **مجاني للأبد** (Render.com free + Cloudinary free).
- **جودة عالية**: Chrome حقيقي + الخطوط المضمّنة.
- **روابط دائمة** (تشتغل مع نشر إنستقرام صور وريل).

## 1) نشر الخدمة على Render.com (مرة وحدة)
1. ادخل https://render.com وسجّل بحساب GitHub (مجاني).
2. **New → Web Service** → اختر مستودع `pcp-field/Contant`.
3. الإعدادات:
   - **Root Directory**: `render-service`
   - **Runtime**: Docker (يلتقط `Dockerfile` تلقائيًا)
   - **Instance Type**: Free
4. **Environment** → أضف متغيّرات Cloudinary (من حسابك المجاني على cloudinary.com → Dashboard):
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
5. **Create Web Service** وانتظر النشر. رابطك يصير: `https://<اسمك>.onrender.com`
   - تأكد: افتح الرابط (GET) لازم يرجّع `{"ok":true,...}`.

> ملاحظة: الخطة المجانية "تنام" بعد ١٥ دقيقة خمول (أول طلب بعدها يتأخر ~٣٠-٦٠ ثانية ثم يشتغل). n8n مضبوط على إعادة المحاولة، فيتكفّل بهذا.

## 2) اختبار سريع (curl)
```bash
# صورة
curl -X POST https://<اسمك>.onrender.com/render \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1 style=\"font-family:sans-serif\">فطين</h1>"}'

# ريل (مرّر نفس محتوى السلايدات JSON)
curl -X POST https://<اسمك>.onrender.com/reel \
  -H "Content-Type: application/json" \
  -d '{"content":"{\"topic\":\"تجربة\",\"slides\":[{\"type\":\"cover\",\"title_line1\":\"مرحبا\",\"title_line2_grad\":\"فطين\"}]}"}'
```
كل واحد يرجّع `{ "url": "..." }`.

## 3) ربطه في n8n
### الكاروسيل (استبدال HCTI مجانًا)
عقدة **HCTI API**:
- **URL** → `https://<اسمك>.onrender.com/render`
- **Authentication** → None
- **Body (JSON)** → `={{ JSON.stringify({ html: $json.html, width: 1080, height: 1350, scale: 2 }) }}`
- الباقي زيّه (يرجّع `{url}`).

### الريل (أمر "ريل")
- في **Parse Message**: أضف كشف `ريل` / `reel` → `type = 'reel'`.
- فرع جديد: `Is Reel?` → قراءة آخر محتوى معتمد → **HTTP POST** `/reel` بالجسم:
  `={{ JSON.stringify({ content: $json.contentJson }) }}`
  → ترجع `{url}` (رابط MP4) → أرسله للتلقرام (sendVideo) و/أو انشره كـ Reel على إنستقرام.

> أرسل لي رابط خدمتك بعد النشر وأنا أجهّز لك فرع "ريل" كامل في الـ workflow (توليد + إرسال + نشر Reel على إنستقرام).


## صوت الريل (اختياري) — قانوني فقط ⚠️
مرّر رابط **موسيقى بلا حقوق (royalty-free)** في `/reel`:
```
{ "content": "...", "audio": "https://.../track.mp3" }
```
مصادر مجانية قانونية: **Pixabay Music**، **Mixkit**، **YouTube Audio Library**، **Uppbeat**.

- ممنوع استخدام صوت منسوخ من منشورات غيرك (حقوق ملكية — إنستقرام يكتمه/يحظره).
- للأصوات الرائجة: انشر الريل بدون صوت، ثم أضف **الصوت الرائج من مكتبة إنستقرام** داخل التطبيق وقت النشر (قانوني + أعلى وصول).
