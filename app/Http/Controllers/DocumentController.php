<?php

namespace App\Http\Controllers;

use App\Models\StartupProfile;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class DocumentController extends Controller
{
    public function index(StartupProfile $startupProfile)
    {
        $documents = Document::where('startup_profile_id', $startupProfile->id)->first();
        return response()->json($documents);
    }

    public function upload(Request $request, StartupProfile $startupProfile)
    {
        $request->validate([
            'document_type' => 'required|string|in:dti_registration,bir_registration,sec_registration',
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:10240',
        ]);

        try {
            $file = $request->file('file');
            $path = $file->store('business-documents', 'public');

            $documents = Document::firstOrCreate(
                ['startup_profile_id' => $startupProfile->id]
            );

            $documentType = $request->document_type;
            $documents->$documentType = $path;
            $documents->save();

            return response()->json([
                'message' => 'Document uploaded successfully',
                'path' => $path
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error uploading document',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function download(StartupProfile $startupProfile, $documentType)
    {
        $documents = Document::where('startup_profile_id', $startupProfile->id)->first();

        if (!$documents || !$documents->$documentType) {
            return response()->json(['message' => 'Document not found'], 404);
        }

        $path = storage_path("app/public/{$documents->$documentType}");

        if (!file_exists($path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        // Use PHP's built-in function to get the MIME type
        $mimeType = mime_content_type($path);

        // Fallback: Define MIME types manually for common extensions
        if (!$mimeType) {
            $extension = pathinfo($path, PATHINFO_EXTENSION);
            $mimeTypes = [
                'jpg'  => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png'  => 'image/png',
                'pdf'  => 'application/pdf',
                'doc'  => 'application/msword',
                'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];
            $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';
        }

        return response()->download($path, basename($path), ['Content-Type' => $mimeType]);
    }
}
