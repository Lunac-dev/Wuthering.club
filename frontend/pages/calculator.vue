<template>
  <v-container>
    <h1 class="text-h5 mb-4">キャラクター育成計算機</h1>

    <v-select
      v-model="selected"
      :items="characterList"
      label="キャラクターを選択"
      item-text="text"
      item-value="value"
      @change="loadCharacter"
    >
      <template v-slot:item="{ item }">
        <v-list-item-content class="d-flex align-center">
          <v-img
            :src="item.img"
            contain
            max-width="50"
            max-height="50"
            class="mr-2"
          />
          <span>{{ item.text }}</span>
        </v-list-item-content>
      </template>
    </v-select>

    <v-row class="mt-4">
      <v-col cols="6">
        <v-select
          v-model="currentLevel"
          :items="levelOptions"
          label="現在のレベル"
        />
      </v-col>
      <v-col cols="6">
        <v-select
          v-model="targetLevel"
          :items="levelOptions"
          label="目標のレベル"
        />
      </v-col>
    </v-row>

    <v-skeleton-loader
      v-if="!data || !ascensionTemplate || !levelTable"
      type="card"
    />

    <div v-else>
      <v-card outlined class="mt-4">
        <v-card-title>レベルアップ素材</v-card-title>
        <v-card-text>
          <p>必要EXP: {{ expResult.exp.toLocaleString() }}</p>
          <p>必要シェルコイン: {{ expResult.coin.toLocaleString() }}</p>
          <p>特級換算: {{ Math.ceil(expResult.exp / 20000) }} 個</p>
          <p>上級換算: {{ Math.ceil(expResult.exp / 8000) }} 個</p>
        </v-card-text>
      </v-card>

      <v-card outlined class="mt-4" v-if="requiredRanks.length">
        <v-card-title>必要な突破素材</v-card-title>
        <v-card-text>
          <p>ボス素材: {{ data.ascension.boss }} ×{{ totalAscension.boss }}</p>
          <p>
            採集素材: {{ data.ascension.field }} ×{{ totalAscension.field }}
          </p>
          <p>シェルコイン: {{ totalAscension.coin.toLocaleString() }}</p>
          <p>
            残像ドロップ:
            <span v-for="(amount, rarity) in totalAscension.drop" :key="rarity">
              {{ rarity }} ×{{ amount }}&nbsp;
            </span>
          </p>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      selected: null,
      data: null,
      ascensionTemplate: null,
      levelTable: null,
      characterList: [
        {
          text: "カルロッタ",
          value: "carlotta",
          img: "/img/characters/carlotta.png",
        },
      ],
      currentLevel: 1,
      targetLevel: 90,
    };
  },
  computed: {
    levelOptions() {
      return Array.from({ length: 90 }, (_, i) => i + 1);
    },
    expResult() {
      if (!this.levelTable || this.currentLevel >= this.targetLevel)
        return { exp: 0, coin: 0 };
      const range = this.levelTable.filter(
        (row) => row.level >= this.currentLevel && row.level < this.targetLevel
      );
      const totalExp = range.reduce((sum, row) => sum + row.exp, 0);
      const totalCoin = range.reduce((sum, row) => sum + row.coin, 0) + 700;
      return { exp: totalExp, coin: totalCoin };
    },
    requiredRanks() {
      if (!this.ascensionTemplate) return [];
      const rankLevels = [20, 40, 50, 60, 70, 80];
      return this.ascensionTemplate.levels.filter((level, i) => {
        const lv = rankLevels[i];
        return lv > this.currentLevel && lv <= this.targetLevel;
      });
    },
    totalAscension() {
      if (!this.requiredRanks.length)
        return { boss: 0, field: 0, coin: 0, drop: {} };

      const total = {
        boss: 0,
        field: 0,
        coin: 0,
        drop: {},
      };

      for (const rank of this.requiredRanks) {
        total.boss += rank.boss;
        total.field += rank.field;
        total.coin += rank.coin;
        for (const rarity in rank.drop) {
          if (!total.drop[rarity]) total.drop[rarity] = 0;
          total.drop[rarity] += rank.drop[rarity];
        }
      }

      return total;
    },
  },
  methods: {
    async loadCharacter() {
      this.data = null;
      this.ascensionTemplate = null;
      try {
        const [charRes, ascRes, levelRes] = await Promise.all([
          fetch(`/data/${this.selected}.json`),
          fetch("/data/ascensionTemplate.json"),
          fetch("/data/levelExpTable.json"),
        ]);
        this.data = await charRes.json();
        const ascJson = await ascRes.json();
        this.ascensionTemplate = ascJson.ascensionTemplate;
        this.levelTable = await levelRes.json();
      } catch (e) {
        console.error("データ読み込みエラー:", e);
      }
    },
  },
};
</script>
