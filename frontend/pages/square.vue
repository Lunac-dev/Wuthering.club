<template>
  <v-container>
    <v-overlay v-if="loading">
      <v-progress-circular indeterminate />
    </v-overlay>
    <v-card class="mx-auto">
      <v-img cover height="350" src="/img/bg.png"></v-img>

      <v-divider class="mx-4"></v-divider>

      <v-card-title>{{ $t("square.title") }}</v-card-title>

      <v-card-subtitle>{{ $t("square.text") }}</v-card-subtitle>

      <v-col cols="12">
        <v-text-field
          append-icon="mdi-magnify"
          color="primary"
          v-model="query"
          dense
          rounded
          clearable
          placeholder="キーワードを入力して検索"
          filled
          :rules="[required]"
          @click:append="search()"
          @keyup.enter="search()"
        />
      </v-col>

      <v-card-text>
        <v-tabs
          v-model="tabs"
          fixed-tabs
          show-arrows
          color="primary"
          @change="nowActiveTab($event)"
        >
          <v-tab>一般 (General)</v-tab>
          <v-tab>質問 (Questions)</v-tab>
          <v-tab>創作活動 (Creative Activities)</v-tab>
          <v-tab>お知らせ (News)</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tabs">
          <v-tab-item>
            <v-card
              elevation="2"
              v-for="post in posts"
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
                  <a :href="'/user?id=' + post.author">{{ post.username }}</a>
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
              </div>
              <div class="container text-left" @click="viewpost(post.id)">
                <h3>
                  {{ post.title }}
                </h3>
                <v-img :src="post.thumbnail" height="300" contain></v-img>
                <div
                  v-text="post.short_content"
                  class="content-container"
                ></div>
              </div>
              <v-card-actions>
                <v-icon left>mdi-comment-outline</v-icon>
                {{ post.comment_count }}
                <v-spacer />
                <LikeButton :postId="post.id" />
              </v-card-actions>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card
              elevation="2"
              v-for="post in posts"
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
                  <a :href="'/user?id=' + post.author">{{ post.username }}</a>
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
              </div>
              <div class="container text-left" @click="viewpost(post.id)">
                <h3>
                  {{ post.title }}
                </h3>
                <v-img :src="post.thumbnail" height="300" contain></v-img>
                <div
                  v-text="post.short_content"
                  class="content-container"
                ></div>
              </div>
              <v-card-actions>
                <v-icon left>mdi-comment-outline</v-icon>
                {{ post.comment_count }}
                <v-spacer />
                <LikeButton :postId="post.id" />
              </v-card-actions>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card
              elevation="2"
              v-for="post in posts"
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
                  <a :href="'/user?id=' + post.author">{{ post.username }}</a>
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
              </div>
              <div class="container text-left" @click="viewpost(post.id)">
                <h3>
                  {{ post.title }}
                </h3>
                <v-img :src="post.thumbnail" height="300" contain></v-img>
                <div
                  v-text="post.short_content"
                  class="content-container"
                ></div>
              </div>
              <v-card-actions>
                <v-icon left>mdi-comment-outline</v-icon>
                {{ post.comment_count }}
                <v-spacer />
                <LikeButton :postId="post.id" />
              </v-card-actions>
            </v-card>
          </v-tab-item>
          <v-tab-item>
            <v-card
              elevation="2"
              v-for="post in posts"
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
                  <a :href="'/user?id=' + post.author">{{ post.username }}</a>
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
              </div>
              <div class="container text-left" @click="viewpost(post.id)">
                <h3>
                  {{ post.title }}
                </h3>
                <v-img :src="post.thumbnail" height="300" contain></v-img>
                <div
                  v-text="post.short_content"
                  class="content-container"
                ></div>
              </div>
              <v-card-actions>
                <v-icon left>mdi-comment-outline</v-icon>
                {{ post.comment_count }}
                <v-spacer />
                <LikeButton :postId="post.id" />
              </v-card-actions>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import FollowButton from "@/components/FollowButton.vue";
import LikeButton from "@/components/LikeButton.vue";
export default {
  name: "SquarePage",

  head: {
    title: "広場",
  },

  data() {
    return {
      tabs: null,
      loading: false,
      posts: null,
      query: null,
      required: (value) => !!value || "検索欄が空です。",
    };
  },

  components: {
    FollowButton,
    LikeButton,
  },

  methods: {
    async nowActiveTab(tab) {
      this.loading = true;

      tab = tab + 1;

      try {
        const response = await this.$axios.get("/posts/" + tab);
        this.posts = response.data.posts;
        this.loading = false;
      } catch (err) {
        this.$swal({
          icon: "error",
          title: "Oops...",
          text: "Reload the web page and try again.",
        });
      }
    },
    viewpost(id) {
      this.$router.push("/p/" + id);
    },
    search() {
      this.$router.push("/search?keyword=" + this.query);
    },
  },

  async mounted() {},
};
</script>
<style scoped>
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
a {
  text-decoration: none;
}
</style>
