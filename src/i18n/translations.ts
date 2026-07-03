export type Language = 'en' | 'ru'

export const translations = {
  en: {
    nav: {
      marketplace: 'Marketplace',
      bounties: 'Bounties',
      dashboard: 'Dashboard',
      signIn: 'Sign In',
    },
    landing: {
      hero: {
        title: 'End the Frankenstein Effect in Your Games',
        subtitle:
          'Setty is a curated marketplace for 2D and 3D digital assets with strict style synchronization, so every piece you buy fits together by design.',
        exploreAssets: 'Explore Assets',
        postBounty: 'Post a Bounty',
      },
      stats: {
        assets: 'Curated assets',
        artists: 'Verified artists',
        matchRate: 'Style match rate',
        paidOut: 'Paid to creators',
      },
      features: {
        curated: {
          title: 'Curated Collections',
          description:
            'Every asset is strictly organized by visual style, so anything you pick from a collection is guaranteed to be compatible with the rest.',
        },
        alaCarte: {
          title: 'A La Carte Buying',
          description:
            'Buy exactly the single item you need, without paying for massive bundles full of assets you will never use.',
        },
        bounty: {
          title: 'The Bounty System',
          description:
            'Missing a specific asset in your style. Post a micro task and let 3D and 2D artists deliver exactly what your project needs.',
        },
      },
      preview: {
        label: 'From the marketplace',
        title: 'Recently added assets',
        viewAll: 'View all',
      },
      steps: {
        title: 'How Setty works',
        browse: {
          title: 'Browse by style',
          description:
            'Filter the entire catalog by strict visual style, so every result already fits your project.',
        },
        buy: {
          title: 'Buy what you need',
          description:
            'Purchase single assets at a fair price instead of committing to oversized bundles.',
        },
        bounty: {
          title: 'Fill the gaps with bounties',
          description:
            'Missing a piece. Post a bounty and receive a matching asset from a verified artist.',
        },
      },
      cta: {
        title: 'Build a consistent world, one asset at a time',
        startBrowsing: 'Start Browsing',
        createAccount: 'Create an Account',
      },
    },
    marketplace: {
      title: 'Marketplace',
      searchPlaceholder: 'Search assets or creators...',
      results: 'results',
      noResults: 'No assets match your filters.',
      addToCart: 'Add to Cart',
      by: 'by',
      category: 'Category',
      visualStyle: 'Visual Style',
      sort: {
        popular: 'Most Popular',
        newest: 'Newest',
        priceAsc: 'Price: Low to High',
        priceDesc: 'Price: High to Low',
      },
      categories: {
        all: 'All Categories',
        environment: 'Environment',
        character: 'Character',
        prop: 'Prop',
        vfx: 'VFX',
        uiKit: 'UI Kit',
      },
      styles: {
        all: 'All Styles',
        lowPoly: 'Low Poly',
        cyberpunk: 'Cyberpunk',
        handPainted: 'Hand painted',
        realistic: 'Realistic',
      },
    },
    bounties: {
      title: 'Bounties',
      postTitle: 'Post a Bounty',
      taskTitle: 'Task Title',
      description: 'Description',
      requiredStyle: 'Required Style',
      reward: 'Reward Amount (USD)',
      publish: 'Publish Bounty',
      openBounties: 'Open Bounties',
      acceptTask: 'Accept Task',
    },
    dashboard: {
      title: 'Dashboard',
      myAssets: 'My Assets',
      myBounties: 'My Bounties',
      download: 'Download',
      viewFiles: 'View Files',
      markDone: 'Mark Done',
      statusInProgress: 'In Progress',
      statusCompleted: 'Completed',
    },
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signInSubtitle: 'Access your Setty account.',
      signUpSubtitle: 'Create a new Setty account.',
      email: 'Email',
      password: 'Password',
      pleaseWait: 'Please wait...',
      noAccount: "Don't have an account? Sign up",
      hasAccount: 'Already have an account? Sign in',
    },
    footer: {
      brand: 'Setty',
    },
  },
  ru: {
    nav: {
      marketplace: 'Маркетплейс',
      bounties: 'Баунти',
      dashboard: 'Кабинет',
      signIn: 'Войти',
    },
    landing: {
      hero: {
        title: 'Конец эффекту Франкенштейна в ваших играх',
        subtitle:
          'Setty — это курируемый маркетплейс 2D и 3D цифровых ассетов со строгой синхронизацией стиля, поэтому каждый элемент, который вы покупаете, сочетается с остальными по замыслу.',
        exploreAssets: 'Смотреть ассеты',
        postBounty: 'Разместить баунти',
      },
      stats: {
        assets: 'Отобранных ассетов',
        artists: 'Проверенных художников',
        matchRate: 'Точность совпадения стиля',
        paidOut: 'Выплачено авторам',
      },
      features: {
        curated: {
          title: 'Курируемые коллекции',
          description:
            'Каждый ассет строго распределён по визуальному стилю, поэтому любой элемент из коллекции гарантированно совместим с остальными.',
        },
        alaCarte: {
          title: 'Покупка поштучно',
          description:
            'Покупайте ровно тот один элемент, который нужен, без переплаты за огромные наборы с ненужным содержимым.',
        },
        bounty: {
          title: 'Система баунти',
          description:
            'Не хватает конкретного ассета в вашем стиле. Разместите микрозадачу, и 3D и 2D художники создадут именно то, что нужно проекту.',
        },
      },
      preview: {
        label: 'Из маркетплейса',
        title: 'Недавно добавленные ассеты',
        viewAll: 'Смотреть все',
      },
      steps: {
        title: 'Как работает Setty',
        browse: {
          title: 'Ищите по стилю',
          description:
            'Фильтруйте весь каталог по строгому визуальному стилю, чтобы каждый результат уже подходил вашему проекту.',
        },
        buy: {
          title: 'Покупайте то что нужно',
          description:
            'Покупайте отдельные ассеты по честной цене, вместо того чтобы брать избыточные наборы.',
        },
        bounty: {
          title: 'Закрывайте пробелы баунти',
          description:
            'Не хватает элемента. Разместите баунти и получите подходящий ассет от проверенного художника.',
        },
      },
      cta: {
        title: 'Стройте цельный мир, ассет за ассетом',
        startBrowsing: 'Начать просмотр',
        createAccount: 'Создать аккаунт',
      },
    },
    marketplace: {
      title: 'Маркетплейс',
      searchPlaceholder: 'Поиск ассетов или авторов...',
      results: 'результатов',
      noResults: 'Нет ассетов, подходящих под фильтры.',
      addToCart: 'В корзину',
      by: 'автор',
      category: 'Категория',
      visualStyle: 'Визуальный стиль',
      sort: {
        popular: 'Популярные',
        newest: 'Новые',
        priceAsc: 'Цена: сначала дешевые',
        priceDesc: 'Цена: сначала дорогие',
      },
      categories: {
        all: 'Все категории',
        environment: 'Окружение',
        character: 'Персонажи',
        prop: 'Пропсы',
        vfx: 'Эффекты',
        uiKit: 'UI Кит',
      },
      styles: {
        all: 'Все стили',
        lowPoly: 'Лоу поли',
        cyberpunk: 'Киберпанк',
        handPainted: 'Ручная отрисовка',
        realistic: 'Реализм',
      },
    },
    bounties: {
      title: 'Баунти',
      postTitle: 'Разместить баунти',
      taskTitle: 'Название задачи',
      description: 'Описание',
      requiredStyle: 'Требуемый стиль',
      reward: 'Награда (USD)',
      publish: 'Опубликовать баунти',
      openBounties: 'Открытые баунти',
      acceptTask: 'Принять задачу',
    },
    dashboard: {
      title: 'Кабинет',
      myAssets: 'Мои ассеты',
      myBounties: 'Мои баунти',
      download: 'Скачать',
      viewFiles: 'Файлы',
      markDone: 'Отметить готово',
      statusInProgress: 'В процессе',
      statusCompleted: 'Завершено',
    },
    auth: {
      signIn: 'Вход',
      signUp: 'Регистрация',
      signInSubtitle: 'Войдите в свой аккаунт Setty.',
      signUpSubtitle: 'Создайте новый аккаунт Setty.',
      email: 'Email',
      password: 'Пароль',
      pleaseWait: 'Подождите...',
      noAccount: 'Нет аккаунта? Зарегистрироваться',
      hasAccount: 'Уже есть аккаунт? Войти',
    },
    footer: {
      brand: 'Setty',
    },
  },
} as const
