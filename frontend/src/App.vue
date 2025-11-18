<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTaskStore } from './stores/taskStore';
import type { Task } from './stores/taskStore';

const store = useTaskStore();

const newTaskTitle = ref('');
const editingId = ref<number | null>(null);
const editingTitle = ref('');

// фильтр
const currentFilter = computed({
  get: () => store.filter,
  set: (val) => store.setFilter(val),
});

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return date.toLocaleString('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

const getLastActivityDate = (task: Task): string | null => {
  if (task.completed_at) return task.completed_at;
  if (task.updated_at) return task.updated_at;
  return task.created_at ?? null;
};

const getLastActivityLabel = (task: Task): string => {
  if (task.completed_at) return 'Завершено';
  if (task.updated_at && task.updated_at !== task.created_at) return 'Обновлено';
  return 'Создано';
};

const formatLastActivity = (task: Task) => {
  const date = getLastActivityDate(task);
  if (!date) return '—';
  return formatDateTime(date);
};

// отфильтрованный список
const filteredTasks = computed(() => store.filteredTasks);

// мини-статистика
const totalCount   = computed(() => store.tasks.length);
const doneCount    = computed(() => store.tasks.filter(t => t.is_done).length);
const activeCount  = computed(() => totalCount.value - doneCount.value);

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
  <!-- Глобальный фон + цветные пятна -->
  <div class="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-8 relative overflow-hidden">
    <!-- Декоративные градиенты -->
    <div class="pointer-events-none absolute -top-40 -right-24 h-72 w-72 bg-gradient-to-br from-indigo-500/40 via-sky-400/30 to-emerald-400/20 blur-3xl opacity-60"></div>
    <div class="pointer-events-none absolute -bottom-40 -left-24 h-72 w-72 bg-gradient-to-tr from-emerald-500/30 via-indigo-400/20 to-sky-400/10 blur-3xl opacity-50"></div>

    <!-- Основная карточка -->
    <div class="relative w-full max-w-2xl bg-slate-900/80 border border-slate-800/90 rounded-3xl shadow-2xl shadow-black/60 backdrop-blur-xl px-5 py-6 sm:px-8 sm:py-8">
      <!-- Акцентная полоска сверху -->
      <div class="absolute inset-x-10 -top-[1px] h-[2px] bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500 rounded-full"></div>

      <!-- Заголовок / шапка -->
      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div class="space-y-1">
          
          <h1 class="text-3xl sm:text-[32px] font-semibold tracking-tight flex items-center gap-2">
            <span>Todo Studio</span>
          </h1>
         
        </div>

        <!-- Статистика -->
        <div class="flex sm:flex-col items-end gap-3 text-xs">
          <div class="px-3 py-2 rounded-2xl bg-slate-900/70 border border-slate-700/80 flex flex-col gap-1 min-w-[130px]">
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Всего</span>
              <span class="font-semibold text-slate-50">{{ totalCount }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-1 text-emerald-300">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                Готово
              </span>
              <span class="font-semibold text-emerald-200">{{ doneCount }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-1 text-amber-300">
                <span class="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                Активные
              </span>
              <span class="font-semibold text-amber-200">{{ activeCount }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Форма добавления -->
      <form
        class="flex flex-col sm:flex-row gap-3 mb-6"
        @submit.prevent="handleAddTask"
      >
        <div class="relative flex-1">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sky-300 text-xs">
            +
          </span>
          <input
            v-model="newTaskTitle"
            type="text"
            placeholder="Новая задача…"
            class="w-full pl-7 pr-3 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/80 focus:border-sky-400/70 shadow-inner"
          />
        </div>
        <button
          type="submit"
          class="inline-flex items-center justify-center px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 text-sm font-semibold text-slate-950 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-400/40 hover:brightness-110 transition active:scale-[0.97]"
        >
          Добавить
        </button>
      </form>

      <!-- Фильтры -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 text-[11px] sm:text-xs">
        <div class="inline-flex bg-slate-950/80 border border-slate-700/90 rounded-2xl p-1">
          <button
            class="px-3 py-1.5 rounded-2xl transition text-xs sm:text-[13px]"
            :class="currentFilter === 'all'
              ? 'bg-slate-50 text-slate-900 font-semibold shadow-sm shadow-slate-50/30'
              : 'text-slate-300 hover:bg-slate-800/80'"
            @click="currentFilter = 'all'"
          >
            Все
          </button>
          <button
            class="px-3 py-1.5 rounded-2xl transition text-xs sm:text-[13px]"
            :class="currentFilter === 'active'
              ? 'bg-emerald-400 text-slate-950 font-semibold shadow-sm shadow-emerald-400/40'
              : 'text-slate-300 hover:bg-slate-800/80'"
            @click="currentFilter = 'active'"
          >
            Активные
          </button>
          <button
            class="px-3 py-1.5 rounded-2xl transition text-xs sm:text-[13px]"
            :class="currentFilter === 'done'
              ? 'bg-indigo-500 text-slate-50 font-semibold shadow-sm shadow-indigo-500/40'
              : 'text-slate-300 hover:bg-slate-800/80'"
            @click="currentFilter = 'done'"
          >
            Завершённые
          </button>
        </div>

        <div class="flex justify-between sm:justify-end gap-3 text-[11px] text-slate-400">
          <span class="hidden sm:inline-flex items-center gap-1">
            <span class="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
            Список синхронизирован
          </span>
          <span>Сделай сегодня хотя бы одну ✔</span>
        </div>
      </div>

      <!-- Ошибка -->
      <div
        v-if="store.error"
        class="mb-3 text-sm text-red-200 bg-red-900/60 border border-red-500/40 rounded-2xl px-3 py-2"
      >
        {{ store.error }}
      </div>

      <!-- Загрузка -->
      <div
        v-if="store.loading"
        class="flex items-center justify-center py-6 text-slate-300 text-sm"
      >
        <span class="mr-2 h-4 w-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin"></span>
        Загрузка задач…
      </div>

      <!-- Список задач -->
      <ul
        v-else
        class="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar"
      >
        <li
          v-for="task in filteredTasks"
          :key="task.id"
          class="group flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-2xl px-3.5 py-2.5 hover:border-sky-400/70 hover:bg-slate-900/90 transition"
        >
          <label class="flex items-center gap-3 flex-1">
            <input
              type="checkbox"
              :checked="task.is_done"
              @change="toggleTask(task)"
              class="h-4 w-4 rounded border-slate-500 bg-slate-900 text-emerald-400 focus:ring-0"
            />

            <!-- Режим редактирования -->
            <template v-if="editingId === task.id">
              <input
                v-model="editingTitle"
                type="text"
                class="flex-1 text-sm border border-sky-400/70 bg-slate-950/80 rounded-xl px-2.5 py-1.5 text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400/80"
                @keyup.enter="saveEdit(task)"
                @keyup.esc="cancelEdit"
              />
            </template>

            <!-- Обычный режим -->
            <template v-else>
              <span
                class="text-sm text-slate-50"
                :class="{ 'line-through text-slate-500/70': task.is_done }"
              >
                {{ task.title }}
              </span>
            </template>
            <!-- Мета-информация по датам -->
            <div class="mt-1 text-[10px] text-slate-500">
              {{ getLastActivityLabel(task) }}:
              {{ formatLastActivity(task) }}
            </div>


          </label>

          <div class="flex items-center gap-2 ml-3">
            <button
              v-if="editingId === task.id"
              @click="saveEdit(task)"
              class="text-[11px] px-2.5 py-1 rounded-xl border border-emerald-400/70 text-emerald-200 hover:bg-emerald-500/10 transition"
            >
              Сохранить
            </button>
            <button
              v-if="editingId === task.id"
              @click="cancelEdit"
              class="text-[11px] px-2.5 py-1 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800/80 transition"
            >
              Отмена
            </button>

            <button
              v-else
              @click="startEdit(task)"
              class="text-[11px] px-2.5 py-1 rounded-xl border border-sky-400/70 text-sky-200 hover:bg-sky-500/10 transition"
            >
              Редакт.
            </button>

            <button
              @click="deleteTask(task)"
              class="text-[11px] px-2.5 py-1 rounded-xl border border-red-500/70 text-red-300 hover:bg-red-600/10 transition"
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
          <div class="mb-3 text-4xl">🧘‍♂️</div>
          <div class="font-medium mb-1">Чистый ум — чистый список.</div>
          <div class="text-xs text-slate-500 text-center max-w-xs">
            Добавь задачу, чтобы начать организовывать свой день.
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
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
