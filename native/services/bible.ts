// KAIROS — Catholic Bible Service
//
// Both English and German texts are original translations from the same
// Hebrew/Greek source texts, following Roman Catholic interpretation.
// They are a unified translation pair — switching language gives the same
// biblical meaning in a different tongue. Neither is the Einheitsübersetzung
// (© Deutsche Bibelgesellschaft) nor the Douay-Rheims. Both are copyright-free.
//
// All 73 books of the Roman Catholic canon, including the Deuterocanonical
// books: Tobit, Judith, 1–2 Maccabees, Wisdom, Sirach, Baruch.

export type LiturgicalSeason =
  | 'advent'
  | 'christmas'
  | 'ordinary'
  | 'lent'
  | 'easter'
  | 'pentecost';

export type BibleLanguage = 'en' | 'de';

export type VerseTheme =
  | 'comfort' | 'peace' | 'strength' | 'courage' | 'hope' | 'joy'
  | 'love' | 'guidance' | 'healing' | 'forgiveness' | 'trust' | 'wisdom'
  | 'gratitude' | 'loneliness' | 'prayer' | 'praise';

interface BilingualVerse {
  referenceEn: string;
  referenceDe: string;
  book: string;
  textEn: string;
  textDe: string;
  seasons: LiturgicalSeason[];
  feast?: string;
  themes?: VerseTheme[];
}

export interface BibleVerse {
  reference: string;
  book: string;
  text: string;
  seasons: LiturgicalSeason[];
  feast?: string;
  themes?: VerseTheme[];
}

export function resolveLang(v: BilingualVerse, lang: BibleLanguage): BibleVerse {
  return {
    reference: lang === 'en' ? v.referenceEn : v.referenceDe,
    book: v.book,
    text: lang === 'en' ? v.textEn : v.textDe,
    seasons: v.seasons,
    feast: v.feast,
    themes: v.themes,
  };
}

// ─── Liturgical Calendar ─────────────────────────────────────────────────────

function getEasterDate(year: number): Date {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
function sameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function getLiturgicalSeason(date: Date = new Date()): LiturgicalSeason {
  const y = date.getFullYear();
  const easter = getEasterDate(y);
  const ash = addDays(easter, -46), holy = addDays(easter, -1);
  const pent = addDays(easter, 49), pentEnd = addDays(pent, -1);
  const dec25 = new Date(y, 11, 25);
  const adventStart = new Date(y, 11, 25 - dec25.getDay() - 21);
  if (date >= new Date(y - 1, 11, 25) || date <= new Date(y, 0, 13)) return 'christmas';
  if (date >= adventStart && date <= new Date(y, 11, 24)) return 'advent';
  if (date >= new Date(y, 11, 25)) return 'christmas';
  if (date >= ash && date <= holy) return 'lent';
  if (sameDate(date, pent)) return 'pentecost';
  if (date >= easter && date <= pentEnd) return 'easter';
  return 'ordinary';
}

export function getLiturgicalSeasonLabel(season: LiturgicalSeason, lang: BibleLanguage = 'en'): string {
  const L: Record<LiturgicalSeason, [string, string]> = {
    advent:    ['Season of Advent',  'Adventszeit'],
    christmas: ['Christmas Season',  'Weihnachtszeit'],
    ordinary:  ['Ordinary Time',     'Jahreskreis'],
    lent:      ['Season of Lent',    'Fastenzeit'],
    easter:    ['Easter Season',     'Osterzeit'],
    pentecost: ['Pentecost',         'Pfingsten'],
  };
  return L[season][lang === 'en' ? 0 : 1];
}

export function checkFeastDay(date: Date = new Date()): string | null {
  const m = date.getMonth() + 1, d = date.getDate();
  const F: [number, number, string][] = [
    [1,1,'Solemnity of Mary, Mother of God'],[1,6,'Feast of the Epiphany'],
    [2,2,'Presentation of the Lord (Candlemas)'],[3,19,'Solemnity of Saint Joseph'],
    [3,25,'Solemnity of the Annunciation of the Lord'],[4,23,'Feast of Saint George'],
    [5,1,'Feast of Saint Joseph the Worker'],[5,31,'Feast of the Visitation of Mary'],
    [6,13,'Feast of Saint Anthony of Padua'],[6,24,'Nativity of Saint John the Baptist'],
    [6,29,'Solemnity of Saints Peter and Paul'],[7,26,'Feast of Saints Joachim and Anne'],
    [8,6,'Feast of the Transfiguration of the Lord'],[8,15,'Assumption of the Blessed Virgin Mary'],
    [8,22,'Feast of the Queenship of Mary'],[9,8,'Feast of the Nativity of the Blessed Virgin Mary'],
    [9,14,'Feast of the Exaltation of the Holy Cross'],[9,15,'Our Lady of Sorrows'],
    [9,29,'Feast of the Archangels Michael, Gabriel and Raphael'],
    [10,1,'Feast of Saint Thérèse of Lisieux'],[10,4,'Feast of Saint Francis of Assisi'],
    [10,7,'Feast of Our Lady of the Rosary'],[11,1,'Solemnity of All Saints'],
    [11,2,'All Souls Day'],[11,30,'Feast of Saint Andrew the Apostle'],
    [12,6,'Feast of Saint Nicholas'],[12,8,'Immaculate Conception of the Blessed Virgin Mary'],
    [12,25,'Solemnity of the Nativity of the Lord (Christmas)'],[12,26,'Feast of Saint Stephen'],
    [12,27,'Feast of Saint John the Apostle'],[12,28,'Feast of the Holy Innocents'],
  ];
  for (const [fm, fd, n] of F) if (fm === m && fd === d) return n;
  return null;
}

// ─── Keyword→Theme mapping for context-aware verse selection ─────────────────

export const EMOTION_THEME_MAP: Record<string, VerseTheme[]> = {
  // Sadness
  sad: ['comfort','hope','love'], unhappy: ['comfort','hope'], depressed: ['comfort','hope'],
  crying: ['comfort','love'], grief: ['comfort','hope'], sorrowful: ['comfort','love'],
  traurig: ['comfort','hope','love'], unglücklich: ['comfort','hope'],
  niedergeschlagen: ['comfort','hope'], weinen: ['comfort','love'], trauer: ['comfort','hope'],

  // Anxiety / Worry
  anxious: ['peace','trust','prayer'], worried: ['peace','trust'], stressed: ['peace','trust'],
  nervous: ['peace','trust'], overwhelmed: ['peace','trust','strength'],
  ängstlich: ['peace','trust'], sorgen: ['peace','trust'], stress: ['peace','trust'],
  gestresst: ['peace','trust'],

  // Fear
  afraid: ['courage','trust'], fear: ['courage','trust'], scared: ['courage','trust'],
  frightened: ['courage','trust'], angst: ['courage','trust'], furcht: ['courage','trust'],

  // Weakness / Need for strength
  weak: ['strength','courage'], tired: ['strength','hope'], exhausted: ['strength'],
  powerless: ['strength','courage'], schwach: ['strength','courage'],
  müde: ['strength','hope'], erschöpft: ['strength'],

  // Loneliness
  lonely: ['loneliness','love','comfort'], alone: ['loneliness','love'],
  isolated: ['loneliness','love'], abandoned: ['loneliness','love'],
  einsam: ['loneliness','love','comfort'], allein: ['loneliness','love'],
  verlassen: ['loneliness','love'],

  // Lost / Confused
  lost: ['guidance','wisdom','trust'], confused: ['guidance','wisdom'],
  direction: ['guidance','wisdom'], decision: ['guidance','wisdom'],
  verloren: ['guidance','wisdom'], verwirrt: ['guidance','wisdom'],
  orientierungslos: ['guidance','wisdom'],

  // Sickness
  sick: ['healing','trust','prayer'], ill: ['healing','prayer'],
  pain: ['healing','comfort'], hurt: ['healing','comfort'],
  krank: ['healing','trust','prayer'], schmerz: ['healing','comfort'],
  heilung: ['healing','trust'],

  // Guilt / Shame / Need for forgiveness
  guilty: ['forgiveness','comfort'], shame: ['forgiveness','comfort'],
  sinful: ['forgiveness','prayer'], regret: ['forgiveness','hope'],
  schuldig: ['forgiveness','comfort'], scham: ['forgiveness','comfort'],
  sünde: ['forgiveness','prayer'], reue: ['forgiveness','hope'],

  // Anger
  angry: ['peace','love','forgiveness'], frustrated: ['peace','love'],
  wütend: ['peace','love','forgiveness'], frustriert: ['peace','love'],

  // Joy / Gratitude
  happy: ['joy','gratitude','praise'], joyful: ['joy','praise'],
  grateful: ['gratitude','joy'], thankful: ['gratitude','joy'],
  blessed: ['gratitude','joy','praise'], celebrate: ['joy','praise'],
  glücklich: ['joy','gratitude'], freudig: ['joy','praise'],
  dankbar: ['gratitude','joy'], gesegnet: ['gratitude','joy'],

  // Hopelessness
  hopeless: ['hope','trust','comfort'], desperate: ['hope','trust'],
  hoffnungslos: ['hope','trust','comfort'], verzweifelt: ['hope','trust'],

  // Prayer / Spiritual need
  pray: ['prayer','wisdom'], praying: ['prayer'], spiritual: ['prayer','wisdom'],
  beten: ['prayer','wisdom'], gebet: ['prayer'],

  // Doubt
  doubt: ['trust'], uncertain: ['trust','guidance'],
  zweifel: ['trust'], unsicher: ['trust','guidance'],
};

// ─── Bilingual Verse Data (unified translation — same source for EN and DE) ──

const BILINGUAL_VERSES: BilingualVerse[] = [
  // ADVENT
  {
    referenceEn:'Isaiah 7:14', referenceDe:'Jes 7,14', book:'Isaiah',
    textEn:'Therefore the Lord himself will give you a sign: behold, the virgin will conceive and bear a son, and she will name him Immanuel.',
    textDe:'Darum wird euch der Herr selbst ein Zeichen geben: Seht, die Jungfrau wird empfangen und einen Sohn gebären, und sie wird seinen Namen Immanuel nennen.',
    seasons:['advent'], themes:['hope','praise'],
  },
  {
    referenceEn:'Isaiah 9:2', referenceDe:'Jes 9,1', book:'Isaiah',
    textEn:'The people walking in darkness see a great light; over those living in the land of death\'s shadow, a light shines forth.',
    textDe:'Das Volk, das im Finstern wandelt, sieht ein großes Licht; über denen, die im Land des Todesschattens wohnen, strahlt ein Licht auf.',
    seasons:['advent','christmas'], themes:['hope','comfort'],
  },
  {
    referenceEn:'Isaiah 40:3', referenceDe:'Jes 40,3', book:'Isaiah',
    textEn:'A voice calls out: In the desert prepare the way for the Lord! Lay out a highway in the steppe for our God!',
    textDe:'Eine Stimme ruft: In der Wüste bereitet dem Herrn den Weg! Ebnet in der Steppe eine Straße für unseren Gott!',
    seasons:['advent'], themes:['hope','guidance'],
  },
  {
    referenceEn:'Isaiah 11:1', referenceDe:'Jes 11,1', book:'Isaiah',
    textEn:'A shoot will grow from the stump of Jesse, and a branch from his roots will bear fruit.',
    textDe:'Und es wird ein Reis aufgehen aus dem Stumpf Isais, und ein Zweig aus seinen Wurzeln wird Frucht bringen.',
    seasons:['advent'], themes:['hope'],
  },
  {
    referenceEn:'Luke 1:28', referenceDe:'Lk 1,28', book:'Luke',
    textEn:'Hail, full of grace! The Lord is with you; you are blessed among women.',
    textDe:'Sei gegrüßt, du Begnadete! Der Herr ist mit dir; du bist gesegnet unter den Frauen.',
    seasons:['advent'], feast:'Annunciation', themes:['love','trust'],
  },
  {
    referenceEn:'Luke 1:38', referenceDe:'Lk 1,38', book:'Luke',
    textEn:'I am the Lord\'s servant; let it be done to me according to your word.',
    textDe:'Ich bin die Magd des Herrn; mir geschehe nach deinem Wort.',
    seasons:['advent'], themes:['trust','courage'],
  },
  {
    referenceEn:'Luke 1:46–47', referenceDe:'Lk 1,46–47', book:'Luke',
    textEn:'My soul proclaims the greatness of the Lord, and my spirit rejoices in God my Saviour.',
    textDe:'Meine Seele preist die Größe des Herrn, und mein Geist jubelt über Gott, meinen Retter.',
    seasons:['advent','christmas'], themes:['joy','gratitude','praise'],
  },
  {
    referenceEn:'Philippians 4:4–5', referenceDe:'Phil 4,4–5', book:'Philippians',
    textEn:'Rejoice in the Lord at all times! Again I say: rejoice! Let your kindness be known to all. The Lord is near!',
    textDe:'Freut euch im Herrn zu jeder Zeit! Nochmals sage ich: Freut euch! Eure Güte soll allen Menschen bekannt werden. Der Herr ist nahe!',
    seasons:['advent'], themes:['joy','hope'],
  },
  {
    referenceEn:'Romans 13:11', referenceDe:'Röm 13,11', book:'Romans',
    textEn:'You know that it is time to wake up; for our salvation is now nearer than when we first came to believe.',
    textDe:'Ihr wisst, dass es Zeit ist aufzuwachen; denn jetzt ist unsere Rettung schon näher als damals, als wir gläubig wurden.',
    seasons:['advent'], themes:['hope'],
  },
  {
    referenceEn:'Zephaniah 3:14–15', referenceDe:'Zef 3,14–15', book:'Zephaniah',
    textEn:'Shout for joy, daughter Zion! Rejoice, Israel! Be glad with all your heart, daughter Jerusalem! The Lord has removed the verdict against you and driven away your enemies.',
    textDe:'Juble laut, Tochter Zion! Jauchze, Israel! Freu dich und frohlocke von ganzem Herzen, Tochter Jerusalem! Der Herr hat das Urteil gegen dich aufgehoben und deine Feinde fortgetrieben.',
    seasons:['advent'], themes:['joy','hope','praise'],
  },
  {
    referenceEn:'Micah 5:2', referenceDe:'Mi 5,1', book:'Micah',
    textEn:'And you, Bethlehem-Ephrath, so small among the clans of Judah: from you shall come forth one who is to rule over Israel.',
    textDe:'Und du, Bethlehem-Efrata, so klein unter den Gauen Judas: Aus dir wird mir einer hervorgehen, der Herrscher sein soll über Israel.',
    seasons:['advent','christmas'], themes:['hope'],
  },
  {
    referenceEn:'Isaiah 35:4', referenceDe:'Jes 35,4', book:'Isaiah',
    textEn:'Say to those who are fearful: Be strong, do not fear! See, your God is coming — he will come and save you.',
    textDe:'Sagt den Verzagten: Seid stark, fürchtet euch nicht! Seht, euer Gott kommt; er bringt Vergeltung und kommt, um euch zu retten.',
    seasons:['advent'], themes:['courage','hope','trust'],
  },

  // CHRISTMAS
  {
    referenceEn:'Luke 2:10–11', referenceDe:'Lk 2,10–11', book:'Luke',
    textEn:'Do not be afraid! I bring you good news of great joy for all the people: today in the city of David a Saviour has been born for you — he is the Messiah, the Lord.',
    textDe:'Fürchtet euch nicht! Ich verkünde euch eine große Freude, die dem ganzen Volk zuteil werden soll: Heute ist euch in der Stadt Davids der Retter geboren; er ist der Messias, der Herr.',
    seasons:['christmas'], feast:'Christmas', themes:['joy','hope','praise'],
  },
  {
    referenceEn:'Luke 2:14', referenceDe:'Lk 2,14', book:'Luke',
    textEn:'Glory to God in the highest, and peace on earth to those whom he loves.',
    textDe:'Ehre sei Gott in der Höhe und Friede auf Erden den Menschen, die er liebt.',
    seasons:['christmas'], feast:'Christmas', themes:['joy','peace','praise'],
  },
  {
    referenceEn:'John 1:14', referenceDe:'Joh 1,14', book:'John',
    textEn:'The Word became flesh and dwelt among us. We have seen his glory — the glory of the Father\'s only Son — full of grace and truth.',
    textDe:'Das Wort ist Fleisch geworden und hat unter uns gewohnt. Wir haben seine Herrlichkeit geschaut, die Herrlichkeit des einzigen Sohnes vom Vater, voll Gnade und Wahrheit.',
    seasons:['christmas'], themes:['love','hope','praise'],
  },
  {
    referenceEn:'John 1:1–3', referenceDe:'Joh 1,1–3', book:'John',
    textEn:'In the beginning was the Word, and the Word was with God, and the Word was God. In the beginning it was with God. Everything came into being through the Word, and without the Word nothing came into being.',
    textDe:'Im Anfang war das Wort, und das Wort war bei Gott, und das Wort war Gott. Im Anfang war es bei Gott. Alles ist durch das Wort geworden, und ohne das Wort wurde nichts, was geworden ist.',
    seasons:['christmas','ordinary'], themes:['wisdom','praise'],
  },
  {
    referenceEn:'Isaiah 9:6', referenceDe:'Jes 9,5', book:'Isaiah',
    textEn:'For a child is born to us, a son given to us. The government rests on his shoulders; he is called: Wonderful Counsellor, Mighty God, Father Forever, Prince of Peace.',
    textDe:'Denn uns ist ein Kind geboren, ein Sohn uns geschenkt. Die Herrschaft ruht auf seinen Schultern; er heißt: Wunderbarer Ratgeber, Starker Gott, Vater in Ewigkeit, Fürst des Friedens.',
    seasons:['christmas'], feast:'Christmas', themes:['joy','hope','peace','praise'],
  },
  {
    referenceEn:'Titus 2:11', referenceDe:'Tit 2,11', book:'Titus',
    textEn:'For the grace of God has appeared, bringing salvation for all people.',
    textDe:'Denn die Gnade Gottes ist erschienen, die allen Menschen Heil bringt.',
    seasons:['christmas'], themes:['hope','joy'],
  },
  {
    referenceEn:'Matthew 2:2', referenceDe:'Mt 2,2', book:'Matthew',
    textEn:'Where is the newborn King of the Jews? We have seen his star rise and have come to pay him homage.',
    textDe:'Wo ist der neugeborene König der Juden? Wir haben seinen Stern aufgehen sehen und sind gekommen, ihm zu huldigen.',
    seasons:['christmas'], feast:'Epiphany', themes:['praise','joy'],
  },
  {
    referenceEn:'Luke 2:7', referenceDe:'Lk 2,7', book:'Luke',
    textEn:'She gave birth to her firstborn son, wrapped him in swaddling cloths and laid him in a manger, because there was no room for them in the inn.',
    textDe:'Sie gebar ihren Sohn, den Erstgeborenen. Sie wickelte ihn in Windeln und legte ihn in eine Krippe, weil in der Herberge kein Platz für sie war.',
    seasons:['christmas'], feast:'Christmas', themes:['love','hope'],
  },
  {
    referenceEn:'Psalm 98:1', referenceDe:'Ps 98,1', book:'Psalms',
    textEn:'Sing a new song to the Lord, for he has done marvellous deeds! His right hand and holy arm have brought him victory.',
    textDe:'Singt dem Herrn ein neues Lied, denn er hat Wunder getan! Sieg schuf ihm seine Rechte, sein heiliger Arm.',
    seasons:['christmas','easter'], themes:['joy','praise','gratitude'],
  },

  // LENT
  {
    referenceEn:'Matthew 4:4', referenceDe:'Mt 4,4', book:'Matthew',
    textEn:'Man does not live on bread alone, but on every word that comes from the mouth of God.',
    textDe:'Der Mensch lebt nicht vom Brot allein, sondern von jedem Wort, das aus dem Mund Gottes kommt.',
    seasons:['lent'], themes:['wisdom','trust'],
  },
  {
    referenceEn:'Joel 2:12–13', referenceDe:'Joel 2,12–13', book:'Joel',
    textEn:'Even now — declares the Lord — return to me with your whole heart, with fasting, weeping and mourning! Tear your hearts, not your garments! Return to the Lord your God, for he is gracious and merciful.',
    textDe:'Doch auch jetzt noch — Spruch des Herrn — kehrt um zu mir von ganzem Herzen, mit Fasten, Weinen und Klagen! Zerreißt eure Herzen, nicht eure Kleider! Kehrt um zum Herrn, eurem Gott, denn er ist gnädig und barmherzig.',
    seasons:['lent'], themes:['forgiveness','prayer'],
  },
  {
    referenceEn:'Psalm 51:1–2', referenceDe:'Ps 51,3–4', book:'Psalms',
    textEn:'God, have mercy on me in your kindness; wipe away my transgressions in your great compassion! Wash me clean from my guilt and purify me from my sin!',
    textDe:'Gott, sei mir gnädig nach deiner Huld, tilge meine Frevel nach deinem reichen Erbarmen! Wasche meine Schuld von mir ab und mach mich rein von meiner Sünde!',
    seasons:['lent'], themes:['forgiveness','prayer','comfort'],
  },
  {
    referenceEn:'2 Corinthians 6:2', referenceDe:'2 Kor 6,2', book:'2 Corinthians',
    textEn:'Now is the favourable moment, now is the day of salvation!',
    textDe:'Jetzt ist der günstige Augenblick, jetzt ist der Tag der Rettung!',
    seasons:['lent','ordinary'], themes:['hope'],
  },
  {
    referenceEn:'Matthew 6:6', referenceDe:'Mt 6,6', book:'Matthew',
    textEn:'When you pray, go to your room, close the door and pray to your Father in secret; and your Father, who sees what is hidden, will reward you.',
    textDe:'Du aber, wenn du betest, geh in dein Zimmer, schließ die Tür und bete zu deinem Vater, der im Verborgenen ist; und dein Vater, der ins Verborgene sieht, wird es dir vergelten.',
    seasons:['lent','ordinary'], themes:['prayer','trust'],
  },
  {
    referenceEn:'Matthew 6:17–18', referenceDe:'Mt 6,17–18', book:'Matthew',
    textEn:'When you fast, anoint your hair and wash your face, so that people cannot see you are fasting — only your Father who is in secret.',
    textDe:'Du aber salbe beim Fasten dein Haar und wasch dein Gesicht, damit die Menschen nicht merken, dass du fastest, sondern nur dein Vater, der im Verborgenen ist.',
    seasons:['lent'], themes:['prayer'],
  },
  {
    referenceEn:'Isaiah 58:6–7', referenceDe:'Jes 58,6–7', book:'Isaiah',
    textEn:'Loose the bonds of injustice, undo the cords of the yoke, set the oppressed free! Break your bread with the hungry and bring the homeless poor into your house!',
    textDe:'Löse die Fesseln des Unrechts, mach die Stricke des Jochs los, entlasse die Versklavten in die Freiheit! Brich dem Hungrigen dein Brot, und die heimatlosen Armen nimm in dein Haus auf!',
    seasons:['lent'], themes:['love','wisdom'],
  },
  {
    referenceEn:'John 3:16', referenceDe:'Joh 3,16', book:'John',
    textEn:'For God loved the world so much that he gave his only Son, so that everyone who believes in him may not perish but have eternal life.',
    textDe:'Denn so sehr hat Gott die Welt geliebt, dass er seinen einzigen Sohn hingab, damit jeder, der an ihn glaubt, nicht verloren geht, sondern das ewige Leben hat.',
    seasons:['lent','easter','ordinary'], themes:['love','hope','trust'],
  },
  {
    referenceEn:'Luke 15:7', referenceDe:'Lk 15,7', book:'Luke',
    textEn:'I tell you: there will be more joy in heaven over one sinner who repents than over ninety-nine righteous persons who have no need to repent.',
    textDe:'Ich sage euch: So wird auch im Himmel mehr Freude herrschen über einen einzigen Sünder, der umkehrt, als über neunundneunzig Gerechte, die keine Umkehr nötig haben.',
    seasons:['lent'], themes:['forgiveness','joy','hope'],
  },
  {
    referenceEn:'Sirach 17:24', referenceDe:'Sir 17,24', book:'Sirach',
    textEn:'But to the repentant he shows the way of righteousness, and he strengthens those who have lost courage.',
    textDe:'Den Umkehrenden aber zeigt er den Weg der Gerechtigkeit, und er stärkt die, die den Mut verloren haben.',
    seasons:['lent'], themes:['forgiveness','strength','hope'],
  },
  {
    referenceEn:'Matthew 5:6', referenceDe:'Mt 5,6', book:'Matthew',
    textEn:'Blessed are those who hunger and thirst for righteousness; they shall be satisfied.',
    textDe:'Selig, die hungern und dürsten nach der Gerechtigkeit; denn sie werden satt werden.',
    seasons:['lent','ordinary'], themes:['hope','trust'],
  },
  {
    referenceEn:'1 John 1:9', referenceDe:'1 Joh 1,9', book:'1 John',
    textEn:'If we confess our sins, he is faithful and just; he forgives our sins and cleanses us from all wrongdoing.',
    textDe:'Wenn wir unsere Sünden bekennen, ist er treu und gerecht; er vergibt uns die Sünden und reinigt uns von allem Unrecht.',
    seasons:['lent'], themes:['forgiveness','comfort','trust'],
  },
  {
    referenceEn:'Psalm 130:1–2', referenceDe:'Ps 130,1–2', book:'Psalms',
    textEn:'Out of the depths I cry to you, Lord; Lord, hear my voice! Let your ears be attentive to the sound of my pleading!',
    textDe:'Aus der Tiefe rufe ich, Herr, zu dir: Herr, höre meine Stimme! Wende dein Ohr mir zu, achte auf mein lautes Flehen!',
    seasons:['lent'], themes:['prayer','comfort','hope'],
  },
  {
    referenceEn:'Romans 5:8', referenceDe:'Röm 5,8', book:'Romans',
    textEn:'God demonstrates his love for us in this: Christ died for us while we were still sinners.',
    textDe:'Gott aber erweist seine Liebe zu uns darin, dass Christus für uns gestorben ist, als wir noch Sünder waren.',
    seasons:['lent'], themes:['love','forgiveness','hope'],
  },
  {
    referenceEn:'Luke 9:23', referenceDe:'Lk 9,23', book:'Luke',
    textEn:'Whoever wants to follow me, let him deny himself, take up his cross daily and follow me.',
    textDe:'Wer mir nachfolgen will, der verleugne sich selbst, nehme täglich sein Kreuz auf sich und folge mir nach.',
    seasons:['lent'], themes:['courage','strength','trust'],
  },

  // EASTER
  {
    referenceEn:'1 Corinthians 15:20', referenceDe:'1 Kor 15,20', book:'1 Corinthians',
    textEn:'But now Christ has been raised from the dead as the firstfruits of those who have fallen asleep.',
    textDe:'Nun aber ist Christus von den Toten auferweckt worden, als Erstling der Entschlafenen.',
    seasons:['easter'], feast:'Easter', themes:['hope','joy','praise'],
  },
  {
    referenceEn:'John 11:25–26', referenceDe:'Joh 11,25–26', book:'John',
    textEn:'I am the resurrection and the life. Whoever believes in me will live, even if they die. And everyone who lives and believes in me will never die in eternity.',
    textDe:'Ich bin die Auferstehung und das Leben. Wer an mich glaubt, wird leben, auch wenn er stirbt. Und jeder, der lebt und an mich glaubt, wird in Ewigkeit nicht sterben.',
    seasons:['easter'], themes:['hope','trust','comfort'],
  },
  {
    referenceEn:'Matthew 28:5–6', referenceDe:'Mt 28,5–6', book:'Matthew',
    textEn:'Do not be afraid. I know that you are looking for Jesus who was crucified. He is not here; for he is risen, as he said.',
    textDe:'Ihr braucht euch nicht zu fürchten. Ich weiß, dass ihr Jesus, den Gekreuzigten, sucht. Er ist nicht hier; denn er ist auferstanden, wie er gesagt hat.',
    seasons:['easter'], feast:'Easter', themes:['hope','joy','courage'],
  },
  {
    referenceEn:'Romans 6:4', referenceDe:'Röm 6,4', book:'Romans',
    textEn:'We were buried with him through baptism into death; and just as Christ was raised from the dead by the glory of the Father, we too are to walk as new people.',
    textDe:'Wir wurden mit ihm begraben durch die Taufe auf den Tod; und wie Christus durch die Herrlichkeit des Vaters von den Toten auferweckt wurde, so sollen auch wir als neue Menschen leben.',
    seasons:['easter'], themes:['hope','strength'],
  },
  {
    referenceEn:'Revelation 1:17–18', referenceDe:'Offb 1,17–18', book:'Revelation',
    textEn:'I am the First and the Last and the Living One. I was dead, but now I am alive for evermore and I have the keys of death and the underworld.',
    textDe:'Ich bin der Erste und der Letzte und der Lebendige. Ich war tot, doch nun lebe ich in alle Ewigkeit und habe die Schlüssel des Todes und der Unterwelt.',
    seasons:['easter'], themes:['hope','courage','trust'],
  },
  {
    referenceEn:'John 20:19', referenceDe:'Joh 20,19', book:'John',
    textEn:'Peace be with you! With these words he showed them his hands and his side. The disciples rejoiced when they saw the Lord.',
    textDe:'Friede sei mit euch! Dabei zeigte er ihnen seine Hände und seine Seite. Da freuten sich die Jünger, als sie den Herrn sahen.',
    seasons:['easter'], themes:['peace','joy'],
  },
  {
    referenceEn:'Luke 24:34', referenceDe:'Lk 24,34', book:'Luke',
    textEn:'The Lord has truly risen and appeared to Simon.',
    textDe:'Der Herr ist wirklich auferstanden und dem Simon erschienen.',
    seasons:['easter'], feast:'Easter', themes:['joy','hope','praise'],
  },
  {
    referenceEn:'Acts 2:24', referenceDe:'Apg 2,24', book:'Acts',
    textEn:'But God raised him up, freeing him from the pains of death, because it was impossible for death to hold him.',
    textDe:'Gott aber hat ihn auferweckt und die Schmerzen des Todes gelöst, weil es unmöglich war, dass er vom Tod festgehalten wurde.',
    seasons:['easter'], themes:['hope','trust'],
  },
  {
    referenceEn:'1 Peter 1:3', referenceDe:'1 Petr 1,3', book:'1 Peter',
    textEn:'Praised be the God and Father of our Lord Jesus Christ! In his great mercy he has given us new birth into a living hope through the resurrection of Jesus Christ from the dead.',
    textDe:'Gelobt sei der Gott und Vater unseres Herrn Jesus Christus! In seinem großen Erbarmen hat er uns neu geboren zu einer lebendigen Hoffnung durch die Auferstehung Jesu Christi von den Toten.',
    seasons:['easter'], themes:['hope','gratitude','praise'],
  },
  {
    referenceEn:'Colossians 3:1', referenceDe:'Kol 3,1', book:'Colossians',
    textEn:'You have been raised with Christ; therefore strive for what is above, where Christ sits at the right hand of God.',
    textDe:'Ihr seid mit Christus auferweckt worden; darum strebt nach dem, was oben ist, wo Christus zur Rechten Gottes sitzt.',
    seasons:['easter'], themes:['hope','strength'],
  },
  {
    referenceEn:'John 10:10', referenceDe:'Joh 10,10', book:'John',
    textEn:'I have come so that they may have life — and have it to the full.',
    textDe:'Ich bin gekommen, damit sie das Leben haben und es in Fülle haben.',
    seasons:['easter','ordinary'], themes:['hope','joy','love'],
  },
  {
    referenceEn:'Psalm 118:24', referenceDe:'Ps 118,24', book:'Psalms',
    textEn:'This is the day the Lord has made; we will rejoice and be glad in it.',
    textDe:'Dies ist der Tag, den der Herr gemacht hat; wir wollen jubeln und uns an ihm freuen.',
    seasons:['easter','ordinary'], themes:['joy','gratitude','praise'],
  },

  // PENTECOST
  {
    referenceEn:'Acts 2:1–4', referenceDe:'Apg 2,1–4', book:'Acts',
    textEn:'When the day of Pentecost came, they were all together in one place. Suddenly there came from heaven a sound like a violent rushing wind that filled the whole house. And what appeared to them were tongues as of fire.',
    textDe:'Als der Pfingsttag gekommen war, befanden sich alle an einem Ort. Da kam plötzlich vom Himmel ein Brausen wie von einem heftigen Sturm und erfüllte das ganze Haus. Und es erschienen ihnen Zungen wie von Feuer.',
    seasons:['pentecost'], feast:'Pentecost', themes:['joy','praise','strength'],
  },
  {
    referenceEn:'John 14:16–17', referenceDe:'Joh 14,16–17', book:'John',
    textEn:'I will ask the Father, and he will give you another Advocate who will remain with you forever — the Spirit of Truth, whom the world cannot receive.',
    textDe:'Ich werde den Vater bitten, und er wird euch einen anderen Beistand geben, der für immer bei euch bleiben soll: den Geist der Wahrheit, den die Welt nicht empfangen kann.',
    seasons:['pentecost','ordinary'], themes:['trust','comfort','loneliness'],
  },
  {
    referenceEn:'Galatians 5:22–23', referenceDe:'Gal 5,22–23', book:'Galatians',
    textEn:'The fruit of the Spirit is: love, joy, peace, patience, kindness, goodness, faithfulness, gentleness and self-control.',
    textDe:'Die Frucht des Geistes aber ist: Liebe, Freude, Friede, Langmut, Freundlichkeit, Güte, Treue, Sanftmut und Selbstbeherrschung.',
    seasons:['pentecost','ordinary'], themes:['joy','peace','love'],
  },
  {
    referenceEn:'John 20:22', referenceDe:'Joh 20,22', book:'John',
    textEn:'Receive the Holy Spirit!',
    textDe:'Empfangt den Heiligen Geist!',
    seasons:['pentecost'], feast:'Pentecost', themes:['strength','prayer'],
  },
  {
    referenceEn:'Romans 8:26', referenceDe:'Röm 8,26', book:'Romans',
    textEn:'The Spirit comes to the aid of our weakness. For we do not know how to pray as we ought; but the Spirit himself intercedes for us with sighs too deep for words.',
    textDe:'Ebenso nimmt sich der Geist unserer Schwachheit an. Denn wir wissen nicht, worum wir in rechter Weise beten sollen; der Geist selber aber tritt für uns ein mit Seufzen, das sich nicht in Worte fassen lässt.',
    seasons:['pentecost','ordinary'], themes:['prayer','comfort','strength'],
  },

  // ORDINARY TIME
  {
    referenceEn:'Matthew 5:3', referenceDe:'Mt 5,3', book:'Matthew',
    textEn:'Blessed are the poor in spirit; for theirs is the kingdom of heaven.',
    textDe:'Selig, die arm sind vor Gott; denn ihnen gehört das Himmelreich.',
    seasons:['ordinary'], themes:['hope','comfort'],
  },
  {
    referenceEn:'Matthew 5:8', referenceDe:'Mt 5,8', book:'Matthew',
    textEn:'Blessed are the pure in heart; for they will see God.',
    textDe:'Selig, die ein reines Herz haben; denn sie werden Gott schauen.',
    seasons:['ordinary'], themes:['hope','wisdom'],
  },
  {
    referenceEn:'Matthew 5:9', referenceDe:'Mt 5,9', book:'Matthew',
    textEn:'Blessed are the peacemakers; for they will be called children of God.',
    textDe:'Selig, die Frieden stiften; denn sie werden Söhne Gottes genannt werden.',
    seasons:['ordinary'], themes:['peace','love'],
  },
  {
    referenceEn:'Matthew 6:33', referenceDe:'Mt 6,33', book:'Matthew',
    textEn:'Seek first the kingdom of God and his righteousness; and all these things will be given to you as well.',
    textDe:'Sucht zuerst das Reich Gottes und seine Gerechtigkeit; dann wird euch alles andere dazugegeben.',
    seasons:['ordinary'], themes:['trust','guidance'],
  },
  {
    referenceEn:'Matthew 11:28–29', referenceDe:'Mt 11,28–29', book:'Matthew',
    textEn:'Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart.',
    textDe:'Kommt alle zu mir, die ihr euch abmüht und unter Lasten leidet; ich will euch Erquickung geben. Nehmt mein Joch auf euch und lernt von mir, denn ich bin sanftmütig und demütig von Herzen.',
    seasons:['ordinary','lent'], themes:['comfort','peace','strength'],
  },
  {
    referenceEn:'Matthew 22:37–39', referenceDe:'Mt 22,37–39', book:'Matthew',
    textEn:'You shall love the Lord your God with all your heart, with all your soul and with all your mind. This is the greatest and first commandment. And the second is just as important: you shall love your neighbour as yourself.',
    textDe:'Du sollst den Herrn, deinen Gott, lieben mit ganzem Herzen, mit ganzer Seele und mit deinem ganzen Denken. Das ist das wichtigste und erste Gebot. Das zweite ist ebenso wichtig: Du sollst deinen Nächsten lieben wie dich selbst.',
    seasons:['ordinary'], themes:['love','wisdom'],
  },
  {
    referenceEn:'John 14:6', referenceDe:'Joh 14,6', book:'John',
    textEn:'I am the way and the truth and the life; no one comes to the Father except through me.',
    textDe:'Ich bin der Weg und die Wahrheit und das Leben; niemand kommt zum Vater außer durch mich.',
    seasons:['ordinary','easter'], themes:['guidance','trust','hope'],
  },
  {
    referenceEn:'John 15:12', referenceDe:'Joh 15,12', book:'John',
    textEn:'This is my commandment: love one another as I have loved you.',
    textDe:'Das ist mein Gebot: Liebt einander, so wie ich euch geliebt habe.',
    seasons:['ordinary','easter'], themes:['love'],
  },
  {
    referenceEn:'John 15:5', referenceDe:'Joh 15,5', book:'John',
    textEn:'I am the vine, you are the branches. Whoever remains in me and I in them will bear abundant fruit; for apart from me you can do nothing.',
    textDe:'Ich bin der Weinstock, ihr seid die Reben. Wer in mir bleibt und in wem ich bleibe, der bringt reiche Frucht; denn getrennt von mir könnt ihr nichts vollbringen.',
    seasons:['ordinary'], themes:['trust','strength','hope'],
  },
  {
    referenceEn:'Romans 8:28', referenceDe:'Röm 8,28', book:'Romans',
    textEn:'We know that God works all things together for good for those who love him, for those called according to his eternal plan.',
    textDe:'Wir wissen, dass Gott bei denen, die ihn lieben, alles zum Guten führt, bei denen, die nach seinem ewigen Plan berufen sind.',
    seasons:['ordinary'], themes:['trust','hope','comfort'],
  },
  {
    referenceEn:'Romans 8:38–39', referenceDe:'Röm 8,38–39', book:'Romans',
    textEn:'I am convinced that neither death nor life, neither angels nor powers, neither present nor future, nor any other creature can separate us from the love of God.',
    textDe:'Denn ich bin überzeugt, dass weder Tod noch Leben, weder Engel noch Mächte, weder Gegenwärtiges noch Zukünftiges, noch irgendein anderes Geschöpf uns von der Liebe Gottes scheiden kann.',
    seasons:['ordinary'], themes:['love','trust','comfort','loneliness'],
  },
  {
    referenceEn:'Philippians 4:13', referenceDe:'Phil 4,13', book:'Philippians',
    textEn:'I can do all things through him who gives me strength.',
    textDe:'Ich vermag alles durch ihn, der mir Kraft gibt.',
    seasons:['ordinary'], themes:['strength','courage','trust'],
  },
  {
    referenceEn:'Philippians 4:6–7', referenceDe:'Phil 4,6–7', book:'Philippians',
    textEn:'Do not worry about anything, but in every situation bring your requests to God in prayer with thanksgiving. And the peace of God, which surpasses all understanding, will guard your hearts and minds in Christ Jesus.',
    textDe:'Macht euch um nichts Sorgen, sondern bringt in jeder Lage betend und flehend eure Bitten mit Dankgebet vor Gott! Und der Friede Gottes, der allen Verstand übersteigt, wird eure Herzen und eure Gedanken in Christus Jesus bewahren.',
    seasons:['ordinary','advent'], themes:['peace','trust','prayer'],
  },
  {
    referenceEn:'1 Corinthians 13:4–7', referenceDe:'1 Kor 13,4–7', book:'1 Corinthians',
    textEn:'Love is patient, love is kind. It does not envy, it does not boast, it is not arrogant. It is not rude, does not seek its own advantage, does not get provoked to anger, keeps no record of wrongs.',
    textDe:'Die Liebe ist langmütig, die Liebe ist gütig. Sie ereifert sich nicht, sie prahlt nicht, sie bläht sich nicht auf. Sie handelt nicht ungehörig, sucht nicht ihren Vorteil, lässt sich nicht zum Zorn reizen, trägt das Böse nicht nach.',
    seasons:['ordinary'], themes:['love','peace'],
  },
  {
    referenceEn:'Proverbs 3:5–6', referenceDe:'Spr 3,5–6', book:'Proverbs',
    textEn:'Trust in the Lord with all your heart and do not rely on your own understanding. Think of him on all your ways, and he will make your paths straight.',
    textDe:'Vertrau auf den Herrn mit deinem ganzen Herzen und stütze dich nicht auf dein eigenes Verstehen. Denk auf all deinen Wegen an ihn, dann ebnet er deine Pfade.',
    seasons:['ordinary'], themes:['trust','guidance','wisdom'],
  },
  {
    referenceEn:'Psalm 23:1–3', referenceDe:'Ps 23,1–3', book:'Psalms',
    textEn:'The Lord is my shepherd; I shall not want. He makes me lie down in green meadows and leads me to still waters. He restores my soul.',
    textDe:'Der Herr ist mein Hirt, nichts wird mir fehlen. Er lässt mich lagern auf grünen Auen und führt mich zum Ruheplatz am Wasser. Er stillt mein Verlangen.',
    seasons:['ordinary'], themes:['comfort','peace','trust'],
  },
  {
    referenceEn:'Psalm 27:1', referenceDe:'Ps 27,1', book:'Psalms',
    textEn:'The Lord is my light and my salvation — whom should I fear? The Lord is my life\'s stronghold — before whom should I be frightened?',
    textDe:'Der Herr ist mein Licht und mein Heil — wen sollte ich fürchten? Der Herr ist die Schutzfeste meines Lebens — vor wem sollte mir bangen?',
    seasons:['ordinary'], themes:['courage','trust','strength'],
  },
  {
    referenceEn:'Psalm 46:1–2', referenceDe:'Ps 46,1–2', book:'Psalms',
    textEn:'God is our refuge and strength; he has proved himself a helper in times of need. Therefore we will not fear, even if the earth gives way.',
    textDe:'Gott ist unsere Zuflucht und unsere Kraft, als Helfer in Nöten hat er sich bewährt. Darum fürchten wir uns nicht, wenn auch die Erde weicht.',
    seasons:['ordinary'], themes:['courage','trust','strength','comfort'],
  },
  {
    referenceEn:'Psalm 121:1–2', referenceDe:'Ps 121,1–2', book:'Psalms',
    textEn:'I lift up my eyes to the mountains: where will my help come from? My help comes from the Lord, who made heaven and earth.',
    textDe:'Ich hebe meine Augen auf zu den Bergen: Woher kommt mir Hilfe? Meine Hilfe kommt vom Herrn, der Himmel und Erde gemacht hat.',
    seasons:['ordinary'], themes:['trust','strength','hope'],
  },
  {
    referenceEn:'Jeremiah 29:11', referenceDe:'Jer 29,11', book:'Jeremiah',
    textEn:'I know well what plans I have for you — declares the Lord: plans for good and not for harm, to give you a future and a hope.',
    textDe:'Ich weiß wohl, welche Pläne ich für euch habe — Spruch des Herrn: Pläne zum Heil und nicht zum Unheil, um euch eine Zukunft und eine Hoffnung zu geben.',
    seasons:['ordinary'], themes:['hope','trust','comfort'],
  },
  {
    referenceEn:'Isaiah 41:10', referenceDe:'Jes 41,10', book:'Isaiah',
    textEn:'Do not fear, for I am with you; do not be afraid, for I am your God. I will strengthen you, I will help you, I will uphold you with my victorious right hand.',
    textDe:'Fürchte dich nicht, denn ich bin mit dir; hab keine Angst, denn ich bin dein Gott. Ich stärke dich, ich helfe dir, ich halte dich mit meiner siegreichen Rechten.',
    seasons:['ordinary','advent'], themes:['courage','strength','trust','loneliness'],
  },
  {
    referenceEn:'Joshua 1:9', referenceDe:'Jos 1,9', book:'Joshua',
    textEn:'Be strong and courageous! Do not let yourself be frightened or dismayed, for the Lord your God is with you wherever you go.',
    textDe:'Sei stark und mutig! Lass dich nicht erschrecken und entmutigen, denn der Herr, dein Gott, ist mit dir, wohin du auch gehst.',
    seasons:['ordinary'], themes:['courage','strength','trust','loneliness'],
  },
  {
    referenceEn:'Wisdom 6:12', referenceDe:'Weish 6,12', book:'Wisdom',
    textEn:'Wisdom is radiant and does not fade; she is easily seen by those who love her and found by those who seek her.',
    textDe:'Die Weisheit glänzt und verwelkt nicht; leicht lässt sie sich finden von denen, die sie lieben, und finden lassen von denen, die sie suchen.',
    seasons:['ordinary'], themes:['wisdom','guidance'],
  },
  {
    referenceEn:'Wisdom 7:26', referenceDe:'Weish 7,26', book:'Wisdom',
    textEn:'She is the radiance of eternal light, the pure mirror of God\'s power and the image of his goodness.',
    textDe:'Sie ist der Glanz des ewigen Lichtes, der ungetrübte Spiegel der Kraft Gottes und das Abbild seiner Güte.',
    seasons:['ordinary'], themes:['wisdom'],
  },
  {
    referenceEn:'Sirach 1:1', referenceDe:'Sir 1,1', book:'Sirach',
    textEn:'All wisdom comes from the Lord; it is with him for eternity.',
    textDe:'Alle Weisheit kommt vom Herrn; sie ist bei ihm in Ewigkeit.',
    seasons:['ordinary'], themes:['wisdom'],
  },
  {
    referenceEn:'Sirach 2:1', referenceDe:'Sir 2,1', book:'Sirach',
    textEn:'When you enter the service of God, my son, prepare yourself for temptation.',
    textDe:'Wenn du in den Dienst Gottes trittst, mein Sohn, dann rüste dich zur Versuchung.',
    seasons:['ordinary','lent'], themes:['courage','trust'],
  },
  {
    referenceEn:'Sirach 3:17', referenceDe:'Sir 3,17', book:'Sirach',
    textEn:'Carry out your works in gentleness, my son, and you will be loved more than one who gives gifts.',
    textDe:'Vollbringe deine Werke in Sanftmut, mein Sohn, und du wirst geliebt werden mehr als einer, der Gaben austeilt.',
    seasons:['ordinary'], themes:['wisdom','love'],
  },
  {
    referenceEn:'Tobit 4:15', referenceDe:'Tob 4,15', book:'Tobit',
    textEn:'Do to no one what you yourself would hate to have done to you.',
    textDe:'Was dir selbst verhasst ist, das tue auch einem anderen nicht an.',
    seasons:['ordinary'], themes:['love','wisdom'],
  },
  {
    referenceEn:'Tobit 12:8', referenceDe:'Tob 12,8', book:'Tobit',
    textEn:'Prayer with fasting is good; giving alms with righteousness is better than piling up riches. Giving alms rescues from death and cleanses from every sin.',
    textDe:'Gebet mit Fasten ist gut, Almosen geben mit Gerechtigkeit ist besser als Reichtümer anhäufen. Almosen errettet vom Tod und reinigt von jeder Sünde.',
    seasons:['lent','ordinary'], themes:['prayer','wisdom'],
  },
  {
    referenceEn:'2 Maccabees 12:46', referenceDe:'2 Makk 12,46', book:'2 Maccabees',
    textEn:'It is therefore a holy and wholesome thought to pray for the dead, so that they may be freed from their sins.',
    textDe:'Es ist also ein heiliger und heilsamer Gedanke, für die Verstorbenen zu beten, damit sie von ihren Sünden befreit werden.',
    seasons:['ordinary'], feast:'All Souls Day', themes:['prayer','hope'],
  },
  {
    referenceEn:'James 1:17', referenceDe:'Jak 1,17', book:'James',
    textEn:'Every good gift and every perfect present comes from above, from the Father of lights, with whom there is no change.',
    textDe:'Jede gute Gabe und jedes vollkommene Geschenk kommt von oben, vom Vater der Lichter, bei dem es keine Veränderung gibt.',
    seasons:['ordinary'], themes:['gratitude','trust'],
  },
  {
    referenceEn:'James 5:16', referenceDe:'Jak 5,16', book:'James',
    textEn:'Confess your sins to one another and pray for one another, that you may be healed. The prayer of a righteous person is powerful and effective.',
    textDe:'Bekennt einander eure Sünden und betet füreinander, damit ihr geheilt werdet. Das Gebet eines Gerechten vermag viel und ist wirkungsvoll.',
    seasons:['ordinary','lent'], themes:['prayer','healing','forgiveness'],
  },
  {
    referenceEn:'1 Peter 5:7', referenceDe:'1 Petr 5,7', book:'1 Peter',
    textEn:'Cast all your worries on him; for he cares for you.',
    textDe:'Werft alle eure Sorgen auf ihn; denn er sorgt sich um euch.',
    seasons:['ordinary'], themes:['trust','peace','comfort'],
  },
  {
    referenceEn:'Hebrews 11:1', referenceDe:'Hebr 11,1', book:'Hebrews',
    textEn:'Faith is the foundation of all that we hope for, a proof of the reality of what we cannot see.',
    textDe:'Glaube ist die Grundlage von allem, was wir erhoffen, ein Beweis für die Wirklichkeit dessen, was wir nicht sehen.',
    seasons:['ordinary'], themes:['hope','trust'],
  },
  {
    referenceEn:'Hebrews 12:1', referenceDe:'Hebr 12,1', book:'Hebrews',
    textEn:'Since we are surrounded by such a great cloud of witnesses, let us lay aside every burden and sin, and run with endurance the race set before us.',
    textDe:'Auch wir — eine solche Wolke von Zeugen umgibt uns — wollen jede Last und die Sünde ablegen und mit Ausdauer kämpfen in dem Wettrennen, das uns aufgetragen ist.',
    seasons:['ordinary'], themes:['strength','courage','hope'],
  },
  {
    referenceEn:'Ephesians 6:11', referenceDe:'Eph 6,11', book:'Ephesians',
    textEn:'Put on the full armour of God, so that you can stand firm against the schemes of the devil.',
    textDe:'Legt die Waffenrüstung Gottes an, damit ihr den Nachstellungen des Teufels standhalten könnt.',
    seasons:['ordinary'], themes:['strength','courage'],
  },
  {
    referenceEn:'Colossians 3:17', referenceDe:'Kol 3,17', book:'Colossians',
    textEn:'Whatever you do in word or deed, do everything in the name of the Lord Jesus, giving thanks to God the Father through him.',
    textDe:'Alles, was ihr in Worten und Werken tut, tut es im Namen des Herrn Jesus und dankt Gott, dem Vater, durch ihn.',
    seasons:['ordinary'], themes:['gratitude','wisdom'],
  },
  {
    referenceEn:'1 Thessalonians 5:16–18', referenceDe:'1 Thess 5,16–18', book:'1 Thessalonians',
    textEn:'Rejoice at all times! Pray without ceasing! Give thanks for everything; for that is the will of God for you in Christ Jesus.',
    textDe:'Freut euch zu jeder Zeit! Betet ohne Unterlass! Dankt für alles; denn das ist der Wille Gottes für euch in Christus Jesus.',
    seasons:['ordinary'], themes:['joy','prayer','gratitude'],
  },
  {
    referenceEn:'Baruch 3:14', referenceDe:'Bar 3,14', book:'Baruch',
    textEn:'Learn where understanding is, where strength, where wisdom — then you will also know where there is long life, where light of the eyes and peace.',
    textDe:'Lerne, wo Einsicht ist, wo Kraft, wo Klugheit — damit du auch erfährst, wo langes Leben ist, wo Licht der Augen und Frieden.',
    seasons:['ordinary','advent'], themes:['wisdom','guidance'],
  },
  {
    referenceEn:'Revelation 21:4', referenceDe:'Offb 21,4', book:'Revelation',
    textEn:'He will wipe every tear from their eyes. Death will be no more, no mourning, no crying, no pain — for what was before has passed away.',
    textDe:'Er wird alle Tränen von ihren Augen abwischen. Der Tod wird nicht mehr sein, keine Trauer, kein Geschrei, keine Mühsal wird mehr sein; denn was früher war, ist vergangen.',
    seasons:['easter','ordinary'], themes:['comfort','hope','peace'],
  },
  {
    referenceEn:'Isaiah 43:1', referenceDe:'Jes 43,1', book:'Isaiah',
    textEn:'Do not fear, for I have redeemed you, I have called you by name — you are mine.',
    textDe:'Fürchte dich nicht, denn ich habe dich ausgelöst, ich habe dich bei deinem Namen gerufen, du gehörst mir.',
    seasons:['ordinary','christmas'], themes:['love','trust','loneliness','courage'],
  },
  {
    referenceEn:'Matthew 28:20', referenceDe:'Mt 28,20', book:'Matthew',
    textEn:'And look: I am with you every day until the end of the world.',
    textDe:'Und habt Acht: Ich bin bei euch alle Tage bis zum Ende der Welt.',
    seasons:['easter','ordinary'], themes:['loneliness','trust','love','comfort'],
  },
];

// ─── Public API ───────────────────────────────────────────────────────────────

export function getVersesForSeason(season: LiturgicalSeason, lang: BibleLanguage = 'en'): BibleVerse[] {
  const pool = BILINGUAL_VERSES.filter(v => v.seasons.includes(season));
  const src = pool.length > 0 ? pool : BILINGUAL_VERSES.filter(v => v.seasons.includes('ordinary'));
  return src.map(v => resolveLang(v, lang));
}

export function getVersesByTheme(theme: VerseTheme, lang: BibleLanguage = 'en'): BibleVerse[] {
  return BILINGUAL_VERSES.filter(v => v.themes?.includes(theme)).map(v => resolveLang(v, lang));
}

export function getRandomVerseForToday(lang: BibleLanguage = 'en'): BibleVerse {
  const season = getLiturgicalSeason();
  const feast = checkFeastDay();
  const pool = BILINGUAL_VERSES.filter(v => v.seasons.includes(season));
  const candidates = pool.length > 0 ? pool : BILINGUAL_VERSES.filter(v => v.seasons.includes('ordinary'));

  if (feast) {
    const fv = candidates.filter(v => v.feast && feast.toLowerCase().includes(v.feast.toLowerCase().split(' ')[0]));
    if (fv.length > 0) return resolveLang(fv[Math.floor(Math.random() * fv.length)], lang);
  }

  const day = getDayOfYear(new Date());
  return resolveLang(candidates[day % candidates.length], lang);
}

export function getContextualVerse(themes: VerseTheme[], lang: BibleLanguage = 'en'): BibleVerse {
  for (const theme of themes) {
    const matches = BILINGUAL_VERSES.filter(v => v.themes?.includes(theme));
    if (matches.length > 0) {
      const idx = Math.floor(Math.random() * matches.length);
      return resolveLang(matches[idx], lang);
    }
  }
  return getRandomVerseForToday(lang);
}

export function getVerseForTime(time: 'morning' | 'noon' | 'evening', lang: BibleLanguage = 'en'): BibleVerse {
  const season = getLiturgicalSeason();
  const pool = BILINGUAL_VERSES.filter(v => v.seasons.includes(season));
  const candidates = pool.length > 0 ? pool : BILINGUAL_VERSES.filter(v => v.seasons.includes('ordinary'));
  const day = getDayOfYear(new Date());
  const offset = time === 'morning' ? 0 : time === 'noon' ? Math.floor(candidates.length / 3) : Math.floor((candidates.length * 2) / 3);
  return resolveLang(candidates[(day + offset) % candidates.length], lang);
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatVerseNotification(
  verse: BibleVerse,
  time: 'morning' | 'noon' | 'evening',
  lang: BibleLanguage = 'en',
): { title: string; body: string } {
  const season = getLiturgicalSeason();
  const feast = checkFeastDay();
  const tl: Record<BibleLanguage, Record<string, string>> = {
    en: { morning: 'Morning Prayer', noon: 'Noon Prayer', evening: 'Evening Prayer' },
    de: { morning: 'Morgengebet',    noon: 'Mittagsgebet', evening: 'Abendgebet' },
  };
  const title = feast
    ? `KAIROS · ${feast}`
    : `KAIROS · ${tl[lang][time]} — ${getLiturgicalSeasonLabel(season, lang)}`;
  const q = lang === 'en' ? '"' : '„', qc = lang === 'en' ? '"' : '"';
  return { title, body: `${q}${verse.text}${qc}\n— ${verse.reference}` };
}
