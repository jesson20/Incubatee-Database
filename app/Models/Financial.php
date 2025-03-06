<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Financial extends Model
{
    use HasFactory;

    protected $table = 'financials';

    protected $fillable = [
        'startup_profile_id',
        'record_type',
        'description',
        'amount',
        'date'
    ];

    public function startupProfile()
    {
        return $this->belongsTo(StartupProfile::class);
    }
}
