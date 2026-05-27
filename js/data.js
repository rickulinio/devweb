const CONFIG = {
    // ID użytkowników i ich uprawnienia
    admins: {
        "123456789": { name: "Administrator", role: "admin" }, // admin ma dostęp do wszystkiego
        "987654321": { name: "LSPD Lider", role: "lspd" }      // lspd lider zarządza tylko lspd
    },
    // Lista frakcji
    factions: [
        { key: "lspd", name: "LSPD", icon: "👮", desc: "Departament Policji", status: true, color: "#3498db" },
        { key: "ems", name: "EMS", icon: "🚑", desc: "Pogotowie", status: true, color: "#e74c3c" }
    ]
};

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
  },

  {
    key: 'adm321312', 
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
            id: 'adm3121231',
            label: 'Dlaczego chcesz dołączyć?',
            type: 'textarea',
            required: true,
            maxLength: 800 // Limit 800 znaków
          },
          {
            id: 'adm4343432',
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
            id: 'adm4334343',
            label: 'Gdzie byłeś w administracji?',
            type: 'textarea',
            required: true,
            maxLength: 1200
          }
        ]
      }
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