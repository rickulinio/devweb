const FACTIONS = [

  {
    key: 'adm', 
    name: 'ADMINISTRACJA',
    icon: '🚨',
    color: '#ff0000',
    desc: "Dołącz do grona administracji Vast Roleplay.",

    webhook: 'https://discord.com/api/webhooks/1508582508504027259/po5hxUh6WT83gMb6HOb8avONROkbjvNbVyVwcGUZ9XoTnN3hHfYFgIQLwrUQoE330_9z',
    roleId: '1507803370704863454',

    questions: [
      {
        section: 'OOC',
        items: [
          {
            id: 'adm2',
            label: 'Link do profilu steam',
            type: 'input',
            required: true
          },
          {
            id: 'adm3',
            label: 'Wiek',
            type: 'input',
            required: true,
            maxLength: 2
          },
          {
            id: 'adm4',
            label: 'Czy posiadasz mutacje',
            type: 'input',
            required: true
          },
          {
            id: 'adm5',
            label: 'Co planujesz odgrywać na naszym serwerze',
            type: 'textarea',
            required: true
          },
          {
            id: 'adm6',
            label: 'Ile czasu w ciągu dnia jesteś w stanie poświęcić na sprawy administracyjne:',
            type: 'input',
            required: true
          },
          {
            id: 'adm7',
            label: 'Poprzednie doświadczenie w administracji:',
            type: 'textarea',
            required: true
          },
          {
            id: 'adm8',
            label: 'Jak zareagujesz, gdy podczas rządowego osoby będą się przekrzykiwać i nie dopuszcza cię do słowa:',
            type: 'textarea',
            required: true
          },
          {
            id: 'adm9',
            label: 'Jak powinien wyglądać poprawny "rządowy"',
            type: 'textarea',
            required: true
          },
        ]
      },
    ]
  },

   {
    key: 'test1',
    name: 'LSPD',
    icon: '🚔',
    color: '#60a5fa',
    desc: 'Los Santos Police Department. Stój na straży prawa i porządku w mieście.',

    webhook: 'https://discord.com/api/webhooks/1506328895404900503/wIwVgPNHyI_ito5kNt3HlMLBufv04g1lh23H80ia4G8vbJZ-wM11aM-QT2eIgH8eSK_m',
    roleId: '1480310621911257240',

    questions: [
      {
        section: 'OOC',
        items: [
          {
            id: '14',
            label: 'Twoje Imię:',
            type: 'input',
            required: true
          },
          {
            id: '15',
            label: 'Wiek (min. 14):',
            type: 'input',
            required: true,
            maxLength: 2
          },
          {
            id: '16',
            label: 'Płeć:',
            type: 'input',
            required: true
          },
          {
            id: '17',
            label: 'Mutacja:',
            type: 'input',
            required: true
          },
          {
            id: '18',
            label: 'Opowiedz o swojej przygodzie z Fivemem:',
            type: 'textarea',
            required: true
          },
          {
            id: '19',
            label: 'Opowiedz o przygodzie z służbami w Fivemie:',
            type: 'textarea',
            required: true
          },
          {
            id: '20',
            label: 'Opowiedz coś o sobie:',
            type: 'textarea',
            required: true
          }
        ]
      },
      {
        section: 'IC',
        items: [
          {
            id: '21',
            label: 'Imię i nazwisko ',
            type: 'input',
            required: true
          },
          {
            id: '22',
            label: 'Data urodzenia:',
            type: 'input',
            required: true
          },
          {
            id: '23',
            label: 'Obywatelstwo:',
            type: 'input',
            required: true
          },
          {
            id: '24',
            label: 'Czy byłeś karany:',
            type: 'input',
            required: true
          },
          {
            id: '25',
            label: 'Prawo jazdy:',
            type: 'input',
            required: true
          },
          {
            id: '26',
            label: 'Dlaczego ty:',
            type: 'textarea',
            required: true
          },
          {
            id: '27',
            label: 'List motywacyjny:',
            type: 'textarea',
            required: true
          }
        ]
      }
    ]
  },

  {
    key: 'test', 
    name: 'LSSD',
    icon: '🛡️',
    color: '#2dd4bf',
    desc: "Los Santos Sheriff's Department. Ochrona spokoju poza miastem.",

    webhook: 'https://discord.com/api/webhooks/1506332001198936098/U999ruVpvlqP5xpvpL3Bil5l0JRZtUPqAu8jSfEVuBGZ9tRfEteFGv-Vm6Vuxce4DzGe',
    roleId: '1480310711878946916',

    questions: [
      {
        section: 'OOC',
        items: [
          {
            id: '2',
            label: 'Wiek',
            type: 'input',
            required: true,
            maxLength: 2
          },
          {
            id: '3',
            label: 'Imię',
            type: 'input',
            required: true
          },
          {
            id: '4a',
            label: 'Doświadczenie w frakcji LEA',
            type: 'input',
            required: true
          },
          {
            id: '4b',
            label: 'Na jakich serwerach grałeś',
            type: 'input',
            required: true
          },
          {
            id: '4c',
            label: 'Oceń swoją wiedze w skali od 1-10',
            type: 'input',
            required: true
          }
        ]
      },
      {
        section: 'IC',
        items: [
          {
            id: '5',
            label: 'Imię i nazwisko',
            type: 'input',
            required: true
          },
          {
            id: '6',
            label: 'Narodowość',
            type: 'input',
            required: true
          },
          {
            id: '7',
            label: 'Wiek',
            type: 'input',
            required: true
          },
          {
            id: '8',
            label: 'Płeć',
            type: 'input',
            required: true
          },
          {
            id: '9',
            label: 'Czy byłeś karany, jak tak to za co?',
            type: 'textarea',
            required: true
          },
          {
            id: '10',
            label: 'Jaką szkołę ukończyłeś',
            type: 'input',
            required: true
          },
          {
            id: '11',
            label: 'Poprzednie doświadczenia we frakcji:',
            type: 'textarea',
            required: true
          },
          {
            id: '12',
            label: 'List motywacyjny: (min 100 słów)',
            type: 'textarea',
            required: true
          }
        ]
      }
    ]
  },

   {
    key: 'test3',
    name: 'EMS',
    icon: '🚑',
    color: '#34d399',
    desc: 'Emergency Medical Services. Ratuj życia na ulicach Los Santos każdego dnia.',

    webhook: 'https://discord.com/api/webhooks/1506329264566435971/kqTjdohoE5Fi_9aUSES7vN4Xjhiz_9d6N1I9RykDPOiv0nStuWvB4Fo-6Id-zi7N0-B4',
    roleId: '1480310757697654855',

    questions: [
      {
        section: 'OOC',
        items: [
          {
            id: '39',
            label: 'Twoje Imię:',
            type: 'input',
            required: true
          },
          {
            id: '40',
            label: 'Wiek:',
            type: 'input',
            required: true,
            maxLength: 2
          },
          {
            id: '41',
            label: 'Link do profilu Steam:',
            type: 'input',
            required: true
          },
          {
            id: '42',
            label: 'Czy posiadasz sprawny mikrofon?',
            type: 'input',
            required: true
          },
          {
            id: '43',
            label: 'Ile czasu dziennie możesz poświęcić na służbę?',
            type: 'textarea',
            required: true
          },
          {
            id: '44',
            label: 'Twoje doświadczenie w Roleplay (ile lat/godzin, jakie serwery):',
            type: 'textarea',
            required: true
          },
          {
            id: '45',
            label: 'Czy pełniłeś już kiedyś funkcję medyka na innym serwerze? (Jeśli tak, opisz krótko):',
            type: 'textarea',
            required: true
          }
        ]
      },
      {
        section: 'IC',
        items: [
          {
            id: '46',
            label: 'Imię i nazwisko ',
            type: 'input',
            required: true
          },
          {
            id: '47',
            label: 'Data urodzenia:',
            type: 'input',
            required: true
          },
          {
            id: '48',
            label: 'Numer telefonu:',
            type: 'input',
            required: true
          },
          {
            id: '49',
            label: 'Miejsce zamieszkania:',
            type: 'input',
            required: true
          },
          {
            id: '50',
            label: 'Opisz swoją postać (minimum 3 rozbudowane zdania o charakterze i cechach):',
            type: 'input',
            required: true
          },
          {
            id: '51',
            label: 'Dlaczego zdecydowałeś się na pracę w EMS?',
            type: 'textarea',
            required: true
          },
          {
            id: '52',
            label: 'Dlaczego to właśnie Ty powinieneś zasilić nasze szeregi?',
            type: 'textarea',
            required: true
          },
          {
            id: '53',
            label: 'Co Twoja postać może wnieść do zespołu EMS?',
            type: 'textarea',
            required: true
          }
        ]
      }
    ]
  },

{
  key: 'autoexotic',
  name: 'Auto Exotic',
  icon: '🔧',
  color: '#f97316',
  desc: 'Dołącz do ekipy profesjonalnych mechaników i rozwijaj swoją karierę motoryzacyjną.',

  webhook: 'https://discord.com/api/webhooks/1506329960149946378/aEzWzMia00ZxzTSwkV35EjAAr7NpKpi13d8FVJxsJ3zf-x6nzpa4We_ZXk-k834VNglG',
  roleId: '1480310820956016712',

  questions: [
    {
      section: 'OOC',
      items: [
        {
          id: '20030300303',
          label: 'Wiek:',
          type: 'input',
          required: true,
          maxLength: 2
        },
        {
          id: '45464765',
          label: 'Czy posiadasz mutację:',
          type: 'input',
          required: true
        },
      ]
    },

    {
      section: 'IC',
      items: [
        {
          id: '23123233333',
          label: 'Wiek:',
          type: 'input',
          required: true
        },
        {
          id: '56546453534',
          label: 'Czy posiadasz prawo jazdy kat. B:',
          type: 'input',
          required: true
        },
        {
          id: '6321321',
          label: 'Napisz kilka zdań o sobie (minimum 5 zdań):',
          type: 'textarea',
          required: true
        },
        {
          id: '7321321',
          label: 'Poprzednie doświadczenie:',
          type: 'textarea',
          required: true
        },
        {
          id: '8321312',
          label: 'Jeśli pracowałeś na innych serwerach, podaj nazwę frakcji oraz zajmowany stopień:',
          type: 'textarea',
          required: false
        },
        {
          id: '3123219',
          label: 'Na jakim stopniu chciałbyś się znaleźć w przyszłości?',
          type: 'textarea',
          required: true
        },
        {
          id: '1021121232',
          label: 'Czy masz doświadczenie w pracy grupowej? Rozwiń swoją wypowiedź:',
          type: 'textarea',
          required: true
        },
        {
          id: '111221',
          label: 'Oceń swoją spostrzegawczość w skali od 1 do 5:',
          type: 'input',
          required: true
        }
      ]
    }
  ]
},

   {
    key: 'test2',
    name: 'CRIME',
    icon: '💀',
    color: '#f87171',
    desc: 'Organizacja przestępcza. Buduj imperium i władaj ulicami od zera.',

    webhook: 'https://discord.com/api/webhooks/1506329541235310602/yPzfVU3tGYHobc5-q-fibLGOEoZTWBr9wdfoXFpeVieJ_bHfaxDEbI273IVq19mxVB4O',
    roleId: '1485660946725601310',

    questions: [
      {
        section: 'OOC',
        items: [
          {
            id: '29',
            label: 'Wiek:',
            type: 'input',
            required: true,
            maxLength: 2
          },
          {
            id: '30',
            label: 'Ile masz przegranych godzin w fivem:',
            type: 'input',
            required: true
          },
          {
            id: '31',
            label: 'Nazwa organizacji:',
            type: 'input',
            required: true
          },
          {
            id: '32',
            label: 'Jaką organizacje chcesz założyć (Mafia, Gang uliczny):',
            type: 'input',
            required: true
          },
          {
            id: '33',
            label: 'Ile macie ludzi:',
            type: 'input',
            required: true
          },
          {
            id: '34',
            label: 'Opis organizacji:',
            type: 'input',
            required: true
          },
          {
            id: '35',
            label: 'Czym będzie się zajmować organizacja:',
            type: 'input',
            required: true
          },
          {
            id: '36',
            label: 'Link do interioru:',
            type: 'input',
            required: true
          },
          {
            id: '37',
            label: 'Link do dc organizacji:',
            type: 'input',
            required: true
          }
        ]
      },
    ]
  },

  {
    key: 'podanienafirme', 
    name: 'FIRMA',
    icon: '🏬',
    color: '#caa35e',
    desc: "Załóż firmę tutaj!",

    webhook: 'https://discord.com/api/webhooks/1509270202318192640/7WTh4gmZDL2MBwWkR8EyUf-GQ-bMAKrcjepngr7B5Q5e-EsWc8T9tKx7Py_ktlYWJv96',
    roleId: '1480310121707077753',

    questions: [
      {
        section: 'OOC',
        items: [
          {
            id: 'firma1',
            label: 'Ile masz lat',
            type: 'input',
            required: true,
            maxLength: 2
          },
          {
            id: 'firma2',
            label: 'Ile masz przegranych godzin w fivem:',
            type: 'input',
            required: true,
          },
          {
            id: 'firma3',
            label: 'Ile posiadasz ludzi:',
            type: 'input',
            required: true,
          },
          {
            id: 'firma4',
            label: 'Jaka firma:',
            type: 'input',
            required: true,
          },
          {
            id: 'firma5',
            label: 'Plan na firmę:',
            type: 'textarea',
            required: true,
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
    name: 'dirtowy',
    role: 'Developer / Opiekun ADM',
    bio: '',
    image: 'team/dirtowy.webp'
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
];
