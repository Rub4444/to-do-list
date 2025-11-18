import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../api';


export interface Task {
    id: number;
    title: string;
    is_done: boolean;
    created_at?: string;
    updated_at?: string;
    completed_at?: string | null;
}

export type TaskFilter = 'all' | 'active' | 'done';

export const useTaskStore = defineStore('tasks', () => {
    const tasks = ref<Task[]>([]);
    const loading = ref(false);
    const error = ref('');

    const filter = ref<TaskFilter>('all');

    const filteredTasks = computed(() => {
        switch (filter.value) {
            case 'active':
                return tasks.value.filter(t => !t.is_done);
            case 'done':
                return tasks.value.filter(t => t.is_done);
            default:
                return tasks.value;
        }
    });

    const setFilter = (value: TaskFilter) => {
        filter.value = value;
    };

    const fetchTasks = async () => {
        loading.value = true;
        error.value = '';
        try {
            const res = await api.get<Task[]>('/tasks');
            tasks.value = res.data;
        } catch (e) {
            error.value = 'Не удалось загрузить задачи';
        } finally {
            loading.value = false;
        }
    };

    const addTask = async (title: string) => {
        if (!title.trim()) return;
        try {
            const res = await api.post<Task>('/tasks', { title: title.trim() });
            tasks.value.unshift(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleTask = async (task: Task) => {
        try {
            const res = await api.put<Task>(`/tasks/${task.id}`, {
                is_done: !task.is_done,
            });
            const updated = res.data;
            const index = tasks.value.findIndex(t => t.id === updated.id);
            if (index !== -1) tasks.value[index] = updated;
        } catch (e) {
            console.error(e);
        }
    };

    const deleteTask = async (task: Task) => {
        if (!confirm('Удалить задачу?')) return;
        try {
            await api.delete(`/tasks/${task.id}`);
            tasks.value = tasks.value.filter(t => t.id !== task.id);
        } catch (e) {
            console.error(e);
        }
    };

    const updateTitle = async (task: Task, newTitle: string) => {
        const title = newTitle.trim();
        if (!title) return;
        try {
            const res = await api.put<Task>(`/tasks/${task.id}`, {
                title,
            });
            const updated = res.data;
            const index = tasks.value.findIndex(t => t.id === updated.id);
            if (index !== -1) tasks.value[index] = updated;
        } catch (e) {
            console.error(e);
        }
    };

    return {
        tasks,
        loading,
        error,
        filter,
        filteredTasks,
        setFilter,
        fetchTasks,
        addTask,
        toggleTask,
        deleteTask,
        updateTitle,
    };
});
