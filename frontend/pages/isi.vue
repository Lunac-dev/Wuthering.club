<template>
  <v-container>
    <v-card class="pa-5" elevation="2">
      <v-row>
        <v-col cols="12" md="8">
          <v-card class="pa-5" elevation="2" outlined>
            <v-card-title>🔮 星声計算ツール</v-card-title>

            <v-card-text>
              <v-text-field
                v-model.number="currentPulls"
                label="現在のガチャ回数"
                type="number"
                outlined
              />
              <v-text-field
                v-model.number="pityLimit"
                label="天井回数（通常80）"
                type="number"
                outlined
              />
              <v-text-field
                v-model.number="ownedStars"
                label="現在所持している星声"
                type="number"
                outlined
              />

              <v-switch
                v-model="applyBonus"
                label="初回購入ボーナスを適用"
                inset
                class="mt-2"
              />

              <v-btn color="primary" class="mt-3" @click="calculate" outlined
                >計算する</v-btn
              >
            </v-card-text>

            <v-divider class="my-4" />

            <v-card-text v-if="result">
              <p>
                🎯 残り回数：<strong>{{ result.pullsNeeded }}</strong> 回
              </p>
              <p>
                🌟 必要な星声：<strong>{{ result.totalStarsNeeded }}</strong> 個
              </p>
              <p v-if="result.starsToBuy > 0">
                💰 不足分：<strong>{{ result.starsToBuy }}</strong> 個
              </p>

              <v-divider class="my-4" />

              <p class="subtitle-1">最安な課金プラン</p>
              <v-simple-table dense>
                <thead>
                  <tr>
                    <th>パック</th>
                    <th>個数</th>
                    <th>価格</th>
                    <th>小計</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, i) in result.recommended" :key="i">
                    <td>{{ p.name }}</td>
                    <td>{{ p.count }}</td>
                    <td>¥{{ p.price }}</td>
                    <td>¥{{ p.count * p.price }}</td>
                  </tr>
                  <tr>
                    <td colspan="3"><strong>合計</strong></td>
                    <td>
                      <strong>¥{{ totalPrice }}</strong>
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center justify-center">
          <v-img
            class="hidden-sm-and-down"
            src="/img/pile.png"
            contain
            max-width="100%"
            max-height="500px"
          />
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
export default {
  head: {
    title: "星声計算ツール",
  },
  data() {
    return {
      currentPulls: 0,
      pityLimit: 80,
      ownedStars: 0,
      applyBonus: true,
      result: null,
    };
  },
  computed: {
    totalPrice() {
      if (!this.result) return 0;
      return this.result.recommended.reduce(
        (sum, p) => sum + p.count * p.price,
        0
      );
    },
  },
  methods: {
    calculate() {
      const starPerPull = 160;
      const pullsNeeded = Math.max(0, this.pityLimit - this.currentPulls);
      const totalStarsNeeded = pullsNeeded * starPerPull;
      const starsToBuy = Math.max(0, totalStarsNeeded - this.ownedStars);

      const recommended = this.findCheapestCombination(
        starsToBuy,
        this.applyBonus
      );

      this.result = {
        pullsNeeded,
        totalStarsNeeded,
        starsToBuy,
        recommended,
      };
    },
    findCheapestCombination(starsToBuy, applyBonus) {
      const basePacks = [
        { name: "6480石", value: 6480, bonusValue: 12960, price: 12000 },
        { name: "3280石", value: 3280, bonusValue: 6560, price: 6100 },
        { name: "1980石", value: 1980, bonusValue: 3960, price: 3680 },
        { name: "980石", value: 980, bonusValue: 1960, price: 1840 },
        { name: "300石", value: 300, bonusValue: 600, price: 610 },
        { name: "60石", value: 60, bonusValue: 120, price: 120 },
      ];

      const maxCounts = basePacks.map((p) => Math.ceil(starsToBuy / p.value));
      let best = { total: Infinity, combo: null };

      const dfs = (
        index,
        currentCombo,
        totalValue,
        totalCost,
        bonusUsedMap
      ) => {
        if (totalValue >= starsToBuy) {
          if (totalCost < best.total) {
            best = {
              total: totalCost,
              combo: JSON.parse(JSON.stringify(currentCombo)),
            };
          }
          return;
        }

        if (index >= basePacks.length) return;

        const pack = basePacks[index];

        for (let count = 0; count <= maxCounts[index]; count++) {
          if (count === 0) {
            dfs(index + 1, [...currentCombo], totalValue, totalCost, {
              ...bonusUsedMap,
            });
            continue;
          }

          // 通常購入のみ
          dfs(
            index + 1,
            [
              ...currentCombo,
              {
                name: pack.name,
                count,
                price: pack.price,
                valuePer: pack.value,
              },
            ],
            totalValue + pack.value * count,
            totalCost + pack.price * count,
            { ...bonusUsedMap }
          );

          // ボーナス適用（1個だけ） + 残りは通常
          if (applyBonus && !bonusUsedMap[index]) {
            const bonusPortion = {
              name: `${pack.name}（初回ボーナス）`,
              count: 1,
              price: pack.price,
              valuePer: pack.bonusValue,
            };

            const normalPortion =
              count > 1
                ? {
                    name: pack.name,
                    count: count - 1,
                    price: pack.price,
                    valuePer: pack.value,
                  }
                : null;

            const newCombo = [...currentCombo, bonusPortion];
            if (normalPortion) newCombo.push(normalPortion);

            dfs(
              index + 1,
              newCombo,
              totalValue + pack.bonusValue + pack.value * (count - 1),
              totalCost + pack.price * count,
              { ...bonusUsedMap, [index]: true }
            );
          }
        }
      };

      dfs(0, [], 0, 0, {});
      return best.combo.filter((p) => p.count > 0);
    },
  },
};
</script>
