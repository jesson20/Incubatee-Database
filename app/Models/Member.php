<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    protected $fillable = [
        'name',
        'course',
        'role',
        'startup_profile_id'
    ];

    // Define the relationship between Member and StartupProfile
    public function startupProfile()
    {
        return $this->belongsTo(StartupProfile::class);
    }
}
