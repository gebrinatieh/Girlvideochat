const video  = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snap   = document.getElementById('snap');

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => { video.srcObject = stream; })
  .catch(() => alert('🚫 Camera access denied.'));

snap.addEventListener('click', () => {
  // 1) draw the frame
  canvas.width  = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);

  // 2) try to get a Blob
  canvas.toBlob(async (blob) => {
    // 3) fallback if Blob is missing
    if (!blob) {
      console.warn('⚠️ canvas.toBlob failed, using dataURL fallback');
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      blob = await (await fetch(dataUrl)).blob();
    }

    // 4) build and send FormData
    const form = new FormData();
    form.append('file', blob, 'snapshot.jpg');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const text = await res.text();               // grab any error text
      if (res.ok) {
        alert('✅ Photo sent to Discord!');
      } else {
        alert(`❌ Server Error: ${text}`);
        console.error('Upload error:', text);
      }
    } catch (e) {
      console.error(e);
      alert('❌ Network error or CORS issue');
    }
  }, 'image/jpeg', 0.9);
});
