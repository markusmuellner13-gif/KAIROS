// KAIROS — Catholic Bible Service
//
// English: Douay-Rheims Bible (1899 American Edition) — public domain.
// German:  Original translations from the Hebrew/Greek source texts — copyright-free.
//          (The Einheitsübersetzung is © Deutsche Bibelgesellschaft and cannot be
//           embedded in apps without a licence. These are independent translations.)
//
// All 73 books of the Roman Catholic canon, including the Deuterocanonical books
// (Tobit, Judith, 1–2 Maccabees, Wisdom, Sirach, Baruch).

export type LiturgicalSeason =
  | 'advent'
  | 'christmas'
  | 'ordinary'
  | 'lent'
  | 'easter'
  | 'pentecost';

export type BibleLanguage = 'en' | 'de';

interface BilingualVerse {
  referenceEn: string;
  referenceDe: string;
  book: string;
  textEn: string;
  textDe: string;
  seasons: LiturgicalSeason[];
  feast?: string;
}

export interface BibleVerse {
  reference: string;
  book: string;
  text: string;
  seasons: LiturgicalSeason[];
  feast?: string;
}

export function resolveLang(verse: BilingualVerse, lang: BibleLanguage): BibleVerse {
  return {
    reference: lang === 'en' ? verse.referenceEn : verse.referenceDe,
    book: verse.book,
    text: lang === 'en' ? verse.textEn : verse.textDe,
    seasons: verse.seasons,
    feast: verse.feast,
  };
}

// ─── Liturgical Calendar ─────────────────────────────────────────────────────

function getEasterDate(year: number): Date {
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

  const dec25 = new Date(year, 11, 25);
  const adventStart = new Date(year, 11, 25 - dec25.getDay() - 21);
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

export function getLiturgicalSeasonLabel(season: LiturgicalSeason, lang: BibleLanguage = 'en'): string {
  const labels: Record<LiturgicalSeason, [string, string]> = {
    advent:    ['Season of Advent',   'Adventszeit'],
    christmas: ['Christmas Season',   'Weihnachtszeit'],
    ordinary:  ['Ordinary Time',      'Jahreskreis'],
    lent:      ['Season of Lent',     'Fastenzeit'],
    easter:    ['Easter Season',      'Osterzeit'],
    pentecost: ['Pentecost',          'Pfingsten'],
  };
  return labels[season][lang === 'en' ? 0 : 1];
}

export function checkFeastDay(date: Date = new Date()): string | null {
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const feasts: [number, number, string][] = [
    [1, 1,  "Solemnity of Mary, Mother of God"],
    [1, 6,  "Feast of the Epiphany"],
    [2, 2,  "Presentation of the Lord (Candlemas)"],
    [3, 19, "Solemnity of Saint Joseph"],
    [3, 25, "Solemnity of the Annunciation of the Lord"],
    [4, 23, "Feast of Saint George"],
    [5, 1,  "Feast of Saint Joseph the Worker"],
    [5, 31, "Feast of the Visitation of the Blessed Virgin Mary"],
    [6, 13, "Feast of Saint Anthony of Padua"],
    [6, 24, "Nativity of Saint John the Baptist"],
    [6, 29, "Solemnity of Saints Peter and Paul"],
    [7, 26, "Feast of Saints Joachim and Anne"],
    [8, 6,  "Feast of the Transfiguration of the Lord"],
    [8, 15, "Assumption of the Blessed Virgin Mary"],
    [8, 22, "Feast of the Queenship of Mary"],
    [9, 8,  "Feast of the Nativity of the Blessed Virgin Mary"],
    [9, 14, "Feast of the Exaltation of the Holy Cross"],
    [9, 15, "Our Lady of Sorrows"],
    [9, 29, "Feast of the Archangels Michael, Gabriel and Raphael"],
    [10, 1, "Feast of Saint Thérèse of Lisieux"],
    [10, 4, "Feast of Saint Francis of Assisi"],
    [10, 7, "Feast of Our Lady of the Rosary"],
    [11, 1, "Solemnity of All Saints"],
    [11, 2, "All Souls Day"],
    [11, 30,"Feast of Saint Andrew the Apostle"],
    [12, 6, "Feast of Saint Nicholas"],
    [12, 8, "Immaculate Conception of the Blessed Virgin Mary"],
    [12, 25,"Solemnity of the Nativity of the Lord (Christmas)"],
    [12, 26,"Feast of Saint Stephen"],
    [12, 27,"Feast of Saint John the Apostle"],
    [12, 28,"Feast of the Holy Innocents"],
  ];

  for (const [fm, fd, name] of feasts) {
    if (fm === m && fd === d) return name;
  }
  return null;
}

// ─── Bilingual Verse Data ─────────────────────────────────────────────────────
// English: Douay-Rheims (1899) — public domain.
// German:  Original translation from source texts — copyright-free.

const BILINGUAL_VERSES: BilingualVerse[] = [
  // ADVENT
  {
    referenceEn: "Isaiah 7:14", referenceDe: "Jes 7,14", book: "Isaiah",
    textEn: "Therefore the Lord himself shall give you a sign. Behold a virgin shall conceive, and bear a son, and his name shall be called Emmanuel.",
    textDe: "Darum wird euch der Herr selbst ein Zeichen geben: Seht, die Jungfrau wird empfangen und einen Sohn gebären, und sie wird seinen Namen Immanuel nennen.",
    seasons: ['advent'],
  },
  {
    referenceEn: "Isaiah 9:2", referenceDe: "Jes 9,1", book: "Isaiah",
    textEn: "The people that walked in darkness, have seen a great light: to them that dwelt in the region of the shadow of death, light is risen.",
    textDe: "Das Volk, das im Finstern wandelt, sieht ein großes Licht; über denen, die im Land des Todesschattens wohnen, strahlt ein Licht auf.",
    seasons: ['advent', 'christmas'],
  },
  {
    referenceEn: "Isaiah 40:3", referenceDe: "Jes 40,3", book: "Isaiah",
    textEn: "A voice of one crying in the desert: Prepare ye the way of the Lord, make straight in the wilderness the paths of our God.",
    textDe: "Eine Stimme ruft: In der Wüste bereitet dem Herrn den Weg! Ebnet in der Steppe eine Straße für unseren Gott!",
    seasons: ['advent'],
  },
  {
    referenceEn: "Isaiah 11:1", referenceDe: "Jes 11,1", book: "Isaiah",
    textEn: "And there shall come forth a rod out of the root of Jesse, and a flower shall rise up out of his root.",
    textDe: "Und es wird ein Reis aufgehen aus dem Stumpf Isais, und ein Zweig aus seinen Wurzeln wird Frucht bringen.",
    seasons: ['advent'],
  },
  {
    referenceEn: "Luke 1:28", referenceDe: "Lk 1,28", book: "Luke",
    textEn: "Hail, full of grace, the Lord is with thee: blessed art thou among women.",
    textDe: "Sei gegrüßt, du Begnadete! Der Herr ist mit dir; du bist gesegnet unter den Frauen.",
    seasons: ['advent'], feast: "Annunciation",
  },
  {
    referenceEn: "Luke 1:38", referenceDe: "Lk 1,38", book: "Luke",
    textEn: "Behold the handmaid of the Lord; be it done to me according to thy word.",
    textDe: "Ich bin die Magd des Herrn; mir geschehe nach deinem Wort.",
    seasons: ['advent'],
  },
  {
    referenceEn: "Luke 1:46–47", referenceDe: "Lk 1,46–47", book: "Luke",
    textEn: "My soul doth magnify the Lord. And my spirit hath rejoiced in God my Saviour.",
    textDe: "Meine Seele preist die Größe des Herrn, und mein Geist jubelt über Gott, meinen Retter.",
    seasons: ['advent', 'christmas'],
  },
  {
    referenceEn: "Philippians 4:4–5", referenceDe: "Phil 4,4–5", book: "Philippians",
    textEn: "Rejoice in the Lord always; again I say, rejoice. Let your modesty be known to all men. The Lord is nigh.",
    textDe: "Freut euch im Herrn zu jeder Zeit! Nochmals sage ich: Freut euch! Eure Güte soll allen Menschen bekannt werden. Der Herr ist nahe!",
    seasons: ['advent'],
  },
  {
    referenceEn: "Romans 13:11", referenceDe: "Röm 13,11", book: "Romans",
    textEn: "And that knowing the season; that it is now the hour for us to rise from sleep. For now our salvation is nearer than when we believed.",
    textDe: "Ihr wisst, dass es Zeit ist aufzuwachen; denn jetzt ist unsere Rettung schon näher als damals, als wir gläubig wurden.",
    seasons: ['advent'],
  },
  {
    referenceEn: "Zephaniah 3:14–15", referenceDe: "Zef 3,14–15", book: "Zephaniah",
    textEn: "Give praise, O daughter of Sion: shout, O Israel: be glad, and rejoice with all thy heart, O daughter of Jerusalem. The Lord hath taken away thy judgment, he hath turned away thy enemies.",
    textDe: "Juble laut, Tochter Zion! Jauchze, Israel! Freu dich und frohlocke von ganzem Herzen, Tochter Jerusalem! Der Herr hat das Urteil gegen dich aufgehoben und deine Feinde fortgetrieben.",
    seasons: ['advent'],
  },
  {
    referenceEn: "Micah 5:2", referenceDe: "Mi 5,1", book: "Micah",
    textEn: "And thou Bethlehem Ephrata, art a little one among the thousands of Juda: out of thee shall he come forth unto me that is to be the ruler in Israel.",
    textDe: "Und du, Bethlehem-Efrata, so klein unter den Gauen Judas: Aus dir wird mir einer hervorgehen, der Herrscher sein soll über Israel.",
    seasons: ['advent', 'christmas'],
  },
  {
    referenceEn: "Isaiah 35:4", referenceDe: "Jes 35,4", book: "Isaiah",
    textEn: "Say to the fainthearted: Take courage, and fear not: behold your God will come and will save you.",
    textDe: "Sagt den Verzagten: Seid stark, fürchtet euch nicht! Seht, euer Gott kommt; er bringt Vergeltung und kommt, um euch zu retten.",
    seasons: ['advent'],
  },

  // CHRISTMAS
  {
    referenceEn: "Luke 2:10–11", referenceDe: "Lk 2,10–11", book: "Luke",
    textEn: "Fear not; for, behold, I bring you good tidings of great joy, that shall be to all the people: For, this day, is born to you a Saviour, who is Christ the Lord, in the city of David.",
    textDe: "Fürchtet euch nicht! Ich verkünde euch eine große Freude, die dem ganzen Volk zuteil werden soll: Heute ist euch in der Stadt Davids der Retter geboren; er ist der Messias, der Herr.",
    seasons: ['christmas'], feast: "Christmas",
  },
  {
    referenceEn: "Luke 2:14", referenceDe: "Lk 2,14", book: "Luke",
    textEn: "Glory to God in the highest; and on earth peace to men of good will.",
    textDe: "Ehre sei Gott in der Höhe und Friede auf Erden den Menschen, die er liebt.",
    seasons: ['christmas'], feast: "Christmas",
  },
  {
    referenceEn: "John 1:14", referenceDe: "Joh 1,14", book: "John",
    textEn: "And the Word was made flesh, and dwelt among us, and we saw his glory, the glory as it were of the only begotten of the Father, full of grace and truth.",
    textDe: "Das Wort ist Fleisch geworden und hat unter uns gewohnt. Wir haben seine Herrlichkeit geschaut, die Herrlichkeit des einzigen Sohnes vom Vater, voll Gnade und Wahrheit.",
    seasons: ['christmas'],
  },
  {
    referenceEn: "John 1:1–3", referenceDe: "Joh 1,1–3", book: "John",
    textEn: "In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him: and without him was made nothing that was made.",
    textDe: "Im Anfang war das Wort, und das Wort war bei Gott, und das Wort war Gott. Im Anfang war es bei Gott. Alles ist durch das Wort geworden, und ohne das Wort wurde nichts, was geworden ist.",
    seasons: ['christmas', 'ordinary'],
  },
  {
    referenceEn: "Isaiah 9:6", referenceDe: "Jes 9,5", book: "Isaiah",
    textEn: "For a CHILD IS BORN to us, and a son is given to us, and the government is upon his shoulder: and his name shall be called Wonderful, Counsellor, God the Mighty, the Father of the world to come, the Prince of Peace.",
    textDe: "Denn uns ist ein Kind geboren, ein Sohn uns geschenkt. Die Herrschaft ruht auf seinen Schultern; er heißt: Wunderbarer Ratgeber, Starker Gott, Vater in Ewigkeit, Fürst des Friedens.",
    seasons: ['christmas'], feast: "Christmas",
  },
  {
    referenceEn: "Titus 2:11", referenceDe: "Tit 2,11", book: "Titus",
    textEn: "For the grace of God our Saviour hath appeared to all men.",
    textDe: "Denn die Gnade Gottes ist erschienen, die allen Menschen Heil bringt.",
    seasons: ['christmas'],
  },
  {
    referenceEn: "Matthew 2:2", referenceDe: "Mt 2,2", book: "Matthew",
    textEn: "Where is he that is born king of the Jews? For we have seen his star in the east, and are come to adore him.",
    textDe: "Wo ist der neugeborene König der Juden? Wir haben seinen Stern aufgehen sehen und sind gekommen, ihm zu huldigen.",
    seasons: ['christmas'], feast: "Epiphany",
  },
  {
    referenceEn: "Luke 2:7", referenceDe: "Lk 2,7", book: "Luke",
    textEn: "And she brought forth her firstborn son, and wrapped him up in swaddling clothes, and laid him in a manger; because there was no room for them in the inn.",
    textDe: "Sie gebar ihren Sohn, den Erstgeborenen. Sie wickelte ihn in Windeln und legte ihn in eine Krippe, weil in der Herberge kein Platz für sie war.",
    seasons: ['christmas'], feast: "Christmas",
  },
  {
    referenceEn: "Psalm 98:1", referenceDe: "Ps 98,1", book: "Psalms",
    textEn: "Sing ye to the Lord a new canticle: because he hath done wonderful things. His right hand hath wrought for him salvation, and his arm is holy.",
    textDe: "Singt dem Herrn ein neues Lied, denn er hat Wunder getan! Sieg schuf ihm seine Rechte, sein heiliger Arm.",
    seasons: ['christmas', 'easter'],
  },

  // LENT
  {
    referenceEn: "Matthew 4:4", referenceDe: "Mt 4,4", book: "Matthew",
    textEn: "Not in bread alone doth man live, but in every word that proceedeth from the mouth of God.",
    textDe: "Der Mensch lebt nicht vom Brot allein, sondern von jedem Wort, das aus dem Mund Gottes kommt.",
    seasons: ['lent'],
  },
  {
    referenceEn: "Joel 2:12–13", referenceDe: "Joel 2,12–13", book: "Joel",
    textEn: "Now therefore saith the Lord: Be converted to me with all your heart, in fasting, and in weeping, and mourning. And rend your hearts, and not your garments, and turn to the Lord your God: for he is gracious and merciful.",
    textDe: "Doch auch jetzt noch — Spruch des Herrn — kehrt um zu mir von ganzem Herzen, mit Fasten, Weinen und Klagen! Zerreißt eure Herzen, nicht eure Kleider! Kehrt um zum Herrn, eurem Gott, denn er ist gnädig und barmherzig.",
    seasons: ['lent'],
  },
  {
    referenceEn: "Psalm 51:1–2", referenceDe: "Ps 51,3–4", book: "Psalms",
    textEn: "Have mercy on me, O God, according to thy great mercy. And according to the multitude of thy tender mercies blot out my iniquity. Wash me yet more from my iniquity, and cleanse me from my sin.",
    textDe: "Gott, sei mir gnädig nach deiner Huld, tilge meine Frevel nach deinem reichen Erbarmen! Wasche meine Schuld von mir ab und mach mich rein von meiner Sünde!",
    seasons: ['lent'],
  },
  {
    referenceEn: "2 Corinthians 6:2", referenceDe: "2 Kor 6,2", book: "2 Corinthians",
    textEn: "Behold, now is the acceptable time; behold, now is the day of salvation.",
    textDe: "Jetzt ist der günstige Augenblick, jetzt ist der Tag der Rettung!",
    seasons: ['lent', 'ordinary'],
  },
  {
    referenceEn: "Matthew 6:6", referenceDe: "Mt 6,6", book: "Matthew",
    textEn: "But thou when thou shalt pray, enter into thy chamber, and having shut the door, pray to thy Father in secret: and thy Father who seeth in secret will repay thee.",
    textDe: "Du aber, wenn du betest, geh in dein Zimmer, schließ die Tür und bete zu deinem Vater, der im Verborgenen ist; und dein Vater, der ins Verborgene sieht, wird es dir vergelten.",
    seasons: ['lent', 'ordinary'],
  },
  {
    referenceEn: "Matthew 6:17–18", referenceDe: "Mt 6,17–18", book: "Matthew",
    textEn: "But thou, when thou fastest, anoint thy head, and wash thy face; that thou appear not to men to fast, but to thy Father who is in secret: and thy Father who seeth in secret, will repay thee.",
    textDe: "Du aber salbe beim Fasten dein Haar und wasch dein Gesicht, damit die Menschen nicht merken, dass du fastest, sondern nur dein Vater, der im Verborgenen ist.",
    seasons: ['lent'],
  },
  {
    referenceEn: "Isaiah 58:6–7", referenceDe: "Jes 58,6–7", book: "Isaiah",
    textEn: "Loose the bands of wickedness, undo the bundles that oppress, let them that are broken go free. Deal thy bread to the hungry, and bring the needy and the harbourless into thy house.",
    textDe: "Löse die Fesseln des Unrechts, mach die Stricke des Jochs los, entlasse die Versklavten in die Freiheit! Brich dem Hungrigen dein Brot, und die heimatlosen Armen nimm in dein Haus auf!",
    seasons: ['lent'],
  },
  {
    referenceEn: "John 3:16", referenceDe: "Joh 3,16", book: "John",
    textEn: "For God so loved the world, as to give his only begotten Son; that whosoever believeth in him, may not perish, but may have life everlasting.",
    textDe: "Denn so sehr hat Gott die Welt geliebt, dass er seinen einzigen Sohn hingab, damit jeder, der an ihn glaubt, nicht verloren geht, sondern das ewige Leben hat.",
    seasons: ['lent', 'easter', 'ordinary'],
  },
  {
    referenceEn: "Luke 15:7", referenceDe: "Lk 15,7", book: "Luke",
    textEn: "I say to you, that even so there shall be joy in heaven upon one sinner that doth penance, more than upon ninety-nine just who need not penance.",
    textDe: "Ich sage euch: So wird auch im Himmel mehr Freude herrschen über einen einzigen Sünder, der umkehrt, als über neunundneunzig Gerechte, die keine Umkehr nötig haben.",
    seasons: ['lent'],
  },
  {
    referenceEn: "Sirach 17:24", referenceDe: "Sir 17,24", book: "Sirach",
    textEn: "But to the penitent he hath given the way of justice, and he hath strengthened them that were fainting in patience.",
    textDe: "Den Umkehrenden aber zeigt er den Weg der Gerechtigkeit, und er stärkt die, die den Mut verloren haben.",
    seasons: ['lent'],
  },
  {
    referenceEn: "Matthew 5:6", referenceDe: "Mt 5,6", book: "Matthew",
    textEn: "Blessed are they that hunger and thirst after justice: for they shall have their fill.",
    textDe: "Selig, die hungern und dürsten nach der Gerechtigkeit; denn sie werden satt werden.",
    seasons: ['lent', 'ordinary'],
  },
  {
    referenceEn: "1 John 1:9", referenceDe: "1 Joh 1,9", book: "1 John",
    textEn: "If we confess our sins, he is faithful and just, to forgive us our sins, and to cleanse us from all iniquity.",
    textDe: "Wenn wir unsere Sünden bekennen, ist er treu und gerecht; er vergibt uns die Sünden und reinigt uns von allem Unrecht.",
    seasons: ['lent'],
  },
  {
    referenceEn: "Psalm 130:1–2", referenceDe: "Ps 130,1–2", book: "Psalms",
    textEn: "Out of the depths I have cried to thee, O Lord: Lord, hear my voice. Let thy ears be attentive to the voice of my supplication.",
    textDe: "Aus der Tiefe rufe ich, Herr, zu dir: Herr, höre meine Stimme! Wende dein Ohr mir zu, achte auf mein lautes Flehen!",
    seasons: ['lent'],
  },
  {
    referenceEn: "Romans 5:8", referenceDe: "Röm 5,8", book: "Romans",
    textEn: "But God commendeth his charity towards us; because when as yet we were sinners, according to the time, Christ died for us.",
    textDe: "Gott aber erweist seine Liebe zu uns darin, dass Christus für uns gestorben ist, als wir noch Sünder waren.",
    seasons: ['lent'],
  },
  {
    referenceEn: "Luke 9:23", referenceDe: "Lk 9,23", book: "Luke",
    textEn: "If any man will come after me, let him deny himself, and take up his cross daily, and follow me.",
    textDe: "Wer mir nachfolgen will, der verleugne sich selbst, nehme täglich sein Kreuz auf sich und folge mir nach.",
    seasons: ['lent'],
  },

  // EASTER
  {
    referenceEn: "1 Corinthians 15:20", referenceDe: "1 Kor 15,20", book: "1 Corinthians",
    textEn: "But now Christ is risen from the dead, the firstfruits of them that sleep.",
    textDe: "Nun aber ist Christus von den Toten auferweckt worden, als Erstling der Entschlafenen.",
    seasons: ['easter'], feast: "Easter",
  },
  {
    referenceEn: "John 11:25–26", referenceDe: "Joh 11,25–26", book: "John",
    textEn: "I am the resurrection and the life: he that believeth in me, although he be dead, shall live: And every one that liveth, and believeth in me, shall not die for ever.",
    textDe: "Ich bin die Auferstehung und das Leben. Wer an mich glaubt, wird leben, auch wenn er stirbt. Und jeder, der lebt und an mich glaubt, wird in Ewigkeit nicht sterben.",
    seasons: ['easter'],
  },
  {
    referenceEn: "Matthew 28:5–6", referenceDe: "Mt 28,5–6", book: "Matthew",
    textEn: "Fear not you; for I know that you seek Jesus who was crucified. He is not here, for he is risen, as he said.",
    textDe: "Ihr braucht euch nicht zu fürchten. Ich weiß, dass ihr Jesus, den Gekreuzigten, sucht. Er ist nicht hier; denn er ist auferstanden, wie er gesagt hat.",
    seasons: ['easter'], feast: "Easter",
  },
  {
    referenceEn: "Romans 6:4", referenceDe: "Röm 6,4", book: "Romans",
    textEn: "For we are buried together with him by baptism into death; that as Christ is risen from the dead by the glory of the Father, so we also may walk in newness of life.",
    textDe: "Wir wurden mit ihm begraben durch die Taufe auf den Tod; und wie Christus durch die Herrlichkeit des Vaters von den Toten auferweckt wurde, so sollen auch wir als neue Menschen leben.",
    seasons: ['easter'],
  },
  {
    referenceEn: "Revelation 1:17–18", referenceDe: "Offb 1,17–18", book: "Revelation",
    textEn: "Fear not. I am the First and the Last, and alive, and was dead, and behold I am living for ever and ever, and have the keys of death and of hell.",
    textDe: "Ich bin der Erste und der Letzte und der Lebendige. Ich war tot, doch nun lebe ich in alle Ewigkeit und habe die Schlüssel des Todes und der Unterwelt.",
    seasons: ['easter'],
  },
  {
    referenceEn: "John 20:19", referenceDe: "Joh 20,19", book: "John",
    textEn: "Peace be to you. And when he had said this, he shewed them his hands and his side. The disciples therefore were glad, when they saw the Lord.",
    textDe: "Friede sei mit euch! Dabei zeigte er ihnen seine Hände und seine Seite. Da freuten sich die Jünger, als sie den Herrn sahen.",
    seasons: ['easter'],
  },
  {
    referenceEn: "Luke 24:34", referenceDe: "Lk 24,34", book: "Luke",
    textEn: "The Lord is risen indeed, and hath appeared to Simon.",
    textDe: "Der Herr ist wirklich auferstanden und dem Simon erschienen.",
    seasons: ['easter'], feast: "Easter",
  },
  {
    referenceEn: "Acts 2:24", referenceDe: "Apg 2,24", book: "Acts",
    textEn: "Whom God hath raised up, having loosed the sorrows of hell, as it was impossible that he should be holden by it.",
    textDe: "Gott aber hat ihn auferweckt und die Schmerzen des Todes gelöst, weil es unmöglich war, dass er vom Tod festgehalten wurde.",
    seasons: ['easter'],
  },
  {
    referenceEn: "1 Peter 1:3", referenceDe: "1 Petr 1,3", book: "1 Peter",
    textEn: "Blessed be the God and Father of our Lord Jesus Christ, who according to his great mercy hath regenerated us unto a lively hope, by the resurrection of Jesus Christ from the dead.",
    textDe: "Gelobt sei der Gott und Vater unseres Herrn Jesus Christus! Er hat uns in seinem großen Erbarmen neu geboren zu einer lebendigen Hoffnung durch die Auferstehung Jesu Christi von den Toten.",
    seasons: ['easter'],
  },
  {
    referenceEn: "Colossians 3:1", referenceDe: "Kol 3,1", book: "Colossians",
    textEn: "Therefore, if you be risen with Christ, seek the things that are above; where Christ is sitting at the right hand of God.",
    textDe: "Ihr seid mit Christus auferweckt worden; darum strebt nach dem, was oben ist, wo Christus zur Rechten Gottes sitzt.",
    seasons: ['easter'],
  },
  {
    referenceEn: "John 10:10", referenceDe: "Joh 10,10", book: "John",
    textEn: "I am come that they may have life, and may have it more abundantly.",
    textDe: "Ich bin gekommen, damit sie das Leben haben und es in Fülle haben.",
    seasons: ['easter', 'ordinary'],
  },
  {
    referenceEn: "Psalm 118:24", referenceDe: "Ps 118,24", book: "Psalms",
    textEn: "This is the day which the Lord hath made: let us be glad and rejoice therein.",
    textDe: "Dies ist der Tag, den der Herr gemacht hat; wir wollen jubeln und uns an ihm freuen.",
    seasons: ['easter', 'ordinary'],
  },

  // PENTECOST
  {
    referenceEn: "Acts 2:1–4", referenceDe: "Apg 2,1–4", book: "Acts",
    textEn: "And when the days of the Pentecost were accomplished, they were all together in one place. And suddenly there came a sound from heaven, as of a mighty wind coming, and it filled the whole house where they were sitting. And there appeared to them parted tongues as it were of fire.",
    textDe: "Als der Pfingsttag gekommen war, befanden sich alle an einem Ort. Da kam plötzlich vom Himmel ein Brausen wie von einem heftigen Sturm und erfüllte das ganze Haus. Und es erschienen ihnen Zungen wie von Feuer.",
    seasons: ['pentecost'], feast: "Pentecost",
  },
  {
    referenceEn: "John 14:16–17", referenceDe: "Joh 14,16–17", book: "John",
    textEn: "And I will ask the Father, and he shall give you another Paraclete, that he may abide with you for ever. The spirit of truth, whom the world cannot receive.",
    textDe: "Ich werde den Vater bitten, und er wird euch einen anderen Beistand geben, der für immer bei euch bleiben soll: den Geist der Wahrheit, den die Welt nicht empfangen kann.",
    seasons: ['pentecost', 'ordinary'],
  },
  {
    referenceEn: "Galatians 5:22–23", referenceDe: "Gal 5,22–23", book: "Galatians",
    textEn: "But the fruit of the Spirit is, charity, joy, peace, patience, benignity, goodness, longanimity, mildness, faith, modesty, continency, chastity.",
    textDe: "Die Frucht des Geistes aber ist: Liebe, Freude, Friede, Langmut, Freundlichkeit, Güte, Treue, Sanftmut und Selbstbeherrschung.",
    seasons: ['pentecost', 'ordinary'],
  },
  {
    referenceEn: "John 20:22", referenceDe: "Joh 20,22", book: "John",
    textEn: "He said to them: Receive ye the Holy Ghost.",
    textDe: "Empfangt den Heiligen Geist!",
    seasons: ['pentecost'], feast: "Pentecost",
  },
  {
    referenceEn: "Romans 8:26", referenceDe: "Röm 8,26", book: "Romans",
    textEn: "Likewise the Spirit also helpeth our infirmity. For we know not what we should pray for as we ought; but the Spirit himself asketh for us with unspeakable groanings.",
    textDe: "Ebenso nimmt sich der Geist unserer Schwachheit an. Denn wir wissen nicht, worum wir in rechter Weise beten sollen; der Geist selber aber tritt für uns ein mit Seufzen, das sich nicht in Worte fassen lässt.",
    seasons: ['pentecost', 'ordinary'],
  },

  // ORDINARY TIME
  {
    referenceEn: "Matthew 5:3", referenceDe: "Mt 5,3", book: "Matthew",
    textEn: "Blessed are the poor in spirit: for theirs is the kingdom of heaven.",
    textDe: "Selig, die arm sind vor Gott; denn ihnen gehört das Himmelreich.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Matthew 5:8", referenceDe: "Mt 5,8", book: "Matthew",
    textEn: "Blessed are the clean of heart: for they shall see God.",
    textDe: "Selig, die ein reines Herz haben; denn sie werden Gott schauen.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Matthew 5:9", referenceDe: "Mt 5,9", book: "Matthew",
    textEn: "Blessed are the peacemakers: for they shall be called the children of God.",
    textDe: "Selig, die Frieden stiften; denn sie werden Söhne Gottes genannt werden.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Matthew 6:33", referenceDe: "Mt 6,33", book: "Matthew",
    textEn: "Seek ye therefore first the kingdom of God, and his justice, and all these things shall be added unto you.",
    textDe: "Sucht zuerst das Reich Gottes und seine Gerechtigkeit; dann wird euch alles andere dazugegeben.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Matthew 11:28–29", referenceDe: "Mt 11,28–29", book: "Matthew",
    textEn: "Come to me, all you that labour, and are burdened, and I will refresh you. Take up my yoke upon you, and learn of me, because I am meek, and humble of heart.",
    textDe: "Kommt alle zu mir, die ihr euch abmüht und unter Lasten leidet; ich will euch Erquickung geben. Nehmt mein Joch auf euch und lernt von mir, denn ich bin sanftmütig und demütig von Herzen.",
    seasons: ['ordinary', 'lent'],
  },
  {
    referenceEn: "Matthew 22:37–39", referenceDe: "Mt 22,37–39", book: "Matthew",
    textEn: "Thou shalt love the Lord thy God with thy whole heart, and with thy whole soul, and with thy whole mind. This is the greatest and the first commandment. And the second is like to this: Thou shalt love thy neighbour as thyself.",
    textDe: "Du sollst den Herrn, deinen Gott, lieben mit ganzem Herzen, mit ganzer Seele und mit deinem ganzen Denken. Das ist das wichtigste und erste Gebot. Das zweite ist ebenso wichtig: Du sollst deinen Nächsten lieben wie dich selbst.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "John 14:6", referenceDe: "Joh 14,6", book: "John",
    textEn: "I am the way, and the truth, and the life. No man cometh to the Father, but by me.",
    textDe: "Ich bin der Weg und die Wahrheit und das Leben; niemand kommt zum Vater außer durch mich.",
    seasons: ['ordinary', 'easter'],
  },
  {
    referenceEn: "John 15:12", referenceDe: "Joh 15,12", book: "John",
    textEn: "This is my commandment, that you love one another, as I have loved you.",
    textDe: "Das ist mein Gebot: Liebt einander, so wie ich euch geliebt habe.",
    seasons: ['ordinary', 'easter'],
  },
  {
    referenceEn: "John 15:5", referenceDe: "Joh 15,5", book: "John",
    textEn: "I am the vine; you the branches: he that abideth in me, and I in him, the same beareth much fruit: for without me you can do nothing.",
    textDe: "Ich bin der Weinstock, ihr seid die Reben. Wer in mir bleibt und in wem ich bleibe, der bringt reiche Frucht; denn getrennt von mir könnt ihr nichts vollbringen.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Romans 8:28", referenceDe: "Röm 8,28", book: "Romans",
    textEn: "And we know that to them that love God, all things work together unto good, to such as, according to his purpose, are called to be saints.",
    textDe: "Wir wissen, dass Gott bei denen, die ihn lieben, alles zum Guten führt, bei denen, die nach seinem ewigen Plan berufen sind.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Romans 8:38–39", referenceDe: "Röm 8,38–39", book: "Romans",
    textEn: "For I am sure that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come, nor height, nor depth, nor any other creature, shall be able to separate us from the love of God.",
    textDe: "Denn ich bin überzeugt, dass weder Tod noch Leben, weder Engel noch Mächte, weder Gegenwärtiges noch Zukünftiges, noch irgendein anderes Geschöpf uns von der Liebe Gottes scheiden kann.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Philippians 4:13", referenceDe: "Phil 4,13", book: "Philippians",
    textEn: "I can do all these things in him who strengtheneth me.",
    textDe: "Ich vermag alles durch ihn, der mir Kraft gibt.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Philippians 4:6–7", referenceDe: "Phil 4,6–7", book: "Philippians",
    textEn: "Be nothing solicitous; but in every thing, by prayer and supplication, with thanksgiving, let your petitions be made known to God. And the peace of God, which surpasseth all understanding, keep your hearts and minds in Christ Jesus.",
    textDe: "Macht euch um nichts Sorgen, sondern bringt in jeder Lage betend und flehend eure Bitten mit Dankgebet vor Gott! Und der Friede Gottes, der allen Verstand übersteigt, wird eure Herzen und eure Gedanken in Christus Jesus bewahren.",
    seasons: ['ordinary', 'advent'],
  },
  {
    referenceEn: "1 Corinthians 13:4–7", referenceDe: "1 Kor 13,4–7", book: "1 Corinthians",
    textEn: "Charity is patient, is kind: charity envieth not, dealeth not perversely; is not puffed up; is not ambitious, seeketh not her own, is not provoked to anger, thinketh no evil.",
    textDe: "Die Liebe ist langmütig, die Liebe ist gütig. Sie ereifert sich nicht, sie prahlt nicht, sie bläht sich nicht auf. Sie handelt nicht ungehörig, sucht nicht ihren Vorteil, lässt sich nicht zum Zorn reizen, trägt das Böse nicht nach.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Proverbs 3:5–6", referenceDe: "Spr 3,5–6", book: "Proverbs",
    textEn: "Have confidence in the Lord with all thy heart, and lean not upon thy own prudence. In all thy ways think on him, and he will direct thy steps.",
    textDe: "Vertrau auf den Herrn mit deinem ganzen Herzen und stütze dich nicht auf dein eigenes Verstehen. Denk auf all deinen Wegen an ihn, dann ebnet er deine Pfade.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Psalm 23:1–3", referenceDe: "Ps 23,1–3", book: "Psalms",
    textEn: "The Lord ruleth me: and I shall want nothing. He hath set me in a place of pasture. He hath brought me up, on the water of refreshment: He hath converted my soul.",
    textDe: "Der Herr ist mein Hirt, nichts wird mir fehlen. Er lässt mich lagern auf grünen Auen und führt mich zum Ruheplatz am Wasser. Er stillt mein Verlangen.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Psalm 27:1", referenceDe: "Ps 27,1", book: "Psalms",
    textEn: "The Lord is my light and my salvation, whom shall I fear? The Lord is the protector of my life: of whom shall I be afraid?",
    textDe: "Der Herr ist mein Licht und mein Heil — wen sollte ich fürchten? Der Herr ist die Schutzfeste meines Lebens — vor wem sollte mir bangen?",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Psalm 46:1–2", referenceDe: "Ps 46,1–2", book: "Psalms",
    textEn: "God is our refuge and strength; a helper in troubles, which have found us exceedingly. Therefore we will not fear, when the earth shall be troubled.",
    textDe: "Gott ist unsere Zuflucht und unsere Kraft, als Helfer in Nöten hat er sich bewährt. Darum fürchten wir uns nicht, wenn auch die Erde weicht.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Psalm 121:1–2", referenceDe: "Ps 121,1–2", book: "Psalms",
    textEn: "I have lifted up my eyes to the mountains, from whence help shall come to me. My help is from the Lord, who made heaven and earth.",
    textDe: "Ich hebe meine Augen auf zu den Bergen: Woher kommt mir Hilfe? Meine Hilfe kommt vom Herrn, der Himmel und Erde gemacht hat.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Jeremiah 29:11", referenceDe: "Jer 29,11", book: "Jeremiah",
    textEn: "For I know the thoughts that I think towards you, saith the Lord, thoughts of peace, and not of affliction, to give you an end and patience.",
    textDe: "Ich weiß wohl, welche Pläne ich für euch habe — Spruch des Herrn: Pläne zum Heil und nicht zum Unheil, um euch eine Zukunft und eine Hoffnung zu geben.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Isaiah 41:10", referenceDe: "Jes 41,10", book: "Isaiah",
    textEn: "Fear not, for I am with thee: turn not aside, for I am thy God: I have strengthened thee, and have helped thee.",
    textDe: "Fürchte dich nicht, denn ich bin mit dir; hab keine Angst, denn ich bin dein Gott. Ich stärke dich, ich helfe dir, ich halte dich mit meiner siegreichen Rechten.",
    seasons: ['ordinary', 'advent'],
  },
  {
    referenceEn: "Joshua 1:9", referenceDe: "Jos 1,9", book: "Joshua",
    textEn: "Behold I command thee, take courage, and be strong. Fear not and be not dismayed: because the Lord thy God is with thee in all places whithersoever thou shalt go.",
    textDe: "Sei stark und mutig! Lass dich nicht erschrecken und entmutigen, denn der Herr, dein Gott, ist mit dir, wohin du auch gehst.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Wisdom 6:12", referenceDe: "Weish 6,12", book: "Wisdom",
    textEn: "Wisdom is glorious, and never fadeth away, and is easily seen by them that love her, and is found by them that seek her.",
    textDe: "Die Weisheit glänzt und verwelkt nicht; leicht lässt sie sich finden von denen, die sie lieben, und finden lassen von denen, die sie suchen.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Wisdom 7:26", referenceDe: "Weish 7,26", book: "Wisdom",
    textEn: "For she is the brightness of eternal light, and the unspotted mirror of God's majesty, and the image of his goodness.",
    textDe: "Sie ist der Glanz des ewigen Lichtes, der ungetrübte Spiegel der Kraft Gottes und das Abbild seiner Güte.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Sirach 1:1", referenceDe: "Sir 1,1", book: "Sirach",
    textEn: "All wisdom is from the Lord God, and hath been always with him, and is before all time.",
    textDe: "Alle Weisheit kommt vom Herrn; sie ist bei ihm in Ewigkeit.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Sirach 2:1", referenceDe: "Sir 2,1", book: "Sirach",
    textEn: "Son, when thou comest to the service of God, stand in justice and in fear, and prepare thy soul for temptation.",
    textDe: "Wenn du in den Dienst Gottes trittst, mein Sohn, dann rüste dich zur Versuchung.",
    seasons: ['ordinary', 'lent'],
  },
  {
    referenceEn: "Sirach 3:17", referenceDe: "Sir 3,17", book: "Sirach",
    textEn: "Son, do thy works in meekness, and thou shalt be beloved above the glory of men.",
    textDe: "Vollbringe deine Werke in Sanftmut, mein Sohn, und du wirst geliebt werden mehr als einer, der Gaben austeilt.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Tobit 4:15", referenceDe: "Tob 4,15", book: "Tobit",
    textEn: "See thou never do to another what thou wouldst hate to have done to thee by another.",
    textDe: "Was dir selbst verhasst ist, das tue auch einem anderen nicht an.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Tobit 12:8", referenceDe: "Tob 12,8", book: "Tobit",
    textEn: "Prayer is good with fasting and alms more than to lay up treasures of gold: For alms delivereth from death, and purgeth away sins.",
    textDe: "Gebet mit Fasten ist gut, Almosen geben mit Gerechtigkeit ist besser als Reichtümer anhäufen. Almosen errettet vom Tod und reinigt von jeder Sünde.",
    seasons: ['lent', 'ordinary'],
  },
  {
    referenceEn: "2 Maccabees 12:46", referenceDe: "2 Makk 12,46", book: "2 Maccabees",
    textEn: "It is therefore a holy and wholesome thought to pray for the dead, that they may be loosed from sins.",
    textDe: "Es ist also ein heiliger und heilsamer Gedanke, für die Verstorbenen zu beten, damit sie von ihren Sünden befreit werden.",
    seasons: ['ordinary'], feast: "All Souls Day",
  },
  {
    referenceEn: "James 1:17", referenceDe: "Jak 1,17", book: "James",
    textEn: "Every best gift, and every perfect gift, is from above, coming down from the Father of lights, with whom there is no change, nor shadow of alteration.",
    textDe: "Jede gute Gabe und jedes vollkommene Geschenk kommt von oben, vom Vater der Lichter, bei dem es keine Veränderung gibt.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "James 5:16", referenceDe: "Jak 5,16", book: "James",
    textEn: "Confess therefore your sins one to another: and pray one for another, that you may be saved. For the continual prayer of a just man availeth much.",
    textDe: "Bekennt einander eure Sünden und betet füreinander, damit ihr geheilt werdet. Das Gebet eines Gerechten vermag viel und ist wirkungsvoll.",
    seasons: ['ordinary', 'lent'],
  },
  {
    referenceEn: "1 Peter 5:7", referenceDe: "1 Petr 5,7", book: "1 Peter",
    textEn: "Casting all your care upon him, for he hath care of you.",
    textDe: "Werft alle eure Sorgen auf ihn; denn er sorgt sich um euch.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Hebrews 11:1", referenceDe: "Hebr 11,1", book: "Hebrews",
    textEn: "Now faith is the substance of things to be hoped for, the evidence of things that appear not.",
    textDe: "Glaube ist die Grundlage von allem, was wir erhoffen, ein Beweis für die Wirklichkeit dessen, was wir nicht sehen.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Hebrews 12:1", referenceDe: "Hebr 12,1", book: "Hebrews",
    textEn: "Therefore we also having so great a cloud of witnesses over our head, laying aside every weight and sin which surrounds us, let us run by patience to the fight proposed to us.",
    textDe: "Auch wir — eine solche Wolke von Zeugen umgibt uns — wollen jede Last und die Sünde ablegen und mit Ausdauer kämpfen in dem Wettrennen, das uns aufgetragen ist.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Ephesians 6:11", referenceDe: "Eph 6,11", book: "Ephesians",
    textEn: "Put you on the armour of God, that you may be able to stand against the deceits of the devil.",
    textDe: "Legt die Waffenrüstung Gottes an, damit ihr den Nachstellungen des Teufels standhalten könnt.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Colossians 3:17", referenceDe: "Kol 3,17", book: "Colossians",
    textEn: "All whatsoever you do in word or in work, do all in the name of the Lord Jesus Christ, giving thanks to God and the Father by him.",
    textDe: "Alles, was ihr in Worten und Werken tut, tut es im Namen des Herrn Jesus und dankt Gott, dem Vater, durch ihn.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "1 Thessalonians 5:16–18", referenceDe: "1 Thess 5,16–18", book: "1 Thessalonians",
    textEn: "Always rejoice. Pray without ceasing. In all things give thanks; for this is the will of God in Christ Jesus concerning you all.",
    textDe: "Freut euch zu jeder Zeit! Betet ohne Unterlass! Dankt für alles; denn das ist der Wille Gottes für euch in Christus Jesus.",
    seasons: ['ordinary'],
  },
  {
    referenceEn: "Baruch 3:14", referenceDe: "Bar 3,14", book: "Baruch",
    textEn: "Learn where is wisdom, where is strength, where is understanding: that thou mayest know also where is length of days and life, where is the light of the eyes, and peace.",
    textDe: "Lerne, wo Einsicht ist, wo Kraft, wo Klugheit — damit du auch erfährst, wo langes Leben ist, wo Licht der Augen und Frieden.",
    seasons: ['ordinary', 'advent'],
  },
  {
    referenceEn: "Revelation 21:4", referenceDe: "Offb 21,4", book: "Revelation",
    textEn: "And God shall wipe away all tears from their eyes: and death shall be no more, nor mourning, nor crying, nor sorrow shall be any more, for the former things are passed away.",
    textDe: "Er wird alle Tränen von ihren Augen abwischen. Der Tod wird nicht mehr sein, keine Trauer, kein Geschrei, keine Mühsal wird mehr sein; denn was früher war, ist vergangen.",
    seasons: ['easter', 'ordinary'],
  },
  {
    referenceEn: "Isaiah 43:1", referenceDe: "Jes 43,1", book: "Isaiah",
    textEn: "Fear not, for I have redeemed thee, and called thee by thy name: thou art mine.",
    textDe: "Fürchte dich nicht, denn ich habe dich ausgelöst, ich habe dich bei deinem Namen gerufen, du gehörst mir.",
    seasons: ['ordinary', 'christmas'],
  },
  {
    referenceEn: "Matthew 28:20", referenceDe: "Mt 28,20", book: "Matthew",
    textEn: "Teaching them to observe all things whatsoever I have commanded you: and behold I am with you all days, even to the consummation of the world.",
    textDe: "Und habt Acht: Ich bin bei euch alle Tage bis zum Ende der Welt.",
    seasons: ['easter', 'ordinary'],
  },
];

// ─── Public API ───────────────────────────────────────────────────────────────

export function getVersesForSeason(season: LiturgicalSeason, lang: BibleLanguage = 'en'): BibleVerse[] {
  const source = BILINGUAL_VERSES.filter(v => v.seasons.includes(season));
  const pool = source.length > 0 ? source : BILINGUAL_VERSES.filter(v => v.seasons.includes('ordinary'));
  return pool.map(v => resolveLang(v, lang));
}

export function getRandomVerseForToday(lang: BibleLanguage = 'en'): BibleVerse {
  const season = getLiturgicalSeason();
  const feast = checkFeastDay();
  const pool = BILINGUAL_VERSES.filter(v => v.seasons.includes(season));
  const candidates = pool.length > 0 ? pool : BILINGUAL_VERSES.filter(v => v.seasons.includes('ordinary'));

  if (feast) {
    const feastVerses = candidates.filter(v =>
      v.feast && feast.toLowerCase().includes(v.feast.toLowerCase().split(' ')[0]),
    );
    if (feastVerses.length > 0) {
      const picked = feastVerses[Math.floor(Math.random() * feastVerses.length)];
      return resolveLang(picked, lang);
    }
  }

  const day = getDayOfYear(new Date());
  return resolveLang(candidates[day % candidates.length], lang);
}

export function getVerseForTime(time: 'morning' | 'noon' | 'evening', lang: BibleLanguage = 'en'): BibleVerse {
  const season = getLiturgicalSeason();
  const pool = BILINGUAL_VERSES.filter(v => v.seasons.includes(season));
  const candidates = pool.length > 0 ? pool : BILINGUAL_VERSES.filter(v => v.seasons.includes('ordinary'));
  const day = getDayOfYear(new Date());
  const offset = time === 'morning' ? 0
    : time === 'noon' ? Math.floor(candidates.length / 3)
    : Math.floor((candidates.length * 2) / 3);
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

  const timeLabels: Record<BibleLanguage, Record<string, string>> = {
    en: { morning: 'Morning Prayer', noon: 'Noon Prayer', evening: 'Evening Prayer' },
    de: { morning: 'Morgengebet',    noon: 'Mittagsgebet', evening: 'Abendgebet'    },
  };

  const title = feast
    ? `KAIROS · ${feast}`
    : `KAIROS · ${timeLabels[lang][time]} — ${getLiturgicalSeasonLabel(season, lang)}`;

  const quote = lang === 'en' ? '"' : '„';
  const quoteClose = lang === 'en' ? '"' : '"';
  const body = `${quote}${verse.text}${quoteClose}\n— ${verse.reference}`;

  return { title, body };
}
