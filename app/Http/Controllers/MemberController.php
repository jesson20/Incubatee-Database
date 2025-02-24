<?php

namespace App\Http\Controllers;

use App\Models\StartupProfile;
use App\Models\Member;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    // Fetch members of a specific startup profile
    public function index(StartupProfile $startupProfile)
    {
        return response()->json($startupProfile->members);
    }

    // Store a new member in a specific startup profile
    public function store(Request $request, StartupProfile $startupProfile)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'course' => 'required|string|max:255',
                'role' => 'required|string|max:255',
            ]);

            // Explicitly set startup_profile_id
            $validatedData['startup_profile_id'] = $startupProfile->id;

            $member = Member::create($validatedData);

            return response()->json([
                'message' => 'Member added successfully',
                'member' => $member
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating member',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    // Update an existing member of a specific startup profile
    public function update(Request $request, StartupProfile $startupProfile, $memberId)
    {
        $member = $startupProfile->members()->findOrFail($memberId);

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'course' => 'required|string|max:255',
            'role' => 'required|string|max:255',
        ]);

        // Explicitly set startup_profile_id
        $validatedData['startup_profile_id'] = $startupProfile->id;

        $member->update($validatedData);

        return response()->json(['message' => 'Member updated successfully', 'member' => $member]);
    }

    // Delete a member from a specific startup profile
    public function destroy(StartupProfile $startupProfile, $memberId)
    {
        $member = $startupProfile->members()->findOrFail($memberId);
        $member->delete();

        return response()->json(['message' => 'Member deleted successfully']);
    }
}
