<template>
  <v-btn :color="liked ? 'red' : 'grey'" @click="toggleLike" text>
    <v-icon>mdi-heart</v-icon>
    {{ likeCount }}
  </v-btn>
</template>

<script>
export default {
  props: {
    postId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      liked: false,
      likeCount: 0,
    };
  },
  methods: {
    async fetchLikes() {
      try {
        const { data } = await this.$axios.get(`/likes/${this.postId}`);
        this.likeCount = data.count;

        if (this.$store.state.auth.loggedIn) {
          const userData = await this.$axios.get(`/likesUser/${this.postId}`);
          this.liked = userData.data.liked;
        }
      } catch (err) {
        console.error("いいねの取得に失敗", err);
      }
    },
    async toggleLike() {
      if (!this.$store.state.auth.loggedIn) {
        this.$swal({
          icon: "warning",
          title: "ログインしてください",
          text: "いいねをするにはログインが必要です。",
        });
        this.$router.push("/login");
        return;
      }

      try {
        if (this.liked) {
          await this.$axios.delete("/likes", {
            data: {
              post_id: this.postId,
            },
          });
          this.likeCount--;
        } else {
          await this.$axios.post("/likes", {
            post_id: this.postId,
          });
          this.likeCount++;
        }
        this.liked = !this.liked;
      } catch (err) {
        console.error("いいねの更新に失敗", err);
      }
    },
  },
  mounted() {
    this.fetchLikes();
  },
};
</script>
