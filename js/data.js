const FACTIONS = [
  {
    key: 'adm', 
    name: 'ADMINISTRACJA',
    icon: '🚨',
    color: '#ff0000',
    desc: "Dołącz do grona administracji Vast Roleplay.",
    webhook: 'https://discord.com/api/webhooks/...',
    roleId: '123456789',
    questions: [
      {
        section: 'OOC',
        items: [
          {
            id: 'adm1',
            label: 'Dlaczego chcesz dołączyć?',
            type: 'textarea',
            required: true,
            maxLength: 800 // Limit 800 znaków
          },
          {
            id: 'adm2',
            label: 'Ile masz lat?',
            type: 'input',
            required: true,
            maxLength: 3
          }
        ]
      },
      {
        section: 'Doświadczenie',
        items: [
          {
            id: 'adm3',
            label: 'Gdzie byłeś w administracji?',
            type: 'textarea',
            required: true,
            maxLength: 1200
          }
        ]
      }
    ]
  }
];

const TEAM = [
  {
    initials: 'OWN',
    name: '𝖛𝖜𝖖',
    role: 'Project Leader',
    bio: '',
    image: 'team/vwq.webp'
  },
  {
    initials: 'CO',
    name: '𝓑𝓾𝓾𝔃𝓲𝓴',
    role: 'Project Leader',
    bio: '',
    image: 'team/buzzik.webp'
  },
  {
    initials: 'ADM',
    name: 'SMOKE',
    role: 'Zarząd',
    bio: '',
    image: 'team/smoke.webp'
  },
  {
    initials: 'MOD',
    name: 'rickulinio',
    role: 'Administrator',
    bio: '',
    image: 'team/rickulinio.gif'
  },
  {
    initials: 'MOD',
    name: 'Bartuś',
    role: 'Administrator',
    bio: '',
    image: 'team/bartus.webp'
  },
  {
    initials: 'MOD',
    name: 'dirtowy',
    role: 'Car Developer',
    bio: '',
    image: 'team/dirtowy.webp'
  },
];