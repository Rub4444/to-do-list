<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index()
    {
        // Все задачи, последние сверху
        return Task::orderByDesc('created_at')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $task = Task::create($data);

        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task)
    {
        $data = $request->validate([
            'title'   => 'sometimes|required|string|max:255',
            'is_done' => 'sometimes|boolean',
        ]);

        // Если пришло поле is_done — управляем completed_at
        if (array_key_exists('is_done', $data)) {
            // если задача становится выполненной
            if ($data['is_done'] && !$task->is_done && $task->completed_at === null) {
                $data['completed_at'] = now();
            }

            // если задачу снова сделали невыполненной
            if (!$data['is_done']) {
                $data['completed_at'] = null;
            }
        }

        $task->update($data);

        return response()->json($task);
    }


    public function destroy(Task $task)
    {
        $task->delete();

        return response()->json(null, 204);
    }
}
