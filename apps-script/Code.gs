/**
 * Backend RSVP dla strony ślubnej Daniel & Zuzia.
 * Wklej do: Arkusz Google → Rozszerzenia → Apps Script.
 * 1) Uruchom funkcję setup() (raz) — utworzy arkusze "Goście" i "Podsumowanie".
 * 2) Wdróż → Nowe wdrożenie → Aplikacja internetowa; Wykonaj jako: Ja; Dostęp: Każdy.
 * 3) Skopiuj adres URL (…/exec) do CONFIG.scriptUrl w index.html.
 * Po każdej zmianie: Wdróż → Zarządzaj wdrożeniami → ołówek → Wersja: Nowa wersja,
 * potem sprawdź …/exec?action=rsvpVersion (musi pokazać aktualne RSVP_VERSION).
 */

const RSVP_VERSION = '2026-10-08b';
const SHEET = 'Goście';
const HEADERS = ['ID', 'Zaproszenie', 'Imię', 'Nazwisko', 'Typ', 'Obecność', 'Menu', 'Alergie',
  'Transport', 'Skąd/dokąd', 'Nocleg', 'Uwagi', 'Wypełnił(a)', 'Ostatnia zmiana'];
const TYPES = ['Dorosły', 'Osoba towarzysząca']; // bez dzieci (decyzja 08.10.2026)
const ANSWER_COLS = { attending: 'Obecność', menu: 'Menu', allergies: 'Alergie', transport: 'Transport',
  from: 'Skąd/dokąd', lodging: 'Nocleg', notes: 'Uwagi' };

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) sh = ss.insertSheet(SHEET);
  // nowe kolumny dopisujemy ZAWSZE na końcu HEADERS — migracja nagłówków:
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#f3e3e1');
  // tekst wymuszony: Arkusze nie „poprawią” np. numeru zaproszenia ani wieku
  sh.getRange(2, 1, 1000, HEADERS.length - 1).setNumberFormat('@');
  sh.setFrozenRows(1);
  if (sh.getLastRow() < 2) {
    // Przykładowe wiersze — zastąpcie je swoją listą gości.
    // Osoby z jednego zaproszenia mają TEN SAM numer w kolumnie "Zaproszenie".
    // Osoba towarzysząca bez znanego imienia: zostawcie Imię i Nazwisko puste, Typ = "Osoba towarzysząca".
    sh.getRange(2, 2, 4, 4).setValues([
      ['1', 'Anna', 'Kowalska', 'Dorosły'],
      ['1', 'Piotr', 'Kowalski', 'Dorosły'],
      ['2', 'Jan', 'Nowak', 'Dorosły'],
      ['2', '', '', 'Osoba towarzysząca'],
    ]);
  }
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(TYPES, true).build();
  sh.getRange(2, 5, 500, 1).setDataValidation(rule);
  sh.autoResizeColumns(1, HEADERS.length);
  ensureIds_(sh);

  let sum = ss.getSheetByName('Podsumowanie');
  if (!sum) sum = ss.insertSheet('Podsumowanie');
  const g = "'" + SHEET + "'!";
  const S = argSeparator_(sum); // "," albo ";" — zależnie od ustawień regionalnych arkusza
  const f = (name, ...args) => '=' + name + '(' + args.join(S) + ')';
  const rows = [
    ['Zaproszonych osób', f('COUNTA', g + 'B2:B')],
    ['Odpowiedzi', f('COUNTA', g + 'F2:F')],
    ['Będzie', f('COUNTIF', g + 'F2:F', '"Tak"')],
    ['Nie będzie', f('COUNTIF', g + 'F2:F', '"Nie"')],
    ['Brak odpowiedzi', '=B1-B2'],
    ['Menu tradycyjne', f('COUNTIFS', g + 'F2:F', '"Tak"', g + 'G2:G', '"Tradycyjne"')],
    ['Menu wegetariańskie', f('COUNTIFS', g + 'F2:F', '"Tak"', g + 'G2:G', '"Wegetariańskie"')],
    ['Menu wegańskie', f('COUNTIFS', g + 'F2:F', '"Tak"', g + 'G2:G', '"Wegańskie"')],
    ['Potrzebny transport', f('COUNTIFS', g + 'F2:F', '"Tak"', g + 'I2:I', '"<>Nie potrzebuję"', g + 'I2:I', '"<>"')],
    ['Potrzebny nocleg', f('COUNTIFS', g + 'F2:F', '"Tak"', g + 'K2:K', '"Tak, potrzebuję noclegu"')],
    ['Zgłoszone alergie', f('COUNTIFS', g + 'F2:F', '"Tak"', g + 'H2:H', '"<>"')],
  ];
  // Pułapka: separator argumentów w formułach zależy od ustawień regionalnych arkusza
  // (PL: ";"), także przy setFormulas(). argSeparator_() sprawdza go na próbnej formule.
  sum.clear();
  sum.getRange(1, 1, rows.length, 1).setValues(rows.map(r => [r[0]])).setFontWeight('bold');
  sum.getRange(1, 2, rows.length, 1).setFormulas(rows.map(r => [r[1]]));
  Logger.log('Separator formuł: "' + S + '" (locale: ' + ss.getSpreadsheetLocale() + ')');
  const empty = ss.getSheetByName('Arkusz1') || ss.getSheetByName('Sheet1');
  if (empty && empty.getLastRow() === 0) ss.deleteSheet(empty);
  sum.autoResizeColumns(1, 2);
}

/* ---------- helpers ---------- */
function argSeparator_(sheet) {
  const cell = sheet.getRange('Z1');
  cell.setFormula('=SUM(1,1)');
  SpreadsheetApp.flush();
  const ok = cell.getValue() === 2;
  cell.clear();
  return ok ? ',' : ';';
}
function norm_(s) {
  return String(s || '').toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function ensureIds_(sh) {
  const n = sh.getLastRow() - 1;
  if (n < 1) return;
  const r = sh.getRange(2, 1, n, 2), v = r.getValues();
  let changed = false;
  v.forEach(row => { if (row[1] !== '' && !row[0]) { row[0] = Utilities.getUuid().slice(0, 8); changed = true; } });
  if (changed) sh.getRange(2, 1, n, 1).setValues(v.map(x => [x[0]]));
}
function readAll_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET);
  ensureIds_(sh);
  const values = sh.getDataRange().getValues();
  const head = values.shift();
  const col = {}; head.forEach((h, i) => col[h] = i);
  return { sh, col, rows: values.map((r, i) => ({ r, rowNum: i + 2 })).filter(x => x.r[col['Zaproszenie']] !== '') };
}
function member_(x, col) {
  const r = x.r;
  const answered = r[col['Obecność']] !== '';
  const answers = answered ? {} : null;
  if (answered) Object.keys(ANSWER_COLS).forEach(k => answers[k] = String(r[col[ANSWER_COLS[k]]]));
  return { id: String(r[col['ID']]), first: String(r[col['Imię']]), last: String(r[col['Nazwisko']]),
    type: String(r[col['Typ']] || 'Dorosły'), answers };
}

/* ---------- API ---------- */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'rsvpVersion') return json_({ ok: true, version: RSVP_VERSION });
  if (p.action !== 'lookup') return json_({ ok: false, error: 'bad_request' });
  const q = norm_(p.name);
  if (q.split(' ').length < 2) return json_({ ok: false, error: 'not_found' });
  const { col, rows } = readAll_();
  const hits = rows.filter(x => {
    const f = norm_(x.r[col['Imię']]), l = norm_(x.r[col['Nazwisko']]);
    return f && (q === f + ' ' + l || q === l + ' ' + f);
  });
  if (hits.length !== 1) return json_({ ok: false, error: hits.length ? 'ambiguous' : 'not_found' });
  const inv = String(hits[0].r[col['Zaproszenie']]);
  return json_({ ok: true, invitation: inv, selfId: String(hits[0].r[col['ID']]),
    members: rows.filter(x => String(x.r[col['Zaproszenie']]) === inv).map(x => member_(x, col)) });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const b = JSON.parse(e.postData.contents);
    if (b.action !== 'save') return json_({ ok: false, error: 'bad_request' });
    const { sh, col, rows } = readAll_();
    const x = rows.find(x => String(x.r[col['ID']]) === String(b.id) && String(x.r[col['Zaproszenie']]) === String(b.invitation));
    if (!x) return json_({ ok: false, error: 'not_found' });
    const row = x.r.slice();
    const a = b.answers || {};
    const clip = v => String(v == null ? '' : v).slice(0, 500);
    Object.keys(ANSWER_COLS).forEach(k => row[col[ANSWER_COLS[k]]] = clip(a[k]));
    if (String(row[col['Typ']]) === 'Osoba towarzysząca' && b.first !== undefined) {
      row[col['Imię']] = clip(b.first); row[col['Nazwisko']] = clip(b.last);
    }
    row[col['Wypełnił(a)']] = clip(b.filledBy);
    row[col['Ostatnia zmiana']] = new Date();
    sh.getRange(x.rowNum, 1, 1, row.length).setValues([row]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'server' });
  } finally {
    lock.releaseLock();
  }
}
