# Nalazi

Zamena za `demo`: dva plagina, `catalog` i `cart`, 37 i 35 fajlova. 117 testova,
`pnpm verify` prolazi (lint, typecheck, test, build).

Domen je namerno dosadan: `catalog` je skladiste rezervnih delova (naziv, vrsta,
cena u centima, stanje na polici), `cart` je lista za izuzimanje. Citalac uzima
mehaniku, nikad model.

## 1. Sta je napravljeno i gde stoji koji prelaz granice

### catalog: stoji sam

Ne zna da korpa postoji. Nema `dependsOn`. Obrisi `cart` i `catalog` i dalje radi.

| prelaz | gde | sta radi |
|---|---|---|
| `grants` | `plugin.ts:37` | jedini izvor dozvola u aplikaciji, iz `viewer` servisa |
| `frame` | `sections/DepotFrame` | ljuska u kojoj se sve stranice iscrtavaju |
| `pages` | `sections/NoEntry`, `sections/NoPage` | 403 i 404 |
| slot | `plugin.ts:65` `catalog.part.aside` | otvara mesto pored jednog dela, salje `{ id, name, cents }` |
| dogadjaj | `plugin.ts:72` `catalog.part.withdrawn` | emituje `services/parts.ts:73`, posle upisa |
| kuka | `plugin.ts:79` `catalog.part.before-withdraw` | pokrece `services/parts.ts:61`, pre upisa |
| `Route.search` | `plugin.ts:55` | `/catalog` deklarise `kind` kroz `PartQuery.schema`; hook `useChosenKind` cita i pise |

Javni API: `Catalog.priceOf` i `Catalog.partOf` u `index.ts`. Komponenta koja
prelazi granicu: `PartRow`. Tipovi koji prelaze: `Beside` (nosivost slota) i
`Withdrawal` (nosivost dogadjaja), pa druga strana ne mora da kastuje u prazno.

### cart: zavisi od kataloga

`dependsOn: ["catalog"]`. Cenu nikad ne izmislja.

| prelaz | gde | sta radi |
|---|---|---|
| javni API | `services/picking.ts:75` | `Catalog.priceOf(ctx, partId)`, jedini nacin da linija dobije cenu |
| doprinos | `plugin.ts:56` | puni `catalog.part.aside` sekcijom `AddToList` |
| slusalac | `plugin.ts:65` | cuje `catalog.part.withdrawn`, precrta liniju u servisu |
| ucesnik | `plugin.ts:77` | odbija `catalog.part.before-withdraw` za deo koji je na listi |
| komanda | `plugin.ts:92` `cart.hand-over` | predaje listu boksu i prazni je, iza `cart.use` |
| `fallback` | `sections/CartTrouble` | ono sto se vidi kad doprinos pukne unutar tudjeg slota |
| `Route.instead` | `plugin.ts:47` | prazna korpa na `/cart/handover` ide na `/cart`, pre iscrtavanja |
| `useHearing` | `sections/AddToList` | ista poruka, ali samo dok je citalac na tom delu |
| `useKept` | `sections/AddToList`, `pages/PickedList`, `pages/Handover` | cita ono sto servis drzi, i pomera se sa njim |

`listens` i `useHearing` slusaju isti dogadjaj namerno: prvi je za plagin i radi
uvek, drugi je za pogled i odlazi sa komponentom. To je razlika koju referenca
opisuje a nista je nije pokazivalo.

Komponenta koju cart pozajmljuje: `PartRow` iz kataloga, u
`sections/AsTheDepotHasIt`. Deo izgleda isto gde god se pokaze, a cart ne uci
sta je deo iznutra.

### Lazni izvor

`src/kernel/source.ts`. Nije ga bilo. Odgovara preko `fetch`, tako da plagini
idu istim putem kojim bi isli sa serverom: presrece samo putanje ispod
`VITE_API_URL`, sve ostalo prosledjuje dalje. `mount` ga postavlja pre nego sto
transport krene.

## 2. Gde sam morao da otvorim kit

Sest puta. Odgovora nije bilo u dokumentima.

1. **`Route.instead` potpis.** `reference.md` kaze da postoji i sta radi, ali ne
   kaze kakav `ctx` dobija. Otvorio `internal/contract.ts` i
   `react/index.tsx:RouteGuard`, gde stoji `route.instead?.(kernel.context(route.plugin))`.
   Bez toga sam prvo napisao `ctx.use("cart")`, sto je plagin koji preko `use`
   posezhe za samim sobom, i testovi su to odmah oborili.

2. **`useHearing(plugin, ...)`: koji plagin?** Potpis kaze `plugin`, ali ne kaze
   da li je to onaj koji slusa ili onaj koji emituje. Otvorio
   `tests/hearing.react.test.tsx`: `useHearing("badge", "mail.arrived", ...)`,
   dakle onaj koji slusa. Iz same reference bih pogodio pogresno.

3. **Sta `wiring` smatra procitanim poljem.** Test je pao na `loading`, koje se
   cita pet puta u istom fajlu. Otvorio `testing/wiring.ts`. Detalji u tacki 3.

4. **Da li `Slot` filtrira po `requires`.** `contract.md` kaze da doprinos ima
   `requires`, ne kaze ko ga proverava. `react/index.tsx:Slot` filtrira pre
   iscrtavanja. Napisao sam test za to.

5. **Da li `emits` iz `setup` prolazi.** `boundaries.md` zabranjuje emitovanje
   kroz tudji `ctx`, ali ne kaze sta je sa sopstvenim u `setup`. Otvorio
   `internal/kernel.ts`, potvrdio, i nisam ni pokusao.

6. **Redosled `services` i `grants`.** `stack.md` kaze da `services` ide pre
   svega sto cita `ctx.services`. Nije jasno da li `grants` spada tu. Otvorio
   `contract.ts`: `grants` prima `Context<Config, Given<Services>>`, znaci da.
   Postavio `services` iznad `grants` u oba plagina.

## 3. Sta mi je falilo

**`wiring` ne prepoznaje destrukturiranje sa podrazumevanom vrednoscu.**
Najkonkretniji nalaz. `PartTableProps.loading` je bilo `loading?: boolean`,
citano pet puta u istom fajlu (`aria-busy={loading || undefined}`,
`{loading && ...}`, `{!loading && ...}`), destrukturirano kao `loading = false`.
`wiring` ga je prijavio kao nepracitano. Pet obrazaca u `reads()` traze
`.loading`, `loading,`, `loading}`, `loading:` ili `"loading"`; nijedan ne hvata
`loading = false,` ni `loading || undefined`. Zaobisao sam tako sto sam polje
napravio obaveznim, cime destrukturiranje postaje `loading,` i obrazac se
poklopi. To je prilagodjavanje alatu, ne popravka koda.

**`Route.instead` gubi tipove plagina.** U `contract.ts` je
`instead?: (ctx: Context) => string | undefined`, sa nevezanim genericima, dok
`grants`, `listens`, `participates` i `commands` svi dobijaju
`Context<z.infer<Schema>, Given<Services>>`. Rezultat je da jedina funkcija koja
odlucuje gde citalac ide mora da kastuje sopstvene servise:
`ctx.services as { picking: PickingService }`. To je jedini kast u oba
`plugin.ts`.

**`Registered` nema `search`.** `RouteGuard` cita `route.instead` i
`route.requires`, a `routes.tsx` cita `route.search`, ali `reference.md` kaze
samo "a route plus the plugin that declared it and its `fallback`". Sta tacno
prezivi registraciju saznao sam iz koda.

**Nema `defineListener` / `defineParticipant` / `defineCommand`.** Backend ih
ima, i tamo `handle` dobija tipovan `Inside`. Ovde je `payload: unknown` i svaki
rukovalac parsira sam. Razlog je dokumentovan u `contract.ts` (kontravarijantnost)
i dobar je, ali posledica je da su tri sheme u `cart/types/` koje postoje samo
da se isti parse ne pise dvaput.

**`ctx.config` u fabrici servisa.** `createPickingService(ctx)` prima
`Context<CartConfig>`, sto tera plagin da tip konfiguracije navede dvaput: jednom
u `config: CartConfig.schema`, jednom u potpisu fabrike. Nista strasno, ali
`services: (ctx) => ...` bi mogao da prosledi vec suzen tip.

**Dva ista `Money` utila.** `catalog/utils/Money.ts` i `cart/utils/Money.ts` su
znak za znak isti. Pravila to nalazu (plagin ne poseze u tudji `utils/`), i
`@ui` ne sme da zna sta je valuta. Tacno po pravilima, i i dalje duplikat.

## 4. Gde nisam siguran da sam dobro odbranio

Iskreno, redom od najozbiljnije sumnje.

**a) `instead` cita servis koji je mozda prazan.** `Route.instead` se poziva pri
svakom iscrtavanju rute. Testirao sam ga direktno, sa kontekstom koji sam
sastavio, i preko `starting.test.tsx` koji ruta gradi. Ali nikad kroz pravi
`RouteGuard` sa pravim ruterom. Ako `kernel.context("cart").services` ikad bude
`undefined` u nekom trenutku zivota aplikacije, moj kast puca sa
"cannot read read of undefined", a nemam test koji bi to uhvatio. Ovo je moja
najveca sumnja.

**b) `useKept` i `read()` koji vraca isti objekat.** Napisao sam test da
`picking.read()` vraca istu referencu dok se nista ne pomeri, jer referenca kaze
da novi objekat pri svakom pozivu vrti render zauvek. Test prolazi. Ali ne znam
da li sam pokrio slucaj kad se dva `settle` pozovu u istom tiku: `useSyncExternalStore`
tada cita snapshot izmedju, i nisam siguran da li bi React to prijavio kao
nestabilan snapshot. Nisam uspeo da napisem test koji bi to izazvao.

**c) Da li je striktnost `Bay` odbrane na pravom mestu.** Bay se proverava tri
puta: `useHandingOver.ready` dok se kuca, `Bay.parse` u `Cart.handOver`, i
`Handing.schema` u komandi. Prvo je za citaoca, trece je granica. Srednje je
mozda visak koji samo pomera gde ce se greska pojaviti. Ostavio sam ga jer
`handOver` je javni API i drugi plagin bi mogao da ga pozove sa bilo cime, ali
nisam siguran da je to odbrana a ne ponavljanje.

**d) Ucesnik odbija po lokalnom stanju.** `cart` odbija povlacenje dela koji je
na listi, ali lista zivi samo u pregledacu. Dva citaoca, dve liste, i ono sto
jedan drzi drugog nista ne sprecava. Na backendu bi ovo bio red u tabeli. Ovde
je mehanika tacna a odbrana je tacna samo za jednu sesiju. Napisao sam to ovde
umesto da se pravim da nije tako.

**e) `source.install` menja globalni `fetch` i nikad ga ne vraca.** `mount` ga
zove i baca povratnu funkciju. U testu `starting.test.tsx` se `mount` zove vise
puta, pa se lazni `fetch` obmotava oko samog sebe. Radi, jer svaki sloj prosledjuje
dalje ono sto nije njegovo, ali je to gomilanje koje nisam ocistio. `source.reset`
vraca stanje polica, ne `fetch`.

**f) Praznu listu na `/cart/handover` branim, ali ne i listu koja je u medjuvremenu
postala prazna.** `instead` se proverava pri iscrtavanju. Ako citalac otvori
predaju sa jednom linijom i ta linija bude precrtana dok gleda, `items` padne na
nulu a stranica ostaje. Dugme se onemoguci i komanda bi odbila, tako da nista
lose ne moze da se desi, ali citalac stoji na stranici na kojoj po pravilu ne bi
trebalo da bude. Nisam nasao mesto da to popravim bez efekta u stranici, a efekat
koji preusmerava mi je licio na tacno ono sto `instead` postoji da zameni.

**g) Testovi koje sam namerno kvario.** Kvario sam sedam: cuvara ucesnika,
`instead`, prelaz cene, `useHearing`, `useKept`, odbijanje kuke, i jedan token u
CSS-u. Svaki je pocrveneo imenujuci pravi uzrok i vracen je. Nisam kvario
`grants`, `frame`, `pages` ni `fallback`: njih pokriva samo to sto se aplikacija
digne, i ako bi neki od njih tiho prestao da radi, mislim da bi mi promaklo.
