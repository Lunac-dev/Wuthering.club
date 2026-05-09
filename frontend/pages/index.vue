<template>
  <v-container>
    <v-overlay v-if="loading">
      <v-progress-circular indeterminate />
    </v-overlay>
    <v-btn color="primary" class="mb-2 black--text" to="/timeline">{{
      $t("index.follow")
    }}</v-btn>
    <div v-if="$store.state.auth.loggedIn">
      <v-alert
        v-if="!$store.state.auth.user.verified"
        outlined
        type="error"
        prominent
        border="left"
      >
        {{ $t("alert.title") }}:
        {{ $t("alert.text") }}
      </v-alert>
    </div>
    <v-row>
      <v-col cols="12" sm="8">
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
            <div v-text="post.short_content" class="content-container"></div>
          </div>
          <v-card-actions>
            <v-icon left>mdi-comment-outline</v-icon>
            {{ post.comment_count }}
            <v-spacer />
            <LikeButton :postId="post.id" />
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card
          elevation="2"
          style="background-color: #121212"
          class="mb-1"
          rounded="lg"
        >
          <v-card-title> {{ $t("index.title") }} </v-card-title>
          <v-card-subtitle>
            {{ $t("index.text") }}
          </v-card-subtitle>
          <v-card-actions>
            <v-btn color="primary" class="black--text" to="/post">
              {{ $t("index.submit") }}
            </v-btn>
            <v-btn color="secondary" class="black--text" to="/timeline">
              {{ $t("index.follow") }}
            </v-btn>
          </v-card-actions>
        </v-card>
        <v-card
          elevation="2"
          style="background-color: #121212"
          class="mb-1"
          rounded="lg"
        >
          <div class="d-flex align-center pa-3">
            <v-avatar size="50">
              <img src="/img/icon.png" alt="Avatar" style="height: 100%" />
            </v-avatar>
            <div class="d-inline-flex flex-column justify-center ml-2">
              <a href="https://wutheringwaves.kurogames.com/"
                >Wuthering Waves</a
              >
              <p class="caption grey--text mb-0">2024-5-22・KURO GAMES</p>
            </div>
            <v-spacer />
            <a
              href="https://apps.apple.com/us/app/wuthering-waves/id6475033368?itscg=30200&itsct=apps_box_badge&mttnsubad=6475033368"
              style="display: inline-block"
            >
              <img
                src="https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us?releaseDate=1716249600"
                style="
                  width: 100px;
                  height: 50px;
                  vertical-align: middle;
                  object-fit: contain;
                "
              />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.kurogame.wutheringwaves.global&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
              ><img
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                style="
                  width: 120px;
                  height: 80px;
                  vertical-align: middle;
                  object-fit: contain;
                "
            /></a>
          </div>
        </v-card>
        <v-card
          elevation="2"
          style="background-color: #121212"
          class="mb-1"
          rounded="lg"
        >
          <v-card-title> {{ $t("index.contact") }} </v-card-title>
          <v-card-subtitle>
            {{ $t("index.contactText") }}
          </v-card-subtitle>
          <v-card-text>
            <a href="https://discord.gg/gt6kexeA">
              <v-btn color="discord" class="black--text"> Discord </v-btn>
            </a>
            <a href="https://twitter.com/wutheringclub">
              <v-btn color="info" class="black--text"> Twitter </v-btn>
            </a>
          </v-card-text>
        </v-card>
        <a
          href="https://dcreakemadlf.notion.site/Wuthering-club-0fcbfde56356479e98183ac498545fde"
          target="blank"
        >
          {{ $t("index.privacy") }}
        </a>
        <a
          href="https://dcreakemadlf.notion.site/Wuthering-club-0fcbfde56356479e98183ac498545fde"
          target="blank"
        >
          {{ $t("index.ToS") }}
        </a>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import FollowButton from "@/components/FollowButton.vue";
import LikeButton from "@/components/LikeButton.vue";
export default {
  name: "IndexPage",

  head: {
    title: "ホーム",
  },

  components: {
    FollowButton,
    LikeButton,
  },

  data() {
    return {
      tab: null,
      loading: true,
      posts: null,
    };
  },

  async mounted() {
    try {
      const response = await this.$axios.get("/posts");

      this.posts = response.data.posts;
      this.loading = false;
    } catch (err) {
      this.loading = false;
      this.$swal({
        icon: "error",
        title: "おっと...",
        text: "ウェブページを再読み込みして、もう一度お試しください。",
      });
    }
  },

  methods: {
    viewpost(id) {
      this.$router.push("/p/" + id);
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
