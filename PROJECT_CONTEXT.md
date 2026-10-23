# PROJECT_CONTEXT — Strona na Wesele (Zuzia & Daniel)

**Wersja 2.3 — 23.10.2026**

## 1. Opis projektu
Strona dla zaproszonych gości: informacje o ślubie i weselu + potwierdzenie obecności (RSVP) z danymi o transporcie, noclegu, diecie, osobach towarzyszących i dzieciach.
**Czym nie jest:** systemem rozsadzania gości, listą prezentów ani galerią zdjęć (na razie).

## 2. Wydarzenie
| | |
|---|---|
| Para | Zuzia & Daniel (zawsze w tej kolejności) |
| Miejsce (ceremonia + przyjęcie) | Lipniak 8, Krzczonów |
| Godzina ceremonii | 17:00 |
| Data | sobota, 24.07.2027 |
| Kontakt na stronie | +48 790 744 200 |

## 3. Design i styl
Styl zaproszeń z inspiracji (Project files): kremowy papier, czerwone ręcznie rysowane ilustracje liniowe, szeryfowe wersaliki + pismo odręczne.
Świadome odejście od standardu Bloome (Outfit, sans-serif) — strona ma pasować do zaproszeń, nie do marki.

| Token | HEX | Rola |
|---|---|---|
| `--paper` | `#F6F1E7` | tło strony |
| `--card` | `#FBF8F2` | karta zaproszenia, formularz |
| `--ink` | `#2B1E1C` | tekst |
| `--muted` | `#76665F` | tekst pomocniczy |
| `--wine` | `#7A2434` | ilustracje (ujednolicone skryptem), akcenty, przyciski, pasmo |
| `--linen` | `#CFE0EE` | baby blue — tło poza kartką (komputer) |

Fonty: **Architects Daughter** (wersaliki: imiona, daty, etykiety, przyciski — darmowy zamiennik Dreaming Outloud All Caps z Canvy, który nie ma licencji web), **Marck Script** (napisy odręczne — ten sam co w Canvie), EB Garamond (tekst ciągły). Wszystkie z Google Fonts, z polskimi znakami.
Grafiki: ⚠️ obecnie tymczasowe SVG rysowane przez Claude → do podmiany na grafiki z Canva Premium.

## 4. Struktura strony
| Plik | Status |
|---|---|
| `index.html` — hero (zaproszenie + odliczanie), Kiedy i gdzie, Plan dnia, Dojazd i nocleg, RSVP, Kontakt | ✅ (tryb podglądu) |
| `apps-script/Code.gs` — kopia backendu RSVP | ✅ wdrożony (wersja `2026-10-08b`) |

## 5. Technologia
| Element | Technologia | Koszt |
|---|---|---|
| Frontend | jeden `index.html`, vanilla JS | 0 zł |
| Hosting | GitHub Pages, repo `wesele` | 0 zł |
| Backend | Google Apps Script (Web App `/exec`) | 0 zł |
| Baza | Arkusz Google: „Goście” + „Podsumowanie” | 0 zł |
| Domena | własna, ⏭️ do wyboru | ~50 zł/rok |

```
Gość ──> index.html (GitHub Pages) ──fetch GET lookup / POST save──> Apps Script /exec ──> Arkusz „Goście”
                                                                                        └─> „Podsumowanie” (formuły)
```
Pusty `CONFIG.scriptUrl` = tryb podglądu z przykładowymi gośćmi (nic nie zapisuje).

## 6. Funkcjonalności — RSVP
- Gość wpisuje imię i nazwisko → serwer zwraca **tylko jego zaproszenie** (osoby z tym samym numerem w kolumnie „Zaproszenie”).
- Najpierw wypełnia siebie, potem dla każdej kolejnej osoby z zaproszenia: „Czy chcesz uzupełnić odpowiedź również za: X?”.
- Typy osób: Dorosły / Osoba towarzysząca (gość wpisuje jej imię i nazwisko). Bez dzieci — na weselu ich nie będzie (08.10.2026).
- Pola: obecność, menu, alergie, transport (+ skąd/dokąd), nocleg, uwagi. Odpowiedź można zmienić.
- Zapis z `LockService`, ID wiersza weryfikowane razem z numerem zaproszenia.

## 7. Status
✅ Repo `bloome2115/wesele` + GitHub Pages (bloome2115.github.io/wesele)
✅ Arkusz „Wesele — RSVP” + Apps Script wdrożony, strona podpięta, zapis przetestowany (08.10.2026)
✅ v2.0: nowy projekt strony — koperta z pieczęcią, ilustracje z Canvy (kolor wina #7A2434), odliczanie z sekundami, kalendarz z zaznaczoną datą, „Dodaj do kalendarza”, rysunki prawdziwego miejsca
✅ Ilustracje w pełnej rozdzielczości (eksport PNG ×2 → `tools/przygotuj_ilustracje.py` → WebP)
✅ v2.1 (22.10): bez koperty i bez ilustracji pojedynczych przedmiotów; tylko sceny z Lipniaka (Canva 9–18) + monogram ZD z wisienkami (19); wejście = monogram wyostrza się, imiona się rozsuwają; plan dnia w łukowych „oknach”; sceny jako WebP na białym tle + mix-blend-mode: multiply (≈1 MB łącznie)
✅ v2.2 (23.10): data 24.07.2027; nowy monogram (wyraźniejsze wiśnie, Canva 20); całe bukiety (23, 24) swobodnie, ucięte (15, 16) tylko w łukach; wieża z wiśniami (21) w podziękowaniu po RSVP; tło baby blue. Tort (22) — na razie nieużyty
⏭️ Następne kroki: (2) poprawki wizualne (faza 4) → (3) data, plan dnia, prawdziwa lista gości → (4) domena.

### ⚠️ Znane atrapy
| Atrapa | Gdzie | Stan |
|---|---|---|
| Termin RSVP `2027-06-12` | `CONFIG.rsvpDeadline` | przykładowy — do potwierdzenia |
| Plan dnia (poza 17:00) | `CONFIG.schedule` | ogólne punkty bez godzin |
| Przykładowi goście (Kowalscy, Nowak) | Arkusz „Goście” | do zastąpienia prawdziwą listą |
| Tekst „Drodzy Goście” | sekcja #zaproszenie | ogólny, do napisania przez Was |
| Brak obrazka podglądu linku (og:image) | `<head>` | po wyborze domeny |
| Teksty Transport / Nocleg | sekcja „Dojazd i nocleg” | ogólne, bez konkretów |

## 8. Pliki projektu
```
Wesele/
├── PROJECT_CONTEXT.md
├── index.html
├── apps-script/Code.gs
├── claude/DECYZJE_backend-rsvp.md
└── .gitignore
```

## 9. Notatki i decyzje
- Backend RSVP: Arkusz + Apps Script (nie baza claude.ai) — patrz `claude/DECYZJE_backend-rsvp.md`.
- Lista gości nie trafia do repozytorium (repo publiczne) — żyje tylko w Arkuszu.

## 10. Pułapki
- Separator argumentów formuł zależy od ustawień regionalnych arkusza (PL: `;`) — także przy `setFormulas()`. Formuła z `,` w polskim arkuszu = `#ERROR!`. Rozwiązanie: `argSeparator_()` sprawdza separator na próbnej formule (08.10.2026).
- Po każdej zmianie `.gs`: **Nowa wersja** wdrożenia, potem `/exec?action=rsvpVersion` (Playbook §11).

- Sceny z przezroczystością ważyły ~4 MB; spłaszczenie na biel + `mix-blend-mode: multiply` = ~1 MB. Uwaga: przodek sceny nie może mieć `transform`/`opacity` (izoluje mieszanie → widać białe tło) — animujemy same obrazki (22.10.2026).
