/* ==========================================================================
   ZO Hotels Goa — reservation page
   script.js — vanilla JavaScript, no frameworks or libraries

   01. Sticky header
   02. Mobile navigation
   03. Smooth scrolling with focus handover
   04. The room photograph: markers and views
   05. Reservation options: drawers and choices
   06. Options dialog: reasons, answers, and the plain consequences
   07. Footer year
   ========================================================================== */

(function () {
  'use strict';

  var prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ------------------------------------------------------------------
     01. STICKY HEADER
     ------------------------------------------------------------------ */
  var header = document.getElementById('siteHeader');
  var ticking = false;

  function syncHeader() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(syncHeader);
    }
  }, { passive: true });

  syncHeader();


  /* ------------------------------------------------------------------
     02. MOBILE NAVIGATION
     ------------------------------------------------------------------ */
  var navToggle = document.getElementById('navToggle');
  var primaryNav = document.getElementById('primaryNav');

  function setNav(open) {
    if (!navToggle || !primaryNav) return;
    primaryNav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      setNav(!primaryNav.classList.contains('is-open'));
    });

    primaryNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setNav(false);
    });

    document.addEventListener('click', function (event) {
      if (!primaryNav.classList.contains('is-open')) return;
      if (!primaryNav.contains(event.target) && !navToggle.contains(event.target)) setNav(false);
    });
  }


  /* ------------------------------------------------------------------
     03. SMOOTH SCROLLING
     CSS handles the easing; this moves keyboard focus to the section
     that was scrolled to, so tabbing continues from the right place.
     ------------------------------------------------------------------ */
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (link) {
    link.addEventListener('click', function (event) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;

      var target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      setNav(false);

      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });

      var hadTabIndex = target.hasAttribute('tabindex');
      if (!hadTabIndex) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      if (!hadTabIndex) {
        target.addEventListener('blur', function off() {
          target.removeAttribute('tabindex');
          target.removeEventListener('blur', off);
        });
      }

      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', id);
      }
    });
  });


  /* ------------------------------------------------------------------
     04. THE ROOM PHOTOGRAPH
     Markers describe what is in the frame; the three thumbnails swap
     the photograph itself. Markers belong to the first view only.
     ------------------------------------------------------------------ */
  var spots = document.querySelectorAll('.spot');
  var spotLayer = document.getElementById('roomSpots');
  var detailTitle = document.getElementById('roomDetailTitle');
  var detailText = document.getElementById('roomDetailText');
  var roomPhoto = document.getElementById('roomPhoto');
  var views = document.querySelectorAll('.view');

  function clearSpots() {
    Array.prototype.forEach.call(spots, function (s) {
      s.setAttribute('aria-pressed', 'false');
    });
  }

  Array.prototype.forEach.call(spots, function (spot) {
    spot.addEventListener('click', function () {
      clearSpots();
      spot.setAttribute('aria-pressed', 'true');
      if (detailTitle) detailTitle.textContent = spot.dataset.title;
      if (detailText) detailText.innerHTML = spot.dataset.text;
    });
  });

  Array.prototype.forEach.call(views, function (view) {
    view.addEventListener('click', function () {
      Array.prototype.forEach.call(views, function (other) {
        other.classList.toggle('is-active', other === view);
        other.setAttribute('aria-pressed', String(other === view));
      });

      if (roomPhoto) {
        roomPhoto.src = view.dataset.src;
        roomPhoto.alt = view.dataset.alt;
      }

      // Only the first view is mapped, so hide the markers on the others.
      var showSpots = view.dataset.spots === 'on';
      if (spotLayer) {
        if (showSpots) spotLayer.removeAttribute('hidden');
        else spotLayer.setAttribute('hidden', '');
      }
      if (!showSpots) {
        clearSpots();
        if (detailTitle) detailTitle.textContent = 'Another look at the same room';
        if (detailText) {
          detailText.textContent =
            'Taken on the same morning as the main photograph. Return to the first view to see the markers.';
        }
      }
    });
  });


  /* ------------------------------------------------------------------
     05. RESERVATION OPTIONS
     Three buttons open their drawer; choosing a line inside a drawer
     confirms what would happen next, and charges nothing.
     ------------------------------------------------------------------ */
  var drawerPairs = [
    { button: 'btnDates',  drawer: 'drawerDates'  },
    { button: 'btnRooms',  drawer: 'drawerRooms'  },
    { button: 'btnExtras', drawer: 'drawerExtras' }
  ];

  function openDrawer(drawerId) {
    drawerPairs.forEach(function (pair) {
      var btn = document.getElementById(pair.button);
      var drw = document.getElementById(pair.drawer);
      if (!btn || !drw) return;

      var open = pair.drawer === drawerId;
      if (open) drw.removeAttribute('hidden');
      else drw.setAttribute('hidden', '');
      btn.setAttribute('aria-expanded', String(open));
    });
  }

  function closeDrawers() { openDrawer(null); }

  drawerPairs.forEach(function (pair) {
    var btn = document.getElementById(pair.button);
    var drw = document.getElementById(pair.drawer);
    if (!btn || !drw) return;

    btn.addEventListener('click', function () {
      var alreadyOpen = !drw.hasAttribute('hidden');
      if (alreadyOpen) closeDrawers();
      else openDrawer(pair.drawer);
    });
  });

  // Choosing an option inside a drawer
  Array.prototype.forEach.call(document.querySelectorAll('.option'), function (option) {
    if (option.classList.contains('option--current')) return;

    option.addEventListener('click', function () {
      var list = option.closest('.options');
      Array.prototype.forEach.call(list.querySelectorAll('.option'), function (other) {
        other.classList.toggle('is-chosen', other === option);
      });

      var note = option.closest('.drawer').querySelector('.drawer__note');
      var label = option.querySelector('.option__main').textContent.trim();
      if (note) {
        note.textContent = label +
          ' — held for 24 hours. The guest desk confirms by email before anything is charged.';
      }
    });
  });

  /* A single status line under the options, written to when an answer in
     the dialog routes back to the page. Created here so the markup stays
     free of empty containers. */
  var manageFoot = document.querySelector('.manage__foot');
  var status = null;

  function showStatus(message) {
    if (!manageFoot) return;
    if (!status) {
      status = document.createElement('p');
      status.className = 'drawer__note';
      status.setAttribute('role', 'status');
      status.style.marginTop = '1rem';
      manageFoot.parentNode.insertBefore(status, manageFoot);
    }
    status.textContent = message;
  }


  /* ------------------------------------------------------------------
     06. OPTIONS DIALOG
     Step one collects what changed, step two answers it, step three
     states plainly what ending the booking would do, step four closes.
     ------------------------------------------------------------------ */
  var modal = document.getElementById('cancelModal');
  var modalBox = document.getElementById('modalBox');
  var openBtn = document.getElementById('cancelOpen');
  var closeBtn = document.getElementById('modalClose');

  var stepReason = document.getElementById('stepReason');
  var stepSolution = document.getElementById('stepSolution');
  var stepOther = document.getElementById('stepOther');
  var stepConfirm = document.getElementById('stepConfirm');
  var stepDone = document.getElementById('stepDone');

  var solutionEyebrow = document.getElementById('solutionEyebrow');
  var solutionTitle = document.getElementById('solutionTitle');
  var solutionText = document.getElementById('solutionText');
  var solutionPoints = document.getElementById('solutionPoints');
  var solutionPrimary = document.getElementById('solutionPrimary');

  var backBtn = document.getElementById('modalBack');
  var lastFocused = null;
  var trail = [];   // the steps walked through, so Back always has somewhere to go

  /* What each reason is answered with. `action` says where the clay
     button sends the guest back to on the page itself. */
  var ANSWERS = {
    price: {
      eyebrow: 'A better price elsewhere',
      title: 'Here is what your rate is made of',
      text: 'Most sites quote the room on its own and add tax and extras at the end, so the two numbers are rarely comparing the same stay. Yours is broken out line by line.',
      points: [
        '₹34,000 is the room itself — ₹8,500 for each of the four nights',
        'Breakfast, both Mopa airport runs, the pool and the spa sit inside that',
        'GST at 18% is ₹6,120, set by law and listed on every Indian hotel bill'
      ],
      label: 'See the full breakdown',
      action: 'bill'
    },
    dates: {
      eyebrow: 'Dates have moved',
      title: 'Move the stay, keep the rate',
      text: 'Your ₹8,500 nightly rate travels with you to any open date up to 31 March, with no change fee.',
      points: [
        'Three windows are open at the same total',
        '9–13 January returns ₹2,360 to your card',
        'Changes before 5 December carry no fee'
      ],
      label: 'See open dates',
      action: 'dates'
    },
    room: {
      eyebrow: 'The room is not right',
      title: 'Take a different room',
      text: 'Two other rooms are open for 12–16 December, and the difference settles on the same card.',
      points: [
        'Garden Room returns ₹3,540 to you',
        'Pool Suite with a private deck is ₹5,900 more',
        'Your inclusions move across unchanged'
      ],
      label: 'See the other rooms',
      action: 'rooms'
    },
    guests: {
      eyebrow: 'Fewer of you are coming',
      title: 'Re-price it for one',
      text: 'A single-occupancy rate on the same room brings the total down, and the breakfast allowance adjusts with it.',
      points: [
        '₹2,800 returns to your card',
        'Room 214 and your transfer are kept',
        'A guest can still be added later at the same rate'
      ],
      label: 'Re-price for one guest',
      action: 'status',
      status: 'Single-occupancy re-price requested — confirmation by email. (Sample page: nothing was changed.)'
    },
    other: null   // handled by its own step, with a box to write in
  };

  function showStep(step, remember) {
    [stepReason, stepSolution, stepOther, stepConfirm, stepDone].forEach(function (el) {
      if (el) el.setAttribute('hidden', '');
    });
    if (step) step.removeAttribute('hidden');

    // Back is offered on every step except the first and the last
    if (remember !== false && trail[trail.length - 1] !== step) trail.push(step);
    var canGoBack = trail.length > 1 && step !== stepDone;
    if (backBtn) {
      if (canGoBack) backBtn.removeAttribute('hidden');
      else backBtn.setAttribute('hidden', '');
    }
  }

  function stepBack() {
    if (trail.length < 2) return;
    trail.pop();
    showStep(trail[trail.length - 1], false);

    var first = (trail[trail.length - 1] === stepReason)
      ? modal.querySelector('.reason')
      : trail[trail.length - 1].querySelector('button, textarea');
    if (first) first.focus();
  }

  if (backBtn) backBtn.addEventListener('click', stepBack);

  function openModal() {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.removeAttribute('hidden');
    document.documentElement.style.overflow = 'hidden';
    trail = [];
    showStep(stepReason);
    var first = modal.querySelector('.reason');
    if (first) first.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute('hidden', '');
    document.documentElement.style.overflow = '';

    // Return focus to whatever opened the dialog; if that element is gone
    // or no longer visible, fall back to the link itself rather than body.
    var back = (lastFocused && lastFocused.offsetParent !== null) ? lastFocused : openBtn;
    if (back && typeof back.focus === 'function') back.focus();
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', function (event) {
      if (event.target.dataset.close === 'true') closeModal();
    });
  }

  // Escape closes; Tab is kept inside the dialog while it is open.
  document.addEventListener('keydown', function (event) {
    if (!modal || modal.hasAttribute('hidden')) return;

    if (event.key === 'Escape') {
      closeModal();
      return;
    }

    if (event.key !== 'Tab') return;

    var focusable = modalBox.querySelectorAll(
      'button:not([hidden]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    var visible = Array.prototype.filter.call(focusable, function (el) {
      return el.offsetParent !== null;
    });
    if (!visible.length) return;

    var first = visible[0];
    var last = visible[visible.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // Step 1 → step 2
  Array.prototype.forEach.call(document.querySelectorAll('.reason'), function (reason) {
    reason.addEventListener('click', function () {
      var answer = ANSWERS[reason.dataset.key];

      // Anything the list does not cover gets a box to write in
      if (!answer) {
        showStep(stepOther);
        var box = document.getElementById('otherReason');
        if (box) box.focus();
        return;
      }

      solutionEyebrow.textContent = answer.eyebrow;
      solutionTitle.textContent = answer.title;
      solutionText.textContent = answer.text;

      solutionPoints.innerHTML = '';
      answer.points.forEach(function (point) {
        var li = document.createElement('li');
        li.textContent = point;
        solutionPoints.appendChild(li);
      });

      solutionPrimary.textContent = answer.label;
      solutionPrimary.dataset.action = answer.action;
      solutionPrimary.dataset.status = answer.status || '';

      showStep(stepSolution);
      solutionPrimary.focus();
    });
  });

  // The clay button on step 2 sends the guest back to the real control
  if (solutionPrimary) {
    solutionPrimary.addEventListener('click', function () {
      var action = solutionPrimary.dataset.action;

      if (action === 'tel') {
        window.location.href = 'tel:+918320000000';
        return;
      }

      closeModal();

      if (action === 'dates') openDrawer('drawerDates');
      if (action === 'rooms') openDrawer('drawerRooms');
      if (action === 'status') showStatus(solutionPrimary.dataset.status);

      // The price answer sends them to the breakdown itself
      var target = document.getElementById(action === 'bill' ? 'stay' : 'manage');
      if (target) {
        target.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start'
        });
      }
    });
  }

  /* A reason in the guest's own words. Nothing is sent anywhere on this
     sample page; the step simply confirms what would happen. */
  var otherForm = document.getElementById('otherForm');
  var otherBox = document.getElementById('otherReason');
  var otherHint = document.getElementById('otherHint');
  var otherSent = document.getElementById('otherSent');

  if (otherForm) {
    otherForm.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!otherBox.value.trim()) {
        otherHint.textContent = 'Add a line or two so the desk knows what to look at.';
        otherHint.classList.add('field-hint--warn');
        otherBox.focus();
        return;
      }

      otherForm.setAttribute('hidden', '');
      otherSent.removeAttribute('hidden');
      document.getElementById('otherDone').focus();
    });

    otherBox.addEventListener('input', function () {
      otherHint.textContent = 'The team reads these themselves and replies by email.';
      otherHint.classList.remove('field-hint--warn');
    });
  }

  var otherDone = document.getElementById('otherDone');
  if (otherDone) otherDone.addEventListener('click', closeModal);

  // Any of the quiet links moves on to the plain statement of consequences
  function goToConfirm() {
    showStep(stepConfirm);
    var keep = document.getElementById('keepBooking');
    if (keep) keep.focus();
  }

  ['toConfirm', 'toConfirmOther', 'toConfirmSent'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', goToConfirm);
  });

  var keepBooking = document.getElementById('keepBooking');
  if (keepBooking) {
    keepBooking.addEventListener('click', function () {
      closeModal();
      var primaryAction = document.getElementById('btnDates');
      if (primaryAction) primaryAction.focus();
    });
  }

  var confirmCancel = document.getElementById('confirmCancel');
  if (confirmCancel) {
    confirmCancel.addEventListener('click', function () { showStep(stepDone); });
  }

  var doneClose = document.getElementById('doneClose');
  if (doneClose) doneClose.addEventListener('click', closeModal);


  /* ------------------------------------------------------------------
     07. FOOTER YEAR
     ------------------------------------------------------------------ */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

})();
