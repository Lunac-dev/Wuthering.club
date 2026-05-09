<template>
  <v-container v-if="post.id">
    <v-card
      elevation="2"
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
              post.square
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
        <div>
          <v-menu offset-y v-if="$store.state.auth.loggedIn">
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" icon>
                <v-icon>mdi-dots-vertical</v-icon></v-btn
              >
            </template>
            <v-list>
              <v-list-item
                @click="edit(post.id)"
                v-if="post.discord_id === $store.state.auth.user.id"
              >
                <v-list-item-title @click="edit(post.id)">
                  {{ $t("p.edit") }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
      <div class="container text-left">
        <h3>
          {{ post.title }}
        </h3>
        <v-img :src="post.thumbnail" height="500" contain></v-img>
        <div v-html="post.content" class="content-container"></div>
      </div>
    </v-card>
    <v-card
      elevation="2"
      style="background-color: #121212"
      class="mb-1"
      rounded="lg"
    >
      <v-card-text>
        <v-textarea
          outlined
          auto-grow
          :label="this.$t('p.commentText')"
          v-model="comment"
        ></v-textarea>
        <v-btn color="primary" @click="commentPost" class="black--text">{{
          $t("p.comment")
        }}</v-btn>
        <div class="mt-3">
          <v-card
            elevation="0"
            style="background-color: transparent"
            v-for="c in comments"
            :key="c.id"
          >
            <v-list-item>
              <v-list-item-avatar>
                <img :src="c.user_avatar" alt="User Avatar" />
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>
                  {{ c.username }}
                  <v-chip
                    v-if="c.discord_id === post.discord_id"
                    color="orange"
                    small
                  >
                    <v-icon> mdi-crown </v-icon>
                  </v-chip>
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ new Date(c.created_at).toLocaleDateString() }}
                </v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                <v-menu offset-y v-if="$store.state.auth.loggedIn">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn v-bind="attrs" v-on="on" icon>
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item
                      @click="commentDelete(c.id, c.discord_id)"
                      v-if="c.discord_id === $store.state.auth.user.id"
                    >
                      <v-list-item-title>{{
                        $t("p.commentDelete")
                      }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>通報</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-list-item-action>
            </v-list-item>

            <v-card-text>
              <p>{{ c.content }}</p>
              <v-btn
                small
                text
                color="primary"
                @click="toggleReplyForm(c.id)"
                v-if="$store.state.auth.loggedIn"
              >
                返信
              </v-btn>
            </v-card-text>

            <!-- 返信フォーム -->
            <v-expand-transition>
              <div v-if="replyingTo === c.id" class="reply-form px-4">
                <v-textarea
                  outlined
                  auto-grow
                  v-model="replyContent"
                  label="返信を入力"
                ></v-textarea>
                <v-btn small color="primary" @click="submitReply(c.id)"
                  >送信</v-btn
                >
                <v-btn small text @click="toggleReplyForm(null)"
                  >キャンセル</v-btn
                >
              </div>
            </v-expand-transition>

            <!-- 返信コメントの表示 -->
            <div v-if="c.replies.length" class="replies">
              <v-card
                v-for="reply in c.replies"
                :key="reply.id"
                class="ml-4"
                elevation="1"
                style="background-color: #1a1a1a"
              >
                <v-list-item>
                  <v-list-item-avatar>
                    <img :src="reply.user_avatar" alt="User Avatar" />
                  </v-list-item-avatar>

                  <v-list-item-content>
                    <v-list-item-title>
                      {{ reply.username }}
                      <v-chip
                        v-if="reply.discord_id === post.discord_id"
                        color="orange"
                        small
                      >
                        <v-icon> mdi-crown </v-icon>
                      </v-chip>
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ new Date(reply.created_at).toLocaleDateString() }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-menu offset-y v-if="$store.state.auth.loggedIn">
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn v-bind="attrs" v-on="on" icon>
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item
                          @click="commentDelete(reply.id, reply.discord_id)"
                          v-if="reply.discord_id === $store.state.auth.user.id"
                        >
                          <v-list-item-title>{{
                            $t("p.commentDelete")
                          }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>通報</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-list-item-action>
                </v-list-item>
                <v-card-text>
                  <p>{{ reply.content }}</p>
                </v-card-text>
              </v-card>
            </div>
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import FollowButton from "@/components/FollowButton.vue";
export default {
  async mounted() {
    try {
      const response = await this.$axios.get("/post/" + this.$route.params.id);
      if (response.data.status !== 200) {
        this.$swal({
          icon: "error",
          title: "Oops...",
          text: "Post not found.",
        });
      } else {
        this.post = response.data.post;
      }

      await this.fetchComments();
    } catch (err) {
      this.$swal({
        icon: "error",
        title: "Oops...",
        text: "Reload the web page and try again.",
      });
    }
  },
  data() {
    return {
      post: {},
      comments: [],
      comment: null,
      replyingTo: null,
      replyContent: "",
    };
  },
  head() {
    return {
      title: this.post.title,
    };
  },
  components: {
    FollowButton,
  },
  methods: {
    async fetchComments() {
      try {
        const response = await this.$axios.get(
          `/comments/${this.$route.params.id}`
        );
        this.comments = this.organizeComments(response.data);
      } catch (error) {
        console.error("コメントの取得に失敗しました", error);
      }
    },
    organizeComments(comments) {
      const commentMap = {};
      const topLevelComments = [];

      comments.forEach((comment) => {
        comment.replies = [];
        commentMap[comment.id] = comment;
        if (comment.parent_id) {
          commentMap[comment.parent_id]?.replies.push(comment);
        } else {
          topLevelComments.push(comment);
        }
      });

      return topLevelComments;
    },
    toggleReplyForm(commentId) {
      this.replyingTo = this.replyingTo === commentId ? null : commentId;
      this.replyContent = "";
    },
    async submitReply(parentId) {
      if (!this.$store.state.auth.loggedIn) {
        this.$swal({
          icon: "error",
          title: "おっと...",
          text: "返信するにはログインが必要です。",
        });
        return;
      }
      if (!this.replyContent.trim()) {
        this.$swal({
          icon: "error",
          title: "おっと...",
          text: "返信を入力してください。",
        });
        return;
      }
      try {
        await this.$axios.post("/addComment", {
          post_id: this.$route.params.id,
          content: this.replyContent,
          parent_id: parentId,
        });
        this.replyContent = "";
        this.replyingTo = null;
        await this.fetchComments();
      } catch (error) {
        console.error("返信の投稿に失敗しました", error);
      }
    },
    edit(id) {
      this.$router.push("/edit/" + id);
    },
    async commentPost() {
      if (!this.$store.state.auth.loggedIn) {
        this.$swal({
          icon: "error",
          title: "おっと...",
          text: "コメントするにはログインが必要です。",
        });
        return;
      }
      if (!this.comment) {
        this.$swal({
          icon: "error",
          title: "おっと...",
          text: "コメントを入力してください。",
        });
        return;
      }
      try {
        await this.$axios.post("/addComment", {
          post_id: this.$route.params.id,
          content: this.comment,
          parent_id: null,
        });
        this.comment = null;
        await this.fetchComments();
      } catch (error) {
        console.error("コメントの投稿に失敗しました", error);
      }
    },
    async commentDelete(id, discord_id) {
      if (!this.$store.state.auth.loggedIn) {
        this.$swal({
          icon: "error",
          title: "Oops...",
          text: "You need to login to delete the comment.",
        });
        return;
      }
      if (discord_id !== this.$store.state.auth.user.id) {
        this.$swal({
          icon: "error",
          title: "Oops...",
          text: "You can only delete your own comments.",
        });
        return;
      }

      try {
        await this.$axios.post("/deleteComment", {
          id: id,
        });
        this.$swal({
          icon: "success",
          title: "Success",
        });
        await this.fetchComments();
      } catch (error) {
        console.error("コメントの削除に失敗しました", error);
      }
    },
  },
};
</script>

<style scoped>
.content-container ::v-deep img {
  max-height: 300px;
  max-width: 100%;
  height: auto;
}
a {
  text-decoration: none;
}
</style>
