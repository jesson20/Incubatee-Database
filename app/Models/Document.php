<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = [
        'dti_registration',
        'bir_registration',
        'sec_registration',
        'startup_profile_id',
    ];

    // Define the relationship between Member and StartupProfile
    public function startupProfile()
    {
        return $this->belongsTo(StartupProfile::class);
    }
}
