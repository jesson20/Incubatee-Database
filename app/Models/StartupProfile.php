<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StartupProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'startup_name',
        'industry',
        'number_of_members',
        'leader',
        'date_registered_dti',
        'date_registered_bir',
    ];

    public function members()
    {
        return $this->hasMany(Member::class);
    }

    public function achievements()
    {
        return $this->hasMany(Achievement::class);
    }

    public function financials()
    {
        return $this->hasMany(Financial::class);
    }
}
