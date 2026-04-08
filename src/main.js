/**
 * 90 Days Challenge — App Entry Point
 * Vite uses this as the module entry from index.html.
 *
 * CSS imports (standard Vite practice — replaces <link> tags during build):
 */
import './styles/theme.css';
import './styles/main.css';
import './styles/components.css';
import './styles/community.css';
import './styles/fixes.css';
import './styles/overhaul.css';
import './styles/warrior-center.css';

/* ── Helpers ─────────────────────────────────────────── */

/** Simple toast notification */
function showToast(msg, type) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'toast show ' + (type || 'info');
  setTimeout(() => { el.className = 'toast'; }, 3500);
}

/** Page / section / tab navigation */
function showPage(pageId, subView) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(pageId);
  if (target) target.classList.add('active');
  if (subView) switchAuth(subView);
}

function switchAuth(view) {
  document.querySelectorAll('.auth-view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById('auth-' + view);
  if (el) el.classList.add('active');
}

function switchSec(secId) {
  const parent = document.querySelector('.app-sections');
  if (!parent) return;
  parent.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(secId);
  if (target) target.classList.add('active');
}

function switchTab(tabGroup, tabId) {
  const group = document.getElementById(tabGroup);
  if (!group) return;
  group.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');
  group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const btn = group.querySelector('[data-tab="' + tabId + '"]');
  if (btn) btn.classList.add('active');
}

function toggleMobileMore() {
  document.querySelector('.bnav-more-menu')?.classList.toggle('active');
}

function toggleNotifPanel() {
  document.querySelector('.notif-panel')?.classList.toggle('hidden');
}

/* ── Register all globals referenced by inline onclick/onchange/oninput ── */

// Navigation & UI
window.showPage = showPage;
window.switchAuth = switchAuth;
window.switchSec = switchSec;
window.switchTab = switchTab;
window.showToast = showToast;
window.toggleMobileMore = toggleMobileMore;
window.toggleNotifPanel = toggleNotifPanel;

// No-op stubs for features that require full module implementation.
// These prevent "function is not defined" errors in the browser console
// while the modular JS source is being built out per REFACTOR_MAP.md.
const noop = () => {};
const noopMsg = (name) => () => {
  console.warn('[90DC] ' + name + ' is not yet wired up.');
};

// Auth
window.doLogin = noopMsg('doLogin');
window.doSignup = noopMsg('doSignup');
window.doLogout = noopMsg('doLogout');
window.verify2FA = noopMsg('verify2FA');
window.tfaNext = noopMsg('tfaNext');

// Onboarding
window.nextOb = noopMsg('nextOb');
window.selectPath = noopMsg('selectPath');
window.completeOnboarding = noopMsg('completeOnboarding');
window.clearObPartner = noopMsg('clearObPartner');
window.searchWarriorsForPartner = noopMsg('searchWarriorsForPartner');
window.completeOnboardingWithPartner = noopMsg('completeOnboardingWithPartner');

// Check-ins
window.completeMorningCheckin = noopMsg('completeMorningCheckin');
window.showEveningCheckin = noopMsg('showEveningCheckin');
window.submitAfternoonCheckinFull = noopMsg('submitAfternoonCheckinFull');
window.submitEveningCheckinFull = noopMsg('submitEveningCheckinFull');
window.doDailyCheckin = noopMsg('doDailyCheckin');
window.handleNextCheckin = noopMsg('handleNextCheckin');
window.acToggle = noopMsg('acToggle');
window.ecToggle = noopMsg('ecToggle');
window.toggleWater = noopMsg('toggleWater');
window.toggleMainWater = noopMsg('toggleMainWater');
window.toggleEveWater = noopMsg('toggleEveWater');
window.showCrisisModal = noopMsg('showCrisisModal');

// Profile
window.saveFullProfile = noopMsg('saveFullProfile');
window.saveProfileField = noopMsg('saveProfileField');
window.handleAvatarUpload = noopMsg('handleAvatarUpload');
window.handleBeforePic = noopMsg('handleBeforePic');
window.showPartnerModal = noopMsg('showPartnerModal');
window.nudgePartner = noopMsg('nudgePartner');
window.showWarriorDirectory = noopMsg('showWarriorDirectory');
window.openCurrencyModal = noopMsg('openCurrencyModal');

// Progress & data
window.exportData = noopMsg('exportData');
window.importData = noopMsg('importData');

// Workout
window.logWorkout = noopMsg('logWorkout');
window.wkTimerStart = noopMsg('wkTimerStart');
window.wkTimerStop = noopMsg('wkTimerStop');
window.wkTimerReset = noopMsg('wkTimerReset');
window.updateWkTypeLabel = noopMsg('updateWkTypeLabel');
window.wkHandlePhoto = noopMsg('wkHandlePhoto');
window.showSmartWatchModal = noopMsg('showSmartWatchModal');

// Finances
window.logExpense = noopMsg('logExpense');
window.logSavings = noopMsg('logSavings');
window.updateBudget = noopMsg('updateBudget');
window.addDebt = noopMsg('addDebt');
window.showFinLesson = noopMsg('showFinLesson');
window.updateEveSavings = noopMsg('updateEveSavings');

// Mindset
window.saveMindsetEntry = noopMsg('saveMindsetEntry');
window.addAffirmation = noopMsg('addAffirmation');
window.saveJournal = noopMsg('saveJournal');
window.setJPrompt = noopMsg('setJPrompt');

// Community / Warrior Center
window.wcSendMsg = noopMsg('wcSendMsg');
window.wcSwitchRoom = noopMsg('wcSwitchRoom');
window.wcToggleEmoji = noopMsg('wcToggleEmoji');
window.wcInsertEmoji = noopMsg('wcInsertEmoji');
window.wcToggleRecording = noopMsg('wcToggleRecording');
window.wcCancelRecording = noopMsg('wcCancelRecording');
window.wcTriggerImage = noopMsg('wcTriggerImage');
window.wcHandleImage = noopMsg('wcHandleImage');
window.wcClearImage = noopMsg('wcClearImage');
window.wcClearReply = noopMsg('wcClearReply');
window.wcLoadMore = noopMsg('wcLoadMore');
window.wcQuickPost = noopMsg('wcQuickPost');
window.dashPost = noopMsg('dashPost');

// Admin
window.adminExportCSV = noopMsg('adminExportCSV');
window.adminFixMissingRows = noopMsg('adminFixMissingRows');
window.adminIssueStrike = noopMsg('adminIssueStrike');
window.adminRevokeStrike = noopMsg('adminRevokeStrike');
window.adminQuickPush = noopMsg('adminQuickPush');
window.adminSendPush = noopMsg('adminSendPush');
window.postAnnouncement = noopMsg('postAnnouncement');

// Notifications & misc
window.requestNotifPerm = noopMsg('requestNotifPerm');
window.saveReminders = noopMsg('saveReminders');
window.saveWeeklyReview = noopMsg('saveWeeklyReview');
window.logWeight = noopMsg('logWeight');
window.logSundayMeasurements = noopMsg('logSundayMeasurements');
window.syncGoogleCal = noopMsg('syncGoogleCal');
window.showSupportContact = noopMsg('showSupportContact');
window.installPWA = noop;

// Window-level optional hooks (called with && guard in HTML)
window.toggleTheme = noop;
window.openWarriorCenter = noop;
window._wcBack = noop;

console.log('[90DC] App shell loaded.');
