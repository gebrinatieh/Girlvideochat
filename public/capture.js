const video  = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snap   = document.getElementById('snap');

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => { video.srcObject = stream; })
  .catch(() => alert('🚫 Camera access denied.'));

snap.addEventListener('click', async () => {
  // 1) draw a frame
  canvas.width  = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);

  // 2) pull a Data‑URL out of it
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

  // 3) send JSON with the Data‑URL
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUrl })
    });
    const text = await res.text();
    if (res.ok) alert('✅ Photo sent!');
    else       alert(`❌ Upload failed: ${text}`);
  } catch (e) {
    console.error(e);
    alert('❌ Network error');
  }
});
