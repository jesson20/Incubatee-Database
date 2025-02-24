<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    protected $fillable = [
        'date',
        'competition_name',
        'organized_by',
        'prize_amount',
        'startup_profile_id',
    ];

    // Define the relationship between Member and StartupProfile
    public function startupProfile()
    {
        return $this->belongsTo(StartupProfile::class);
    }
}
