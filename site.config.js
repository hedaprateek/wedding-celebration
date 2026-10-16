// Replace the sample information here; all dates include the Indian time-zone offset.
export default {
  preview: true,
  couple: { first: 'Prerna', second: '', initials: 'P' },
  weddingDate: '2026-12-02T17:00:00+05:30',
  rsvpDeadline: '2026-11-20T23:59:00+05:30',
  timezone: 'Asia/Kolkata',
  city: 'Venue to be announced',
  hashtag: '#PrernasNewBeginning',
  venue: {
    name: 'A beautiful setting, coming soon',
    address: 'The exact venue and city will be shared by the family.',
    mapsUrl: '',
    note: 'Venue, directions, stay arrangements, and travel assistance will be added once the family confirms them.'
  },
  contact: { name: 'The wedding family', phone: '', email: '' },
  story: {
    title: 'Two families. One beautiful beginning.',
    paragraphs: [
      'Some celebrations are made of more than beautiful moments. They are made of family, blessings, cherished traditions, and all the people who feel like home.',
      'With the warmth of a Marwari wedding and a heart full of excitement, Prerna and her family invite you to share in two wonderful days of celebration. Your presence will make them even more special.'
    ]
  },
  events: [
    { id: 'haldi', title: 'Haldi & mehendi', kind: 'COLOUR, LAUGHTER & A LITTLE HALDI', icon: 'sun', theme: 'yellow', date: '2026-12-01T10:00:00+05:30', end: '2026-12-01T14:00:00+05:30', place: 'Venue to be confirmed', dress: 'A little yellow, a lot of sunshine', description: 'The festivities begin with family, beautiful mehendi, and the happiest kind of haldi. Timing and ceremony details will be confirmed by the family.' },
    { id: 'sangeet', title: 'Sangeet ki raat', kind: 'LET THE MUSIC BEGIN', icon: 'sparkle', theme: 'green', date: '2026-12-01T19:00:00+05:30', end: '2026-12-01T23:00:00+05:30', place: 'Venue to be confirmed', dress: 'Colourful festive · dancing shoes welcome', description: 'Family performances, favourite songs, and a dance floor with your name on it. Bring your best moves and your biggest smile.' },
    { id: 'wedding', title: 'Baraat & pheras', kind: 'BLESSINGS FOR A NEW BEGINNING', icon: 'flower', theme: 'pink', date: '2026-12-02T17:00:00+05:30', end: '2026-12-02T20:00:00+05:30', place: 'Venue to be confirmed', dress: 'Traditional Indian · your festive finest', description: 'A joyful baraat, beautiful traditions, and the beginning of a new chapter. The family will share the final baraat and phera timings here.' },
    { id: 'reception', title: 'A feast, a family, a forever', kind: 'A BEAUTIFUL FINALE', icon: 'moon', theme: 'lavender', date: '2026-12-02T20:00:00+05:30', end: '2026-12-02T23:00:00+05:30', place: 'Venue to be confirmed', dress: 'Evening festive · a touch of sparkle', description: 'Come together for a celebratory dinner, warm wishes, and just one more photograph. The sweetest end to two beautiful days.' }
  ],
  // Proposed experience notes: replace these with the family's actual plans.
  eventExperiences: {
    haldi: { lead: 'Start with sunshine. Stay for the laughter.', highlights: ['A colourful beginning, surrounded by the people who feel like home.', 'Space for the family’s haldi and mehendi traditions, once the programme is confirmed.', 'The candid photographs are often the loveliest ones. Keep a little room for happy surprises.'], colours: ['#e5b42b', '#fff0b5', '#e98d47'], prompt: 'Who in your family is most likely to start the haldi mischief?' },
    sangeet: { lead: 'Some nights deserve one more song.', highlights: ['A night to cheer for your people and sing along to the songs everyone knows.', 'The family’s performances and programme will be added here when ready.', 'Have a song that gets you dancing? Suggest it with your RSVP.'], colours: ['#397d67', '#e8b7ca', '#d5b568'], prompt: 'Come with a favourite song. Leave with a favourite memory.' },
    wedding: { lead: 'The moment two families have been waiting for.', highlights: ['A new beginning, surrounded by blessings, familiar faces and cherished traditions.', 'The family will confirm the baraat, phera timings and muhurat before the final invitation is shared.', 'Your presence and blessings are what make this chapter feel complete.'], colours: ['#b53660', '#f0bf80', '#f3ddcb'], prompt: 'A good place to pause, be present, and take it all in.' },
    reception: { lead: 'A little more time with our favourite people.', highlights: ['A chance to catch up, share warm wishes and celebrate together.', 'Dinner, hospitality and any special arrangements will be confirmed by the family.', 'Before you go, leave a little wish for the new beginning.'], colours: ['#9279a5', '#d2af70', '#e5d9ed'], prompt: 'What would you wish for their next chapter?' }
  },
  gallery: [
    { src: 'assets/photos/couple-close.jpg', title: 'Our kind of forever', category: 'us', alt: 'Illustrative Indian wedding portrait of a couple in red and ivory, photographed by ARTO SURAJ' },
    { src: 'assets/photos/couple-portrait.jpg', title: 'All dressed up in love', category: 'us', alt: 'Illustrative formal portrait of an Indian bride and groom, photographed by ARTO SURAJ' },
    { src: 'assets/photos/celebration.jpg', title: 'The little details', category: 'details', alt: 'Illustrative photograph of a wedding flower bouquet in warm evening light' },
    { src: 'assets/photos/couple-hero.jpg', title: 'A moment, just for us', category: 'us', alt: 'Illustrative wedding couple sharing a quiet moment beneath warm fairy lights, photographed by ARTO SURAJ' }
  ]
};
