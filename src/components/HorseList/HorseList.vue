<template>
  <div class="horse-list">
    <div class="horse-list__header">
      <h2>Horse List (1 - {{ horses.length || 20 }})</h2>
    </div>

    <div class="horse-list__body">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Condition</th>
            <th>Color</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="horse in horses" :key="horse.id" class="horse-list__row">
            <td>{{ horse.name }}</td>
            <td>{{ horse.condition }}</td>
            <td class="horse-list__color-cell">
              <span
                class="horse-list__color-dot"
                :style="{ backgroundColor: horse.color.toLowerCase() }"
              ></span>
              {{ horse.color }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HorseList',

  computed: {
    horses() {
      return this.$store.getters['horses/allHorses']
    },
  },
}
</script>

<style scoped>
/*
  "scoped" means these styles ONLY apply to this component.
  No risk of accidentally affecting other components.
*/

.horse-list {
  width: 220px;
  flex-shrink: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.horse-list__header {
  background-color: #e8a838;
  padding: 8px 12px;
}

.horse-list__header h2 {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.horse-list__body {
  max-height: 500px;
  overflow-y: auto; /* makes the list scrollable */
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

thead tr {
  background-color: #f9f9f9;
  border-bottom: 2px solid #ddd;
}

th {
  padding: 6px 8px;
  text-align: left;
  font-weight: bold;
  color: #555;
}

.horse-list__row {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.horse-list__row:hover {
  background-color: #fff8ee;
}

td {
  padding: 6px 8px;
  color: #333;
}

/* The colored circle next to the color name */
.horse-list__color-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.horse-list__color-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}
</style>
