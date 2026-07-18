import { supabase } from '../backend/supabase'

// Uploads a file to a private bucket with real progress reporting.
// supabase-js standard uploads do not expose progress, so this talks to the
// Storage REST endpoint directly with the user's JWT.
export async function uploadToBucket(
  bucket: string,
  path: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<{ error: string | null }> {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) return { error: 'Not authenticated.' }

  const baseUrl: string = import.meta.env.VITE_SUPABASE_URL
  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  const url = `${baseUrl}/storage/v1/object/${bucket}/${encodedPath}`

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.setRequestHeader('x-upsert', 'true')

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100)
        resolve({ error: null })
      } else {
        let message = `Upload failed (${xhr.status})`
        try {
          const body = JSON.parse(xhr.responseText) as { message?: string; error?: string }
          message = body.message ?? body.error ?? message
        } catch {
          // keep the generic message
        }
        resolve({ error: message })
      }
    }

    xhr.onerror = () => resolve({ error: 'Network error during upload.' })

    xhr.send(file)
  })
}

export function uploadAssetFile(
  path: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<{ error: string | null }> {
  return uploadToBucket('asset-files', path, file, onProgress)
}

// Returns a one-hour signed URL for a file in a private bucket.
export async function getSignedFileUrl(
  bucket: string,
  filePath: string,
): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(filePath, 3600)

  if (error || !data?.signedUrl) {
    return { url: null, error: error?.message ?? 'Could not create download link.' }
  }
  return { url: data.signedUrl, error: null }
}

export function getSignedAssetFileUrl(filePath: string) {
  return getSignedFileUrl('asset-files', filePath)
}

// Triggers a browser download for a signed URL.
export function triggerDownload(url: string, fileName: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
}
