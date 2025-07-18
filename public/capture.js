const video  = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snap   = document.getElementById('snap');

// 1) Ask for camera access
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => { video.srcObject = stream; })
  .catch(err => alert('Camera access denied.'));

// 2) When you click “Take Photo & Send”
snap.addEventListener('click', () => {
  canvas.width  = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);

  // Convert to blob and POST it to our serverless function
  canvas.toBlob(blob => {
    const form = new FormData();
    form.append('file', blob, 'snapshot.jpg');

    fetch('/api/upload', {
      method: 'POST',
      body: form
    })
    .then(res => {
      if (res.ok) alert('✅ Sent to Discord');
      else       alert('❌ Failed to send');
    })
    .catch(() => alert('❌ Network error'));
  }, 'image/jpeg', 0.9);
});
