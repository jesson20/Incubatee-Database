<?php

namespace App\Http\Controllers;

use App\Models\StartupProfile;
use Illuminate\Http\Request;

class StartupProfileController extends Controller
{
    public function index()
    {
        return response()->json(StartupProfile::all());
    }

    public function store(Request $request)
    {
        try {
            // Validate request data
            $validated = $request->validate([
                'startup_name' => 'required|string',
                'industry' => 'required|string',
                'leader' => 'required|string',
                'number_of_members' => 'required|integer',
                'date_registered_dti' => 'required|date',
                'date_registered_bir' => 'required|date',
            ]);

            // Create the startup profile
            $startupProfile = new StartupProfile();
            $startupProfile->startup_name = $validated['startup_name'];
            $startupProfile->industry = $validated['industry'];
            $startupProfile->leader = $validated['leader'];
            $startupProfile->number_of_members = $validated['number_of_members'];
            $startupProfile->date_registered_dti = $validated['date_registered_dti'];
            $startupProfile->date_registered_bir = $validated['date_registered_bir'];
            $startupProfile->save();

            // Return a success response
            return response()->json($startupProfile, 201);
        } catch (\Exception $e) {
            // Catch any exceptions and return a JSON error message
            return response()->json(['error' => 'Something went wrong! ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        return response()->json(StartupProfile::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $profile = StartupProfile::findOrFail($id);

        $validated = $request->validate([
            'startup_name' => 'required|string|max:255',
            'industry' => 'required|string|max:255',
            'leader' => 'required|string|max:255',
            'number_of_members' => 'required|integer',
            'date_registered_dti' => 'nullable|date',
            'date_registered_bir' => 'nullable|date',
        ]);

        $profile->update($validated);

        return response()->json($profile);
    }

    public function destroy($id)
    {
        $profile = StartupProfile::findOrFail($id);
        $profile->delete();
        return response()->json(['message' => 'Profile deleted successfully']);
    }
}
