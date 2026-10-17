// Family-supplied schedule. An undated event stays null until its timing is confirmed.
export default {
  preview: true,
  couple: { first: 'Prerna', firstSurname: 'Pareek', second: 'Shubham', secondSurname: 'Purohit', initials: 'P & S' },
  family: { father: 'Sunil Pareek', brother: 'Rahul Pareek' },
  weddingDate: '2026-12-02T15:15:00+05:30',
  rsvpDeadline: null,
  timezone: 'Asia/Kolkata',
  city: 'Secunderabad, Hyderabad',
  hashtag: '',
  venue: {
    name: 'Secunderabad, Hyderabad',
    address: 'Secunderabad, Hyderabad, Telangana',
    mapsUrl: '',
    note: 'The venue name and exact address will be shared soon. Contact Rahul Pareek for help with your visit.'
  },
  contact: { name: 'Rahul Pareek', relation: 'Brother of the bride', phone: '+919156704040', displayPhone: '91567 04040', email: '' },
  story: {
    title: 'Two families. One beautiful beginning.',
    paragraphs: [
      'With love and blessings, Sunil Pareek invites you to celebrate the wedding of his daughter, Prerna Pareek, with Shubham Purohit.',
      'Join our families in Secunderabad, Hyderabad, on 1 and 2 December 2026 for a Marwari celebration filled with cherished traditions, laughter, and the people who feel like home. Your presence will make these moments even more special.'
    ]
  },
  events: [
    { id: 'tilak', title: 'Tilak – Engagement', kind: 'THE FIRST OF MANY HAPPY MOMENTS', icon: 'flower', theme: 'pink', date: '2026-12-01T09:15:00+05:30', end: null, place: 'Secunderabad, Hyderabad', dress: 'Festive Indian · a suggested mood', description: 'Begin the celebrations with our families, warm wishes, and the joy of Prerna and Shubham’s engagement.' },
    { id: 'maayra', title: 'Maayra', kind: 'FAMILY, BLESSINGS & TOGETHERNESS', icon: 'heart', theme: 'yellow', date: '2026-12-01T16:30:00+05:30', end: null, place: 'Secunderabad, Hyderabad', dress: 'Traditional festive · a suggested mood', description: 'An afternoon for cherished family traditions, heartfelt blessings, and the warmth of being together.' },
    { id: 'sangeet', title: 'Sangeet', kind: 'LET THE MUSIC BEGIN', icon: 'sparkle', theme: 'green', date: '2026-12-01T19:30:00+05:30', end: null, place: 'Secunderabad, Hyderabad', dress: 'Colourful festive · dancing shoes welcome', description: 'An evening of favourite songs, laughter, and celebrating our people. Bring your brightest smile and a song you love.' },
    { id: 'wedding', title: 'Phera', kind: 'BLESSINGS FOR A NEW BEGINNING', icon: 'flower', theme: 'pink', date: '2026-12-02T15:15:00+05:30', end: null, place: 'Secunderabad, Hyderabad', dress: 'Traditional Indian · a suggested mood', description: 'Be with Prerna and Shubham for their wedding ceremony, surrounded by family, blessings, and beautiful traditions.' },
    { id: 'reception', title: 'Reception', kind: 'AN EVENING TO CELEBRATE', icon: 'moon', theme: 'lavender', date: '2026-12-02T20:30:00+05:30', end: null, place: 'Secunderabad, Hyderabad', dress: 'Evening festive · a touch of sparkle', description: 'Celebrate the newlyweds with warm wishes, familiar faces, and a little more time together.' },
    { id: 'haldi', title: 'Haldi', kind: 'A LITTLE SUNSHINE, COMING SOON', icon: 'sun', theme: 'yellow', date: null, end: null, place: 'Secunderabad, Hyderabad', dress: 'A little yellow · a suggested mood', description: 'There is a little haldi happiness still to come. The family will share the date and time once they are decided.' }
  ],
  // Invitation copy; outfit colours are suggestions, not a compulsory dress code.
  eventExperiences: {
    tilak: { lead: 'A new chapter begins with our favourite people.', highlights: ['Join the families for Tilak and Engagement on Tuesday, 1 December, at 9:15 am.', 'A morning to share blessings and celebrate Prerna and Shubham.', 'The venue name and exact address will be shared by the family.'], colours: ['#b53660', '#f0bf80', '#f3ddcb'], prompt: 'The first happy memory of two wonderful days.' },
    maayra: { lead: 'The warmth of family. The joy of tradition.', highlights: ['Come together for Maayra on Tuesday, 1 December, at 4:30 pm.', 'An afternoon to be present with the people closest to our hearts.', 'For venue details or help with your visit, reach out to Rahul Pareek.'], colours: ['#e5b42b', '#fff0b5', '#e98d47'], prompt: 'Some celebrations feel just like home.' },
    haldi: { lead: 'A little sunshine, with the details still to come.', highlights: ['The Haldi date and time are yet to be decided.', 'Add it to your plan if you would love to join; calendar downloads will wait for a confirmed time.', 'Rahul Pareek can help with updates when the arrangements are ready.'], colours: ['#e5b42b', '#fff0b5', '#e98d47'], prompt: 'Save a little room for laughter.' },
    sangeet: { lead: 'Some nights deserve one more song.', highlights: ['A night to cheer for your people and sing along to the songs everyone knows.', 'The family’s performances and programme will be added here when ready.', 'Have a song that gets you dancing? Suggest it with your RSVP.'], colours: ['#397d67', '#e8b7ca', '#d5b568'], prompt: 'Come with a favourite song. Leave with a favourite memory.' },
    wedding: { lead: 'The moment two families have been waiting for.', highlights: ['Join the Phera ceremony on Wednesday, 2 December, at 3:15 pm.', 'A new beginning for Prerna Pareek and Shubham Purohit, surrounded by cherished traditions.', 'Your presence and blessings are what make this chapter feel complete.'], colours: ['#b53660', '#f0bf80', '#f3ddcb'], prompt: 'A good place to pause, be present, and take it all in.' },
    reception: { lead: 'A little more time with our favourite people.', highlights: ['A chance to catch up, share warm wishes and celebrate together.', 'Dinner, hospitality and any special arrangements will be confirmed by the family.', 'Before you go, leave a little wish for the new beginning.'], colours: ['#9279a5', '#d2af70', '#e5d9ed'], prompt: 'What would you wish for their next chapter?' }
  },
  gallery: [
    { src: 'assets/photos/couple-close.jpg', title: 'Our kind of forever', category: 'us', alt: 'Illustrative Indian wedding portrait of a couple in red and ivory, photographed by ARTO SURAJ' },
    { src: 'assets/photos/couple-portrait.jpg', title: 'All dressed up in love', category: 'us', alt: 'Illustrative formal portrait of an Indian bride and groom, photographed by ARTO SURAJ' },
    { src: 'assets/photos/celebration.jpg', title: 'The little details', category: 'details', alt: 'Illustrative photograph of a wedding flower bouquet in warm evening light' },
    { src: 'assets/photos/couple-hero.jpg', title: 'A moment, just for us', category: 'us', alt: 'Illustrative wedding couple sharing a quiet moment beneath warm fairy lights, photographed by ARTO SURAJ' }
  ]
};
