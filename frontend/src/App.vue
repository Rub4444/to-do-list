<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTaskStore } from './stores/taskStore';
import type { Task } from './stores/taskStore';

const store = useTaskStore();

const newTaskTitle = ref('');
const editingId = ref<number | null>(null);
const editingTitle = ref('');

// текущий фильтр (связка с хранилищем)
const currentFilter = computed({
  get: () => store.filter,
  set: (val) => store.setFilter(val),
});

// отфильтрованные задачи из стора
const filteredTasks = computed(() => store.filteredTasks);

// Статистика
const totalCount = computed(() => store.tasks.length);
const doneCount = computed(() => store.tasks.filter(t => t.is_done).length);
const activeCount = computed(() => totalCount.value - doneCount.value);

const handleAddTask = async () => {
  if (!newTaskTitle.value.trim()) return;
  await store.addTask(newTaskTitle.value);
  newTaskTitle.value = '';
};

const startEdit = (task: Task) => {
  editingId.value = task.id;
  editingTitle.value = task.title;
};

const cancelEdit = () => {
  editingId.value = null;
  editingTitle.value = '';
};

const saveEdit = async (task: Task) => {
  if (!editingTitle.value.trim()) {
    cancelEdit();
    return;
  }
  await store.updateTitle(task, editingTitle.value);
  cancelEdit();
};

const toggleTask = (task: Task) => {
  store.toggleTask(task);
};

const deleteTask = (task: Task) => {
  store.deleteTask(task);
};

onMounted(() => {
  store.fetchTasks();
});
</script>

<template>
  <!-- Фон всей страницы -->
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 flex items-center justify-center px-4 py-8">
    <!-- Основная карточка -->
    <div class="w-full max-w-2xl bg-white/10 backdrop-blur-xl shadow-2xl border border-white/10 rounded-3xl p-6 sm:p-8 text-slate-50">
      
      <!-- Заголовок + описание -->
      <header class="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-3xl font-bold tracking-tight flex items-center gap-2">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-200 text-xl">
              ✔
            </span>
            <span>ToDo List</span>
          </h1>
          <p class="text-sm text-slate-300 mt-1">
            Простой список задач с фильтрами, редактированием и статусами.
          </p>
        </div>

        <!-- Мини-статистика -->
        <div class="hidden sm:flex flex-col items-end text-xs text-slate-200">
          <div class="flex items-center gap-2">
            <span class="inline-flex h-2 w-2 rounded-full bg-sky-400"></span>
            Всего: <span class="font-semibold">{{ totalCount }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
            Выполнено: <span class="font-semibold">{{ doneCount }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex h-2 w-2 rounded-full bg-amber-400"></span>
            Активные: <span class="font-semibold">{{ activeCount }}</span>
          </div>
        </div>
      </header>

      <!-- Форма добавления -->
      <form
        class="flex flex-col sm:flex-row gap-3 mb-5"
        @submit.prevent="handleAddTask"
      >
        <div class="relative flex-1">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            +
          </span>
          <input
            v-model="newTaskTitle"
            type="text"
            placeholder="Новая задача..."
            class="w-full pl-8 pr-3 py-2.5 rounded-2xl bg-slate-900/40 border border-slate-500/60 text-sm text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:border-sky-400 shadow-inner"
          />
        </div>
        <button
          type="submit"
          class="inline-flex items-center justify-center px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-500/30 transition active:scale-[0.98]"
        >
          Добавить
        </button>
      </form>

      <!-- Фильтры + статистика для мобилок -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 text-sm">
        <div class="inline-flex bg-slate-900/40 border border-slate-600/80 rounded-2xl p-1">
          <button
            class="px-3 py-1.5 rounded-2xl text-xs sm:text-sm transition"
            :class="currentFilter === 'all'
              ? 'bg-sky-500 text-slate-900 font-semibold shadow-sm shadow-sky-500/30'
              : 'text-slate-200 hover:bg-slate-700/70'"
            @click="currentFilter = 'all'"
          >
            Все
          </button>
          <button
            class="px-3 py-1.5 rounded-2xl text-xs sm:text-sm transition"
            :class="currentFilter === 'active'
              ? 'bg-sky-500 text-slate-900 font-semibold shadow-sm shadow-sky-500/30'
              : 'text-slate-200 hover:bg-slate-700/70'"
            @click="currentFilter = 'active'"
          >
            Активные
          </button>
          <button
            class="px-3 py-1.5 rounded-2xl text-xs sm:text-sm transition"
            :class="currentFilter === 'done'
              ? 'bg-sky-500 text-slate-900 font-semibold shadow-sm shadow-sky-500/30'
              : 'text-slate-200 hover:bg-slate-700/70'"
            @click="currentFilter = 'done'"
          >
            Завершённые
          </button>
        </div>

        <div class="flex sm:hidden justify-between text-xs text-slate-200">
          <span>Всего: <span class="font-semibold">{{ totalCount }}</span></span>
          <span>✔ {{ doneCount }}</span>
          <span>⏳ {{ activeCount }}</span>
        </div>
      </div>

      <!-- Ошибка -->
      <div v-if="store.error" class="mb-3 text-sm text-red-300 bg-red-900/40 border border-red-500/40 rounded-2xl px-3 py-2">
        {{ store.error }}
      </div>

      <!-- Загрузка -->
      <div v-if="store.loading" class="flex items-center justify-center py-6 text-slate-300 text-sm">
        <span class="mr-2 h-4 w-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin"></span>
        Загрузка задач...
      </div>

      <!-- Список задач -->
      <ul v-else class="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
        <li
          v-for="task in filteredTasks"
          :key="task.id"
          class="group flex items-center justify-between bg-slate-900/60 border border-slate-700/80 rounded-2xl px-3 py-2.5 hover:border-sky-500/70 hover:bg-slate-900/90 transition"
        >
          <label class="flex items-center gap-3 flex-1">
            <input
              type="checkbox"
              :checked="task.is_done"
              @change="toggleTask(task)"
              class="h-4 w-4 rounded border-slate-500 bg-slate-900 text-sky-400 focus:ring-0"
            />

            <!-- Режим редактирования -->
            <template v-if="editingId === task.id">
              <input
                v-model="editingTitle"
                type="text"
                class="flex-1 text-sm border border-sky-500/60 bg-slate-900/70 rounded-xl px-2.5 py-1.5 text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400/70"
                @keyup.enter="saveEdit(task)"
                @keyup.esc="cancelEdit"
              />
            </template>

            <!-- Обычный режим -->
            <template v-else>
              <span
                class="text-sm text-slate-100"
                :class="{ 'line-through text-slate-500/70': task.is_done }"
              >
                {{ task.title }}
              </span>
            </template>
          </label>

          <div class="flex items-center gap-2 ml-3">
            <button
              v-if="editingId === task.id"
              @click="saveEdit(task)"
              class="text-[11px] px-2 py-1 rounded-xl border border-emerald-400/70 text-emerald-200 hover:bg-emerald-500/10 transition"
            >
              Сохранить
            </button>
            <button
              v-if="editingId === task.id"
              @click="cancelEdit"
              class="text-[11px] px-2 py-1 rounded-xl border border-slate-500/70 text-slate-300 hover:bg-slate-700/70 transition"
            >
              Отмена
            </button>

            <button
              v-else
              @click="startEdit(task)"
              class="text-[11px] px-2 py-1 rounded-xl border border-sky-400/70 text-sky-200 hover:bg-sky-500/10 transition"
            >
              Редакт.
            </button>

            <button
              @click="deleteTask(task)"
              class="text-[11px] px-2 py-1 rounded-xl border border-red-500/70 text-red-300 hover:bg-red-600/10 transition"
            >
              Удалить
            </button>
          </div>
        </li>

        <!-- Пустой список -->
        <li
          v-if="!store.loading && store.tasks.length === 0"
          class="flex flex-col items-center justify-center py-10 text-slate-300 text-sm"
        >
          <div class="mb-2 text-3xl">📝</div>
          <div class="font-medium mb-1">Пока нет задач</div>
          <div class="text-xs text-slate-400">
            Добавь свою первую задачу, чтобы начать.
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* Небольшой кастомный скроллбар (необязательно) */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.7); /* slate-400 */
  border-radius: 999px;
}
</style>
