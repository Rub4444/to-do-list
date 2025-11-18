<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'title',
        'is_done',
        'completed_at',
    ];

    protected $casts = [
        'is_done'      => 'boolean',
        'completed_at' => 'datetime',
    ];
}
