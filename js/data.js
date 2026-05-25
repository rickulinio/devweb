const FACTIONS = [

  {
    key: 'adm', 
    name: 'ADMINISTRACJA',
    icon: '🚨',
    color: '#ff0000',
    desc: "Dołącz do grona administracji Vast Roleplay.",

    webhook: 'https://discord.com/api/webhooks/1506379285898985635/5g2imypeguUg_2eXyDrdyCLJuRAYDghkY9Ak5NCr7GSHm85mhcWXyf2Y82ywUvbbuJbi',
    roleId: '',

    questions: [
      {
        section: 'OOC',
        items: [
          {
            id: 'adm1',
            label: 'Nazwa + Discord ID',
            type: 'input',
            required: true
          },
        ]
      },
    ]
  },
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