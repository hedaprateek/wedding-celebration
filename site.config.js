// Family-supplied schedule. An undated event stays null until its timing is confirmed.
export default {
  preview: true,
  siteUrl: 'https://hedaprateek.github.io/wedding-celebration/',
  couple: { first: 'Prerna', firstSurname: 'Pareek', second: 'Shubham', secondSurname: 'Purohit', initials: 'P & S' },
  family: { father: 'Sunil Vyas', mother: 'Vandana Vyas', brother: 'Rahul Pareek' },
  weddingDate: '2026-12-02T15:15:00+05:30',
  rsvpDeadline: null,
  timezone: 'Asia/Kolkata',
  city: 'Secunderabad, Hyderabad',
  hashtag: '',
  venue: {
    name: 'Terapanthi Bhavan',
    nameHindi: 'तेरापंथी भवन',
    address: 'D. V. Colony, Secunderabad, Hyderabad, Telangana',
    addressHindi: 'तेरापंथी भवन, डी.वी. कालोनी, सिकंदराबाद',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Terapanthi%20Bhavan%2C%20D.%20V.%20Colony%2C%20Secunderabad%2C%20Hyderabad',
    note: 'Wedding celebrations and the reception are at Terapanthi Bhavan. For arrival or stay assistance, contact Rahul Pareek.'
  },
  contact: { name: 'Rahul Pareek', relation: 'Brother of the bride', phone: '+919156704040', displayPhone: '91567 04040', email: 'rahulpareek3366@gmail.com' },
  story: {
    title: 'With love. You’re invited.',
    paragraphs: [
      'With love and blessings, Vandana and Sunil Vyas invite you to celebrate the wedding of their daughter, Prerna, with Shubham.',
      'Join us for two beautiful days of Marwari traditions, music, laughter and togetherness. Come with your family, and bless our new beginning.'
    ]
  },
  events: [
    { id: 'tilak', title: 'Tilak Chhantna', titleHindi: 'तिलक छाँटना', kind: 'THE FIRST OF MANY HAPPY MOMENTS', icon: 'flower', theme: 'pink', date: '2026-12-01T09:15:00+05:30', end: null, dressCode: null, place: 'Terapanthi Bhavan', dress: 'Festive Indian · a suggested mood', description: 'Begin two beautiful days with our families, warm wishes, and the first ceremony of the celebrations.' },
    { id: 'chak', title: 'Chak Pujan', titleHindi: 'चाक पूजन', kind: 'A MORNING OF CHERISHED TRADITIONS', icon: 'sun', theme: 'yellow', date: '2026-12-01T10:15:00+05:30', end: null, dressCode: null, place: 'Terapanthi Bhavan', dress: 'Traditional festive · a suggested mood', description: 'Join the family for Chak Pujan, a special part of our wedding programme.' },
    { id: 'vinayak', title: 'Vinayak Pujan', titleHindi: 'विनायक पूजन', kind: 'WITH BLESSINGS FOR THE JOURNEY AHEAD', icon: 'flower', theme: 'green', date: '2026-12-01T12:15:00+05:30', end: null, dressCode: null, place: 'Terapanthi Bhavan', dress: 'Traditional Indian · a suggested mood', description: 'Come together for Vinayak Pujan as the wedding festivities continue with family and blessings.' },
    { id: 'maayra', title: 'Maayra', titleHindi: 'मायरा', kind: 'FAMILY, BLESSINGS & TOGETHERNESS', icon: 'heart', theme: 'yellow', date: '2026-12-01T16:31:00+05:30', end: null, dressCode: null, place: 'Terapanthi Bhavan', dress: 'Traditional festive · a suggested mood', description: 'An afternoon for cherished family traditions, heartfelt blessings, and the warmth of being together.' },
    { id: 'sangeet', title: 'Sangeet Sandhya', titleHindi: 'संगीत संध्या', kind: 'LET THE MUSIC BEGIN', icon: 'sparkle', theme: 'green', date: '2026-12-01T19:31:00+05:30', end: null, dressCode: null, place: 'Terapanthi Bhavan', dress: 'Colourful festive · dancing shoes welcome', description: 'An evening of favourite songs, laughter, and celebrating our people. Bring your brightest smile and a song you love.' },
    { id: 'haldi', title: 'Haldi', titleHindi: 'हल्दी', kind: 'A LITTLE SUNSHINE TO BEGIN THE DAY', icon: 'sun', theme: 'yellow', date: '2026-12-02T08:15:00+05:30', end: null, dressCode: null, place: 'Terapanthi Bhavan', dress: 'A little yellow · a suggested mood', description: 'Start the wedding morning with family, a little colour, and the happiest kind of haldi.' },
    { id: 'baraat', title: 'Baraat Swagat', titleHindi: 'बारात स्वागत', kind: 'A WARM WELCOME TO THE WEDDING FAMILY', icon: 'heart', theme: 'lavender', date: '2026-12-02T12:15:00+05:30', end: null, dressCode: null, place: 'Terapanthi Bhavan', dress: 'Festive Indian · a suggested mood', description: 'Join us in welcoming Shubham and the Purohit family’s baraat to Terapanthi Bhavan.' },
    { id: 'wedding', title: 'Phera · Panigrahan Sanskar', titleHindi: 'पाणिग्रहण संस्कार', kind: 'BLESSINGS FOR A NEW BEGINNING', icon: 'flower', theme: 'pink', date: '2026-12-02T15:15:00+05:30', end: null, dressCode: null, place: 'Terapanthi Bhavan', dress: 'Traditional Indian · a suggested mood', description: 'Be with Prerna and Shubham for their wedding ceremony, surrounded by family, blessings, and beautiful traditions.' },
    { id: 'reception', title: 'Reception & Pritibhoj', titleHindi: 'स्वागत समारोह एवं प्रीतिभोज', kind: 'AN EVENING TO CELEBRATE', icon: 'moon', theme: 'lavender', date: '2026-12-02T20:31:00+05:30', end: null, dressCode: null, place: 'Terapanthi Bhavan', dress: 'Evening festive · a touch of sparkle', description: 'Celebrate the newlyweds with a warm welcome, a celebratory dinner, and a little more time together. From 8:31 pm onwards.' }
  ],
  // Invitation copy; outfit colours are suggestions, not a compulsory dress code.
  eventExperiences: {
    tilak: { lead: 'A new chapter begins with our favourite people.', highlights: ['Join the families for Tilak Chhantna on Tuesday, 1 December, at 9:15 am.', 'A morning to share blessings and celebrate Prerna and Shubham.', 'The celebrations take place at Terapanthi Bhavan, D. V. Colony, Secunderabad.'], colours: ['#b53660', '#f0bf80', '#f3ddcb'], prompt: 'The first happy memory of two wonderful days.' },
    chak: { lead: 'A little time for the traditions we cherish.', highlights: ['Chak Pujan is on Tuesday, 1 December, at 10:15 am.', 'Join the family at Terapanthi Bhavan, D. V. Colony, Secunderabad.', 'Rahul Pareek can help with your visit or any questions.'], colours: ['#e5b42b', '#fff0b5', '#e98d47'], prompt: 'Together, every tradition feels a little more special.' },
    vinayak: { lead: 'With blessings for a beautiful beginning.', highlights: ['Vinayak Pujan is on Tuesday, 1 December, at 12:15 pm.', 'A moment to come together with the family before the afternoon festivities.', 'All celebrations are at Terapanthi Bhavan in Secunderabad.'], colours: ['#397d67', '#e8b7ca', '#d5b568'], prompt: 'A new chapter, surrounded by blessings.' },
    maayra: { lead: 'The warmth of family. The joy of tradition.', highlights: ['Come together for Maayra on Tuesday, 1 December, at 4:31 pm.', 'An afternoon to be present with the people closest to our hearts.', 'For venue details or help with your visit, reach out to Rahul Pareek.'], colours: ['#e5b42b', '#fff0b5', '#e98d47'], prompt: 'Some celebrations feel just like home.' },
    haldi: { lead: 'Start the wedding morning with a little sunshine.', highlights: ['Haldi is on Wednesday, 2 December, at 8:15 am.', 'Join our families for a colourful beginning to the wedding day.', 'Meet us at Terapanthi Bhavan, D. V. Colony, Secunderabad.'], colours: ['#e5b42b', '#fff0b5', '#e98d47'], prompt: 'Save a little room for laughter.' },
    baraat: { lead: 'A warm welcome, from one family to another.', highlights: ['Baraat Swagat is on Wednesday, 2 December, at 12:15 pm.', 'Welcome Shubham and the Purohit family to Terapanthi Bhavan.', 'The Phera ceremony follows at 3:15 pm.'], colours: ['#9279a5', '#d2af70', '#e5d9ed'], prompt: 'Two families. One joyful welcome.' },
    sangeet: { lead: 'Some nights deserve one more song.', highlights: ['A night to cheer for your people and sing along to the songs everyone knows.', 'The family’s performances and programme will be added here when ready.', 'Have a song that gets you dancing? Suggest it with your RSVP.'], colours: ['#397d67', '#e8b7ca', '#d5b568'], prompt: 'Come with a favourite song. Leave with a favourite memory.' },
    wedding: { lead: 'The moment two families have been waiting for.', highlights: ['Join the Phera ceremony on Wednesday, 2 December, at 3:15 pm.', 'A new beginning for Prerna Pareek and Shubham Purohit, surrounded by cherished traditions.', 'Your presence and blessings are what make this chapter feel complete.'], colours: ['#b53660', '#f0bf80', '#f3ddcb'], prompt: 'A good place to pause, be present, and take it all in.' },
    reception: { lead: 'A little more time with our favourite people.', highlights: ['The reception and Pritibhoj begin on Wednesday, 2 December, from 8:31 pm onwards.', 'Join us at Terapanthi Bhavan, D. V. Colony, Secunderabad.', 'Share warm wishes and a celebratory dinner with the newlyweds and our families.'], colours: ['#9279a5', '#d2af70', '#e5d9ed'], prompt: 'What would you wish for their next chapter?' }
  },
  printedInvitation: {
    blessings: ['मंगलम् भगवान विष्णु, मंगलम् गरुड ध्वजः।', 'मंगलम् पुंडरीकाक्षो, मंगलाय तनो हरि॥'],
    ganeshVerse: ['वक्रतुण्ड महाकाय, सूर्यकोटि समप्रभः।', 'निर्विघ्नं कुरु मे देव, सर्व कार्येषु सर्वदा॥'],
    greeting: 'परमस्नेही स्वजन,',
    opening: 'मंगलमय भगवान श्री विनायकजी महाराज की असीम अनुकम्पा से हमारे यहाँ',
    bride: 'चि.सौ.कां. प्रेरणा',
    groom: 'चि. शुभमजी',
    tithi: 'संवत् २०८३ · मार्गशीर्ष कृष्णपक्ष नवमी · बुधवार, २ दिसम्बर २०२६',
    invitation: 'इस पावन परिणय की सुमधुर बेला पर आप सपरिवार पधारकर नव दम्पती को आशीर्वाद प्रदान कर हमें अनुगृहित करें।',
    families: [
      { side: 'THE BRIDE’S FAMILY', name: 'प्रेरणा', parents: 'सौ. वंदना एवं सुनील व्यास', grandparents: 'श्रीमती रमेश्वरीदेवी एवं स्व. श्री उदयरायजी व्यास' },
      { side: 'THE GROOM’S FAMILY', name: 'शुभमजी', parents: 'सौ. शारदादेवी एवं सा. श्री संजयकुमारजी पुरोहित', grandparents: 'स्व. श्रीमती गोदावरीबाई एवं स्व. सा. श्री रामचंद्रजी पुरोहित' }
    ],
    hostGroups: [
      { title: 'विनीत', lines: ['श्रीकांत सुनील व्यास'] },
      { title: 'दर्शनाभिलाषी', lines: ['विनोदकुमार, श्रीकांत, सुनील, चंद्रकांत, सूर्यकांत, भरत, ऋतिक, राहुल, प्रांश एवं समस्त गोलवाल व्यास परिवार'] },
      { title: 'ननिहाल पक्ष', lines: ['श्री शांतिलालजी, ओमप्रकाशजी, हेमंतजी, आशिषजी, प्रवीणजी, गोपालजी, मनीषजी, लव, राघव एवं वरना जोशी परिवार'] },
      { title: 'बड़ मायरेदार', lines: ['श्री शिवराजजी सुरेशजी गिरधारीजी तिवाड़ी', 'गुलर, राजस्थान'] },
      { title: 'विशेष प्रार्थी', lines: ['सौ. कलावती दिनेशजी तिवाड़ी, इचलकरंजी', 'सौ. पद्मा रामदेवजी जोशी, सिकंदराबाद', 'सौ. अनुश्रीया मुकेशजी तिवाड़ी, मालोव', 'सौ. स्वाती गिरिराजजी शर्मा, सिकंदराबाद', 'सौ. संतोष अनिलजी व्यास, सिकंदराबाद', 'सौ. सरला दीपकजी तिवाड़ी, लिंगमपल्ली', 'भाणेज विजयकुमार पारिक, मुंबई', 'भाणेज गोविंद पारिक, दांडोली', 'भाणेज वासुदेव पारिक, सुरत', 'सौ. सविता मनोहरलालजी जोशी, रियां बड़ी', 'सौ. सुभांगी पीतांबरजी पुरोहित, हैदराबाद', 'सौ. पूनम आकाशजी पुरोहित, सिकंदराबाद'] }
    ],
    baraat: 'श्री संजयकुमारजी राजेशजी पुरोहित एवं परिवार की बारात का स्वागत तेरापंथी भवन, सिकंदराबाद में होगा।'
  },
  gallery: [
    { src: 'assets/photos/couple-close.jpg', title: 'Our kind of forever', category: 'us', alt: 'Illustrative Indian wedding portrait of a couple in red and ivory, photographed by ARTO SURAJ' },
    { src: 'assets/photos/couple-portrait.jpg', title: 'All dressed up in love', category: 'us', alt: 'Illustrative formal portrait of an Indian bride and groom, photographed by ARTO SURAJ' },
    { src: 'assets/photos/celebration.jpg', title: 'The little details', category: 'details', alt: 'Illustrative photograph of a wedding flower bouquet in warm evening light' },
    { src: 'assets/photos/couple-hero.jpg', title: 'A moment, just for us', category: 'us', alt: 'Illustrative wedding couple sharing a quiet moment beneath warm fairy lights, photographed by ARTO SURAJ' }
  ]
};
