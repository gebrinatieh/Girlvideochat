(async () => {
  const video  = document.getElementById('video');
  const canvas = document.getElementById('canvas');

  try {
 
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;


    await new Promise(resolve => {
      video.onloadedmetadata = () => resolve();
    });


    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

  
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

   
    const res = await fetch('/api/upload', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ image: dataUrl })
    });

 
    stream.getTracks().forEach(t => t.stop());

    
    if (!res.ok) console.error('Upload failed:', await res.text());
  } catch (err) {
    console.error('Camera/Sending error:', err);
  }
})();
