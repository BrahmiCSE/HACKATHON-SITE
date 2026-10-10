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
   3. FOOTER YEAR
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
initYear();