# DECYZJE — backend RSVP

**Status: ✅ obowiązuje (07.10.2026)**

## Problem
Goście muszą zapisywać odpowiedzi bez zakładania kont, a wy musicie je widzieć w jednym miejscu.

## Rozważone
| Opcja | Werdykt | Dlaczego |
|---|---|---|
| Baza wbudowana w artefakt claude.ai | ❌ odrzucona (06.10) | goście spoza konta nie mogą zapisywać danych; pierwotnie rekomendowana przez pomyłkę |
| Google Forms | ❌ | brak logiki „uzupełnij też za osobę X z zaproszenia”, wygląd niezgodny ze stroną |
| **Apps Script + Arkusz** | ✅ | standard Bloome, 0 zł, arkusz = gotowy panel dla pary, pełna kontrola nad logiką zaproszeń |

## Konsekwencje
- Wyszukiwanie po imieniu i nazwisku zwraca tylko jedno zaproszenie (filtrowanie na serwerze, Playbook §7.8).
- Ktoś znający imię i nazwisko gościa może zobaczyć/zmienić jego odpowiedź — akceptowalne przy tej stawce; ewentualny kod z zaproszenia = opcja na później.
