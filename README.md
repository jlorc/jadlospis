# Jadłospis — panel dietetyka (MVP)

Front-endowa aplikacja do układania jadłospisów dla pacjentów. Dane są zapisane w plikach TypeScript (produkty, potrawy, przykładowy pacjent); stan aplikacji trafia do `localStorage`. Bez backendu, bazy i logowania.

## Uruchomienie

```bash
npm install
npm run dev
```

Aplikacja domyślnie: [http://127.0.0.1:43123](http://127.0.0.1:43123)

**Demo (GitHub Pages):** po wdrożeniu — [https://dawidw.pl/jadlospis/](https://dawidw.pl/jadlospis/) lub [https://dawidw.github.io/jadlospis/](https://dawidw.github.io/jadlospis/)

```bash
npm run build   # produkcyjny build
npm run preview # podgląd buildu
```

## Funkcje (MVP)

- **Pacjent i cele** — waga, wzrost, wiek, płeć, PAL → BMI, PPM, CPM; cel kcal, podział makro (%), lista posiłków z udziałem % i godzinami; lista pacjentów (+ dodawanie).
- **Jadłospis** — nazwa, 1–7 dni, pełna szerokość siatki dni × posiłki; karta posiłku: czas, kcal vs cel, makra, status odchylenia.
- **Edycja w panelu bocznym** — wyszukiwanie produktów (IŻŻ/USDA) i potraw, gramy i miary domowe, rozwijane składniki potrawy, „do normy posiłku pozostało” na żywo.
- **Pasek norm** — bilans dobowy (wybrany dzień) i tygodniowy (suma), energia + makra + błonnik z % odchylenia.
- **Cofnij / ponów**, duplikacja posiłku i dnia, **eksport PDF** (jsPDF).

## Stack

Vite, React 19, TypeScript, Tailwind CSS 4.

## Dane

- `src/data/productGenerator.ts` — ok. 95 produktów (makro na 100 g, miary domowe).
- `src/data/dishes.ts` — 10 przykładowych potraw.
- `src/data/defaults.ts` — pacjentka **Anna Nowak** i plan na 3 dni.
