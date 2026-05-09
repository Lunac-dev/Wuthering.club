import colors from "vuetify/es5/util/colors";

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: "%s - 鳴潮 非公式コミュニティ",
    title: "Wuthering.club - 鳴潮 非公式コミュニティ",
    htmlAttrs: {
      lang: "ja",
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content:
          "「Wuthering.club」は、『鳴潮』を愛するプレイヤーが集い、語り合い、共に創り上げていく非公式コミュニティです。",
      },
      {
        hid: "og:site_name",
        property: "og:site_name",
        content: "Wuthering.club - 鳴潮 非公式コミュニティ",
      },
      { hid: "og:type", property: "og:type", content: "website" },
      { hid: "og:url", property: "og:url", content: "https://wuthering.club/" },
      {
        hid: "og:title",
        property: "og:title",
        content: "Wuthering.club - 鳴潮 非公式コミュニティ",
      },
      {
        hid: "og:description",
        property: "og:description",
        content:
          "「Wuthering.club」は、『鳴潮』を愛するプレイヤーが集い、語り合い、共に創り上げていく非公式コミュニティです。",
      },
      {
        hid: "og:image",
        property: "og:image",
        content: "https://wuthering.club/img/icon.png",
      },
      { name: "format-detection", content: "telephone=no" },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  router: {
    middleware: ["maintenance"],
  },

  publicRuntimeConfig: {
    maintenance: process.env.MAINTENANCE_MODE === "true",
  },

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    "@nuxtjs/vuetify",
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    "@nuxtjs/axios",
    "@nuxtjs/i18n",
    "@nuxtjs/auth-next",
    "vue-sweetalert2/nuxt",
    "vue2-editor/nuxt",
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: process.env.API_URL,
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ["~/assets/variables.scss"],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: "#E2CDA9",
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
          discord: "#7289da",
        },
      },
    },
  },

  auth: {
    strategies: {
      discord: {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
      },
    },
    redirect: {
      login: "/login",
      logout: "/",
      callback: "/callback",
      home: "/",
    },
    localStorage: false,
    resetOnError: true,
  },

  i18n: {
    locales: [
      { code: "ja", name: "Japanese", iso: "ja", file: "ja.json" },
      { code: "en", name: "English", iso: "en", file: "en.json" },
    ],
    defaultLocale: "ja",
    langDir: "locales/",
    strategy: "no_prefix",
    lazy: true,
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
};
