# 🌙 Dormilega — App personal del son del nadó

App de son per a nadons d'ús personal: registre de migdiades i nits, predicció adaptativa de la propera migdiada segons finestres de vigília, registre de preses (biberó o pit) i estadístiques. És una PWA: s'instal·la com a app a l'iPhone i a l'Android, funciona sense connexió i se sincronitza entre dispositius via Supabase. **Cost total: 0 €.**

## Posada en marxa (un sol cop, ~15 min)

### 1. Backend gratuït (Supabase)

1. Crea un compte gratuït a https://supabase.com i un projecte nou (regió `eu-west` va bé).
2. Al projecte, ves a **SQL Editor**, enganxa el contingut complet de `schema.sql` i prem **Run**.
3. Ves a **Authentication → Sign In / Providers → Email** i **desactiva "Confirm email"** (així podràs crear el teu compte sense verificació de correu).
4. Copia la **Project URL** i la clau pública. La manera més ràpida: botó **Connect** a la barra superior del projecte, que mostra totes dues coses. Alternativa: **Project Settings** (engranatge) → **API Keys**:
   - Pestanya **API Keys** → **Publishable key** (`sb_publishable_...`); si no n'hi ha, prem **Create new API Keys**.
   - En projectes antics: pestanya **Legacy API Keys** → clau **anon** (comença per `eyJ...`).
   - La **Project URL** (`https://xxxx.supabase.co`) també és a **Project Settings → Data API**.

   L'app accepta qualsevol de les dues claus (publishable o anon). No facis servir mai la *secret* / *service_role*.

> Si ja tenies el projecte de la versió anterior, només cal que tornis a executar `schema.sql` per afegir la taula de preses.

### 2. Publicar l'app (gratis)

Opció recomanada — **GitHub Pages**:

1. Crea un compte gratuït a https://github.com i un repositori nou **públic** (l'app no conté ni les teves claus ni les teves dades).
2. Puja tots els fitxers d'aquesta carpeta (`index.html`, `manifest.webmanifest`, `sw.js`, `schema.sql`, carpeta `icons/`).
3. Al repositori: **Settings → Pages → Source: Deploy from a branch → main → / (root)** → Save.
4. En un minut tindràs la teva URL: `https://EL_TEU_USUARI.github.io/EL_TEU_REPO/`

Alternatives igual de vàlides: Cloudflare Pages o Netlify (arrossegar i deixar anar la carpeta).

### 3. Instal·lar als mòbils

Obre la teva URL al mòbil i:

- **iPhone (Safari):** botó Compartir → **Afegir a la pantalla d'inici**.
- **Android (Chrome):** menú ⋮ → **Instal·lar aplicació** (o "Afegir a la pantalla d'inici").

El primer cop, l'app demanarà la **URL** i l'**anon key** de Supabase (pas 1.4). Després crea el teu compte (email + contrasenya) i inicia sessió amb **el mateix compte a tots els dispositius**: les dades se sincronitzen soles, en temps real.

## Què fa

- **Avui:** botó gran per començar/acabar el son (detecta migdiada vs. nit per l'hora), botó de registrar presa, cronòmetre de temps despert/dormint, predicció de la propera migdiada i de l'hora d'anar al llit.
- **Predicció adaptativa:** parteix de finestres de vigília estàndard per edat (calculades amb la data de naixement) i les combina amb les finestres reals observades els darrers 7 dies (mediana), acotades a ±30 % del valor estàndard. Com més registres, més s'ajusta al teu nadó.
- **Preses:** hora d'inici i de fi (opcional). Amb biberó de fórmula s'indica l'**aigua** i, si cal, els ml que queden: l'app calcula el volum final (aigua × 1,11, pel desplaçament de la pols: 90 → 100 ml) i els ml presos. A Ajustos es tria **pit, biberó o mixta** i la pantalla s'adapta (amb pit no es demanen ml).
- **Perfil:** sexe (nen/nena — de moment només canvia l'avatar; els llindars de son no distingeixen per sexe) i tipus d'alimentació.
- **On dorm:** cada registre de son pot indicar el lloc (bressol, cotxet, braços, llit dels pares); es recorda l'últim lloc usat. Les recomanacions fan servir aquesta dada per guiar el progrés cap a l'objectiu: dormir tota la nit al bressol.
- **Botó ＋ central:** a la barra de navegació, obre el menú per afegir qualsevol registre: 😴 Son, 🍼 Presa, 🚼 Bolquer, ⚖️ Pes i alçada.
- **Creixement:** registre de pes i alçada amb data; a Estadístiques, corba de pes sobre la banda P3–P97 dels estàndards OMS (aproximada, per sexe) i ingesta objectiu (~150 ml/kg/dia) comparada amb els ml reals.
- **Bolquers:** botó 🚼 per registrar canvis de bolquer amb hora i 💧 pipí i/o 💩 caca; apareixen cronològicament a Avui i a l'Historial. Els bolquers molls són l'indicador estàndard que la ingesta és suficient (≥6/dia a partir de la primera setmana).
- **Historial:** llista per dies amb son i preses barrejats cronològicament; afegir/editar/eliminar tocant qualsevol registre.
- **Estadístiques (14 dies):** hores de son per dia (nit vs. migdiades), hora de despertar i d'anar al llit (derivades automàticament dels trams de nit, sense marcar res a mà), finestra de vigília, despertars nocturns, repartiment dia/nit, ml consumits per dia i KPIs de mitjanes.
- **Recomanacions:** índex 0–100, resum de 3 indicadors i consells personalitzats en dues seccions (😴 Son i 🍼 Alimentació): son total vs. rang per edat (NSF/AAP), finestres de vigília, consistència de l'hora de llit i del despertar (àncores circadiàries), confusió dia-nit, migdiades curtes, despertars i preses nocturnes, lloc on dorm (progrés cap al bressol), volums i tendències d'alimentació. No és consell mèdic.
- **Offline:** sense connexió tot es desa localment i se sincronitza quan torna.
- **Avisos:** notificació 15 min abans de la migdiada prevista (activa-la a Ajustos; a l'iPhone cal tenir l'app instal·lada a la pantalla d'inici, iOS 16.4+).

## Seguretat i privadesa

Com està protegida l'app per defecte:

- **Row Level Security (RLS)** a totes les taules: cada registre exigeix `auth.uid() = user_id`, així que ningú sense el teu compte pot llegir ni escriure les teves dades, encara que tingui la URL i la clau anon.
- La **clau anon és pública per disseny** (només identifica el projecte; la seguretat la fa l'RLS). No està al codi ni al repositori: s'introdueix a cada dispositiu i es guarda en local.
- Tot el trànsit va per HTTPS i Supabase xifra les dades en repòs.

Passos recomanats per tancar-ho tot (5 min):

1. **Tanca el registre de comptes.** Un cop creats els teus comptes (el teu i el de l'altra persona cuidadora, si cal), ves a Supabase → **Authentication → Settings** i desactiva **"Allow new users to sign up"**. Així ningú més podrà crear comptes al teu projecte encara que trobi la URL de l'app.
2. **Evita el repo públic (opcional).** GitHub Pages gratuït requereix repo públic (només s'hi veu el codi, mai dades ni claus). Si no vols res públic, desplega amb **Cloudflare Pages**: gratuït, accepta repo privat o pujar la carpeta directament, i el codi no queda visible enlloc.
3. **Protegeix el mòbil.** Per al mode offline, l'app desa una còpia local de les dades al dispositiu; la protecció és el bloqueig de pantalla del mòbil, com amb qualsevol app.

La URL de l'app la pot obrir qualsevol, però sense el teu login només veurà la pantalla d'inici de sessió.

## Límits del pla gratuït (de sobres per a ús personal)

- Supabase free: 500 MB de base de dades; es **pausa després d'~1 setmana sense ús** (amb ús diari no passa; si es pausa, es reactiva amb un clic al panell).
- GitHub Pages / Cloudflare Pages: allotjament estàtic il·limitat a efectes pràctics.

## Fitxers

| Fitxer | Què és |
|---|---|
| `index.html` | L'app completa (HTML + CSS + JS) |
| `manifest.webmanifest` | Fa que sigui instal·lable com a app |
| `sw.js` | Service worker: funcionament offline |
| `icons/` | Icones de l'app |
| `schema.sql` | Taules i seguretat per a Supabase |
