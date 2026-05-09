<template>
  <v-btn rounded color="primary" @click="toggleFollow" class="black--text">
    {{ isFollowing ? "フォロー解除" : "フォロー" }}
  </v-btn>
</template>

<script>
export default {
  props: {
    userId: Number, // フォロー対象のユーザーID
    currentDiscordId: [Number, String], // 現在ログインしているユーザーのDiscord ID
  },
  data() {
    return {
      isFollowing: false,
    };
  },
  async mounted() {
    try {
      const response = await this.$axios.get(
        `/following/${this.currentDiscordId}/true`
      );
      if (response.data) {
        this.isFollowing = response.data.some(
          (user) => user.id === this.userId
        );
      }
    } catch (error) {
      console.error("フォロー状態の取得に失敗しました", error);
    }
  },
  methods: {
    async toggleFollow() {
      try {
        if (this.isFollowing) {
          await this.$axios.post("/unfollow", {
            followed_id: this.userId,
          });
        } else {
          await this.$axios.post("/follow", {
            followed_id: this.userId,
          });
        }
        this.isFollowing = !this.isFollowing;
      } catch (error) {
        console.error("フォロー操作に失敗しました", error);
      }
    },
  },
};
</script>
