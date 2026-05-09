<template>
  <v-container>
    <v-overlay v-if="loading">
      <v-progress-circular indeterminate />
    </v-overlay>
    <v-card
      elevation="2"
      style="background-color: #121212"
      class="mb-1"
      rounded="lg"
    >
      <v-card-title>
        {{ $t("search.title") }}
      </v-card-title>
      <div class="ma-2">
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
      </div>
      <v-divider></v-divider>
      <v-row class="ma-2">
        <v-col cols="6" v-for="post in posts" v-bind:key="post.id" sm="3">
          <v-card class="mx-auto" max-width="344" @click="viewpost(post.id)">
            <v-img :src="post.thumbnail" height="200px"></v-img>

            <v-card-title> {{ post.title }} </v-card-title>

            <v-card-subtitle>
              <div v-text="post.short_content" class="content-container"></div>
            </v-card-subtitle>

            <v-card-actions>
              <v-avatar size="30">
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
              <v-icon left>mdi-comment-outline</v-icon>
              {{ post.comment_count }}
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "SearchPage",

  head: {
    title: "検索",
  },

  data() {
    return {
      posts: null,
      query: null,
      loading: false,
      required: (value) => !!value || "検索欄が空です。",
    };
  },

  async mounted() {
    this.loading = true;
    try {
      const response = await this.$axios.get(
        `/search/${this.$route.query.keyword}`
      );

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

  methods: {
    viewpost(id) {
      this.$router.push("/p/" + id);
    },
    search() {
      this.$router.push("/search?keyword=" + this.query);
    },
  },
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
