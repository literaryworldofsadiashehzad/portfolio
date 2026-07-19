// Static data for Sadia Shahzad Literary Portfolio
const SLIDES_DATA = [
  {
    image: 'assets/images/slide_desk.png',
    title: 'Explore the Literary World of Sadia Shahzad',
    subtitle: 'Where stories shape reality and words weave eternal threads.',
    cta: 'View Collection',
    tab: 'portfolio'
  },
  {
    image: 'assets/images/aas.png',
    title: 'Featured Novel: AAS',
    subtitle: 'A powerful novel exploring life, relationships, and hope amidst struggles.',
    cta: 'Read AAS',
    tab: 'portfolio',
    bookId: 'aas'
  },
  {
    image: 'assets/images/intezaar.png',
    title: 'Featured Fable: Intezaar',
    subtitle: 'An elegant fable that explores the art of waiting, hope, and patience.',
    cta: 'Read Intezaar',
    tab: 'portfolio',
    bookId: 'intezaar'
  }
];

const BOOKS_DATA = [
  {
    id: 'aas',
    title: 'AAS',
    category: 'Novels',
    coverImage: 'assets/images/aas.png',
    coverStyle: 'emerald',
    pdfUrl: 'assets/books/novels/AAS.pdf',
    synopsis: 'AAS is a powerful Urdu novel expressing hope, human relationships, and the emotional struggles of individuals. Traced with beautiful prose, it is a testament to the resilience of the human spirit in Karachi\'s vibrant landscape.',
    defaultViews: 1420,
    defaultReads: 980,
    defaultDownloads: 350,
    defaultRatingSum: 4320, // Avg 4.8 based on 900 ratings
    defaultRatingCount: 900
  },
  {
    id: 'eid_e_vasl',
    title: 'Eid e Vasl',
    category: 'Novelettes',
    coverImage: 'assets/images/eid_e_vasl.png',
    coverStyle: 'sapphire',
    pdfUrl: 'assets/books/novelettes/Eid_e_Vasl.pdf',
    synopsis: 'An emotional and romantic novelette depicting longing, reunion, and the trials of love. Tracing the delicate threads of separation and union, this story leaves a lasting imprint on the heart.',
    defaultViews: 890,
    defaultReads: 540,
    defaultDownloads: 180,
    defaultRatingSum: 3290, // Avg 4.7 based on 700 ratings
    defaultRatingCount: 700
  },
  {
    id: 'azadi_aik_naymat',
    title: 'Azadi aik Naymat',
    category: 'Articles',
    coverImage: 'assets/images/azadi_aik_naymat.png',
    coverStyle: 'parchment',
    pdfUrl: 'assets/books/articles/Azadi_aik_Naymat.pdf',
    synopsis: 'An insightful essay exploring the value of independence and freedom, and the responsibilities that come with it. It reflects on societal values and the historical significance of freedom.',
    defaultViews: 620,
    defaultReads: 390,
    defaultDownloads: 120,
    defaultRatingSum: 1840, // Avg 4.6 based on 400 ratings
    defaultRatingCount: 400
  },
  {
    id: 'intezaar',
    title: 'Intezaar',
    category: 'Fables',
    coverImage: 'assets/images/intezaar.png',
    coverStyle: 'gold-linen',
    pdfUrl: 'assets/books/fables/Intezaar.pdf',
    synopsis: 'An elegant fable that explores the art of waiting, hope, and the rewards of patience. Inspired by traditional motifs, it offers a gentle, moving lesson on time, trust, and woven destinies.',
    defaultViews: 1100,
    defaultReads: 780,
    defaultDownloads: 290,
    defaultRatingSum: 3920, // Avg 4.9 based on 800 ratings
    defaultRatingCount: 800
  }
];

const ANNOUNCEMENTS_DATA = [
  {
    id: 'announce_intezaar',
    title: "New Fable Released: 'Intezaar'",
    date: 'July 20, 2026',
    image: 'assets/images/intezaar.png',
    content: `I am happy to share that my latest illustrated fable, <strong>Intezaar</strong>, is now available for reading! Tracing themes of patience, trust, and the beauty of timing, this fable draws on classic motifs to deliver a timeless lesson. Read the PDF online in the Portfolio tab and leave your reviews!`
  },
  {
    id: 'announce_eid_e_vasl',
    title: "Introducing My Novelette: 'Eid e Vasl'",
    date: 'June 25, 2026',
    image: 'assets/images/eid_e_vasl.png',
    content: `I am pleased to bring you my novelette, <strong>Eid e Vasl</strong>. It has been a deeply personal project, tracing the threads of love and separation. You can download and read the PDF in the portfolio tab.`
  },
  {
    id: 'announce_aas',
    title: "Read My Featured Novel: 'AAS'",
    date: 'May 10, 2026',
    image: 'assets/images/aas.png',
    content: `AAS is a novel close to my heart, exploring life, relationships, and aspirations. Read the full book in the Novels category of the Portfolio section.`
  }
];

// Biography details split into pages for the book-flip animation
const BIO_PAGES = [
  {
    left: `
      <h3 class="bio-subtitle">The Voice & The Pen</h3>
      <p class="bio-paragraph">I’m Sadia Shahzad, a Mass Communication student at a federal university, specializing in Broadcast Media, Film, and Theatre. Writing is my passion — especially crime thrillers, suspense, murder mysteries, and social commentaries.</p>
      <p class="bio-paragraph">For me, media and literature are powerful vessels to bring awareness and trigger positive change in society, using characters to reflect our deepest realities.</p>
    `,
    right: `
      <h3 class="bio-subtitle">Literary Collections</h3>
      <p class="bio-paragraph">I’ve written an afsana, <i>Intezaar</i>, which delves deep into the concepts of sacrifice and consequence, an article, <i>Azadi aik Naymat</i>, exploring the true value and gift of Pakistan, and an Eid novelette, <i>Eid e Vasl</i>, focusing on family bonds and emotional ties.</p>
    `
  },
  {
    left: `
      <h3 class="bio-subtitle">Current Works</h3>
      <p class="bio-paragraph">I’m currently working on my novel, <i>Aas</i>, which is a crime thriller that explores societal injustice and power dynamics, along with another novelette that focuses on justice, media ethics, and pressing social issues.</p>
    `,
    right: `
      <h3 class="bio-subtitle">Inspirations</h3>
      <p class="bio-paragraph">Reading and reflecting on the different perspectives of life is what inspires my work. For me, stories are not just a form of expression, but a way to hold up a mirror to the world.</p>
      <p class="bio-paragraph">I hope this digital library serves as a cozy sanctuary for you. Feel free to explore my portfolios, download articles, read reviews, or send a direct message.</p>
      <div class="bio-signature">Sadia Shahzad</div>
    `
  }
];

export { SLIDES_DATA, BOOKS_DATA, ANNOUNCEMENTS_DATA, BIO_PAGES };
