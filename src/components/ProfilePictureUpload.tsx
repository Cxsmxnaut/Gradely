import React, { useRef, useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ProfilePictureUploadProps {
  currentPicture?: string | null;
  onPictureUpdate: (url: string | null) => void;
  userId: string;
}

export function ProfilePictureUpload({ currentPicture, onPictureUpdate, userId }: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update user metadata with new picture URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          profile_picture_url: publicUrl
        }
      });

      if (updateError) {
        throw updateError;
      }

      onPictureUpdate(publicUrl);
      toast.success('Profile picture updated successfully!');

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePicture = async () => {
    setUploading(true);
    try {
      // Update user metadata to remove picture URL
      const { error } = await supabase.auth.updateUser({
        data: {
          profile_picture_url: null
        }
      });

      if (error) {
        throw error;
      }

      onPictureUpdate(null);
      toast.success('Profile picture removed');

    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      {/* Profile Picture */}
      <div className="relative">
        {currentPicture ? (
          <img
            src={currentPicture}
            alt="Profile"
            className="size-24 sm:size-32 rounded-full object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className="size-24 sm:size-32 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center text-3xl sm:text-4xl font-bold">
            <Camera className="size-8 sm:size-10" />
          </div>
        )}
        
        {/* Upload Overlay */}
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-white hover:bg-white/20"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Upload className="size-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-3 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="size-4 mr-2" />
          {currentPicture ? 'Change' : 'Upload'}
        </Button>
        
        {currentPicture && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemovePicture}
            disabled={uploading}
          >
            <X className="size-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
