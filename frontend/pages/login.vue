<template>
  <v-container>
    <v-card style="background-color: #121212" class="text-center pa-10">
      <img src="/img/2.png" class="hidden-sm-and-down" height="300" />
      <h1>{{ $t("login.title") }}</h1>
      <v-card-text>
        <p>{{ $t("login.text") }}</p>
        <v-btn color="discord" @click="loginpage">{{
          $t("login.discord")
        }}</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "LoginPage",
  head: {
    title: "ログイン",
  },
  methods: {
    loginpage() {
      this.$auth.loginWith("discord");
    },
  },
  async mounted() {
    if (this.$store.state.auth.loggedIn) {
      this.$router.push("/");
    }
  },
};
</script>

<style scoped lang="css">
.title {
  color: #c8c6d7;
  font-size: 26px;
}
</style>
