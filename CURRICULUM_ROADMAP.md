# Save4Dream — Curriculum-Aligned Roadmap

**Date:** 2026-05-14
**Context:** Mapping the app against Israel's official financial-education curriculum and the new mandatory program rolling out (תכנית "חינוך פיננסי" — תשפ"ז, mandatory from 9th grade in 2027, integrated into elementary "מולדת, חברה ואזרחות" today).

---

## Current Coverage vs. Curriculum

| Curriculum Topic (משרד החינוך) | Grade Band | In App? |
|---|---|---|
| הכנסה והוצאה (income vs. expenses) | 3-4 | ✅ Budget lesson |
| צרכים מול רצונות | 3-4 | ✅ Needs/Wants lesson + shop tagging |
| חיסכון ודחיית סיפוקים | 3-4 | ✅ Save tab + milestones |
| היסטוריית הכסף (סחר חליפין → מטבעות → דיגיטלי) | 3-4 | ❌ |
| שטרות ומטבעות ישראליים + סימני אבטחה | 3-4 | ❌ |
| השוואת מחירים, צרכנות נבונה | 5-6 | ✅ Lesson |
| ריבית פשוטה ואחוזים | 5-6 | ✅ Lesson |
| בנק, כספומט, אמצעי תשלום | 5-6 | 🟡 Lesson exists, no app/UI for digital wallets |
| אינפלציה | 5-6 | ✅ Lesson |
| כסף וחיסכון (השקעות, סיכון/הזדמנות) | 7-9 | 🟡 Investing lesson stub only |
| תלוש שכר (gross/net, ביטוח לאומי, מס) | 7-9 | ❌ |
| חוק עבודת הנוער + זכויות עובדים | 7-9 | ❌ |
| הגנה מהונאות וסייבר (phishing, חנויות מזויפות) | 7-9 | ❌ |
| יזמות (תכנון עסק, רווח, תמחור) | 7-9 | ❌ |
| פנסיה והשקעה לטווח ארוך | 7-9 | ❌ |
| מע"מ ומסים — מבוא | 7-9 | ❌ |
| חיסכון לכל ילד (ביטוח לאומי) | ערך לאומי | ❌ |
| צדקה ונתינה | חינוך לערכים | 🟡 lesson exists; no budget slider |
| זכויות צרכן (חוק הגנת הצרכן) | 5-9 | ❌ |

---

## Recommended New Features — Ranked

### Tier 1 — High curriculum fit, low build cost

1. **תלוש שכר אינטראקטיבי (interactive pay-stub)** — explicitly required from תשפ"ז. A new lesson + simulator: drag the slider for gross salary; the app computes ביטוח לאומי, מס הכנסה, פנסיה deductions and reveals net. Two age tracks (אזרחים/ערך כללי for ages 9-11, פירוט מלא for 12+).

2. **הונאות וסייבר — מיני-משחק "Real or Fake?"** (also required in תשפ"ז). Cards show an SMS, ad, or website — kid chooses "אמיתי" / "מזויף". Examples: PayBox phishing, "אתה זכית באייפון", fake Shufersal coupon. Each round explains the red flag (URL mismatch, urgency, request for password). Cheap to author, hugely topical.

3. **חיסכון לכל ילד simulator** — uniquely Israeli, every kid has one but most don't know. Compound-interest calculator that shows the kid: "אם אבא/אמא יוסיפו 57₪ נוספים בחודש, בגיל 18 יהיו לך X₪". Default 57₪/month from ביטוח לאומי, slider for parent matching, toggle for בנק vs. קופת גמל. Connects directly to math curriculum.

4. **Onboarding name entry** — currently the default user name is empty (was hardcoded "אופיר"). Add a first-launch flow that asks `מה השם שלך?` and optionally `בן/בת כמה?` to age-gate future content (teen track 12+).

5. **Banknote-recognition mini-game** — explicit elementary curriculum. Display Israeli notes/coins with security features (Leah Goldberg on the 100, Shaul Tchernichovsky on the 50, hologram strip), kid matches features to bills. Pure content, no new mechanics.

6. **Charity slider in Save tab** — already a values pillar, currently a lesson only. Add a "10% צדקה" slider on every deposit so the kid can choose to route part of savings to a "צדקה" pot, with a counter ("נתת השנה: 120₪"). Builds a habit, not just knowledge.

### Tier 2 — Medium effort, big curriculum coverage

7. **יזמות track ("הקמת עסק קטן")** — a new tab or sub-flow where the kid designs a fictional small business (לימונדה, צמידים, וובינר). Steps: choose product → set price → calculate cost → simulate 7 days of sales (random demand) → see profit/loss. Aligns with the Ministry's "יזמות וחדשנות" track. Reuses existing coin economy.

8. **Digital-wallet simulator (BIT / PayBox / כרטיס אשראי)** — when a kid "buys" something in the shop, ask which payment method and explain trade-offs (BIT = immediate from account; credit card = bill at month-end). Tie into the existing shop tab. Teaches the difference between debit/credit/digital that the new curriculum requires.

9. **Investing 101 track for ages 11+** — risk vs. return mini-game. Show three "investments" — savings account (4% safe), bond (6% medium), stock (random −20% to +30%). Kid splits 1000 virtual coins. Run the year as a 10-second animation, see results, replay. Teaches diversification viscerally. Required topic 7-9.

10. **VAT / מע"מ awareness toggle** — every shop price has a hidden "18% מע"מ" toggle. Tap a price → see breakdown (`80₪ price = 67.80₪ + 12.20₪ מע"מ`). Tiny feature, big curriculum hit on consumer-rights/tax basics.

### Tier 3 — Reach goals (months)

11. **Parent dashboard / משימות מהבית** — parents define real-world chores with real reward amounts (sync via QR code or PIN), the kid completes in-app, parent confirms; coins map to real shekels saved into a real piggy bank. Bridges the virtual/real gap that other Israeli apps (Pelephone Kids, Bituach Yashir's "כספיון") use as their main hook.

12. **Multi-child profiles** — currently single-user (all localStorage). Add up to 4 profiles in one device so siblings can each have an account, or a teacher can use one tablet in class.

13. **Classroom mode (כיתה)** — printable QR/PIN code, teacher leaderboard, class-wide weekly challenges. Ministry's GAFAN catalog (גפ"ן) lists approved providers; getting on it requires a teacher-facing surface.

14. **חוק עבודת הנוער quiz pack** — for 12+ users only, a quiz/scenario series on minimum age for work, max hours, minimum wage, what's a פסק זמן. Aligns with 7-9 curriculum.

15. **AI-tutored Q&A (re-enabling Gemini safely)** — the AI was disabled for API-key reasons. Re-enable via a Netlify Function proxy with rate-limiting + content filter, expose as a "שאל את הסנאי" chat. Output is curated to a list of finance topics; refuses everything else. Major engagement driver.

---

## Sources

- משרד החינוך — חינוך פיננסי ביסודי: https://pop.education.gov.il/financial-education/financial-education-elementary/
- משרד החינוך — חינוך פיננסי במולדת/חברה/אזרחות: https://pop.education.gov.il/tchumey_daat/moledet_hevra_ezrahut/yesodi/noseem_nilmadim/hinuch_pinansi/
- בנק ישראל — סדרת "כסף קטן" (מרץ 2024): https://www.boi.org.il/publications/pressreleases/05-03-2024/
- חוזר ynet — חינוך פיננסי חובה החל מתשפ"ז: https://www.ynet.co.il/economy/article/s1c10kyubg
- ביטוח לאומי — חיסכון לכל ילד: https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/default.aspx
- אורט — "להבין את הכסף" (תכנית גפ"ן): https://money.ort.org.il/
