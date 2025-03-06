<?php

namespace App\Http\Controllers;

use App\Models\StartupProfile;
use App\Models\Financial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class FinancialController extends Controller
{
    // Get all financials for a startup
    public function index(StartupProfile $startupProfile)
    {
        try {
            Log::info('Fetching financials for startup ID: ' . $startupProfile->id);

            $records = Financial::where('startup_profile_id', $startupProfile->id)->get();

            $income = $records->where('record_type', 'income')->values();
            $expenses = $records->where('record_type', 'expense')->values();

            $totalIncome = $income->sum('amount');
            $totalExpenses = $expenses->sum('amount');
            $balance = $totalIncome - $totalExpenses;

            return response()->json([
                'income' => $income,
                'expenses' => $expenses,
                'totalIncome' => $totalIncome,
                'totalExpenses' => $totalExpenses,
                'balance' => $balance
            ]);
        } catch (\Exception $e) {
            Log::error('Error in financials index: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Store a new financial
    public function store(Request $request, StartupProfile $startupProfile)
    {
        try {
            Log::info('Creating financial for startup ID: ' . $startupProfile->id);
            Log::info('Request data: ' . json_encode($request->all()));

            $validatedData = $request->validate([
                'record_type' => 'required|in:income,expense',
                'description' => 'required|string|max:255',
                'amount' => 'required|numeric|min:0',
                'date' => 'required|date',
            ]);

            $validatedData['startup_profile_id'] = $startupProfile->id;

            $record = Financial::create($validatedData);

            return response()->json([
                'message' => 'Financial record added successfully',
                'record' => $record
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error in financials store: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Update an existing financial
    public function update(Request $request, StartupProfile $startupProfile, $recordId)
    {
        try {
            Log::info('Updating financial ID: ' . $recordId . ' for startup ID: ' . $startupProfile->id);
            Log::info('Request data: ' . json_encode($request->all()));

            $record = Financial::where('startup_profile_id', $startupProfile->id)
                ->findOrFail($recordId);

            $validatedData = $request->validate([
                'record_type' => 'required|in:income,expense',
                'description' => 'required|string|max:255',
                'amount' => 'required|numeric|min:0',
                'date' => 'required|date',
            ]);

            $record->update($validatedData);

            return response()->json([
                'message' => 'Financial record updated successfully',
                'record' => $record
            ]);
        } catch (\Exception $e) {
            Log::error('Error in financials update: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Delete a financial
    public function destroy(StartupProfile $startupProfile, $recordId)
    {
        try {
            Log::info('Deleting financial ID: ' . $recordId . ' for startup ID: ' . $startupProfile->id);

            $record = Financial::where('startup_profile_id', $startupProfile->id)
                ->findOrFail($recordId);

            $record->delete();

            return response()->json(['message' => 'Financial record deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error in financials destroy: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
