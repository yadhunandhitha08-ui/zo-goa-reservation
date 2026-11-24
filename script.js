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
     Every view carries its own markers, caption, heading and list, so
     switching the thumbnail changes the whole panel rather than just
     the image. Content lives here; the markup is rebuilt from it.
     ------------------------------------------------------------------ */
  var ROOM_VIEWS = {
    room: {
      src: 'images/ocean-view-suite.jpg',
      alt: 'Room 214 at ZO Hotels Goa: a king bed with a cane headboard, open balcony doors to a sea view, and a seating corner by the window.',
      caption: 'Room 214 · 420 sq ft · sea-facing balcony',
      listTitle: 'In Room 214',
      detailTitle: 'Four things to look at',
      detailText: 'Choose a marker on the image to see that part of the room described, measured and confirmed against what is in your booking.',
      list: [
        '420 sq ft, second floor, sea side',
        'King bed with cotton linen and a day bench',
        'Private balcony with two chairs',
        'Rain shower, bathtub and Goan toiletries',
        'Split air conditioning and a ceiling fan',
        'Wi-Fi in the room, at the pool and in the lounge',
        'Mini bar restocked daily — soft drinks included',
        'Tea, filter coffee and still water, replenished',
        'Safe, iron, smart TV and a writing desk',
        'Housekeeping twice daily, turndown at seven'
      ],
      spots: [
        { x: 82, y: 56, title: 'King bed, cotton linen', text: 'A single king with a cane headboard, turned down each evening. Charging points and a reading light on both sides.' },
        { x: 46, y: 61, title: 'Private balcony', text: 'Two cane chairs and a low table facing the sea. The doors slide fully open, and the balcony is yours alone.' },
        { x: 11, y: 71, title: 'Reading corner', text: 'A lounge chair, side table and floor lamp by the window — where breakfast arrives if you order it in.' },
        { x: 76, y: 33, title: 'Bedside pendant', text: 'Handblown glass over each bedside table, dimmable, with two plug points and a USB socket below.' }
      ]
    },

    angle: {
      src: 'images/room-second-angle.jpg',
      alt: 'A second angle of the Deluxe Ocean-View room, showing the dressing console, the day bench at the foot of the bed and the doors folded back to the terrace.',
      caption: 'Room 214 · from the dressing wall, doors folded back',
      listTitle: 'From this corner',
      detailTitle: 'Four more things to look at',
      detailText: 'The same room from the dressing wall, photographed on the same morning. Tap a marker to see what sits in this half of it.',
      list: [
        'Writing desk and dressing console, mirror above',
        'Day bench at the foot of the bed, for an open suitcase',
        'Doors that fold back flat into the wall',
        'Flat threshold between the room and the terrace',
        'Ceiling fan and split air conditioning, either alone',
        'Bedside lamps on dimmers, one on each side',
        'Woven rug underfoot, laid flat to the floor',
        'Terrace seating beyond the doors, shaded until four'
      ],
      spots: [
        { x: 9,  y: 62, title: 'Writing desk and console', text: 'A full-width console with a mirror above and drawers below — the writing desk listed on your booking. The stool tucks underneath.' },
        { x: 58, y: 73, title: 'Day bench', text: 'At the foot of the bed, long enough for an open suitcase, so nothing needs to go on the floor.' },
        { x: 41, y: 42, title: 'Doors, folded back', text: 'The panels slide into the wall and the floor runs straight out to the terrace, with no lip or step between the two.' },
        { x: 58, y: 6,  title: 'Fan and air conditioning', text: 'A ceiling fan under the cane soffit, with split air conditioning behind it. Either can run on its own.' }
      ]
    },

    balcony: {
      src: 'images/balcony-view.jpg?v=2',
      alt: 'The balcony of Room 214 at sunset: two cane armchairs either side of a round table set with tea and fruit, with the pool, the palms and the sea beyond.',
      caption: 'The balcony of Room 214 · six in the evening, looking over the pool',
      listTitle: 'On your balcony',
      detailTitle: 'Four things to look at',
      detailText: 'Your own balcony, photographed at six in the evening. Tap a marker to see what is out here.',
      list: [
        'Two deep cane armchairs with cushions, facing the water',
        'Round teak table low enough to reach from either chair',
        'Carved balustrade at chest height, no gap beneath it',
        'Level with the room — no step out onto the balcony',
        'The pool directly below, the sea past the palm line',
        'Bougainvillea along the arch, in flower through December',
        'A lantern over the doorway, lit from dusk',
        'Shaded until four, then open sun until the light goes'
      ],
      spots: [
        { x: 17, y: 72, title: 'Cane armchairs', text: 'Two of them, deep enough to sit in for an hour, with solid arms to push up from. They face the water rather than each other.' },
        { x: 50, y: 70, title: 'The teak table', text: 'Round, and low enough to reach without standing. In this photograph it is set with tea and fruit from the kitchen downstairs.' },
        { x: 80, y: 52, title: 'Balustrade and the pool', text: 'Carved stone at chest height with no gap underneath. The pool sits directly below, and the sea starts past the palms.' },
        { x: 14, y: 10, title: 'The lantern', text: 'Pierced brass above the doorway, lit from dusk, so the balcony stays usable without turning the room lights back on.' }
      ]
    }
  };

  var spotLayer   = document.getElementById('roomSpots');
  var detailTitle = document.getElementById('roomDetailTitle');
  var detailText  = document.getElementById('roomDetailText');
  var roomPhoto   = document.getElementById('roomPhoto');
  var roomCaption = document.getElementById('roomCaption');
  var listTitleEl = document.getElementById('roomListTitle');
  var ticksEl     = document.getElementById('roomTicks');
  var views       = document.querySelectorAll('.view');

  /* Markers are rebuilt for each view, so the handler is bound once here
     and reads its copy from the button it was created with. */
  function buildSpots(view) {
    if (!spotLayer) return;
    spotLayer.innerHTML = '';

    view.spots.forEach(function (s) {
      var b = document.createElement('button');
      b.className = 'spot';
      b.type = 'button';
      b.style.left = s.x + '%';
      b.style.top = s.y + '%';
      b.setAttribute('aria-pressed', 'false');

      var label = document.createElement('span');
      label.className = 'visually-hidden';
      label.textContent = s.title;
      b.appendChild(label);

      b.addEventListener('click', function () {
        Array.prototype.forEach.call(spotLayer.querySelectorAll('.spot'), function (other) {
          other.setAttribute('aria-pressed', String(other === b));
        });
        if (detailTitle) detailTitle.textContent = s.title;
        if (detailText) detailText.textContent = s.text;
      });

      spotLayer.appendChild(b);
    });
  }

  function renderView(key) {
    var view = ROOM_VIEWS[key];
    if (!view) return;

    if (roomPhoto) {
      roomPhoto.src = view.src;
      roomPhoto.alt = view.alt;
    }
    if (roomCaption) roomCaption.textContent = view.caption;
    if (listTitleEl) listTitleEl.textContent = view.listTitle;
    if (detailTitle) detailTitle.textContent = view.detailTitle;
    if (detailText) detailText.textContent = view.detailText;

    if (ticksEl) {
      ticksEl.innerHTML = '';
      view.list.forEach(function (item) {
        var li = document.createElement('li');
        li.textContent = item;
        ticksEl.appendChild(li);
      });
    }

    buildSpots(view);
  }

  Array.prototype.forEach.call(views, function (view) {
    view.addEventListener('click', function () {
      Array.prototype.forEach.call(views, function (other) {
        other.classList.toggle('is-active', other === view);
        other.setAttribute('aria-pressed', String(other === view));
      });
      renderView(view.dataset.view);
    });
  });

  /* First paint, so the panel and the photograph always agree. */
  if (views.length) renderView(views[0].dataset.view);


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
    care: {
      eyebrow: 'Travelling with your parents',
      title: 'The desk can have this ready before you arrive',
      text: 'Tell the Care Desk what would help \u2014 a slower pace at breakfast, plainer food, a shorter walk to the pool \u2014 and it is in place before you check in.',
      points: [
        'A lift from the lobby to the door of Room 214, and no step into the room',
        'The kitchen cooks plain, low-spice food on request, at no extra charge',
        'Breakfast on the terrace, or brought up to the room instead'
      ],
      label: 'Talk to the Care Desk',
      action: 'desk'
    },
    doctor: {
      eyebrow: 'If a doctor is needed',
      title: 'A doctor at any hour, a hospital six kilometres away',
      text: 'The desk does not send you out looking for help. A doctor attends in the room, and a car stays on the property overnight so nobody is waiting for a taxi at three in the morning.',
      points: [
        'A doctor is on call 24 hours and attends in your room, not the lobby',
        'The nearest hospital is 6 km \u2014 about fifteen minutes, and the desk calls ahead',
        'Medicines, allergies and conditions are held at the desk, with your consent',
        'A car and driver stay on the property through the night'
      ],
      label: 'Talk to the Care Desk',
      action: 'desk'
    },
    fittings: {
      eyebrow: 'Fittings for the bathroom',
      title: 'Fitted before you arrive, at no charge',
      text: 'Room 214 is fitted out before you land, so there is nothing to arrange at the desk and nothing added to your folio for it.',
      points: [
        'Grab bars beside the WC and inside the rain shower',
        'A teak shower seat and a raised WC seat, fitted to the room',
        'Non-slip mats in the bathroom and at the step out of the bathtub',
        'Photographed once fitted and sent to you, so you see it before you fly'
      ],
      label: 'Request these fittings',
      action: 'status',
      status: 'Bathroom fittings requested for Room 214 \u2014 housekeeping confirms by email with a photograph. (Sample page: nothing was changed.)'
    },
    quiet: {
      eyebrow: 'Worried about the noise',
      title: 'Move to the Quiet Wing',
      text: 'The Quiet Wing sits away from the pool bar and the beach music, so the evening sounds like the garden rather than the shoreline.',
      points: [
        'Soundproofed rooms, set back from the pool bar and the sand',
        'Quiet hours from 10 PM across the whole wing',
        'Same rate and the same inclusions — only the room number changes'
      ],
      label: 'Move me to the Quiet Wing',
      action: 'status',
      status: 'Quiet Wing move requested — the desk confirms by email. (Sample page: nothing was changed.)'
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
