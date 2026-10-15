(function () {
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  }

  var form = document.getElementById('ajanlat-form');
  if (!form) return;
  var TO = form.getAttribute('data-to');
  var status = document.getElementById('form-status');

  function field(name) { return form.elements[name]; }
  function setBad(name, msg) {
    var el = field(name), wrap = el.closest('.field');
    wrap.classList.add('bad');
    el.setAttribute('aria-invalid', 'true');
    wrap.querySelector('.err').textContent = msg;
  }
  function clearBad(name) {
    var el = field(name), wrap = el.closest('.field');
    wrap.classList.remove('bad');
    el.removeAttribute('aria-invalid');
  }
  ['nev', 'telefon', 'email', 'uzenet'].forEach(function (n) {
    field(n).addEventListener('input', function () {
      clearBad(n);
      if (n === 'telefon' || n === 'email') { clearBad('telefon'); clearBad('email'); }
    });
  });

  function validate() {
    var ok = true, first = null;
    ['nev', 'telefon', 'email', 'uzenet'].forEach(clearBad);
    function bad(n, m) { setBad(n, m); ok = false; if (!first) first = field(n); }
    if (!field('nev').value.trim()) bad('nev', 'Kérjük, adja meg a nevét.');
    var tel = field('telefon').value.trim(), em = field('email').value.trim();
    if (!tel && !em) {
      bad('telefon', 'Adjon meg telefonszámot vagy e-mail-címet, hogy visszaszólhassanak.');
    }
    if (tel && !/^[+()\d\s\/.-]{6,}$/.test(tel)) bad('telefon', 'Ez nem tűnik érvényes telefonszámnak.');
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) bad('email', 'Ez nem tűnik érvényes e-mail-címnek.');
    if (field('uzenet').value.trim().length < 10) bad('uzenet', 'Írjon néhány mondatot arról, miben kér segítséget.');
    if (first) first.focus();
    return ok;
  }

  function compose() {
    var v = function (n) { return field(n).value.trim(); };
    var lines = [
      'Név: ' + v('nev'),
      v('cegnev') ? 'Cégnév: ' + v('cegnev') : '',
      v('telefon') ? 'Telefonszám: ' + v('telefon') : '',
      v('email') ? 'E-mail: ' + v('email') : '',
      v('telepules') ? 'Település: ' + v('telepules') : '',
      'Érdeklődés: ' + v('tema'),
      '',
      v('uzenet')
    ].filter(function (l, i, a) { return l !== '' || a[i - 1] !== ''; });
    return { subject: 'Árajánlatkérés – ' + v('tema'), body: lines.join('\n') };
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;
    var m = compose();
    var href = 'mailto:' + TO + '?subject=' + encodeURIComponent(m.subject) + '&body=' + encodeURIComponent(m.body);
    status.hidden = false;
    status.innerHTML = '<strong>Az üzenet még nem lett elküldve.</strong> Megnyitjuk az e-mail-programját a kitöltött levéllel; ott kell elküldenie. ' +
      'Ha nem nyílt meg semmi, másolja ki a szöveget, és küldje a <a href="mailto:' + TO + '">' + TO + '</a> címre, vagy hívja a vállalkozót.' +
      '<div class="btn-row"><button type="button" class="btn" id="copy-btn">Szöveg másolása</button>' +
      '<a class="btn btn--red" href="' + href + '">E-mail megnyitása</a></div>';
    document.getElementById('copy-btn').addEventListener('click', function () {
      var txt = 'Címzett: ' + TO + '\nTárgy: ' + m.subject + '\n\n' + m.body;
      var done = function () { document.getElementById('copy-btn').textContent = 'Kimásolva'; };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () {});
    });
    window.location.href = href;
  });
})();
