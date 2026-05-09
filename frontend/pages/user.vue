<template>
  <v-container v-if="user">
    <v-card>
      <v-img src="/img/bg.png" height="300px"></v-img>
      <v-card-text>
        <v-avatar size="100" class="profile-avatar">
          <img :src="user.avatar" alt="Profile Avatar" />
        </v-avatar>
        <h2 class="profile-name">{{ user.username }}</h2>
        <p class="profile-bio">{{ user.profile }}</p>
        <v-spacer></v-spacer>
        <v-row>
          <v-col cols="4">
            {{ user.posts.length }} {{ $t("user.post") }}
          </v-col>
          <v-col cols="4">
            <span @click="gofollowing"
              >{{ user.following }} {{ $t("user.following") }}</span
            >
          </v-col>
          <v-col cols="4">
            <span @click="gofollowers"
              >{{ user.followers }} {{ $t("user.follower") }}</span
            >
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card
      elevation="2"
      v-for="post in user.posts"
      v-bind:key="post.id"
      style="background-color: #121212"
      class="mb-1"
      rounded="lg"
    >
      <div class="d-flex align-center px-3 pt-3">
        <v-avatar size="50">
          <img :src="post.avatar" alt="Avatar" style="height: 100%" />
        </v-avatar>
        <div class="d-inline-flex flex-column justify-center ml-2">
          <div>{{ post.username }}</div>
          <p class="caption grey--text mb-0">
            {{ new Date(post.posted_date).toLocaleDateString() }}・{{
              post.name
            }}
          </p>
        </div>
        <v-spacer />
        <!-- フォロー機能 -->
        <div v-if="$store.state.auth.loggedIn">
          <div v-if="post.discord_id != $store.state.auth.user.id">
            <FollowButton
              :userId="post.author"
              :currentDiscordId="$store.state.auth.user.id"
            />
          </div>
        </div>
        <v-btn rounded color="primary" v-else class="black--text" to="/login">
          フォロー
        </v-btn>
        <!-- ここまで-->
      </div>
      <div class="container text-left" @click="viewpost(post.id)">
        <h3>
          {{ post.title }}
        </h3>
        <v-img :src="post.thumbnail" height="300" contain></v-img>
        <div v-text="post.short_content" class="content-container"></div>
      </div>
      <v-card-actions>
        <v-icon left>mdi-comment-outline</v-icon>
        {{ post.comment_count }}
        <v-spacer />
        <LikeButton :postId="post.id" />
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import FollowButton from "@/components/FollowButton.vue";
import LikeButton from "@/components/LikeButton.vue";
export default {
  name: "FollowListPage",

  head: {
    title: "アカウント",
  },

  components: {
    FollowButton,
    LikeButton,
  },

  data() {
    return {
      following: null,
      user: null,
    };
  },

  async mounted() {
    try {
      const response = await this.$axios.get(`/user/${this.$route.query.id}`);

      this.user = response.data;
    } catch (err) {
      this.$swal({
        icon: "error",
        title: "Oops...",
        text: "Reload the web page and try again.",
      });
    }
  },

  methods: {
    viewpost(id) {
      this.$router.push("/p/" + id);
    },
    gofollowing() {
      this.$router.push("/followList?id=" + this.$route.query.id);
    },
    gofollowers() {
      this.$router.push("/followerList?id=" + this.$route.query.id);
    },
  },
};
</script>
<style scoped>
.profile-avatar {
  margin-top: -50px;
  margin-bottom: 10px;
}
.content-container ::v-deep {
  color: gray;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.content-container ::v-deep img {
  max-width: 100%;
  height: auto;
  max-height: 300px;
}
</style>
