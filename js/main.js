/* =====================================================
   CHIKUDEN LABO ｜ main.js  (v5 / Phase 2)
   ─────────────────────────────────────────────
   ・スクロール演出（reveal + anim-*）
   ・問合せフォーム送信（mailto:方式）
   ─────────────────────────────────────────────
   ▼ フォームの送信先メールアドレスは下記 CONTACT_EMAIL を変更
   ===================================================== */

const CONTACT_EMAIL = 'info@chikulabo.jp';


/* スクロール演出（reveal + 全 anim-* クラスを検知） */
(function initRevealAnimation() {
  if (!('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
  });

  // 既存の .reveal + 新しい anim-* クラス全種を監視
  const selectors = [
    '.reveal',
    '.anim-slide-left', '.anim-slide-right',
    '.anim-slide-up', '.anim-slide-down',
    '.anim-pop', '.anim-spin',
    '.anim-bounce', '.anim-fade', '.anim-flip'
  ].join(', ');
  
  document.querySelectorAll(selectors).forEach(el => io.observe(el));
})();


/* フォーム送信（mailto:方式）*/
function handleContactSubmit(event) {
  event.preventDefault();

  const form = document.querySelector('.contact-form-wrap');
  if (!form) return;

  const name  = form.querySelector('[name="name"]').value.trim();
  const email = form.querySelector('[name="email"]').value.trim();
  const tel   = form.querySelector('[name="tel"]').value.trim();
  const plan  = form.querySelector('[name="plan"]').value;
  const msg   = form.querySelector('[name="message"]').value.trim();

  if (!name || !email) {
    alert('お名前とメールアドレスは必須項目です。');
    return;
  }

  const subject = `【無料相談】CHIKUDEN LABO お問合せ - ${name}様`;
  const body = [
    '以下の内容で無料相談を申し込みます。',
    '',
    '【お名前】　　 ' + name,
    '【メール】　　 ' + email,
    '【電話番号】 ' + (tel || '未入力'),
    '【希望プラン】 ' + (plan || '未選択'),
    '',
    '【お問合せ内容】',
    msg || '（内容未入力）',
    '',
    '---',
    'このメールは CHIKUDEN LABO LP より自動作成されました。'
  ].join('\n');

  const mailtoUrl = `mailto:${CONTACT_EMAIL}`
    + `?subject=${encodeURIComponent(subject)}`
    + `&body=${encodeURIComponent(body)}`;

  window.location.href = mailtoUrl;
}


/* スムーズスクロール */
function scrollToElement(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


/* TOPに戻るボタン */
(function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  // スクロール検知（throttle で軽量化）
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 300) {
          btn.classList.add('show');
        } else {
          btn.classList.remove('show');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // クリックでスムーズスクロール
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* 初期化 */
document.addEventListener('DOMContentLoaded', function() {
  const submitBtn = document.querySelector('.form-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', handleContactSubmit);
  }
  document.querySelectorAll('[data-scroll]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-scroll');
      scrollToElement(target);
    });
  });
});