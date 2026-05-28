// Catholic Bible service
// Verses from the Douay-Rheims Bible (1899 American Edition) — public domain.
// Includes all 73 books of the Catholic canon, including Deuterocanonical books
// (Tobit, Judith, 1 & 2 Maccabees, Wisdom, Sirach, Baruch).

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

// ─── Liturgical Calendar ────────────────────────────────────────────────────

function getEasterDate(year: number): Date {
  // Anonymous Gregorian algorithm
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
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed
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

  // Advent: starts 4 Sundays before Dec 25
  // Find the Sunday on or before Nov 30 (closest to St Andrew's day)
  const dec25 = new Date(year, 11, 25);
  const dayOfWeek = dec25.getDay(); // 0=Sun
  const adventStart = new Date(year, 11, 25 - dayOfWeek - 21); // 3 full weeks back to first Sunday

  // Christmas: Dec 25 to Jan 13 (Baptism of the Lord)
  const christmasEnd = new Date(year + 1, 0, 13);
  const christmasStart = new Date(year, 11, 25);

  // Jan 1 - Jan 13 belongs to Christmas of the *previous* year's cycle
  const prevYearChristmasStart = new Date(year - 1, 11, 25);
  const currentYearChristmasEnd = new Date(year, 0, 13);

  // Lent: Ash Wednesday to Holy Saturday
  const holySaturday = addDays(easter, -1);

  // Easter season: Easter Sunday to day before Pentecost
  const easterEnd = addDays(pentecost, -1);

  if (date >= prevYearChristmasStart || date <= currentYearChristmasEnd) {
    return 'christmas';
  }
  if (date >= adventStart && date <= new Date(year, 11, 24)) {
    return 'advent';
  }
  if (date >= christmasStart && date <= christmasEnd) {
    return 'christmas';
  }
  if (date >= ashWednesday && date <= holySaturday) {
    return 'lent';
  }
  if (isSameDate(date, pentecost)) {
    return 'pentecost';
  }
  if (date >= easter && date <= easterEnd) {
    return 'easter';
  }
  return 'ordinary';
}

export function getLiturgicalSeasonLabel(season: LiturgicalSeason): string {
  const labels: Record<LiturgicalSeason, string> = {
    advent: 'Season of Advent',
    christmas: 'Christmas Season',
    ordinary: 'Ordinary Time',
    lent: 'Season of Lent',
    easter: 'Easter Season',
    pentecost: 'Pentecost',
  };
  return labels[season];
}

export function checkFeastDay(date: Date = new Date()): string | null {
  const m = date.getMonth() + 1; // 1-indexed
  const d = date.getDate();

  const feasts: [number, number, string][] = [
    [1, 1, "Solemnity of Mary, Mother of God"],
    [1, 6, "Feast of the Epiphany"],
    [2, 2, "Feast of the Presentation of the Lord (Candlemas)"],
    [2, 14, "Feast of Saints Cyril and Methodius"],
    [3, 19, "Solemnity of Saint Joseph"],
    [3, 25, "Solemnity of the Annunciation of the Lord"],
    [4, 23, "Feast of Saint George"],
    [5, 1, "Feast of Saint Joseph the Worker"],
    [5, 31, "Feast of the Visitation of the Blessed Virgin Mary"],
    [6, 13, "Feast of Saint Anthony of Padua"],
    [6, 24, "Nativity of Saint John the Baptist"],
    [6, 29, "Solemnity of Saints Peter and Paul"],
    [7, 26, "Feast of Saints Joachim and Anne"],
    [8, 6, "Feast of the Transfiguration of the Lord"],
    [8, 10, "Feast of Saint Lawrence"],
    [8, 15, "Solemnity of the Assumption of the Blessed Virgin Mary"],
    [8, 22, "Feast of the Queenship of Mary"],
    [9, 8, "Feast of the Nativity of the Blessed Virgin Mary"],
    [9, 14, "Feast of the Exaltation of the Holy Cross"],
    [9, 15, "Feast of Our Lady of Sorrows"],
    [9, 29, "Feast of Saints Michael, Gabriel and Raphael (Archangels)"],
    [10, 1, "Feast of Saint Thérèse of Lisieux"],
    [10, 4, "Feast of Saint Francis of Assisi"],
    [10, 7, "Feast of Our Lady of the Rosary"],
    [11, 1, "Solemnity of All Saints"],
    [11, 2, "Commemoration of All the Faithful Departed (All Souls Day)"],
    [11, 9, "Feast of the Dedication of the Lateran Basilica"],
    [11, 21, "Feast of the Presentation of the Blessed Virgin Mary"],
    [11, 22, "Feast of Saint Cecilia"],
    [11, 30, "Feast of Saint Andrew the Apostle"],
    [12, 6, "Feast of Saint Nicholas"],
    [12, 8, "Solemnity of the Immaculate Conception"],
    [12, 12, "Feast of Our Lady of Guadalupe"],
    [12, 25, "Solemnity of the Nativity of the Lord (Christmas)"],
    [12, 26, "Feast of Saint Stephen"],
    [12, 27, "Feast of Saint John the Apostle and Evangelist"],
    [12, 28, "Feast of the Holy Innocents"],
  ];

  for (const [fm, fd, name] of feasts) {
    if (fm === m && fd === d) return name;
  }
  return null;
}

// ─── Catholic Bible Verses ───────────────────────────────────────────────────

export const BIBLE_VERSES: BibleVerse[] = [
  // ADVENT
  {
    reference: "Isaiah 7:14",
    book: "Isaiah",
    text: "Behold a virgin shall conceive, and bear a son, and his name shall be called Emmanuel.",
    seasons: ['advent'],
    feast: "Advent",
  },
  {
    reference: "Isaiah 9:2",
    book: "Isaiah",
    text: "The people that walked in darkness, have seen a great light: to them that dwelt in the region of the shadow of death, light is risen.",
    seasons: ['advent', 'christmas'],
  },
  {
    reference: "Isaiah 40:3",
    book: "Isaiah",
    text: "A voice of one crying in the desert: Prepare ye the way of the Lord, make straight in the wilderness the paths of our God.",
    seasons: ['advent'],
  },
  {
    reference: "Isaiah 11:1",
    book: "Isaiah",
    text: "And there shall come forth a rod out of the root of Jesse, and a flower shall rise up out of his root.",
    seasons: ['advent'],
  },
  {
    reference: "Luke 1:28",
    book: "Luke",
    text: "Hail, full of grace, the Lord is with thee: blessed art thou among women.",
    seasons: ['advent'],
    feast: "Annunciation",
  },
  {
    reference: "Luke 1:38",
    book: "Luke",
    text: "Behold the handmaid of the Lord; be it done to me according to thy word.",
    seasons: ['advent'],
  },
  {
    reference: "Luke 1:46-47",
    book: "Luke",
    text: "My soul doth magnify the Lord. And my spirit hath rejoiced in God my Saviour.",
    seasons: ['advent', 'christmas'],
  },
  {
    reference: "Philippians 4:4-5",
    book: "Philippians",
    text: "Rejoice in the Lord always; again I say, rejoice. Let your modesty be known to all men. The Lord is nigh.",
    seasons: ['advent'],
  },
  {
    reference: "Romans 13:11",
    book: "Romans",
    text: "And that knowing the season; that it is now the hour for us to rise from sleep. For now our salvation is nearer than when we believed.",
    seasons: ['advent'],
  },
  {
    reference: "Zephaniah 3:14-15",
    book: "Zephaniah",
    text: "Give praise, O daughter of Sion: shout, O Israel: be glad, and rejoice with all thy heart, O daughter of Jerusalem. The Lord hath taken away thy judgment, he hath turned away thy enemies.",
    seasons: ['advent'],
  },
  {
    reference: "Micah 5:2",
    book: "Micah",
    text: "And thou Bethlehem Ephrata, art a little one among the thousands of Juda: out of thee shall he come forth unto me that is to be the ruler in Israel.",
    seasons: ['advent', 'christmas'],
  },
  {
    reference: "Isaiah 35:4",
    book: "Isaiah",
    text: "Say to the fainthearted: Take courage, and fear not: behold your God will bring the revenge of recompense: God himself will come and will save you.",
    seasons: ['advent'],
  },

  // CHRISTMAS
  {
    reference: "Luke 2:10-11",
    book: "Luke",
    text: "Fear not; for, behold, I bring you good tidings of great joy, that shall be to all the people: For, this day, is born to you a Saviour, who is Christ the Lord, in the city of David.",
    seasons: ['christmas'],
    feast: "Christmas",
  },
  {
    reference: "Luke 2:14",
    book: "Luke",
    text: "Glory to God in the highest; and on earth peace to men of good will.",
    seasons: ['christmas'],
    feast: "Christmas",
  },
  {
    reference: "John 1:14",
    book: "John",
    text: "And the Word was made flesh, and dwelt among us, and we saw his glory, the glory as it were of the only begotten of the Father, full of grace and truth.",
    seasons: ['christmas'],
  },
  {
    reference: "John 1:1-3",
    book: "John",
    text: "In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him: and without him was made nothing that was made.",
    seasons: ['christmas', 'ordinary'],
  },
  {
    reference: "Isaiah 9:6",
    book: "Isaiah",
    text: "For a CHILD IS BORN to us, and a son is given to us, and the government is upon his shoulder: and his name shall be called Wonderful, Counsellor, God the Mighty, the Father of the world to come, the Prince of Peace.",
    seasons: ['christmas'],
    feast: "Christmas",
  },
  {
    reference: "Titus 2:11",
    book: "Titus",
    text: "For the grace of God our Saviour hath appeared to all men; Instructing us, that, denying ungodliness and worldly desires, we should live soberly, and justly, and godly in this world.",
    seasons: ['christmas'],
  },
  {
    reference: "Matthew 2:2",
    book: "Matthew",
    text: "Where is he that is born king of the Jews? For we have seen his star in the east, and are come to adore him.",
    seasons: ['christmas'],
    feast: "Epiphany",
  },
  {
    reference: "Luke 2:7",
    book: "Luke",
    text: "And she brought forth her firstborn son, and wrapped him up in swaddling clothes, and laid him in a manger; because there was no room for them in the inn.",
    seasons: ['christmas'],
    feast: "Christmas",
  },
  {
    reference: "Psalm 97:1",
    book: "Psalms",
    text: "Sing ye to the Lord a new canticle: because he hath done wonderful things. His right hand hath wrought for him salvation, and his arm is holy.",
    seasons: ['christmas', 'easter'],
  },

  // LENT
  {
    reference: "Matthew 4:4",
    book: "Matthew",
    text: "Not in bread alone doth man live, but in every word that proceedeth from the mouth of God.",
    seasons: ['lent'],
  },
  {
    reference: "Joel 2:12-13",
    book: "Joel",
    text: "Now therefore saith the Lord: Be converted to me with all your heart, in fasting, and in weeping, and mourning. And rend your hearts, and not your garments, and turn to the Lord your God: for he is gracious and merciful.",
    seasons: ['lent'],
  },
  {
    reference: "Psalm 51:1-2",
    book: "Psalms",
    text: "Have mercy on me, O God, according to thy great mercy. And according to the multitude of thy tender mercies blot out my iniquity. Wash me yet more from my iniquity, and cleanse me from my sin.",
    seasons: ['lent'],
  },
  {
    reference: "2 Corinthians 6:2",
    book: "2 Corinthians",
    text: "Behold, now is the acceptable time; behold, now is the day of salvation.",
    seasons: ['lent', 'ordinary'],
  },
  {
    reference: "Matthew 6:6",
    book: "Matthew",
    text: "But thou when thou shalt pray, enter into thy chamber, and having shut the door, pray to thy Father in secret: and thy Father who seeth in secret will repay thee.",
    seasons: ['lent', 'ordinary'],
  },
  {
    reference: "Matthew 6:17-18",
    book: "Matthew",
    text: "But thou, when thou fastest, anoint thy head, and wash thy face; That thou appear not to men to fast, but to thy Father who is in secret: and thy Father who seeth in secret, will repay thee.",
    seasons: ['lent'],
  },
  {
    reference: "Isaiah 58:6-7",
    book: "Isaiah",
    text: "Loose the bands of wickedness, undo the bundles that oppress, let them that are broken go free, and break asunder every burden. Deal thy bread to the hungry, and bring the needy and the harbourless into thy house.",
    seasons: ['lent'],
  },
  {
    reference: "John 3:16",
    book: "John",
    text: "For God so loved the world, as to give his only begotten Son; that whosoever believeth in him, may not perish, but may have life everlasting.",
    seasons: ['lent', 'easter', 'ordinary'],
  },
  {
    reference: "Luke 15:7",
    book: "Luke",
    text: "I say to you, that even so there shall be joy in heaven upon one sinner that doth penance, more than upon ninety-nine just who need not penance.",
    seasons: ['lent'],
  },
  {
    reference: "Sirach 17:24",
    book: "Sirach",
    text: "But to the penitent he hath given the way of justice, and he hath strengthened them that were fainting in patience.",
    seasons: ['lent'],
  },
  {
    reference: "Matthew 5:6",
    book: "Matthew",
    text: "Blessed are they that hunger and thirst after justice: for they shall have their fill.",
    seasons: ['lent', 'ordinary'],
  },
  {
    reference: "1 John 1:9",
    book: "1 John",
    text: "If we confess our sins, he is faithful and just, to forgive us our sins, and to cleanse us from all iniquity.",
    seasons: ['lent'],
  },
  {
    reference: "Psalm 130:1-2",
    book: "Psalms",
    text: "Out of the depths I have cried to thee, O Lord: Lord, hear my voice. Let thy ears be attentive to the voice of my supplication.",
    seasons: ['lent'],
  },
  {
    reference: "Romans 5:8",
    book: "Romans",
    text: "But God commendeth his charity towards us; because when as yet we were sinners, according to the time, Christ died for us.",
    seasons: ['lent'],
  },
  {
    reference: "Luke 9:23",
    book: "Luke",
    text: "If any man will come after me, let him deny himself, and take up his cross daily, and follow me.",
    seasons: ['lent'],
  },

  // EASTER
  {
    reference: "1 Corinthians 15:20",
    book: "1 Corinthians",
    text: "But now Christ is risen from the dead, the firstfruits of them that sleep.",
    seasons: ['easter'],
    feast: "Easter",
  },
  {
    reference: "John 11:25-26",
    book: "John",
    text: "I am the resurrection and the life: he that believeth in me, although he be dead, shall live: And every one that liveth, and believeth in me, shall not die for ever.",
    seasons: ['easter'],
  },
  {
    reference: "Matthew 28:5-6",
    book: "Matthew",
    text: "Fear not you; for I know that you seek Jesus who was crucified. He is not here, for he is risen, as he said. Come, and see the place where the Lord was laid.",
    seasons: ['easter'],
    feast: "Easter",
  },
  {
    reference: "Romans 6:4",
    book: "Romans",
    text: "For we are buried together with him by baptism into death; that as Christ is risen from the dead by the glory of the Father, so we also may walk in newness of life.",
    seasons: ['easter'],
  },
  {
    reference: "Revelation 1:17-18",
    book: "Revelation",
    text: "Fear not. I am the First and the Last, And alive, and was dead, and behold I am living for ever and ever, and have the keys of death and of hell.",
    seasons: ['easter'],
  },
  {
    reference: "John 20:19",
    book: "John",
    text: "Peace be to you. And when he had said this, he shewed them his hands and his side. The disciples therefore were glad, when they saw the Lord.",
    seasons: ['easter'],
  },
  {
    reference: "Luke 24:34",
    book: "Luke",
    text: "The Lord is risen indeed, and hath appeared to Simon.",
    seasons: ['easter'],
    feast: "Easter",
  },
  {
    reference: "Acts 2:24",
    book: "Acts",
    text: "Whom God hath raised up, having loosed the sorrows of hell, as it was impossible that he should be holden by it.",
    seasons: ['easter'],
  },
  {
    reference: "1 Peter 1:3",
    book: "1 Peter",
    text: "Blessed be the God and Father of our Lord Jesus Christ, who according to his great mercy hath regenerated us unto a lively hope, by the resurrection of Jesus Christ from the dead.",
    seasons: ['easter'],
  },
  {
    reference: "Colossians 3:1",
    book: "Colossians",
    text: "Therefore, if you be risen with Christ, seek the things that are above; where Christ is sitting at the right hand of God: Mind the things that are above, not the things that are upon the earth.",
    seasons: ['easter'],
  },
  {
    reference: "John 10:10",
    book: "John",
    text: "I am come that they may have life, and may have it more abundantly.",
    seasons: ['easter', 'ordinary'],
  },
  {
    reference: "Psalm 118:24",
    book: "Psalms",
    text: "This is the day which the Lord hath made: let us be glad and rejoice therein.",
    seasons: ['easter', 'ordinary'],
  },

  // PENTECOST
  {
    reference: "Acts 2:1-4",
    book: "Acts",
    text: "And when the days of the Pentecost were accomplished, they were all together in one place. And suddenly there came a sound from heaven, as of a mighty wind coming, and it filled the whole house where they were sitting. And there appeared to them parted tongues as it were of fire.",
    seasons: ['pentecost'],
    feast: "Pentecost",
  },
  {
    reference: "John 14:16-17",
    book: "John",
    text: "And I will ask the Father, and he shall give you another Paraclete, that he may abide with you for ever. The spirit of truth, whom the world cannot receive.",
    seasons: ['pentecost', 'ordinary'],
  },
  {
    reference: "Galatians 5:22-23",
    book: "Galatians",
    text: "But the fruit of the Spirit is, charity, joy, peace, patience, benignity, goodness, longanimity, Mildness, faith, modesty, continency, chastity.",
    seasons: ['pentecost', 'ordinary'],
  },
  {
    reference: "John 20:22",
    book: "John",
    text: "He said to them: Receive ye the Holy Ghost. Whose sins you shall forgive, they are forgiven them; and whose sins you shall retain, they are retained.",
    seasons: ['pentecost'],
    feast: "Pentecost",
  },
  {
    reference: "Romans 8:26",
    book: "Romans",
    text: "Likewise the Spirit also helpeth our infirmity. For we know not what we should pray for as we ought; but the Spirit himself asketh for us with unspeakable groanings.",
    seasons: ['pentecost', 'ordinary'],
  },

  // ORDINARY TIME — General Wisdom, Faith & Daily Life
  {
    reference: "Matthew 5:3",
    book: "Matthew",
    text: "Blessed are the poor in spirit: for theirs is the kingdom of heaven.",
    seasons: ['ordinary'],
  },
  {
    reference: "Matthew 5:8",
    book: "Matthew",
    text: "Blessed are the clean of heart: for they shall see God.",
    seasons: ['ordinary'],
  },
  {
    reference: "Matthew 5:9",
    book: "Matthew",
    text: "Blessed are the peacemakers: for they shall be called the children of God.",
    seasons: ['ordinary'],
  },
  {
    reference: "Matthew 6:33",
    book: "Matthew",
    text: "Seek ye therefore first the kingdom of God, and his justice, and all these things shall be added unto you.",
    seasons: ['ordinary'],
  },
  {
    reference: "Matthew 11:28-29",
    book: "Matthew",
    text: "Come to me, all you that labour, and are burdened, and I will refresh you. Take up my yoke upon you, and learn of me, because I am meek, and humble of heart: and you shall find rest to your souls.",
    seasons: ['ordinary', 'lent'],
  },
  {
    reference: "Matthew 22:37-39",
    book: "Matthew",
    text: "Thou shalt love the Lord thy God with thy whole heart, and with thy whole soul, and with thy whole mind. This is the greatest and the first commandment. And the second is like to this: Thou shalt love thy neighbour as thyself.",
    seasons: ['ordinary'],
  },
  {
    reference: "John 14:6",
    book: "John",
    text: "I am the way, and the truth, and the life. No man cometh to the Father, but by me.",
    seasons: ['ordinary', 'easter'],
  },
  {
    reference: "John 15:12",
    book: "John",
    text: "This is my commandment, that you love one another, as I have loved you.",
    seasons: ['ordinary', 'easter'],
  },
  {
    reference: "John 15:5",
    book: "John",
    text: "I am the vine; you the branches: he that abideth in me, and I in him, the same beareth much fruit: for without me you can do nothing.",
    seasons: ['ordinary'],
  },
  {
    reference: "Romans 8:28",
    book: "Romans",
    text: "And we know that to them that love God, all things work together unto good, to such as, according to his purpose, are called to be saints.",
    seasons: ['ordinary'],
  },
  {
    reference: "Romans 8:38-39",
    book: "Romans",
    text: "For I am sure that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come, nor might, Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God.",
    seasons: ['ordinary'],
  },
  {
    reference: "Philippians 4:13",
    book: "Philippians",
    text: "I can do all these things in him who strengtheneth me.",
    seasons: ['ordinary'],
  },
  {
    reference: "Philippians 4:6-7",
    book: "Philippians",
    text: "Be nothing solicitous; but in every thing, by prayer and supplication, with thanksgiving, let your petitions be made known to God. And the peace of God, which surpasseth all understanding, keep your hearts and minds in Christ Jesus.",
    seasons: ['ordinary', 'advent'],
  },
  {
    reference: "1 Corinthians 13:4-7",
    book: "1 Corinthians",
    text: "Charity is patient, is kind: charity envieth not, dealeth not perversely; is not puffed up; Is not ambitious, seeketh not her own, is not provoked to anger, thinketh no evil; Rejoiceth not in iniquity, but rejoiceth with the truth.",
    seasons: ['ordinary'],
  },
  {
    reference: "Proverbs 3:5-6",
    book: "Proverbs",
    text: "Have confidence in the Lord with all thy heart, and lean not upon thy own prudence. In all thy ways think on him, and he will direct thy steps.",
    seasons: ['ordinary'],
  },
  {
    reference: "Psalm 23:1-3",
    book: "Psalms",
    text: "The Lord ruleth me: and I shall want nothing. He hath set me in a place of pasture. He hath brought me up, on the water of refreshment: He hath converted my soul.",
    seasons: ['ordinary'],
  },
  {
    reference: "Psalm 27:1",
    book: "Psalms",
    text: "The Lord is my light and my salvation, whom shall I fear? The Lord is the protector of my life: of whom shall I be afraid?",
    seasons: ['ordinary'],
  },
  {
    reference: "Psalm 46:1-2",
    book: "Psalms",
    text: "God is our refuge and strength; a helper in troubles, which have found us exceedingly. Therefore we will not fear, when the earth shall be troubled; and the mountains shall be removed into the heart of the sea.",
    seasons: ['ordinary'],
  },
  {
    reference: "Psalm 121:1-2",
    book: "Psalms",
    text: "I have lifted up my eyes to the mountains, from whence help shall come to me. My help is from the Lord, who made heaven and earth.",
    seasons: ['ordinary'],
  },
  {
    reference: "Jeremiah 29:11",
    book: "Jeremiah",
    text: "For I know the thoughts that I think towards you, saith the Lord, thoughts of peace, and not of affliction, to give you an end and patience.",
    seasons: ['ordinary'],
  },
  {
    reference: "Isaiah 41:10",
    book: "Isaiah",
    text: "Fear not, for I am with thee: turn not aside, for I am thy God: I have strengthened thee, and have helped thee, and the right hand of my just one hath upheld thee.",
    seasons: ['ordinary', 'advent'],
  },
  {
    reference: "Joshua 1:9",
    book: "Joshua",
    text: "Behold I command thee, take courage, and be strong. Fear not and be not dismayed: because the Lord thy God is with thee in all places whithersoever thou shalt go.",
    seasons: ['ordinary'],
  },
  {
    reference: "Wisdom 6:12",
    book: "Wisdom",
    text: "Wisdom is glorious, and never fadeth away, and is easily seen by them that love her, and is found by them that seek her.",
    seasons: ['ordinary'],
  },
  {
    reference: "Wisdom 7:26",
    book: "Wisdom",
    text: "For she is the brightness of eternal light, and the unspotted mirror of God's majesty, and the image of his goodness.",
    seasons: ['ordinary'],
  },
  {
    reference: "Sirach 1:1",
    book: "Sirach",
    text: "All wisdom is from the Lord God, and hath been always with him, and is before all time.",
    seasons: ['ordinary'],
  },
  {
    reference: "Sirach 2:1",
    book: "Sirach",
    text: "Son, when thou comest to the service of God, stand in justice and in fear, and prepare thy soul for temptation.",
    seasons: ['ordinary', 'lent'],
  },
  {
    reference: "Sirach 3:17",
    book: "Sirach",
    text: "Son, do thy works in meekness, and thou shalt be beloved above the glory of men: for the greater thou art, the more humble thyself in all things, and thou shalt find grace before God.",
    seasons: ['ordinary'],
  },
  {
    reference: "Tobit 4:15",
    book: "Tobit",
    text: "See thou never do to another what thou wouldst hate to have done to thee by another.",
    seasons: ['ordinary'],
  },
  {
    reference: "Tobit 12:8",
    book: "Tobit",
    text: "Prayer is good with fasting and alms more than to lay up treasures of gold: For alms delivereth from death, and the same is that which purgeth away sins, and maketh to find mercy and life everlasting.",
    seasons: ['lent', 'ordinary'],
  },
  {
    reference: "2 Maccabees 12:46",
    book: "2 Maccabees",
    text: "It is therefore a holy and wholesome thought to pray for the dead, that they may be loosed from sins.",
    seasons: ['ordinary'],
    feast: "All Souls Day",
  },
  {
    reference: "James 1:17",
    book: "James",
    text: "Every best gift, and every perfect gift, is from above, coming down from the Father of lights, with whom there is no change, nor shadow of alteration.",
    seasons: ['ordinary'],
  },
  {
    reference: "James 5:16",
    book: "James",
    text: "Confess therefore your sins one to another: and pray one for another, that you may be saved. For the continual prayer of a just man availeth much.",
    seasons: ['ordinary', 'lent'],
  },
  {
    reference: "1 Peter 5:7",
    book: "1 Peter",
    text: "Casting all your care upon him, for he hath care of you.",
    seasons: ['ordinary'],
  },
  {
    reference: "Hebrews 11:1",
    book: "Hebrews",
    text: "Now faith is the substance of things to be hoped for, the evidence of things that appear not.",
    seasons: ['ordinary'],
  },
  {
    reference: "Hebrews 12:1",
    book: "Hebrews",
    text: "Therefore we also having so great a cloud of witnesses over our head, laying aside every weight and sin which surrounds us, let us run by patience to the fight proposed to us.",
    seasons: ['ordinary'],
  },
  {
    reference: "Ephesians 6:11",
    book: "Ephesians",
    text: "Put you on the armour of God, that you may be able to stand against the deceits of the devil.",
    seasons: ['ordinary'],
  },
  {
    reference: "Colossians 3:17",
    book: "Colossians",
    text: "All whatsoever you do in word or in work, do all in the name of the Lord Jesus Christ, giving thanks to God and the Father by him.",
    seasons: ['ordinary'],
  },
  {
    reference: "1 Thessalonians 5:16-18",
    book: "1 Thessalonians",
    text: "Always rejoice. Pray without ceasing. In all things give thanks; for this is the will of God in Christ Jesus concerning you all.",
    seasons: ['ordinary'],
  },
  {
    reference: "Baruch 3:14",
    book: "Baruch",
    text: "Learn where is wisdom, where is strength, where is understanding: that thou mayest know also where is length of days and life, where is the light of the eyes, and peace.",
    seasons: ['ordinary', 'advent'],
  },
  {
    reference: "Revelation 21:4",
    book: "Revelation",
    text: "And God shall wipe away all tears from their eyes: and death shall be no more, nor mourning, nor crying, nor sorrow shall be any more, for the former things are passed away.",
    seasons: ['easter', 'ordinary'],
  },
  {
    reference: "Isaiah 43:1",
    book: "Isaiah",
    text: "Fear not, for I have redeemed thee, and called thee by thy name: thou art mine.",
    seasons: ['ordinary', 'christmas'],
  },
  {
    reference: "Matthew 28:20",
    book: "Matthew",
    text: "Teaching them to observe all things whatsoever I have commanded you: and behold I am with you all days, even to the consummation of the world.",
    seasons: ['easter', 'ordinary'],
  },
];

// ─── Verse Selection ─────────────────────────────────────────────────────────

export function getVersesForSeason(season: LiturgicalSeason): BibleVerse[] {
  const forSeason = BIBLE_VERSES.filter(v => v.seasons.includes(season));
  return forSeason.length > 0 ? forSeason : BIBLE_VERSES.filter(v => v.seasons.includes('ordinary'));
}

export function getRandomVerseForToday(): BibleVerse {
  const season = getLiturgicalSeason();
  const feast = checkFeastDay();
  const candidates = getVersesForSeason(season);

  // Prefer feast-specific verses when available
  if (feast) {
    const feastVerses = candidates.filter(
      v => v.feast && feast.toLowerCase().includes(v.feast.toLowerCase()),
    );
    if (feastVerses.length > 0) {
      return feastVerses[Math.floor(Math.random() * feastVerses.length)];
    }
  }

  // Use date as seed so morning/noon/evening pick DIFFERENT verses on the same day
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
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function formatVerseNotification(verse: BibleVerse, time: 'morning' | 'noon' | 'evening'): {
  title: string;
  body: string;
} {
  const season = getLiturgicalSeason();
  const feast = checkFeastDay();
  const timeLabels = { morning: 'Morning', noon: 'Noon', evening: 'Evening' };

  const title = feast
    ? `KAIROS · ${feast}`
    : `KAIROS · ${timeLabels[time]} Scripture — ${getLiturgicalSeasonLabel(season)}`;

  const body = `"${verse.text}"\n— ${verse.reference}`;
  return { title, body };
}
