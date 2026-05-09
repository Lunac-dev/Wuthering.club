<template>
  <v-app class="bg">
    <v-app-bar fixed app style="background-color: transparent">
      <div class="d-flex align-center">
        <v-toolbar-title
          class="hidden-sm-and-down primary--text"
          style="font-weight: bolder; font-family: sans-serif"
          >Wuthering.club</v-toolbar-title
        >
        <v-btn
          v-for="item in menu"
          :key="item.icon"
          :to="item.link"
          text
          nuxt
          tile
          plain
          :ripple="false"
          class="hidden-sm-and-down"
          style="font-weight: bold"
        >
          {{ item.title }}
        </v-btn>
        <!-- <v-badge dot overlap class="hidden-sm-and-down">
          <v-btn
            text
            nuxt
            tile
            plain
            :ripple="false"
            href="https://discord.gg/4zrQDW9PNq"
            target="_blank"
          >
            {{ this.$t("navbar.community") }}
          </v-btn>
        </v-badge> -->
      </div>
      <v-dialog transition="dialog-top-transition" max-width="600">
        <template v-slot:activator="{ on, attrs }">
          <v-app-bar-nav-icon
            class="hidden-md-and-up"
            v-bind="attrs"
            v-on="on"
          />
        </template>
        <template v-slot:default="dialog">
          <v-card>
            <v-toolbar color="valorant" dark>Menu</v-toolbar>
            <v-card-text>
              <v-list>
                <v-list-item
                  v-for="item in menu"
                  :key="item.icon"
                  :to="item.link"
                >
                  <v-list-item-icon>
                    <v-icon>{{ item.icon }}</v-icon>
                  </v-list-item-icon>
                  <v-list-tile>
                    {{ item.title }}
                  </v-list-tile>
                </v-list-item>
              </v-list>
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn text @click="dialog.value = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
      <!-- <v-menu offset-y rounded="Large" transition="slide-y-transition">
        <template v-slot:activator="{ on, attrs }">
          <v-app-bar-nav-icon class="hidden-md-and-up" v-bind="attrs" v-on="on"/>
        </template>
        <v-list shaped>
          <v-list-item v-for="item in menu" :key="item.icon" :to="item.link">
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-tile>
              {{ item.title }}
            </v-list-tile>
          </v-list-item>
        </v-list>
      </v-menu> -->
      <v-spacer />
      <v-btn text to="/post">
        <v-icon> mdi-draw-pen </v-icon>
      </v-btn>
      <v-menu
        open-on-hover
        offset-y
        rounded="Large"
        transition="slide-y-transition"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn text v-bind="attrs" v-on="on">
            <v-icon> mdi-translate </v-icon>
            <v-icon> mdi-menu-down </v-icon>
          </v-btn>
        </template>
        <v-list nav>
          <v-list-item
            v-if="$i18n.locale !== 'en'"
            @click="() => changeLocale('en')"
          >
            <v-list-item-title>English</v-list-item-title>
          </v-list-item>
          <v-list-item
            v-if="$i18n.locale !== 'ja'"
            @click="() => changeLocale('ja')"
          >
            <v-list-item-title>日本語</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn
        v-if="!$store.state.auth.loggedIn"
        color="discord"
        @click="loginpage"
      >
        Login with Discord
      </v-btn>
      <v-menu
        v-else
        open-on-hover
        offset-y
        rounded="Large"
        transition="slide-y-transition"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn text tile :ripple="false" v-bind="attrs" v-on="on">
            <v-avatar class="mr-3" v-bind="attrs" v-on="on">
              <img v-if="avatar !== null" :src="avatar" alt="Discord Avatar" />
              <v-icon v-else> mdi-account-circle </v-icon>
            </v-avatar>
            {{ $store.state.auth.user.username }}
          </v-btn>
        </template>
        <v-list nav>
          <v-list-item @click="$auth.logout()">
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-main style="font-family: sans-serif">
      <Nuxt />
    </v-main>
    <v-footer app absolute class="ma-0 pa-0 justify-center">
      <v-card
        flat
        tile
        class="text-center"
        width="100%"
        style="background-color: #121212"
      >
        <v-card-text class="grey--text pt-3">
          This is an unofficial community site and is not affiliated with
          Wuthering Waves or Kuro Games.<br />
          Wuthering Waves and content are trademarks and copyright of Guangzhou
          Kuro Technology Co., Ltd.<br />
          Made with <span class="pink--text">&hearts;</span>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-text class="white--text">
          {{ new Date().getFullYear() }} —
          <span class="primary--text" style="font-family: sans-serif"
            >Wuthering.club</span
          >
          <v-chip x-small>β</v-chip>
        </v-card-text>
      </v-card>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: "MainLayout",
  data() {
    return {
      menu: [
        { icon: "mdi-home", title: this.$t("navbar.home"), link: "/" },
        {
          icon: "mdi-forum-outline",
          title: this.$t("navbar.square"),
          link: "/square",
        },
        {
          icon: "mdi-star-four-points",
          title: this.$t("navbar.isi"),
          link: "/isi",
        },
      ],
      avatar: null,
    };
  },

  mounted() {
    if (
      this.$store.state.auth.loggedIn &&
      this.$store.state.auth.user.avatar !== null
    ) {
      this.avatar =
        "https://cdn.discordapp.com/avatars/" +
        this.$store.state.auth.user.id +
        "/" +
        this.$store.state.auth.user.avatar +
        ".png";
    }
  },

  methods: {
    loginpage() {
      this.$router.push("/login");
    },

    changeLocale(locale) {
      this.$i18n.setLocaleCookie(locale);
      this.$router.go(0);
    },
  },
};
</script>
<style scoped>
.bg {
  background-image: url("/img/bg2.webp");
  background-size: cover;
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
