<template>
  <div class="flex flex-col">
    <div class="flex-1 flex items-start justify-center">
      <div class="liste-container">
        <!-- Filter bar -->
        <div class="filter-bar">
          <div class="filter-group">
            <label for="level-filter">Level:</label>
            <select
              id="level-filter"
              v-model="filters.level"
              class="form-select"
            >
              <option value="">Tous</option>
              <option v-for="level in levels" :key="level.id" :value="level.id">
                {{ level.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="theme-filter">Theme:</label>
            <select
              id="theme-filter"
              v-model="filters.theme"
              class="form-select"
            >
              <option value="">Tous</option>
              <option v-for="theme in themes" :key="theme.id" :value="theme.id">
                {{ theme.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="type-filter">Type:</label>
            <select id="type-filter" v-model="filters.type" class="form-select">
              <option value="">Tous</option>
              <option v-for="type in exerciseTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="eval-filter">Last Eval:</label>
            <select
              id="eval-filter"
              v-model="filters.evaluation"
              class="form-select"
            >
              <option value="">Tous</option>
              <option value="working">Working (OK)</option>
              <option value="not-working">Not Working (KO)</option>
              <option value="no-eval">No Evaluation</option>
            </select>
          </div>

          <div class="exercise-count">
            {{ filteredExercises.length }} exercice(s) trouvé(s)
          </div>

          <button class="btn btn-secondary" v-on:click="resetFilters">
            effacer les filtres
          </button>
        </div>
        
        <div class="max-w-full w-full table-container">
          <table class="table min-w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Level</th>
                <th>Theme</th>
                <th>Num</th>
                <th>Position</th>
                <th>Turn</th>
                <th>Type</th>
                <th>Instruction | indice | solution</th>
                <th>Last Eval</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="exercise in filteredExercises">
                <td>{{ exercise.id }}</td>
                <td>{{ exercise.level_name }}</td>
                <td>{{ exercise.theme_name }}</td>
                <td>{{ exercise.num }}</td>
                <td class="chessboard-cell">
                  <div
                    class="chessboard-wrapper clickable"
                   v-on:click="navigateToExercise(exercise.id)"
                  >
                    <div
                      v-if="
                        exercise.fen != '' &&
                        exercise.fen != null &&
                        exercise.fen != 'fen'
                      " >
                      <TheChessboard :key="exercise.id" :board-config="getBoardConfig(exercise)" />
                    </div>
                  </div>
                </td>
                <td>{{ exercise.turn }}</td>
                <td>{{ exercise.type }}</td>
                <td>
                  <div class="text-xs font-bold">CONSIGNE</div>
                  <div
                    class="instruction-container"
                    v-html="exercise.instruction"
                  ></div>
                  <hr class="my-3" />
                  <div class="text-xs font-bold">INDICE</div>
                  <div class="indice-container" v-html="exercise.indice"></div>
                  <hr class="my-3" />
                  <div class="text-xs font-bold">SOLUTION</div>
                  <div
                    class="solution-container"
                    v-html="exercise.solution"
                  ></div>
                </td>
                <td>
                  <div class="commentaires-container">
                    <div v-if="exercise.last_comment" class="comments-list">
                      <div class="comment-header">
                        <HandThumbUpIcon
                          v-if="exercise.last_comment.is_working"
                          class="thumb-icon thumb-up"
                        />
                        <HandThumbDownIcon
                          v-else
                          class="thumb-icon thumb-down"
                        />
                        <div class="comment-date">
                          {{ formatDate(exercise.last_comment.created_at) }}
                          <br> par {{ exercise.last_comment.user.username }}
                        </div>

                        <div class="comment-content">
                          {{ exercise.last_comment.content }}
                        </div>
                      </div>
                    </div>
                    <div v-else class="no-comments">Aucune évaluation</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { $api } from "../utils/api";
import { TheChessboard } from "vue3-chessboard";
import "vue3-chessboard/style.css";
import { initialListeBoardConfig } from "../config/Chessboard";
import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/vue/24/solid";

export default {
  name: "Liste",
  components: {
    TheChessboard,
    HandThumbUpIcon,
    HandThumbDownIcon,
  },
  emits: ["update-page-info"],
  setup(props, { emit }) {
    const router = useRouter();
    const exercises = ref([]);
    const levels = ref([]);
    const themes = ref([]);
    const loading = ref(true);
    const error = ref(null);

    // Filter state
    const filters = ref({
      level: "",
      theme: "",
      type: "",
      evaluation: "",
    });

    // Unique exercise types
    const exerciseTypes = computed(() => {
      const types = new Set(exercises.value.map((ex) => ex.type));
      return Array.from(types);
    });

    // Filtered exercises based on selected filters
    const filteredExercises = computed(() => {
      return exercises.value.filter((exercise) => {
        // Apply level filter
        if (filters.value.level && exercise.level_id != filters.value.level) {
          return false;
        }

        // Apply theme filter
        if (filters.value.theme && exercise.theme_id != filters.value.theme) {
          return false;
        }

        // Apply type filter
        if (filters.value.type && exercise.type !== filters.value.type) {
          return false;
        }

        // Apply evaluation filter
        if (filters.value.evaluation) {
          if (
            filters.value.evaluation === "working" &&
            (!exercise.last_comment || !exercise.last_comment.is_working)
          ) {
            return false;
          }
          if (
            filters.value.evaluation === "not-working" &&
            (!exercise.last_comment || exercise.last_comment.is_working)
          ) {
            return false;
          }
          if (filters.value.evaluation === "no-eval" && exercise.last_comment) {
            return false;
          }
        }

        return true;
      });
    });

    const resetFilters = () => {
      filters.value = {
        level: "",
        theme: "",
        type: "",
        evaluation: "",
      };
    };

    const getBoardConfig = (exercise) => {
      return {
        ...initialListeBoardConfig,
        fen: exercise.fen,
        orientation: exercise.turn,
      };
    };

    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    };

    const navigateToExercise = (exerciseId) => {
      router.push(`/exercices/verif/${exerciseId}`);
    };

    onMounted(async () => {
      emit("update-page-info", { name: "liste", title: "Liste des exercices" });

      try {
        loading.value = true;

        // Load exercises - using getAllExercises endpoint instead of /exercises/all
        const exercisesResponse = await $api("/exercises/all", {
          method: "GET",
        });
        exercises.value = exercisesResponse.exercises;

        // Load levels
        const levelsResponse = await $api("/levels", {
          method: "GET",
        });
        levels.value = levelsResponse;

        // Load themes
        const themesResponse = await $api("/themes", {
          method: "GET",
        });
        themes.value = themesResponse;
      } catch (err) {
        error.value = "Failed to load data: " + err.message;
        console.error("Error loading data:", err);
      } finally {
        loading.value = false;
      }
    });

    return {
      exercises,
      levels,
      themes,
      loading,
      error,
      filters,
      exerciseTypes,
      filteredExercises,
      resetFilters,
      getBoardConfig,
      formatDate,
      navigateToExercise,
    };
  },
};
</script>

<style scoped>
.main-wrap {
  width: 250px !important;
  margin-inline: auto;
  max-width: 100%;
}

.liste-container {
  padding: 20px;
  font-family: "Arial", sans-serif;
  width: 100%;
}

.table-container {
  display: block;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

table {
  width: 100%;
  min-width: 1200px;
  border-collapse: collapse;
  table-layout: auto;
}

th,
td {
  padding: 8px 12px;
  border: 1px solid #ddd;
  text-align: left;
  vertical-align: middle;
  overflow: hidden;
}

th:nth-child(1) {
  width: 5%;
}
th:nth-child(2) {
  width: 7%;
}
th:nth-child(3) {
  width: 7%;
}
th:nth-child(4) {
  width: 5%;
}
th:nth-child(5) {
  width: 15%;
}
th:nth-child(6) {
  width: 5%;
}
th:nth-child(7) {
  width: 7%;
}
th:nth-child(8) {
  width: 40%;
}
th:nth-child(9) {
  width: 9%;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

/* Updated styling for alternating rows */
tr:nth-child(odd) {
  background-color: #ffffff;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f1f1f1;
}

.chessboard-cell {
  padding: 5px;
  width: 250px;
  height: 250px;
}

.chessboard-wrapper {
  width: 100%;
  aspect-ratio: 1;
  max-width: 250px;
  margin: 0 auto;
}

.clickable {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.clickable:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

:deep(.vue3-chessboard) {
  width: 100% !important;
  height: 100% !important;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.filter-group label {
  margin-bottom: 5px;
  font-weight: bold;
}

.form-select {
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: white;
}

.exercise-count {
  display: flex;
  align-items: flex-end;
  padding-bottom: 10px;
  font-weight: bold;
  color: #495057;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  align-self: flex-end;
  margin-top: 24px;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

/* Styles pour les commentaires */
.commentaires-container {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
  font-family: "Roboto", sans-serif;
}

.comment-item {
  padding: 8px 0;
  border-bottom: 1px solid #eaeaea;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {

  margin-bottom: 4px;
}

.thumb-icon {
  width: 20px;
  height: 20px;
  margin-top: 2px;
  margin-right: 8px;
  flex-shrink: 0;
}

.thumb-up {
  color: #22c55e; /* green-500 */
}

.thumb-down {
  color: #ef4444; /* red-500 */
}

.comment-user-info {
  display: flex;
  flex-direction: column;
}

.comment-username {
  font-weight: 600;
  font-size: 0.875rem;
}

.comment-date {
  font-size: 0.75rem;
  color: #6b7280; /* gray-500 */
}

.comment-content {
  font-size: 0.875rem;
  margin-top: 4px;
  word-break: break-word;
}

.comment-empty {
  font-style: italic;
  color: #6b7280; /* gray-500 */
}

.comment-divider {
  margin: 8px 0;
  border-color: #f3f4f6; /* gray-100 */
}

.no-comments {
  font-size: 0.875rem;
  color: #6b7280; /* gray-500 */
  font-style: italic;
}
</style>
