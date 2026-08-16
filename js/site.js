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

  function formatBirthdate(iso) {
    if (!iso) return '';
    var parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return parts[2] + '.' + parts[1] + '.' + parts[0];
  }

  function buildMailtoBody(data) {
    var lines = [
      '— Anfrage über die Website —',
      '',
      'Name: ' + (data.name || ''),
      'E-Mail: ' + (data.email || ''),
      'Telefon: ' + (data.phone || ''),
      'Geburtsdatum des Kindes: ' + formatBirthdate(data.birthdate),
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

  function initSafariDatePicker(birthdate) {
    var userAgent = navigator.userAgent;
    var isDesktopSafari =
      /Safari/.test(userAgent) &&
      !/Chrome|Chromium|CriOS|Edg|OPR/.test(userAgent) &&
      navigator.maxTouchPoints < 2;
    if (!isDesktopSafari) return;

    var picker = document.getElementById('ios-date-picker');
    if (!picker) return;

    var months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    var wheels = {
      day: picker.querySelector('[data-picker-unit="day"]'),
      month: picker.querySelector('[data-picker-unit="month"]'),
      year: picker.querySelector('[data-picker-unit="year"]')
    };
    var selected = { day: 13, month: 7, year: 2007 };
    var scrollTimers = {};

    birthdate.type = 'text';
    birthdate.removeAttribute('max');
    birthdate.removeAttribute('placeholder');
    birthdate.setAttribute('data-custom-picker', 'true');
    birthdate.setAttribute('aria-haspopup', 'dialog');
    birthdate.setAttribute('aria-expanded', 'false');

    function parseDate(value) {
      var input = value.trim();
      var numeric = input.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
      var words = input.match(/^(\d{1,2})\s+([A-Za-zÄÖÜäöü]+)\s+(\d{4})$/);
      var parsedDay;
      var parsedMonth;
      var parsedYear;

      if (numeric) {
        parsedDay = Number(numeric[1]);
        parsedMonth = Number(numeric[2]);
        parsedYear = Number(numeric[3]);
      } else if (words) {
        var monthNames = {
          january: 1,
          januar: 1,
          february: 2,
          februar: 2,
          march: 3,
          märz: 3,
          april: 4,
          may: 5,
          mai: 5,
          june: 6,
          juni: 6,
          july: 7,
          juli: 7,
          august: 8,
          september: 9,
          october: 10,
          oktober: 10,
          november: 11,
          december: 12,
          dezember: 12
        };
        parsedDay = Number(words[1]);
        parsedMonth = monthNames[words[2].toLowerCase()];
        parsedYear = Number(words[3]);
      } else {
        return null;
      }

      if (!parsedMonth) return null;
      var date = new Date(parsedYear, parsedMonth - 1, parsedDay);
      var today = new Date();
      today.setHours(23, 59, 59, 999);
      if (
        date.getFullYear() !== parsedYear ||
        date.getMonth() !== parsedMonth - 1 ||
        date.getDate() !== parsedDay ||
        date > today
      ) {
        return null;
      }
      return { day: parsedDay, month: parsedMonth, year: parsedYear };
    }

    function validateManualInput() {
      if (!birthdate.value.trim()) {
        birthdate.setCustomValidity('');
        return;
      }
      var parsed = parseDate(birthdate.value);
      birthdate.setCustomValidity(
        parsed ? '' : 'Bitte gib ein gültiges Datum ein, z. B. 13.07.2007.'
      );
      if (parsed) selected = parsed;
    }

    function addOption(wheel, value, label) {
      var option = document.createElement('button');
      option.type = 'button';
      option.className = 'ios-picker-option';
      option.dataset.value = String(value);
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', 'false');
      option.textContent = label;
      wheel.appendChild(option);
    }

    for (var day = 1; day <= 31; day += 1) {
      addOption(wheels.day, day, String(day));
    }
    months.forEach(function (month, index) {
      addOption(wheels.month, index + 1, month);
    });
    var currentYear = new Date().getFullYear();
    for (var year = currentYear; year >= currentYear - 40; year -= 1) {
      addOption(wheels.year, year, String(year));
    }

    function getOption(unit, value) {
      return Array.prototype.find.call(
        wheels[unit].querySelectorAll('.ios-picker-option'),
        function (option) {
          return Number(option.dataset.value) === value;
        }
      );
    }

    function paintSelection(unit, shouldScroll) {
      var options = wheels[unit].querySelectorAll('.ios-picker-option');
      options.forEach(function (option) {
        var active = Number(option.dataset.value) === selected[unit];
        option.classList.toggle('is-selected', active);
        option.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      var activeOption = getOption(unit, selected[unit]);
      if (activeOption && shouldScroll) {
        wheels[unit].scrollTop =
          activeOption.offsetTop -
          (wheels[unit].clientHeight - activeOption.offsetHeight) / 2;
      }
    }

    function selectValue(unit, value, shouldScroll) {
      selected[unit] = value;
      var maxDay = new Date(selected.year, selected.month, 0).getDate();
      if (selected.day > maxDay) {
        selected.day = maxDay;
        paintSelection('day', shouldScroll);
      }
      paintSelection(unit, shouldScroll);
    }

    Object.keys(wheels).forEach(function (unit) {
      var wheel = wheels[unit];
      wheel.addEventListener('click', function (event) {
        var option = event.target.closest('.ios-picker-option');
        if (!option) return;
        selectValue(unit, Number(option.dataset.value), true);
      });
      wheel.addEventListener('scroll', function () {
        window.clearTimeout(scrollTimers[unit]);
        scrollTimers[unit] = window.setTimeout(function () {
          var wheelCenter = wheel.scrollTop + wheel.clientHeight / 2;
          var nearest = null;
          var nearestDistance = Infinity;
          wheel.querySelectorAll('.ios-picker-option').forEach(function (option) {
            var optionCenter = option.offsetTop + option.offsetHeight / 2;
            var distance = Math.abs(optionCenter - wheelCenter);
            if (distance < nearestDistance) {
              nearest = option;
              nearestDistance = distance;
            }
          });
          if (nearest) {
            selectValue(unit, Number(nearest.dataset.value), false);
          }
        }, 80);
      });
      wheel.addEventListener('keydown', function (event) {
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
        event.preventDefault();
        var options = Array.from(
          wheel.querySelectorAll('.ios-picker-option')
        );
        var active = getOption(unit, selected[unit]);
        var index = options.indexOf(active);
        var nextIndex =
          event.key === 'ArrowUp'
            ? Math.max(0, index - 1)
            : Math.min(options.length - 1, index + 1);
        selectValue(unit, Number(options[nextIndex].dataset.value), true);
      });
    });

    function openPicker() {
      var typedDate = parseDate(birthdate.value);
      if (typedDate) selected = typedDate;
      picker.hidden = false;
      birthdate.setAttribute('aria-expanded', 'true');
      window.requestAnimationFrame(function () {
        paintSelection('day', true);
        paintSelection('month', true);
        paintSelection('year', true);
      });
    }

    function closePicker() {
      picker.hidden = true;
      birthdate.setAttribute('aria-expanded', 'false');
    }

    birthdate.addEventListener('click', function (event) {
      event.stopPropagation();
      if (picker.hidden) openPicker();
      else closePicker();
    });
    birthdate.addEventListener('input', validateManualInput);
    birthdate.addEventListener('blur', validateManualInput);
    birthdate.addEventListener('invalid', openPicker);
    birthdate.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === 'ArrowDown') {
        event.preventDefault();
        openPicker();
      }
      if (event.key === 'Escape') closePicker();
    });
    picker.addEventListener('click', function (event) {
      event.stopPropagation();
      var action = event.target.closest('[data-picker-action]');
      if (!action) return;
      if (action.dataset.pickerAction === 'done') {
        birthdate.value =
          selected.day + ' ' + months[selected.month - 1] + ' ' + selected.year;
        validateManualInput();
        birthdate.dispatchEvent(new Event('change', { bubbles: true }));
      }
      closePicker();
      birthdate.focus();
    });
    document.addEventListener('click', closePicker);
  }

  function initContactForm() {
    var form = document.getElementById('kontakt-form');
    if (!form) return;
    var birthdate = document.getElementById('kf-birthdate');
    if (birthdate) {
      var today = new Date();
      var mm = today.getMonth() + 1;
      var dd = today.getDate();
      birthdate.setAttribute(
        'max',
        today.getFullYear() +
          '-' +
          (mm < 10 ? '0' : '') +
          mm +
          '-' +
          (dd < 10 ? '0' : '') +
          dd
      );
      initSafariDatePicker(birthdate);
    }
    var feedback = document.getElementById('form-feedback');
    var feedbackBody = document.getElementById('form-feedback-body');
    var copyBtn = document.getElementById('form-copy-btn');
    var mailtoAgain = document.getElementById('form-mailto-again');
    var submitButton = form.querySelector('.form-submit');
    var fields = {
      name: {
        input: document.getElementById('kf-name'),
        error: document.getElementById('kf-name-error'),
        touched: false
      },
      email: {
        input: document.getElementById('kf-email'),
        error: document.getElementById('kf-email-error'),
        touched: false
      },
      phone: {
        input: document.getElementById('kf-phone'),
        error: document.getElementById('kf-phone-error'),
        touched: false
      },
      birthdate: {
        input: birthdate,
        error: document.getElementById('kf-birthdate-error'),
        touched: false
      },
      experience: {
        input: document.getElementById('kf-exp'),
        error: document.getElementById('kf-exp-error'),
        touched: false
      },
      message: {
        input: document.getElementById('kf-msg'),
        error: document.getElementById('kf-msg-error'),
        touched: false
      },
      privacy: {
        input: document.getElementById('privacy-consent'),
        error: document.getElementById('privacy-consent-error'),
        touched: false
      }
    };

    function validBirthdate(value) {
      var input = value.trim();
      var iso = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      var numeric = input.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
      var words = input.match(/^(\d{1,2})\s+([A-Za-zÄÖÜäöü]+)\s+(\d{4})$/);
      var selectedDay;
      var selectedMonth;
      var selectedYear;
      var monthNames = {
        january: 1,
        januar: 1,
        february: 2,
        februar: 2,
        march: 3,
        märz: 3,
        april: 4,
        may: 5,
        mai: 5,
        june: 6,
        juni: 6,
        july: 7,
        juli: 7,
        august: 8,
        september: 9,
        october: 10,
        oktober: 10,
        november: 11,
        december: 12,
        dezember: 12
      };

      if (iso) {
        selectedYear = Number(iso[1]);
        selectedMonth = Number(iso[2]);
        selectedDay = Number(iso[3]);
      } else if (numeric) {
        selectedDay = Number(numeric[1]);
        selectedMonth = Number(numeric[2]);
        selectedYear = Number(numeric[3]);
      } else if (words) {
        selectedDay = Number(words[1]);
        selectedMonth = monthNames[words[2].toLowerCase()];
        selectedYear = Number(words[3]);
      } else {
        return false;
      }

      if (!selectedMonth) return false;
      var selectedDate = new Date(
        selectedYear,
        selectedMonth - 1,
        selectedDay
      );
      var currentDate = new Date();
      currentDate.setHours(23, 59, 59, 999);
      return (
        selectedDate.getFullYear() === selectedYear &&
        selectedDate.getMonth() === selectedMonth - 1 &&
        selectedDate.getDate() === selectedDay &&
        selectedDate <= currentDate
      );
    }

    function validationMessage(key, input) {
      var value = input.type === 'checkbox' ? '' : input.value.trim();
      if (key === 'name') {
        if (!value) return 'Bitte gib deinen Namen ein.';
        if (value.length < 2) return 'Der Name muss mindestens 2 Zeichen haben.';
      }
      if (key === 'email') {
        if (!value) return 'Bitte gib deine E-Mail-Adresse ein.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
          return 'Bitte gib eine vollständige E-Mail-Adresse ein.';
        }
      }
      if (key === 'phone' && value) {
        var digits = value.replace(/\D/g, '');
        if (!/^[+\d\s()./-]+$/.test(value) || digits.length < 6) {
          return 'Bitte gib eine gültige Telefonnummer ein.';
        }
      }
      if (key === 'birthdate') {
        if (!value) return 'Bitte gib das Geburtsdatum des Kindes ein.';
        if (!validBirthdate(value)) {
          return 'Bitte gib ein gültiges Geburtsdatum ein.';
        }
      }
      if (key === 'experience') {
        if (!value) {
          return 'Bitte beschreibe kurz die bisherigen Erfahrungen.';
        }
        if (value.length < 2) {
          return 'Bitte gib mindestens 2 Zeichen ein.';
        }
      }
      if (key === 'message') {
        if (value && value.length < 10) {
          return 'Bitte gib mindestens 10 Zeichen ein.';
        }
      }
      if (key === 'privacy' && !input.checked) {
        return 'Bitte stimme der Datenschutzerklärung zu.';
      }
      return '';
    }

    function validateField(key, showError) {
      var field = fields[key];
      if (!field || !field.input) return true;
      if (showError) field.touched = true;
      var message = validationMessage(key, field.input);
      var visibleError = field.touched && Boolean(message);

      field.input.setCustomValidity(message);
      field.input.setAttribute(
        'aria-invalid',
        visibleError ? 'true' : 'false'
      );
      if (key === 'privacy') {
        var consent = field.input.closest('.form-consent');
        if (consent) consent.classList.toggle('has-error', visibleError);
      } else {
        field.input.classList.toggle('has-error', visibleError);
      }
      if (field.error) {
        field.error.textContent = field.touched ? message : '';
      }
      return !message;
    }

    function validateForm(showAllErrors) {
      var valid = true;
      Object.keys(fields).forEach(function (key) {
        if (!validateField(key, showAllErrors)) valid = false;
      });
      if (submitButton) submitButton.disabled = !valid;
      return valid;
    }

    Object.keys(fields).forEach(function (key) {
      var field = fields[key];
      if (!field.input) return;
      var eventName = field.input.type === 'checkbox' ? 'change' : 'input';
      field.input.addEventListener(eventName, function () {
        if (field.input.type === 'checkbox') field.touched = true;
        validateForm(false);
      });
      if (eventName !== 'change') {
        field.input.addEventListener('change', function () {
          validateForm(false);
        });
      }
      field.input.addEventListener('blur', function () {
        field.touched = true;
        validateForm(false);
      });
      field.input.addEventListener('invalid', function () {
        field.touched = true;
        validateField(key, false);
      });
    });
    validateForm(false);

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!validateForm(true) || !form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var fd = new FormData(form);
      var data = {
        name: (fd.get('name') || '').toString().trim(),
        email: (fd.get('email') || '').toString().trim(),
        phone: (fd.get('phone') || '').toString().trim(),
        birthdate: (fd.get('birthdate') || '').toString().trim(),
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
