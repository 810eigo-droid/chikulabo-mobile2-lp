/* =====================================================
   CHIKUDEN LABO ｜ main.js  (v7 / Phase 4 - アニメ動作修正)
   ─────────────────────────────────────────────
   ・スクロール演出（reveal + anim-*）
   ・問合せフォーム送信（Web3Forms 経由・自動メール送信）
   ─────────────────────────────────────────────
   v6 → v7 修正点
   ・スクロール演出と back-to-top を DOMContentLoaded 配下へ移動
   ・スクリプト読込タイミングで要素が未生成のまま observe される
     問題を解消（要素ゼロで空振りしていた）
   ・古いブラウザ用フォールバック追加（IntersectionObserver 非対応時）
   ・動作確認用 console.log を追加（F12 Console で件数を確認可能）
   ===================================================== */


/* ===== スクロール演出（reveal + 全 anim-* クラスを検知） ===== */
function initRevealAnimation() {
  // 古いブラウザは IO 非対応 → 全要素を即「.in」にして表示
  if (!('IntersectionObserver' in window)) {
    document
      .querySelectorAll('.reveal, [class*="anim-"]')
      .forEach(el => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px 100px 0px'
  });

  const selectors = [
    '.reveal',
    '.anim-slide-left', '.anim-slide-right',
    '.anim-slide-up', '.anim-slide-down',
    '.anim-pop', '.anim-spin',
    '.anim-spin-right', '.anim-spin-double',
    '.anim-tilt-in-left', '.anim-tilt-in-right',
    '.anim-spin-tilt-left', '.anim-spin-tilt-right', '.anim-spin-tilt-double',
    '.anim-stamp-in',
    '.anim-bounce', '.anim-fade', '.anim-flip'
  ].join(', ');

  const targets = document.querySelectorAll(selectors);
  // ▼ 動作確認用：F12 Console に「[CHIKUDEN] reveal targets: 〇〇」と表示される
  console.log('[CHIKUDEN] reveal targets:', targets.length);
  targets.forEach(el => io.observe(el));
}


/* ===== TOPに戻るボタン ===== */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

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

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ===== フォーム送信（Web3Forms 経由・非同期） ===== */
async function handleContactSubmit(event) {
  event.preventDefault();

  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('.form-submit');
  const resultDiv = form.querySelector('#form-result');
  const formGrid  = form.querySelector('.form-grid');
  const formNote  = form.querySelector('.form-note');
  const formDisclaimer = form.querySelector('.form-disclaimer');

  // 必須チェック
  const name  = form.querySelector('[name="name"]').value.trim();
  const email = form.querySelector('[name="email"]').value.trim();
  if (!name || !email) {
    alert('お名前とメールアドレスは必須項目です。');
    return;
  }

  // 送信中状態
  submitBtn.disabled = true;
  submitBtn.classList.add('is-loading');

  const formData = new FormData(form);

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });
    const data = await response.json();

    if (data.success) {
      // 送信成功
      resultDiv.innerHTML =
        '<div class="result-icon">✓</div>' +
        '<h4>送信ありがとうございました！</h4>' +
        '<p>2営業日以内にご返信いたします。<br>少々お待ちください。</p>';
      resultDiv.classList.add('show', 'success');
      if (formGrid) formGrid.style.display = 'none';
      if (formNote) formNote.style.display = 'none';
      if (formDisclaimer) formDisclaimer.style.display = 'none';
      submitBtn.style.display = 'none';
      resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      throw new Error(data.message || '送信に失敗しました');
    }
  } catch (error) {
    console.error('Form submit error:', error);
    resultDiv.innerHTML =
      '<h4>送信エラー</h4>' +
      '<p>申し訳ございません、送信に失敗しました。<br>' +
      'お手数ですが、お電話でお問い合わせください。</p>';
    resultDiv.classList.add('show', 'error');
    submitBtn.disabled = false;
    submitBtn.classList.remove('is-loading');
  }
}


/* ===== スムーズスクロール ===== */
function scrollToElement(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


/* ===== 初期化（DOM Ready 後にまとめて実行） ===== */
document.addEventListener('DOMContentLoaded', function() {
  // アニメと back-to-top をここで初期化（v7 修正の本丸）
  initRevealAnimation();
  initBackToTop();

  // フォーム送信ハンドラ
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', handleContactSubmit);
  }

  // data-scroll 属性付きボタンのスムーズスクロール
  document.querySelectorAll('[data-scroll]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-scroll');
      scrollToElement(target);
    });
  });
});