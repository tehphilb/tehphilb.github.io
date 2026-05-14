(function () {
  'use strict';

  const CONFIG_URL = 'content/site-config.json';

  function applyConfig(cfg) {
    if (!cfg) return;
    if (cfg.meta) {
      if (cfg.meta.title) document.title = cfg.meta.title;
      const md = document.querySelector('meta[name="description"]');
      if (md && cfg.meta.description) md.setAttribute('content', cfg.meta.description);
    }
    const c = cfg.contact;
    if (c) {
      const em = document.getElementById('contact-email-link');
      const et = document.getElementById('contact-email-text');
      if (c.email) {
        if (em) em.href = 'mailto:' + c.email;
        if (et) et.textContent = c.email;
      }
      const ph = document.getElementById('contact-phone-link');
      const pt = document.getElementById('contact-phone-text');
      if (c.phoneTel && ph) ph.href = 'tel:' + String(c.phoneTel).replace(/\s/g, '');
      if (c.phoneDisplay && pt) pt.textContent = c.phoneDisplay;
    }
    const loc = document.getElementById('contact-location-text');
    if (loc && cfg.locationLabel) loc.textContent = cfg.locationLabel;
  }

  function loadConfig() {
    const embed = document.getElementById('site-config-embed');
    if (embed && embed.textContent.trim()) {
      try {
        applyConfig(JSON.parse(embed.textContent));
        return Promise.resolve();
      } catch (_) {
        /* fall through */
      }
    }
    return fetch(CONFIG_URL, { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) return null;
        return r.json();
      })
      .then(function (cfg) {
        applyConfig(cfg);
      })
      .catch(function () {
        /* HTML-Standardwerte bleiben */
      });
  }

  window.toggleMenu = function () {
    var el = document.getElementById('mobileNav');
    if (el) el.classList.toggle('open');
  };

  function initTheme() {
    var themeToggle = document.getElementById('themeToggle');
    var html = document.documentElement;
    var saved = localStorage.getItem('theme');
    if (saved) {
      html.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.setAttribute('data-theme', 'dark');
    }
    if (themeToggle) {
      themeToggle.addEventListener('click', function () {
        var current = html.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
      });
    }
  }

  function initReveal() {
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) e.target.classList.add('visible');
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach(function (r) {
      obs.observe(r);
    });
  }

  function initPillars() {
    document.querySelectorAll('.pillar-card').forEach(function (card, i) {
      card.style.transitionDelay = i * 0.1 + 's';
    });
  }

  function initBackToTop() {
    var backBtn = document.getElementById('backToTop');
    if (!backBtn) return;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 600) {
        backBtn.classList.add('visible');
      } else {
        backBtn.classList.remove('visible');
      }
    });
    backBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initNavActive() {
    var sections = ['angebot', 'ueber-mich', 'anfrage']
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean);
    var allLinks = document.querySelectorAll('.nav-links a');
    var sectionObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            allLinks.forEach(function (a) {
              a.classList.remove('active');
            });
            var link = document.querySelector('.nav-links a[href="#' + e.target.id + '"]');
            if (link) link.classList.add('active');
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach(function (s) {
      sectionObs.observe(s);
    });
  }

  function buildMailtoBody(data) {
    var lines = [
      '— Anfrage über die Website —',
      '',
      'Name: ' + (data.name || ''),
      'E-Mail: ' + (data.email || ''),
      'Telefon: ' + (data.phone || ''),
      'Alter des Kindes: ' + (data.age || ''),
      'Erfahrung / Verein: ' + (data.experience || ''),
      '',
      'Wunsch / Nachricht:',
      data.message || ''
    ];
    return lines.join('\n');
  }

  function buildPlainEmail(data, cfgEmail) {
    return (
      'An: ' + cfgEmail + '\n' +
      'Betreff: Anfrage Kleingruppentraining\n' +
      '\n' +
      buildMailtoBody(data)
    );
  }

  function openMailto(href) {
    var a = document.createElement('a');
    a.href = href;
    a.setAttribute('rel', 'noopener');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function initContactForm() {
    var form = document.getElementById('kontakt-form');
    if (!form) return;
    var feedback = document.getElementById('form-feedback');
    var feedbackBody = document.getElementById('form-feedback-body');
    var copyBtn = document.getElementById('form-copy-btn');
    var mailtoAgain = document.getElementById('form-mailto-again');

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var fd = new FormData(form);
      var data = {
        name: (fd.get('name') || '').toString().trim(),
        email: (fd.get('email') || '').toString().trim(),
        phone: (fd.get('phone') || '').toString().trim(),
        age: (fd.get('age') || '').toString().trim(),
        experience: (fd.get('experience') || '').toString().trim(),
        message: (fd.get('message') || '').toString().trim()
      };
      if (!data.name || !data.email) {
        return;
      }
      var cfgEmail = '';
      var et = document.getElementById('contact-email-text');
      if (et) cfgEmail = et.textContent.trim();
      if (!cfgEmail) cfgEmail = 'kontakt@entwicklungsraum-fussball.de';

      var subject = encodeURIComponent('Anfrage Kleingruppentraining');
      var body = encodeURIComponent(buildMailtoBody(data));
      var mailtoHref = 'mailto:' + cfgEmail + '?subject=' + subject + '&body=' + body;

      openMailto(mailtoHref);

      if (feedback && feedbackBody) {
        feedbackBody.value = buildPlainEmail(data, cfgEmail);
        feedback.hidden = false;
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      if (mailtoAgain) {
        mailtoAgain.href = mailtoHref;
      }
    });

    if (copyBtn && feedbackBody) {
      copyBtn.addEventListener('click', function () {
        var text = feedbackBody.value;
        var label = 'In Zwischenablage kopieren';
        function ok() {
          var prev = copyBtn.textContent;
          copyBtn.textContent = 'Kopiert.';
          setTimeout(function () {
            copyBtn.textContent = prev || label;
          }, 2200);
        }
        function fail() {
          feedbackBody.focus();
          feedbackBody.select();
          copyBtn.textContent = 'Text markiert — Strg+C / ⌘+C';
          setTimeout(function () {
            copyBtn.textContent = label;
          }, 3500);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(ok).catch(fail);
        } else {
          try {
            feedbackBody.focus();
            feedbackBody.select();
            if (document.execCommand('copy')) ok();
            else fail();
          } catch (e) {
            fail();
          }
        }
      });
    }
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    initTheme();
    loadConfig().finally(function () {
      initReveal();
      initPillars();
      initBackToTop();
      initNavActive();
      initContactForm();
    });
  });
})();
