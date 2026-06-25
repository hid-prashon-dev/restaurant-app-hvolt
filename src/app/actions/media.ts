'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function uploadMenuMedia(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized: Please log in.' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !profile.tenant_id) {
      return { success: false, error: 'Unauthorized: Tenant association required.' };
    }
    
    if (profile.role !== 'ADMIN') {
      return { success: false, error: 'Forbidden: Tenant Admin access required.' };
    }

    const tenant_id = profile.tenant_id;
    const uploaded_by = user.id;

    const file = formData.get('image_file') as File | null;
    if (!file) return { success: false, error: 'File is required' };

    // Validate size (3MB = 3 * 1024 * 1024 bytes)
    if (file.size > 3145728) return { success: false, error: 'File size must be less than 3MB' };
    if (file.size <= 0) return { success: false, error: 'File is empty' };

    // Validate MIME type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) return { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' };

    const adminSupabase = createAdminClient();

    // Determine path
    // Format: {tenant_id}/dishes/pending/{uuid}.{ext}
    const uuid = crypto.randomUUID();
    const ext = file.name.split('.').pop() || 'webp';
    const storage_path = `${tenant_id}/dishes/pending/${uuid}.${ext}`;

    if (process.env.NODE_ENV === 'development') console.time('[media:upload] storage upload');
    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from('menu-media')
      .upload(storage_path, file, {
        contentType: file.type,
        upsert: false
      });
    if (process.env.NODE_ENV === 'development') console.timeEnd('[media:upload] storage upload');

    if (uploadError || !uploadData) {
      console.error('Storage upload error:', uploadError);
      return { success: false, error: 'Failed to upload file to storage.' };
    }

    const { data: publicUrlData } = adminSupabase.storage
      .from('menu-media')
      .getPublicUrl(storage_path);
    const public_url = publicUrlData.publicUrl;

    if (process.env.NODE_ENV === 'development') console.time('[media:upload] db insert');
    const { data: mediaRow, error: dbError } = await adminSupabase
      .from('menu_media')
      .insert({
        tenant_id,
        uploaded_by,
        bucket: 'menu-media',
        storage_path,
        public_url,
        original_filename: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        usage_type: 'DISH_IMAGE'
      })
      .select('id')
      .single();
    if (process.env.NODE_ENV === 'development') console.timeEnd('[media:upload] db insert');

    if (dbError) {
      console.error('DB insert error (orphan created):', dbError, 'Storage path:', storage_path);
      return { success: false, error: 'Failed to record uploaded media.' };
    }

    return { 
      success: true, 
      error: null, 
      media_id: mediaRow.id, 
      public_url, 
      storage_path 
    };

  } catch (err: unknown) {
    console.error('uploadMenuMedia error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}
