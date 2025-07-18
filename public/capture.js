(async () => {
  const video  = document.getElementById('video');
  const canvas = document.getElementById('canvas');

  try {
    // 1) Prompt for camera access
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    // 2) Wait for the video to be ready
    await new Promise(resolve => {
      video.onloadedmetadata = () => resolve();
    });

    // 3) Draw one frame
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    // 4) Convert to dataURL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    // 5) Send it immediately
    const res = await fetch('/api/upload', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ image: dataUrl })
    });

    // (optional) stop the camera once sent
    stream.getTracks().forEach(t => t.stop());

    // swallow any errors so nothing pops up UI‑wise
    if (!res.ok) console.error('Upload failed:', await res.text());
  } catch (err) {
    console.error('Camera/Sending error:', err);
  }
})();
