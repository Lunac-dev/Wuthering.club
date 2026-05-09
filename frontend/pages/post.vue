<template>
  <v-container>
    <v-card style="background-color: #121212" class="pa-10">
      <v-overlay v-if="loading">
        <v-progress-circular indeterminate />
      </v-overlay>
      <h1>{{ $t("post.title") }}</h1>
      <p>{{ $t("post.text") }}</p>
      <v-divider />
      <v-form ref="form" class="pt-3">
        <h5>{{ $t("post.thumbnail") }}</h5>
        <v-btn color="primary" @click="deleteImage" text v-if="uploadSuccess">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <v-img
          :src="thumbnail"
          height="300"
          contain
          v-if="uploadSuccess"
        ></v-img>
        <div v-if="!uploadSuccess">
          <v-file-input
            @change="uploadImage"
            show-size
            truncate-length="15"
            accept="image/*"
            v-model="thumbnail"
            :label="$t('post.thumbnailDesc')"
          ></v-file-input>
        </div>
        <v-progress-linear
          v-if="isUploading"
          :value="uploadProgress"
          striped
          color="blue"
        ></v-progress-linear>
        <v-alert v-if="uploadError" type="error">{{
          $t("post.uploadError")
        }}</v-alert>
        <h5>{{ $t("post.title2") }}</h5>
        <v-text-field
          outlined
          v-model="title"
          counter
          maxlength="200"
          :label="$t('post.title3')"
          :rules="[required]"
        ></v-text-field>
        <h5>{{ $t("post.content") }}</h5>

        <client-only>
          <VueEditor
            class="ql-editor"
            v-model="content"
            useCustomImageHandler
            @image-added="handleImageAdded"
          />
        </client-only>

        <h5 class="mt-5">{{ $t("post.square") }}</h5>
        <v-select
          outlined
          v-model="square"
          item-text="label"
          item-value="value"
          :items="squares"
          filled
          :label="$t('post.squareDesc')"
          :rules="[required]"
        />
        <v-btn
          class="mt-5 black--text"
          color="primary"
          elevation="2"
          block
          @click="submit()"
          >{{ $t("post.title") }}</v-btn
        >
      </v-form>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "SubmitPage",
  middleware: "auth",
  data() {
    return {
      squares: [
        {
          label: "一般 (General)",
          value: "1",
        },
        {
          label: "質問 (Questions)",
          value: "2",
        },
        {
          label: "創作活動 (Creative Activities)",
          value: "3",
        },
      ],
      thumbnail: null,
      fileID: null,
      square: null,
      title: "",
      content: null,
      loading: false,
      isUploading: false,
      uploadProgress: 0,
      uploadSuccess: false,
      uploadError: false,
      required: (value) => !!value || "必要です。",
    };
  },

  head() {
    return {
      title: this.$t("post.title"),
    };
  },

  methods: {
    async reloadImage(retries = 5) {
      const newUrl = this.thumbnail + "?t=" + new Date().getTime();

      for (let i = 0; i < retries; i++) {
        try {
          const img = new Image();
          img.src = newUrl;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          // 画像が正常に読み込まれたら更新
          this.thumbnail = newUrl;
          return;
        } catch (error) {
          console.log(`Retry ${i + 1}: Image not available yet, retrying...`);
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 1秒待つ
        }
      }

      console.error("Failed to load image after retries.");
    },
    handleImageAdded: function (file, Editor, cursorLocation, resetUploader) {
      this.loading = true;

      const formData = new FormData();
      formData.append("file", file);

      const reader = new FileReader();
      reader.onload = (event) => {
        const tempImageUrl = event.target.result;
        Editor.insertEmbed(cursorLocation, "image", tempImageUrl);
      };
      reader.readAsDataURL(file);

      this.$axios({
        url: "/v2/uploadImg",
        method: "POST",
        data: formData,
      })
        .then((result) => {
          let imageUrl =
            "https://YOUR_S3_ENDPOINT/wuthering/" + result.data.id;
          imageUrl += "?t=" + new Date().getTime(); // キャッシュ回避

          // 画像がロードされたら再レンダリング
          const img = new Image();
          img.src = imageUrl;
          img.onload = () => {
            Editor.deleteText(cursorLocation, 1);
            Editor.insertEmbed(cursorLocation, "image", imageUrl);
          };

          resetUploader();
          this.loading = false;
        })
        .catch((err) => {
          console.error("Image upload failed:", err);
          this.loading = false;
        });
    },
    async deleteImage() {
      this.loading = true;
      await this.$axios.$post("/v2/remove", {
        id: this.fileID,
      });
      this.thumbnail = null;
      this.uploadSuccess = false;
      this.uploadError = false;

      this.$swal({
        icon: "success",
        title: this.$t("post.successTitle"),
        text: this.$t("post.deleteImgSuccess"),
      });
      this.loading = false;
    },

    async uploadImage() {
      if (!this.thumbnail) {
        return;
      }

      if (!this.thumbnail.type.startsWith("image/")) {
        this.$swal({
          icon: "error",
          title: "Error",
          text: "Image file only.",
        });
        return;
      }

      this.isUploading = true;
      this.uploadProgress = 0;
      this.uploadSuccess = false;
      this.uploadError = false;

      const formData = new FormData();
      formData.append("file", this.thumbnail);

      this.loading = true;
      try {
        const response = await this.$axios.post("/v2/uploadImg", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            this.uploadProgress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
          },
        });
        if (response.data.status === 200) {
          this.uploadSuccess = true;
          this.thumbnail =
            "https://YOUR_S3_ENDPOINT/wuthering/" + response.data.id;
          this.fileID = response.data.id;
          this.reloadImage();
        } else {
          this.uploadError = true;
        }
      } catch (error) {
        this.uploadError = true;
        console.error(error);
      } finally {
        this.isUploading = false;
      }
      this.loading = false;
    },
    async submit() {
      this.loading = true;
      if (this.$refs.form.validate()) {
        if (!this.content) {
          this.loading = false;
          this.$swal({
            icon: "error",
            title: this.$t("post.noContent"),
          });
        } else if (!this.thumbnail) {
          this.loading = false;
          this.$swal({
            icon: "error",
            title: this.$t("post.noThumbnail"),
          });
        } else {
          try {
            const post = await this.$axios.$post("/post", {
              title: this.title,
              content: this.content,
              thumbnail: this.thumbnail,
              square: this.square,
            });
            if (post.status === 200) {
              this.loading = false;
              this.$swal({
                icon: "success",
                title: this.$t("post.success"),
              });
              this.$router.push("/p/" + post.id);
            } else {
              this.loading = false;
              this.$swal({
                icon: "error",
                title: this.$t("post.errorTitle"),
                text: post.status,
              });
            }
          } catch (error) {
            this.loading = false;
            this.$swal({
              icon: "error",
              title: this.$t("post.errorTitle"),
              text: post.error,
            });
          }
        }
      } else {
        this.loading = false;
        this.$swal({
          icon: "error",
          title: this.$t("post.errorTitle"),
          text: this.$t("post.formEmpty"),
        });
      }
    },
  },
};
</script>
<style scoped>
.ql-editor ::v-deep img {
  max-width: 50% !important;
  height: auto !important;
  display: block;
  margin: 0 auto;
}
</style>
