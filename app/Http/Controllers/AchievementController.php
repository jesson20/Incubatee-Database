<?php

namespace App\Http\Controllers;

use App\Models\StartupProfile;
use App\Models\Achievement;
use Illuminate\Http\Request;

class AchievementController extends Controller
{
    // Fetch achievements of a specific startup profile
    public function index(StartupProfile $startupProfile)
    {
        return response()->json($startupProfile->achievements);
    }

    // Store a new achievement in a specific startup profile
    public function store(Request $request, StartupProfile $startupProfile)
    {
        try {
            $validatedData = $request->validate([
                'date' => 'required|date',
                'competition_name' => 'required|string|max:255',
                'organized_by' => 'required|string|max:255',
                'prize_amount' => 'required|numeric',
            ]);

            // Explicitly set startup_profile_id
            $validatedData['startup_profile_id'] = $startupProfile->id;

            $achievement = Achievement::create($validatedData);

            return response()->json([
                'message' => 'Achievement added successfully',
                'achievement' => $achievement
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating achievement',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    // Update an existing achievement of a specific startup profile
    public function update(Request $request, StartupProfile $startupProfile, $achievementId)
    {
        $achievement = $startupProfile->achievements()->findOrFail($achievementId);

        $validatedData = $request->validate([
            'date' => 'required|date',
            'competition_name' => 'required|string|max:255',
            'organized_by' => 'required|string|max:255',
            'prize_amount' => 'required|numeric',
        ]);

        // Explicitly set startup_profile_id
        $validatedData['startup_profile_id'] = $startupProfile->id;

        $achievement->update($validatedData);

        return response()->json(['message' => 'achievement updated successfully', 'achievement' => $achievement]);
    }

    // Delete a achievement from a specific startup profile
    public function destroy(StartupProfile $startupProfile, $achievementId)
    {
        $achievement = $startupProfile->achievements()->findOrFail($achievementId);
        $achievement->delete();

        return response()->json(['message' => 'Achievement deleted successfully']);
    }
}
