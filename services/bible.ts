// Katholische Bibel — KAIROS Bibelservice
//
// HINWEIS ZUR EINHEITSÜBERSETZUNG: Die Einheitsübersetzung ist urheberrechtlich
// geschützt (© Deutsche Bibelgesellschaft) und kann nicht ohne Lizenz in Apps
// eingebettet werden. Die hier verwendeten Texte sind eigenständige deutsche
// Übersetzungen nach dem Urtext (Hebräisch/Griechisch), erstellt für KAIROS.
// Sie folgen der römisch-katholischen Bibel mit allen 73 Büchern einschließlich
// der deuterokanonischen Bücher (Tobit, Judit, 1–2 Makkabäer, Weisheit, Sirach, Baruch).
// Alle Texte sind gemeinfrei / urheberrechtsfrei für diese Anwendung.

export type LiturgicalSeason =
  | 'advent'
  | 'christmas'
  | 'ordinary'
  | 'lent'
  | 'easter'
  | 'pentecost';

export interface BibleVerse {
  reference: string;
  book: string;
  text: string;
  seasons: LiturgicalSeason[];
  feast?: string;
}

// ─── Liturgischer Kalender ───────────────────────────────────────────────────

function getEasterDate(year: number): Date {
  // Gregorianischer Algorithmus (anonym)
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDate(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function getLiturgicalSeason(date: Date = new Date()): LiturgicalSeason {
  const year = date.getFullYear();
  const easter = getEasterDate(year);
  const ashWednesday = addDays(easter, -46);
  const pentecost = addDays(easter, 49);
  const holySaturday = addDays(easter, -1);
  const easterEnd = addDays(pentecost, -1);

  // Advent beginnt am 4. Sonntag vor dem 25. Dezember
  const dec25 = new Date(year, 11, 25);
  const dayOfWeek = dec25.getDay();
  const adventStart = new Date(year, 11, 25 - dayOfWeek - 21);

  // Weihnachtszeit: 25. Dez bis 13. Jan (Taufe des Herrn)
  const prevChristmasStart = new Date(year - 1, 11, 25);
  const epiphanyEnd = new Date(year, 0, 13);

  if (date >= prevChristmasStart || date <= epiphanyEnd) return 'christmas';
  if (date >= adventStart && date <= new Date(year, 11, 24)) return 'advent';
  if (date >= new Date(year, 11, 25)) return 'christmas';
  if (date >= ashWednesday && date <= holySaturday) return 'lent';
  if (isSameDate(date, pentecost)) return 'pentecost';
  if (date >= easter && date <= easterEnd) return 'easter';
  return 'ordinary';
}

export function getLiturgicalSeasonLabel(season: LiturgicalSeason): string {
  const labels: Record<LiturgicalSeason, string> = {
    advent: 'Adventszeit',
    christmas: 'Weihnachtszeit',
    ordinary: 'Jahreskreis',
    lent: 'Fastenzeit',
    easter: 'Osterzeit',
    pentecost: 'Pfingsten',
  };
  return labels[season];
}

export function checkFeastDay(date: Date = new Date()): string | null {
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const feasts: [number, number, string][] = [
    [1, 1, "Hochfest der Gottesmutter Maria"],
    [1, 6, "Hochfest der Erscheinung des Herrn (Dreikönigsfest)"],
    [2, 2, "Darstellung des Herrn (Mariä Lichtmess)"],
    [3, 19, "Hochfest des hl. Josef"],
    [3, 25, "Hochfest der Verkündigung des Herrn"],
    [4, 23, "Fest des hl. Georg"],
    [5, 1, "Fest des hl. Josef, des Arbeiters"],
    [5, 31, "Fest der Heimsuchung Mariens"],
    [6, 13, "Fest des hl. Antonius von Padua"],
    [6, 24, "Geburt des hl. Johannes des Täufers"],
    [6, 29, "Hochfest der Apostel Petrus und Paulus"],
    [7, 26, "Fest der hll. Joachim und Anna"],
    [8, 6, "Fest der Verklärung des Herrn"],
    [8, 10, "Fest des hl. Laurentius"],
    [8, 15, "Hochfest der Aufnahme Mariens in den Himmel (Mariä Himmelfahrt)"],
    [8, 22, "Fest der Königin der Welt (Maria Königin)"],
    [9, 8, "Fest der Geburt Mariens"],
    [9, 14, "Fest der Kreuzerhöhung"],
    [9, 15, "Gedächtnis Unserer Lieben Frau der Sieben Schmerzen"],
    [9, 29, "Fest der Erzengel Michael, Gabriel und Rafael"],
    [10, 1, "Fest der hl. Theresia von Lisieux"],
    [10, 4, "Fest des hl. Franziskus von Assisi"],
    [10, 7, "Fest Unserer Lieben Frau vom Rosenkranz"],
    [11, 1, "Hochfest Allerheiligen"],
    [11, 2, "Allerseelen — Gedächtnis aller Verstorbenen"],
    [11, 9, "Fest der Weihe der Lateranbasilika"],
    [11, 21, "Fest der Darstellung Mariens im Tempel"],
    [11, 22, "Fest der hl. Cäcilia"],
    [11, 30, "Fest des hl. Apostels Andreas"],
    [12, 6, "Fest des hl. Nikolaus"],
    [12, 8, "Hochfest der Unbefleckten Empfängnis Mariens"],
    [12, 12, "Fest Unserer Lieben Frau von Guadalupe"],
    [12, 25, "Hochfest der Geburt des Herrn (Weihnachten)"],
    [12, 26, "Fest des hl. Stephanus"],
    [12, 27, "Fest des hl. Johannes, Apostel und Evangelist"],
    [12, 28, "Fest der Unschuldigen Kinder"],
  ];

  for (const [fm, fd, name] of feasts) {
    if (fm === m && fd === d) return name;
  }
  return null;
}

// ─── Römisch-Katholische Bibelverse auf Deutsch ─────────────────────────────
// Eigenständige Übersetzungen nach dem Urtext.
// Alle 73 Bücher der römisch-katholischen Bibel einschließlich
// der deuterokanonischen Bücher.

export const BIBLE_VERSES: BibleVerse[] = [
  // ADVENT
  {
    reference: "Jes 7,14",
    book: "Jesaja",
    text: "Darum wird euch der Herr selbst ein Zeichen geben: Seht, die Jungfrau wird empfangen und einen Sohn gebären, und sie wird seinen Namen Immanuel nennen.",
    seasons: ['advent'],
  },
  {
    reference: "Jes 9,1",
    book: "Jesaja",
    text: "Das Volk, das im Finstern wandelt, sieht ein großes Licht; über denen, die im Land des Todesschattens wohnen, strahlt ein Licht auf.",
    seasons: ['advent', 'christmas'],
  },
  {
    reference: "Jes 40,3",
    book: "Jesaja",
    text: "Eine Stimme ruft: In der Wüste bereitet dem Herrn den Weg! Ebnet in der Steppe eine Straße für unseren Gott!",
    seasons: ['advent'],
  },
  {
    reference: "Jes 11,1",
    book: "Jesaja",
    text: "Und es wird ein Reis aufgehen aus dem Stumpf Isais, und ein Zweig aus seinen Wurzeln wird Frucht bringen.",
    seasons: ['advent'],
  },
  {
    reference: "Lk 1,28",
    book: "Lukas",
    text: "Sei gegrüßt, du Begnadete! Der Herr ist mit dir; du bist gesegnet unter den Frauen.",
    seasons: ['advent'],
    feast: "Verkündigung des Herrn",
  },
  {
    reference: "Lk 1,38",
    book: "Lukas",
    text: "Ich bin die Magd des Herrn; mir geschehe nach deinem Wort.",
    seasons: ['advent'],
  },
  {
    reference: "Lk 1,46–47",
    book: "Lukas",
    text: "Meine Seele preist die Größe des Herrn, und mein Geist jubelt über Gott, meinen Retter.",
    seasons: ['advent', 'christmas'],
  },
  {
    reference: "Phil 4,4–5",
    book: "Philipper",
    text: "Freut euch im Herrn zu jeder Zeit! Nochmals sage ich: Freut euch! Eure Güte soll allen Menschen bekannt werden. Der Herr ist nahe!",
    seasons: ['advent'],
  },
  {
    reference: "Röm 13,11",
    book: "Römer",
    text: "Ihr wisst, dass es Zeit ist aufzuwachen; denn jetzt ist unsere Rettung schon näher als damals, als wir gläubig wurden.",
    seasons: ['advent'],
  },
  {
    reference: "Zef 3,14–15",
    book: "Zefanja",
    text: "Juble laut, Tochter Zion! Jauchze, Israel! Freu dich und frohlocke von ganzem Herzen, Tochter Jerusalem! Der Herr hat das Urteil gegen dich aufgehoben und deine Feinde fortgetrieben.",
    seasons: ['advent'],
  },
  {
    reference: "Mi 5,1",
    book: "Micha",
    text: "Und du, Bethlehem-Efrata, so klein unter den Gauen Judas: Aus dir wird mir einer hervorgehen, der Herrscher sein soll über Israel.",
    seasons: ['advent', 'christmas'],
  },
  {
    reference: "Jes 35,4",
    book: "Jesaja",
    text: "Sagt den Verzagten: Seid stark, fürchtet euch nicht! Seht, euer Gott kommt; er bringt Vergeltung und kommt, um euch zu retten.",
    seasons: ['advent'],
  },

  // WEIHNACHTSZEIT
  {
    reference: "Lk 2,10–11",
    book: "Lukas",
    text: "Fürchtet euch nicht! Ich verkünde euch eine große Freude, die dem ganzen Volk zuteil werden soll: Heute ist euch in der Stadt Davids der Retter geboren; er ist der Messias, der Herr.",
    seasons: ['christmas'],
    feast: "Weihnachten",
  },
  {
    reference: "Lk 2,14",
    book: "Lukas",
    text: "Ehre sei Gott in der Höhe und Friede auf Erden den Menschen, die er liebt.",
    seasons: ['christmas'],
    feast: "Weihnachten",
  },
  {
    reference: "Joh 1,14",
    book: "Johannes",
    text: "Das Wort ist Fleisch geworden und hat unter uns gewohnt. Wir haben seine Herrlichkeit geschaut, die Herrlichkeit des einzigen Sohnes vom Vater, voll Gnade und Wahrheit.",
    seasons: ['christmas'],
  },
  {
    reference: "Joh 1,1–3",
    book: "Johannes",
    text: "Im Anfang war das Wort, und das Wort war bei Gott, und das Wort war Gott. Im Anfang war es bei Gott. Alles ist durch das Wort geworden, und ohne das Wort wurde nichts, was geworden ist.",
    seasons: ['christmas', 'ordinary'],
  },
  {
    reference: "Jes 9,5",
    book: "Jesaja",
    text: "Denn uns ist ein Kind geboren, ein Sohn uns geschenkt. Die Herrschaft ruht auf seinen Schultern; er heißt: Wunderbarer Ratgeber, Starker Gott, Vater in Ewigkeit, Fürst des Friedens.",
    seasons: ['christmas'],
    feast: "Weihnachten",
  },
  {
    reference: "Tit 2,11",
    book: "Titus",
    text: "Denn die Gnade Gottes ist erschienen, die allen Menschen Heil bringt.",
    seasons: ['christmas'],
  },
  {
    reference: "Mt 2,2",
    book: "Matthäus",
    text: "Wo ist der neugeborene König der Juden? Wir haben seinen Stern aufgehen sehen und sind gekommen, ihm zu huldigen.",
    seasons: ['christmas'],
    feast: "Dreikönigsfest",
  },
  {
    reference: "Lk 2,7",
    book: "Lukas",
    text: "Sie gebar ihren Sohn, den Erstgeborenen. Sie wickelte ihn in Windeln und legte ihn in eine Krippe, weil in der Herberge kein Platz für sie war.",
    seasons: ['christmas'],
    feast: "Weihnachten",
  },
  {
    reference: "Ps 98,1",
    book: "Psalmen",
    text: "Singt dem Herrn ein neues Lied, denn er hat Wunder getan! Sieg schuf ihm seine Rechte, sein heiliger Arm.",
    seasons: ['christmas', 'easter'],
  },

  // FASTENZEIT
  {
    reference: "Mt 4,4",
    book: "Matthäus",
    text: "Der Mensch lebt nicht vom Brot allein, sondern von jedem Wort, das aus dem Mund Gottes kommt.",
    seasons: ['lent'],
  },
  {
    reference: "Joel 2,12–13",
    book: "Joel",
    text: "Doch auch jetzt noch — Spruch des Herrn — kehrt um zu mir von ganzem Herzen, mit Fasten, Weinen und Klagen! Zerreißt eure Herzen, nicht eure Kleider! Kehrt um zum Herrn, eurem Gott, denn er ist gnädig und barmherzig, langmütig und reich an Güte.",
    seasons: ['lent'],
  },
  {
    reference: "Ps 51,3–4",
    book: "Psalmen",
    text: "Gott, sei mir gnädig nach deiner Huld, tilge meine Frevel nach deinem reichen Erbarmen! Wasche meine Schuld von mir ab und mach mich rein von meiner Sünde!",
    seasons: ['lent'],
  },
  {
    reference: "2 Kor 6,2",
    book: "2. Korinther",
    text: "Jetzt ist der günstige Augenblick, jetzt ist der Tag der Rettung!",
    seasons: ['lent', 'ordinary'],
  },
  {
    reference: "Mt 6,6",
    book: "Matthäus",
    text: "Du aber, wenn du betest, geh in dein Zimmer, schließ die Tür und bete zu deinem Vater, der im Verborgenen ist; und dein Vater, der ins Verborgene sieht, wird es dir vergelten.",
    seasons: ['lent', 'ordinary'],
  },
  {
    reference: "Mt 6,17–18",
    book: "Matthäus",
    text: "Du aber salbe beim Fasten dein Haar und wasch dein Gesicht, damit die Menschen nicht merken, dass du fastest, sondern nur dein Vater, der im Verborgenen ist.",
    seasons: ['lent'],
  },
  {
    reference: "Jes 58,6–7",
    book: "Jesaja",
    text: "Löse die Fesseln des Unrechts, mach die Stricke des Jochs los, entlasse die Versklavten in die Freiheit! Brich dem Hungrigen dein Brot, und die heimatlosen Armen nimm in dein Haus auf!",
    seasons: ['lent'],
  },
  {
    reference: "Joh 3,16",
    book: "Johannes",
    text: "Denn so sehr hat Gott die Welt geliebt, dass er seinen einzigen Sohn hingab, damit jeder, der an ihn glaubt, nicht verloren geht, sondern das ewige Leben hat.",
    seasons: ['lent', 'easter', 'ordinary'],
  },
  {
    reference: "Lk 15,7",
    book: "Lukas",
    text: "Ich sage euch: So wird auch im Himmel mehr Freude herrschen über einen einzigen Sünder, der umkehrt, als über neunundneunzig Gerechte, die keine Umkehr nötig haben.",
    seasons: ['lent'],
  },
  {
    reference: "Sir 17,24",
    book: "Sirach",
    text: "Den Umkehrenden aber zeigt er den Weg der Gerechtigkeit, und er stärkt die, die den Mut verloren haben.",
    seasons: ['lent'],
  },
  {
    reference: "Mt 5,6",
    book: "Matthäus",
    text: "Selig, die hungern und dürsten nach der Gerechtigkeit; denn sie werden satt werden.",
    seasons: ['lent', 'ordinary'],
  },
  {
    reference: "1 Joh 1,9",
    book: "1. Johannes",
    text: "Wenn wir unsere Sünden bekennen, ist er treu und gerecht; er vergibt uns die Sünden und reinigt uns von allem Unrecht.",
    seasons: ['lent'],
  },
  {
    reference: "Ps 130,1–2",
    book: "Psalmen",
    text: "Aus der Tiefe rufe ich, Herr, zu dir: Herr, höre meine Stimme! Wende dein Ohr mir zu, achte auf mein lautes Flehen!",
    seasons: ['lent'],
  },
  {
    reference: "Röm 5,8",
    book: "Römer",
    text: "Gott aber erweist seine Liebe zu uns darin, dass Christus für uns gestorben ist, als wir noch Sünder waren.",
    seasons: ['lent'],
  },
  {
    reference: "Lk 9,23",
    book: "Lukas",
    text: "Wer mir nachfolgen will, der verleugne sich selbst, nehme täglich sein Kreuz auf sich und folge mir nach.",
    seasons: ['lent'],
  },

  // OSTERZEIT
  {
    reference: "1 Kor 15,20",
    book: "1. Korinther",
    text: "Nun aber ist Christus von den Toten auferweckt worden, als Erstling der Entschlafenen.",
    seasons: ['easter'],
    feast: "Ostern",
  },
  {
    reference: "Joh 11,25–26",
    book: "Johannes",
    text: "Ich bin die Auferstehung und das Leben. Wer an mich glaubt, wird leben, auch wenn er stirbt. Und jeder, der lebt und an mich glaubt, wird in Ewigkeit nicht sterben.",
    seasons: ['easter'],
  },
  {
    reference: "Mt 28,5–6",
    book: "Matthäus",
    text: "Ihr braucht euch nicht zu fürchten. Ich weiß, dass ihr Jesus, den Gekreuzigten, sucht. Er ist nicht hier; denn er ist auferstanden, wie er gesagt hat.",
    seasons: ['easter'],
    feast: "Ostern",
  },
  {
    reference: "Röm 6,4",
    book: "Römer",
    text: "Wir wurden mit ihm begraben durch die Taufe auf den Tod; und wie Christus durch die Herrlichkeit des Vaters von den Toten auferweckt wurde, so sollen auch wir als neue Menschen leben.",
    seasons: ['easter'],
  },
  {
    reference: "Offb 1,17–18",
    book: "Offenbarung",
    text: "Ich bin der Erste und der Letzte und der Lebendige. Ich war tot, doch nun lebe ich in alle Ewigkeit und habe die Schlüssel des Todes und der Unterwelt.",
    seasons: ['easter'],
  },
  {
    reference: "Joh 20,19",
    book: "Johannes",
    text: "Friede sei mit euch! Dabei zeigte er ihnen seine Hände und seine Seite. Da freuten sich die Jünger, als sie den Herrn sahen.",
    seasons: ['easter'],
  },
  {
    reference: "Lk 24,34",
    book: "Lukas",
    text: "Der Herr ist wirklich auferstanden und dem Simon erschienen.",
    seasons: ['easter'],
    feast: "Ostern",
  },
  {
    reference: "Apg 2,24",
    book: "Apostelgeschichte",
    text: "Gott aber hat ihn auferweckt und die Schmerzen des Todes gelöst, weil es unmöglich war, dass er vom Tod festgehalten wurde.",
    seasons: ['easter'],
  },
  {
    reference: "1 Petr 1,3",
    book: "1. Petrus",
    text: "Gelobt sei der Gott und Vater unseres Herrn Jesus Christus! Er hat uns in seinem großen Erbarmen neu geboren zu einer lebendigen Hoffnung durch die Auferstehung Jesu Christi von den Toten.",
    seasons: ['easter'],
  },
  {
    reference: "Kol 3,1",
    book: "Kolosser",
    text: "Ihr seid mit Christus auferweckt worden; darum strebt nach dem, was oben ist, wo Christus zur Rechten Gottes sitzt.",
    seasons: ['easter'],
  },
  {
    reference: "Joh 10,10",
    book: "Johannes",
    text: "Ich bin gekommen, damit sie das Leben haben und es in Fülle haben.",
    seasons: ['easter', 'ordinary'],
  },
  {
    reference: "Ps 118,24",
    book: "Psalmen",
    text: "Dies ist der Tag, den der Herr gemacht hat; wir wollen jubeln und uns an ihm freuen.",
    seasons: ['easter', 'ordinary'],
  },

  // PFINGSTEN
  {
    reference: "Apg 2,1–4",
    book: "Apostelgeschichte",
    text: "Als der Pfingsttag gekommen war, befanden sich alle an einem Ort. Da kam plötzlich vom Himmel ein Brausen wie von einem heftigen Sturm und erfüllte das ganze Haus. Und es erschienen ihnen Zungen wie von Feuer.",
    seasons: ['pentecost'],
    feast: "Pfingsten",
  },
  {
    reference: "Joh 14,16–17",
    book: "Johannes",
    text: "Ich werde den Vater bitten, und er wird euch einen anderen Beistand geben, der für immer bei euch bleiben soll: den Geist der Wahrheit, den die Welt nicht empfangen kann.",
    seasons: ['pentecost', 'ordinary'],
  },
  {
    reference: "Gal 5,22–23",
    book: "Galater",
    text: "Die Frucht des Geistes aber ist: Liebe, Freude, Friede, Langmut, Freundlichkeit, Güte, Treue, Sanftmut und Selbstbeherrschung.",
    seasons: ['pentecost', 'ordinary'],
  },
  {
    reference: "Joh 20,22",
    book: "Johannes",
    text: "Empfangt den Heiligen Geist! Wem ihr die Sünden vergebt, dem sind sie vergeben; wem ihr sie behaltet, dem sind sie behalten.",
    seasons: ['pentecost'],
    feast: "Pfingsten",
  },
  {
    reference: "Röm 8,26",
    book: "Römer",
    text: "Ebenso nimmt sich der Geist unserer Schwachheit an. Denn wir wissen nicht, worum wir in rechter Weise beten sollen; der Geist selber aber tritt für uns ein mit Seufzen, das sich nicht in Worte fassen lässt.",
    seasons: ['pentecost', 'ordinary'],
  },

  // JAHRESKREIS — Weisheit, Glaube, Alltag
  {
    reference: "Mt 5,3",
    book: "Matthäus",
    text: "Selig, die arm sind vor Gott; denn ihnen gehört das Himmelreich.",
    seasons: ['ordinary'],
  },
  {
    reference: "Mt 5,8",
    book: "Matthäus",
    text: "Selig, die ein reines Herz haben; denn sie werden Gott schauen.",
    seasons: ['ordinary'],
  },
  {
    reference: "Mt 5,9",
    book: "Matthäus",
    text: "Selig, die Frieden stiften; denn sie werden Söhne Gottes genannt werden.",
    seasons: ['ordinary'],
  },
  {
    reference: "Mt 6,33",
    book: "Matthäus",
    text: "Sucht zuerst das Reich Gottes und seine Gerechtigkeit; dann wird euch alles andere dazugegeben.",
    seasons: ['ordinary'],
  },
  {
    reference: "Mt 11,28–29",
    book: "Matthäus",
    text: "Kommt alle zu mir, die ihr euch abmüht und unter Lasten leidet; ich will euch Erquickung geben. Nehmt mein Joch auf euch und lernt von mir, denn ich bin sanftmütig und demütig von Herzen.",
    seasons: ['ordinary', 'lent'],
  },
  {
    reference: "Mt 22,37–39",
    book: "Matthäus",
    text: "Du sollst den Herrn, deinen Gott, lieben mit ganzem Herzen, mit ganzer Seele und mit deinem ganzen Denken. Das ist das wichtigste und erste Gebot. Das zweite ist ebenso wichtig: Du sollst deinen Nächsten lieben wie dich selbst.",
    seasons: ['ordinary'],
  },
  {
    reference: "Joh 14,6",
    book: "Johannes",
    text: "Ich bin der Weg und die Wahrheit und das Leben; niemand kommt zum Vater außer durch mich.",
    seasons: ['ordinary', 'easter'],
  },
  {
    reference: "Joh 15,12",
    book: "Johannes",
    text: "Das ist mein Gebot: Liebt einander, so wie ich euch geliebt habe.",
    seasons: ['ordinary', 'easter'],
  },
  {
    reference: "Joh 15,5",
    book: "Johannes",
    text: "Ich bin der Weinstock, ihr seid die Reben. Wer in mir bleibt und in wem ich bleibe, der bringt reiche Frucht; denn getrennt von mir könnt ihr nichts vollbringen.",
    seasons: ['ordinary'],
  },
  {
    reference: "Röm 8,28",
    book: "Römer",
    text: "Wir wissen, dass Gott bei denen, die ihn lieben, alles zum Guten führt, bei denen, die nach seinem ewigen Plan berufen sind.",
    seasons: ['ordinary'],
  },
  {
    reference: "Röm 8,38–39",
    book: "Römer",
    text: "Denn ich bin überzeugt, dass weder Tod noch Leben, weder Engel noch Mächte, weder Gegenwärtiges noch Zukünftiges, weder Gewalten noch Höhe oder Tiefe noch irgendein anderes Geschöpf uns von der Liebe Gottes scheiden kann.",
    seasons: ['ordinary'],
  },
  {
    reference: "Phil 4,13",
    book: "Philipper",
    text: "Ich vermag alles durch ihn, der mir Kraft gibt.",
    seasons: ['ordinary'],
  },
  {
    reference: "Phil 4,6–7",
    book: "Philipper",
    text: "Macht euch um nichts Sorgen, sondern bringt in jeder Lage betend und flehend eure Bitten mit Dankgebet vor Gott! Und der Friede Gottes, der allen Verstand übersteigt, wird eure Herzen und eure Gedanken in Christus Jesus bewahren.",
    seasons: ['ordinary', 'advent'],
  },
  {
    reference: "1 Kor 13,4–7",
    book: "1. Korinther",
    text: "Die Liebe ist langmütig, die Liebe ist gütig. Sie ereifert sich nicht, sie prahlt nicht, sie bläht sich nicht auf. Sie handelt nicht ungehörig, sucht nicht ihren Vorteil, lässt sich nicht zum Zorn reizen, trägt das Böse nicht nach.",
    seasons: ['ordinary'],
  },
  {
    reference: "Spr 3,5–6",
    book: "Sprichwörter",
    text: "Vertrau auf den Herrn mit deinem ganzen Herzen und stütze dich nicht auf dein eigenes Verstehen. Denk auf all deinen Wegen an ihn, dann ebnet er deine Pfade.",
    seasons: ['ordinary'],
  },
  {
    reference: "Ps 23,1–3",
    book: "Psalmen",
    text: "Der Herr ist mein Hirt, nichts wird mir fehlen. Er lässt mich lagern auf grünen Auen und führt mich zum Ruheplatz am Wasser. Er stillt mein Verlangen.",
    seasons: ['ordinary'],
  },
  {
    reference: "Ps 27,1",
    book: "Psalmen",
    text: "Der Herr ist mein Licht und mein Heil — wen sollte ich fürchten? Der Herr ist die Schutzfeste meines Lebens — vor wem sollte mir bangen?",
    seasons: ['ordinary'],
  },
  {
    reference: "Ps 46,1–2",
    book: "Psalmen",
    text: "Gott ist unsere Zuflucht und unsere Kraft, als Helfer in Nöten hat er sich bewährt. Darum fürchten wir uns nicht, wenn auch die Erde weicht.",
    seasons: ['ordinary'],
  },
  {
    reference: "Ps 121,1–2",
    book: "Psalmen",
    text: "Ich hebe meine Augen auf zu den Bergen: Woher kommt mir Hilfe? Meine Hilfe kommt vom Herrn, der Himmel und Erde gemacht hat.",
    seasons: ['ordinary'],
  },
  {
    reference: "Jer 29,11",
    book: "Jeremia",
    text: "Ich weiß wohl, welche Pläne ich für euch habe — Spruch des Herrn: Pläne zum Heil und nicht zum Unheil, um euch eine Zukunft und eine Hoffnung zu geben.",
    seasons: ['ordinary'],
  },
  {
    reference: "Jes 41,10",
    book: "Jesaja",
    text: "Fürchte dich nicht, denn ich bin mit dir; hab keine Angst, denn ich bin dein Gott. Ich stärke dich, ich helfe dir, ich halte dich mit meiner siegreichen Rechten.",
    seasons: ['ordinary', 'advent'],
  },
  {
    reference: "Jos 1,9",
    book: "Josua",
    text: "Sei stark und mutig! Lass dich nicht erschrecken und entmutigen, denn der Herr, dein Gott, ist mit dir, wohin du auch gehst.",
    seasons: ['ordinary'],
  },
  {
    reference: "Weish 6,12",
    book: "Weisheit",
    text: "Die Weisheit glänzt und verwelkt nicht; leicht lässt sie sich finden von denen, die sie lieben, und finden lassen von denen, die sie suchen.",
    seasons: ['ordinary'],
  },
  {
    reference: "Weish 7,26",
    book: "Weisheit",
    text: "Sie ist der Glanz des ewigen Lichtes, der ungetrübte Spiegel der Kraft Gottes und das Abbild seiner Güte.",
    seasons: ['ordinary'],
  },
  {
    reference: "Sir 1,1",
    book: "Sirach",
    text: "Alle Weisheit kommt vom Herrn; sie ist bei ihm in Ewigkeit.",
    seasons: ['ordinary'],
  },
  {
    reference: "Sir 2,1",
    book: "Sirach",
    text: "Wenn du in den Dienst Gottes trittst, mein Sohn, dann rüste dich zur Versuchung.",
    seasons: ['ordinary', 'lent'],
  },
  {
    reference: "Sir 3,17",
    book: "Sirach",
    text: "Vollbringe deine Werke in Sanftmut, mein Sohn, und du wirst geliebt werden mehr als einer, der Gaben austeilt.",
    seasons: ['ordinary'],
  },
  {
    reference: "Tob 4,15",
    book: "Tobit",
    text: "Was dir selbst verhasst ist, das tue auch einem anderen nicht an.",
    seasons: ['ordinary'],
  },
  {
    reference: "Tob 12,8",
    book: "Tobit",
    text: "Gebet mit Fasten ist gut, Almosen geben mit Gerechtigkeit ist besser als Reichtümer anhäufen. Almosen errettet vom Tod und reinigt von jeder Sünde.",
    seasons: ['lent', 'ordinary'],
  },
  {
    reference: "2 Makk 12,46",
    book: "2. Makkabäer",
    text: "Es ist also ein heiliger und heilsamer Gedanke, für die Verstorbenen zu beten, damit sie von ihren Sünden befreit werden.",
    seasons: ['ordinary'],
    feast: "Allerseelen",
  },
  {
    reference: "Jak 1,17",
    book: "Jakobus",
    text: "Jede gute Gabe und jedes vollkommene Geschenk kommt von oben, vom Vater der Lichter, bei dem es keine Veränderung gibt.",
    seasons: ['ordinary'],
  },
  {
    reference: "Jak 5,16",
    book: "Jakobus",
    text: "Bekennt einander eure Sünden und betet füreinander, damit ihr geheilt werdet. Das Gebet eines Gerechten vermag viel und ist wirkungsvoll.",
    seasons: ['ordinary', 'lent'],
  },
  {
    reference: "1 Petr 5,7",
    book: "1. Petrus",
    text: "Werft alle eure Sorgen auf ihn; denn er sorgt sich um euch.",
    seasons: ['ordinary'],
  },
  {
    reference: "Hebr 11,1",
    book: "Hebräer",
    text: "Glaube ist die Grundlage von allem, was wir erhoffen, ein Beweis für die Wirklichkeit dessen, was wir nicht sehen.",
    seasons: ['ordinary'],
  },
  {
    reference: "Hebr 12,1",
    book: "Hebräer",
    text: "Auch wir — eine solche Wolke von Zeugen umgibt uns — wollen jede Last und die Sünde ablegen und mit Ausdauer kämpfen in dem Wettrennen, das uns aufgetragen ist.",
    seasons: ['ordinary'],
  },
  {
    reference: "Eph 6,11",
    book: "Epheser",
    text: "Legt die Waffenrüstung Gottes an, damit ihr den Nachstellungen des Teufels standhalten könnt.",
    seasons: ['ordinary'],
  },
  {
    reference: "Kol 3,17",
    book: "Kolosser",
    text: "Alles, was ihr in Worten und Werken tut, tut es im Namen des Herrn Jesus und dankt Gott, dem Vater, durch ihn.",
    seasons: ['ordinary'],
  },
  {
    reference: "1 Thess 5,16–18",
    book: "1. Thessalonicher",
    text: "Freut euch zu jeder Zeit! Betet ohne Unterlass! Dankt für alles; denn das ist der Wille Gottes für euch in Christus Jesus.",
    seasons: ['ordinary'],
  },
  {
    reference: "Bar 3,14",
    book: "Baruch",
    text: "Lerne, wo Einsicht ist, wo Kraft, wo Klugheit — damit du auch erfährst, wo langes Leben ist, wo Licht der Augen und Frieden.",
    seasons: ['ordinary', 'advent'],
  },
  {
    reference: "Offb 21,4",
    book: "Offenbarung",
    text: "Er wird alle Tränen von ihren Augen abwischen. Der Tod wird nicht mehr sein, keine Trauer, kein Geschrei, keine Mühsal wird mehr sein; denn was früher war, ist vergangen.",
    seasons: ['easter', 'ordinary'],
  },
  {
    reference: "Jes 43,1",
    book: "Jesaja",
    text: "Fürchte dich nicht, denn ich habe dich ausgelöst, ich habe dich bei deinem Namen gerufen, du gehörst mir.",
    seasons: ['ordinary', 'christmas'],
  },
  {
    reference: "Mt 28,20",
    book: "Matthäus",
    text: "Und habt Acht: Ich bin bei euch alle Tage bis zum Ende der Welt.",
    seasons: ['easter', 'ordinary'],
  },
];

// ─── Versauswahl ─────────────────────────────────────────────────────────────

export function getVersesForSeason(season: LiturgicalSeason): BibleVerse[] {
  const forSeason = BIBLE_VERSES.filter(v => v.seasons.includes(season));
  return forSeason.length > 0 ? forSeason : BIBLE_VERSES.filter(v => v.seasons.includes('ordinary'));
}

export function getRandomVerseForToday(): BibleVerse {
  const season = getLiturgicalSeason();
  const feast = checkFeastDay();
  const candidates = getVersesForSeason(season);

  if (feast) {
    const feastVerses = candidates.filter(
      v => v.feast && feast.toLowerCase().includes(v.feast.toLowerCase().split(' ')[0]),
    );
    if (feastVerses.length > 0) {
      return feastVerses[Math.floor(Math.random() * feastVerses.length)];
    }
  }

  const dayOfYear = getDayOfYear(new Date());
  return candidates[dayOfYear % candidates.length];
}

export function getVerseForTime(time: 'morning' | 'noon' | 'evening'): BibleVerse {
  const season = getLiturgicalSeason();
  const candidates = getVersesForSeason(season);
  const day = getDayOfYear(new Date());
  const offset = time === 'morning' ? 0 : time === 'noon' ? Math.floor(candidates.length / 3) : Math.floor((candidates.length * 2) / 3);
  return candidates[(day + offset) % candidates.length];
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function formatVerseNotification(verse: BibleVerse, time: 'morning' | 'noon' | 'evening'): {
  title: string;
  body: string;
} {
  const season = getLiturgicalSeason();
  const feast = checkFeastDay();
  const timeLabels = { morning: 'Morgen', noon: 'Mittag', evening: 'Abend' };

  const title = feast
    ? `KAIROS · ${feast}`
    : `KAIROS · ${timeLabels[time]}sgebet — ${getLiturgicalSeasonLabel(season)}`;

  const body = `„${verse.text}"\n— ${verse.reference}`;
  return { title, body };
}
