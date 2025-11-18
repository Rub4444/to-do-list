<script setup>
import { ref, onMounted } from 'vue';
import api from './api';

const tasks = ref([]);
const newTaskTitle = ref('');
const loading = ref(false);
const error = ref('');

const loadTasks = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await api.get('/tasks');
    tasks.value = res.data;
  } catch (e) {
    error.value = 'Не удалось загрузить задачи';
  } finally {
    loading.value = false;
  }
};

const addTask = async () => {
  if (!newTaskTitle.value.trim()) return;
  try {
    const res = await api.post('/tasks', { title: newTaskTitle.value.trim() });
    tasks.value.unshift(res.data);
    newTaskTitle.value = '';
  } catch (e) {
    console.error(e);
  }
};

const toggleTask = async (task) => {
  try {
    const res = await api.put(`/tasks/${task.id}`, {
      is_done: !task.is_done,
    });
    const updated = res.data;
    const index = tasks.value.findIndex(t => t.id === updated.id);
    if (index !== -1) tasks.value[index] = updated;
  } catch (e) {
    console.error(e);
  }
};

const deleteTask = async (task) => {
  if (!confirm('Удалить задачу?')) return;
  try {
    await api.delete(`/tasks/${task.id}`);
    tasks.value = tasks.value.filter(t => t.id !== task.id);
  } catch (e) {
    console.error(e);
  }
};

onMounted(loadTasks);
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center px-4">
    <div class="w-full max-w-xl bg-white shadow-lg rounded-2xl p-6">
      <h1 class="text-2xl font-bold mb-4 text-slate-800 text-center">
        ToDo List
      </h1>

      <form
        class="flex gap-2 mb-4"
        @submit.prevent="addTask"
      >
        <input
          v-model="newTaskTitle"
          type="text"
          placeholder="Новая задача..."
          class="flex-1 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <button
          type="submit"
          class="px-4 py-2 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition"
        >
          Добавить
        </button>
      </form>

      <div v-if="error" class="mb-2 text-sm text-red-500">
        {{ error }}
      </div>
      <div v-if="loading" class="text-center text-slate-500">
        Загрузка...
      </div>

      <ul v-else class="space-y-2 max-h-80 overflow-y-auto pr-1">
        <li
          v-for="task in tasks"
          :key="task.id"
          class="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
        >
          <label class="flex items-center gap-2 flex-1">
            <input
              type="checkbox"
              :checked="task.is_done"
              @change="toggleTask(task)"
              class="h-4 w-4"
            />
            <span
              class="text-slate-800"
              :class="{'line-through text-slate-400': task.is_done}"
            >
              {{ task.title }}
            </span>
          </label>
          <button
            @click="deleteTask(task)"
            class="ml-3 text-xs px-2 py-1 rounded-lg border border-red-300 text-red-500 hover:bg-red-50"
          >
            Удалить
          </button>
        </li>

        <li v-if="tasks.length === 0" class="text-center text-slate-400 py-4">
          Пока нет задач
        </li>
      </ul>
    </div>
  </div>
</template>
