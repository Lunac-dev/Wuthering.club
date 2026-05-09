<template>
  <v-container>
    <v-card style="background-color: #121212" class="text-center pa-10">
      <img src="/img/3.png" height="300" />
      <h1>{{ $t("maintenance.title") }}</h1>
      <v-card-text>
        <p>{{ $t("maintenance.text") }}</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "MaintenancePage",
  layout: "maintenance",
  head() {
    return {
      meta: [{ hid: "robots", name: "robots", content: "noindex, nofollow" }],
    };
  },
};
</script>
