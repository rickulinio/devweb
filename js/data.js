const FACTIONS = [

  {
    key: 'adm', 
    name: 'ADMINISTRACJA',
    icon: '🚨',
    color: '#ff0000',
    desc: "Dołącz do grona administracji Vast Roleplay.",

    webhook: 'https://discord.com/api/webhooks/1508141374342565958/xTp81fK2TzoYfYvWjio9HKiV_Y5mwj_1RI8lpDU1HomZ0KT9S_tgwZT6oHOfUHlU3Qim',
    roleId: '1480310462620110999',

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