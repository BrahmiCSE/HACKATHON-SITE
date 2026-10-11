/* ===========================================================
   ECHELON YOUNG INNOVATORS HACKATHON 2026
   Page behaviour

   1. Countdown to the next milestone
   2. Mobile menu
   3. Footer year
   =========================================================== */

/* "use strict" makes the browser report sloppy mistakes
   instead of silently guessing what you meant. */
"use strict";


/* -----------------------------------------------------------
   1. COUNTDOWN

   The page counts down to whichever milestone is next.
   Once registration closes, it moves on to the online round,
   and so on. After the finale it shows a closing message.

   EDIT HERE if a date changes. The format is:
   YYYY-MM-DDTHH:MM:SS+05:30   ( +05:30 means India time )
   ----------------------------------------------------------- */
var MILESTONES = [
  { label: "Registration closes in",  date: "2026-10-30T23:59:59+05:30" },
  { label: "Online round closes in",  date: "2026-11-05T23:59:59+05:30" },
  { label: "Results announced in",    date: "2026-11-10T09:00:00+05:30" },
  { label: "Grand finale begins in",  date: "2026-11-21T09:00:00+05:30" }
];

var FINISHED_MESSAGE = "The hackathon has concluded. Thank you for taking part.";

function initCountdown() {
  var box      = document.getElementById("countdown");
  var labelEl  = document.getElementById("countdown-label");
  var daysEl   = document.getElementById("cd-days");
  var hoursEl  = document.getElementById("cd-hours");
  var minsEl   = document.getElementById("cd-mins");
  var secsEl   = document.getElementById("cd-secs");

  // If any piece is missing from the HTML, stop rather than crash.
  if (!box || !labelEl || !daysEl || !hoursEl || !minsEl || !secsEl) {
    return;
  }

  // Turn the text dates into real dates, dropping any that are invalid.
  var schedule = [];
  for (var i = 0; i < MILESTONES.length; i++) {
    var when = new Date(MILESTONES[i].date);
    if (isNaN(when.getTime())) {
      // A mistyped date is skipped instead of showing "NaN" on the page.
      continue;
    }
    schedule.push({ label: MILESTONES[i].label, when: when });
  }

  // Earliest first, so "the next one" is simply the first future entry.
  schedule.sort(function (a, b) { return a.when - b.when; });

  var timerId = null;

  function pad(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function showFinished() {
    labelEl.textContent = FINISHED_MESSAGE;
    var row = box.querySelector(".countdown-row");
    if (row) { row.style.display = "none"; }
    if (timerId !== null) { clearInterval(timerId); }
  }

  function tick() {
    var now = Date.now();
    var next = null;

    for (var j = 0; j < schedule.length; j++) {
      if (schedule[j].when.getTime() > now) {
        next = schedule[j];
        break;
      }
    }

    // Every date is in the past, or none were valid.
    if (next === null) {
      showFinished();
      return;
    }

    var msLeft = next.when.getTime() - now;
    var totalSeconds = Math.floor(msLeft / 1000);

    labelEl.textContent = next.label;
    daysEl.textContent  = pad(Math.floor(totalSeconds / 86400));
    hoursEl.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
    minsEl.textContent  = pad(Math.floor((totalSeconds % 3600) / 60));
    secsEl.textContent  = pad(totalSeconds % 60);
  }

  tick();                              // fill the numbers immediately
  timerId = setInterval(tick, 1000);   // then update every second
}


/* -----------------------------------------------------------
   2. MOBILE MENU
   ----------------------------------------------------------- */
function initMenu() {
  var button = document.getElementById("menu-toggle");
  var menu   = document.getElementById("site-nav");

  if (!button || !menu) { return; }

  button.addEventListener("click", function () {
    var isOpen = menu.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
    button.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  // Tapping a link should close the menu, not leave it covering the page.
  var links = menu.querySelectorAll("a");
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function () {
      menu.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Open menu");
    });
  }

  // If the window is widened past the mobile breakpoint while the menu
  // is open, clear the open state so the desktop layout is correct.
  window.addEventListener("resize", function () {
    if (window.innerWidth > 700 && menu.classList.contains("is-open")) {
      menu.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Open menu");
    }
  });
}


/* -----------------------------------------------------------
   3. BADGE TILT

   The badge turns slightly to follow the pointer, which makes it
   read as an object sitting in space rather than a flat picture.

   Only on pointers that can hover, so phones and tablets are left
   alone, and skipped entirely if the visitor has asked their device
   to reduce motion.
   ----------------------------------------------------------- */
function initBadgeTilt() {
  var badge = document.getElementById("hero-badge");
  var hero  = document.getElementById("home");

  if (!badge || !hero) { return; }

  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var wideEnough = window.matchMedia("(min-width: 981px)").matches;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canHover || !wideEnough || reduced) { return; }

  var RESTING_Y = -14;   // the angles the CSS sets when the pointer is away
  var RESTING_X = 6;
  var SWING = 11;        // how far it is allowed to turn, in degrees
  var pending = false;

  function apply(event) {
    var box = hero.getBoundingClientRect();

    // Where the pointer is inside the hero, as -1 to 1 on each axis
    var x = (event.clientX - box.left) / box.width * 2 - 1;
    var y = (event.clientY - box.top) / box.height * 2 - 1;

    // Clamp, so a pointer just outside cannot throw it to an extreme
    x = Math.max(-1, Math.min(1, x));
    y = Math.max(-1, Math.min(1, y));

    var rotY = RESTING_Y + x * SWING;
    var rotX = RESTING_X - y * SWING * 0.6;

    badge.style.transform = "rotateY(" + rotY.toFixed(2) + "deg) " +
                            "rotateX(" + rotX.toFixed(2) + "deg)";
  }

  hero.addEventListener("mousemove", function (event) {
    // Only recalculate once per frame, so moving the mouse fast
    // cannot flood the browser with work.
    if (pending) { return; }
    pending = true;
    window.requestAnimationFrame(function () {
      pending = false;
      apply(event);
    });
  });

  // Settle back to the resting angle when the pointer leaves
  hero.addEventListener("mouseleave", function () {
    badge.style.transform = "rotateY(" + RESTING_Y + "deg) rotateX(" + RESTING_X + "deg)";
  });
}


/* -----------------------------------------------------------
   4. FOOTER YEAR
   ----------------------------------------------------------- */
function initYear() {
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
}


/* -----------------------------------------------------------
   START
   The script tag sits at the end of the body, so the HTML is
   already loaded by the time this runs.
   ----------------------------------------------------------- */
initCountdown();
initMenu();
initBadgeTilt();
initYear();

/* -----------------------------------------------------------
   START
   The script tag sits at the end of the body, so the HTML is
   already loaded by the time this runs.
   ----------------------------------------------------------- */
initCountdown();
initMenu();
initYear();
