import { sanitize } from '../../utils/sanitize.js';
import { CURRENCIES } from '../../content/content.js';
// src/modules/onboarding/onboarding.js
// Onboarding flow — steps, path selection, completion.

import { getState, setState, saveNow } from '../../store/appStore.js';
import { showToast } from '../../utils/toast.js';
import { showPage } from '../../utils/router.js';
import { sb } from '../../services/supabase.js';
import { todayStr } from '../../utils/date.js';

let obStep = 1;

export function nextOb(n) {
  if (obStep === 1 && n === 2) {
    const sig = document.getElementById('sig')?.value.trim();
    if (!sig) { showToast('Sign your name to continue', 'error'); return; }
  }
  const cur    = document.getElementById('os-' + obStep);
  const curDot = document.getElementById('sd-' + obStep);
  if (cur)    cur.classList.remove('active');
  if (curDot) { curDot.classList.remove('active'); curDot.classList.add('done'); curDot.textContent = '✓'; }
  obStep = n;
  const nxt    = document.getElementById('os-' + n);
  const nxtDot = document.getElementById('sd-' + n);
  if (nxt)    nxt.classList.add('active');
  if (nxtDot) nxtDot.classList.add('active');
}

export function selectPath(el, path) {
  document.querySelectorAll('.ex-path').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  setState({ exercisePath: path }, true);
}

export async function searchWarriorsForPartner(query) {
  if (!query || query.length < 2) return;
  try {
    const { data } = await sb.from('warriors')
      .select('id,display_name,nickname,name,current_day')
      .ilike('display_name', `%${query}%`)
      .limit(8);
    _renderPartnerResults(data || []);
  } catch (e) { /* silent */ }
}

function _renderPartnerResults(warriors) {
  const el = document.getElementById('ob-partner-results');
  if (!el) return;
  if (!warriors.length) { el.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">No warriors found.</p>'; return; }

  el.innerHTML = warriors.map(w => {
    const name = w.display_name || w.nickname || w.name || 'Warrior';
    return `<div class="partner-result-item" data-id="${w.id}" data-name="${sanitize(name)}" style="padding:10px;border:1px solid var(--border);border-radius:6px;margin-bottom:8px;cursor:pointer;display:flex;align-items:center;gap:10px;">
      <div style="width:36px;height:36px;border-radius:50%;background:var(--orange);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--text-primary);">${name[0].toUpperCase()}</div>
      <div><div style="font-size:13px;color:var(--text-primary);font-weight:600;">${sanitize(name)}</div><div style="font-size:11px;color:var(--text-muted);">Day ${w.current_day || 1}</div></div>
    </div>`;
  }).join('');
  el.querySelectorAll('.partner-result-item').forEach(item => {
    item.addEventListener('click', () => selectObPartner(item.dataset.id, item.dataset.name));
  });
}

export function selectObPartner(id, name) {
  setState({ acctPartner: { id, name } }, true);
  const el = document.getElementById('ob-selected-partner');
  if (el) el.textContent = 'Partner: ' + name;
  document.getElementById('ob-partner-results')?.querySelectorAll('.partner-result-item').forEach(item => {
    item.style.opacity = item.dataset.id === id ? '1' : '0.4';
  });
}

export function clearObPartner() {
  setState({ acctPartner: null }, true);
  const el = document.getElementById('ob-selected-partner');
  if (el) el.textContent = '';
}

export async function completeOnboarding() {
  const S = getState();

  const sig        = document.getElementById('sig')?.value.trim() || S.user?.name || '';
  const wakeup     = document.getElementById('ob-wakeup')?.value || '05:30';
  const whoFor     = document.getElementById('ob-whyfor')?.value.trim() || '';
  const weight     = parseFloat(document.getElementById('ob-weight')?.value) || 0;
  const startBudget = parseFloat(document.getElementById('ob-budget')?.value) || 0;
  const debt       = parseFloat(document.getElementById('ob-debt')?.value) || 0;
  const savings    = parseFloat(document.getElementById('ob-savings')?.value) || 0;
  const currency   = _getCurrencyFromSelect();

  if (!sig) { showToast('Sign your name to complete onboarding.', 'error'); return; }

  setState({
    baseline: {
      date: todayStr(),
      sig, whoFor, weight, startBudget, debt, savings,
      exercisePath: S.exercisePath || 'run',
    },
    wakeupTime: wakeup,
    day: 1,
    currency,
    savings,
    totalSaved: savings,
    debts: debt ? [{ label: 'Starting debt', amount: debt, date: todayStr() }] : [],
    lastActiveDate: todayStr(),
  });

  saveNow();
  showToast(`Welcome to Day 1, ${S.user?.name?.split(' ')[0] || 'Warrior'}. The war starts now.`, 'success');
  showPage('page-app');
}

export async function completeOnboardingWithPartner() {
  return completeOnboarding();
}

function _getCurrencyFromSelect() {
  const val = document.getElementById('ob-currency')?.value || 'BWP';

  return CURRENCIES.find(c => c.code === val) || { code: 'BWP', sym: 'P', name: 'Botswana Pula' };
}

// Global exposure
window.nextOb                      = nextOb;
window.selectPath                  = selectPath;
window.searchWarriorsForPartner    = searchWarriorsForPartner;
window.selectObPartner             = selectObPartner;
window.clearObPartner              = clearObPartner;
window.completeOnboarding          = completeOnboarding;
window.completeOnboardingWithPartner = completeOnboardingWithPartner;
