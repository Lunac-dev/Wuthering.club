<template>
  <v-container>
    <v-card
      elevation="2"
      style="background-color: #121212"
      class="mb-1"
      rounded="lg"
    >
      <v-card-title>
        {{ $t("followerList") }}
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-list-item v-for="user in follower" :key="user.id">
          <v-list-item-avatar>
            <v-img :src="user.avatar"></v-img>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title
              >{{ user.username }} <v-divider vertical></v-divider>
              <!-- フォロー機能 -->
              <div v-if="$store.state.auth.loggedIn">
                <div v-if="user.discord_id != $store.state.auth.user.id">
                  <FollowButton
                    :userId="user.id"
                    :currentDiscordId="$store.state.auth.user.id"
                  />
                </div>
              </div>
              <v-btn
                rounded
                color="primary"
                v-else
                class="black--text"
                to="/login"
              >
                フォロー
              </v-btn>
              <!-- ここまで-->
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import FollowButton from "@/components/FollowButton.vue";
export default {
  name: "FollowerListPage",

  head: {
    title: "アカウント",
  },

  components: {
    FollowButton,
  },

  data() {
    return {
      follower: null,
    };
  },

  async mounted() {
    try {
      const response = await this.$axios.get(
        `/followers/${this.$route.query.id}`
      );

      this.follower = response.data;
    } catch (err) {
      this.$swal({
        icon: "error",
        title: "おっと...",
        text: "ウェブページを再読み込みして、もう一度お試しください。",
      });
    }
  },

  methods: {},
};
</script>
