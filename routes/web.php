<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\StartupProfileController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\DocumentController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Group routes that need authentication
Route::middleware('auth')->group(function () {

    Route::get('/profiles', function () {
        return Inertia::render('Profiles');
    })->name('profiles');

    Route::get('/members', function () {
        return Inertia::render('Members');
    })->name('members');

    Route::get('/documents', function () {
        return Inertia::render('Documents');
    })->name('documents');

    Route::get('/achievements', function () {
        return Inertia::render('Achievements');
    })->name('achievements');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Startup profiles routes
Route::resource('startup-profiles', StartupProfileController::class)->except([
    'create',
    'edit'
]);

// Member management routes
Route::prefix('startup-profiles/{startupProfile}')->group(function () {
    Route::get('/members', [MemberController::class, 'index'])->name('members.index');
    Route::post('/members', [MemberController::class, 'store'])->name('members.store');
    Route::delete('/members/{memberId}', [MemberController::class, 'destroy'])->name('members.destroy');
    Route::put('/members/{memberId}', [MemberController::class, 'update'])->name('members.update');
});

// Achievement management routes
Route::prefix('startup-profiles/{startupProfile}')->group(function () {
    Route::get('/achievements', [AchievementController::class, 'index'])->name('achievements.index');
    Route::post('/achievements', [AchievementController::class, 'store'])->name('achievements.store');
    Route::delete('/achievements/{achievementId}', [AchievementController::class, 'destroy'])->name('achievements.destroy');
    Route::put('/achievements/{achievementId}', [AchievementController::class, 'update'])->name('achievements.update');
});

// Document management routes (DTI, BIR, SEC)
// Document management routes (DTI, BIR, SEC)
Route::prefix('startup-profiles/{startupProfile}')->group(function () {
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::post('/documents/upload', [DocumentController::class, 'upload']);
    Route::get('/documents/download/{documentType}', [DocumentController::class, 'download']);
});


require __DIR__ . '/auth.php';
