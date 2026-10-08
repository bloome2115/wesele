# PROJECT_CONTEXT — Strona na Wesele (Daniel & Zuzia)

**Wersja 1 — 07.10.2026**

## 1. Opis projektu
Strona dla zaproszonych gości: informacje o ślubie i weselu + potwierdzenie obecności (RSVP) z danymi o transporcie, noclegu, diecie, osobach towarzyszących i dzieciach.
**Czym nie jest:** systemem rozsadzania gości, listą prezentów ani galerią zdjęć (na razie).

## 2. Wydarzenie
| | |
|---|---|
| Para | Daniel & Zuzia |
| Miejsce (ceremonia + przyjęcie) | Lipniak 8, Krzczonów |
| Godzina ceremonii | 17:00 |
| Data | ⚠️ do uzupełnienia |
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
| `--red` | `#A82A2C` | ilustracje, akcenty, przyciski |

Fonty: Bodoni Moda (imiona, nagłówki), EB Garamond (tekst), Pinyon Script (ozdobne).
Grafiki: ⚠️ obecnie tymczasowe SVG rysowane przez Claude → do podmiany na grafiki z Canva Premium.

## 4. Struktura strony
| Plik | Status |
|---|---|
| `index.html` — hero (zaproszenie + odliczanie), Kiedy i gdzie, Plan dnia, Dojazd i nocleg, RSVP, Kontakt | ✅ (tryb podglądu) |
| `apps-script/Code.gs` — kopia backendu RSVP | ✅ kod gotowy, ⏭️ niewdrożony |

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
- Typy osób: Dorosły / Dziecko (wiek, menu dziecięce) / Osoba towarzysząca (gość wpisuje jej imię i nazwisko).
- Pola: obecność, menu, alergie, transport (+ skąd/dokąd), nocleg, uwagi. Odpowiedź można zmienić.
- Zapis z `LockService`, ID wiersza weryfikowane razem z numerem zaproszenia.

## 7. Status
✅ Strona i backend napisane, podgląd działa.
⏭️ Następne kroki: (1) repo + GitHub Pages → (2) Arkusz + Apps Script → (3) podpięcie `scriptUrl`, data → (4) grafiki z Canvy → (5) domena.

### ⚠️ Znane atrapy
| Atrapa | Gdzie | Stan |
|---|---|---|
| Data ślubu `2027-06-26` | `index.html` → `CONFIG.date` | przykładowa |
| Termin RSVP `2027-05-15` | `CONFIG.rsvpDeadline` | przykładowy |
| Plan dnia (poza 17:00) | `CONFIG.schedule` | ogólne punkty bez godzin |
| Tryb podglądu, przykładowi goście | `CONFIG.scriptUrl` pusty | do podpięcia |
| Ilustracje | sprite SVG w `index.html` | tymczasowe |
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
- Po każdej zmianie `.gs`: **Nowa wersja** wdrożenia, potem `/exec?action=rsvpVersion` (Playbook §11).
