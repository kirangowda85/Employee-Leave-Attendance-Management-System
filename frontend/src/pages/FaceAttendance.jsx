import { useState, useEffect, useRef } from 'react';
import { Camera, LogIn, LogOut, Upload, CheckCircle, AlertCircle } from 'lucide-react';

export default function FaceAttendance({ type }) {
  const [useWebcam, setUseWebcam] = useState(false);
  const [stream, setStream] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Auto-start webcam if available
  useEffect(() => {
    startWebcam();
    return () => stopWebcam();
  }, []);

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setUseWebcam(true);
      setImageFile(null);
      setPreviewUrl('');
      setStatus({ type: '', message: '' });
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setUseWebcam(false);
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setUseWebcam(false);
  };

  const capturePhoto = () => {
    return new Promise((resolve) => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });
          resolve(file);
        }, 'image/jpeg');
      } else {
        resolve(null);
      }
    });
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      stopWebcam();
      setStatus({ type: '', message: '' });
      // Automatically mark attendance on file upload
      markAttendance(file);
    }
  };

  const handleWebcamCapture = async () => {
    const file = await capturePhoto();
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    stopWebcam();
    markAttendance(file);
  };

  const markAttendance = async (fileToUpload) => {
    setStatus({ type: '', message: '' });

    if (!fileToUpload) {
      setStatus({ type: 'error', message: 'Please provide a face image first.' });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('image', fileToUpload);
    formData.append('eventType', type); // Uses the prop passed from router (ENTRY or EXIT)

    try {
      const response = await fetch('http://localhost:5000/recognize-face', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: `Welcome ${data.employeeId}! ${type} marked successfully.` });
        
        // Reset after 4 seconds for the next person
        setTimeout(() => {
          setImageFile(null);
          setPreviewUrl('');
          startWebcam();
          setStatus({ type: '', message: '' });
        }, 4000);

      } else {
        setStatus({ type: 'error', message: data.error || 'Face not recognized.' });
        // Reset after error
        setTimeout(() => {
          setImageFile(null);
          setPreviewUrl('');
          startWebcam();
        }, 3000);
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to connect to the Recognition Server.' });
      setLoading(false);
    }
  };

  // Determine styles based on type
  const isEntry = type === 'ENTRY';
  const themeColor = isEntry ? 'var(--secondary)' : 'var(--danger)';
  const ThemeIcon = isEntry ? LogIn : LogOut;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      
      <div className="header">
        <h1 style={{ fontSize: '3rem', color: themeColor }}>Face Recognition {isEntry ? 'Login' : 'Logout'}</h1>
        <p style={{ fontSize: '1.2rem' }}>Look at the camera to automatically mark your {type}</p>
      </div>

      {status.message && (
        <div className={`alert alert-${status.type}`} style={{ width: '100%', maxWidth: '640px', fontSize: '1.1rem' }}>
          {status.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <span>{status.message}</span>
        </div>
      )}

      <div className="camera-wrapper" style={{ boxShadow: `0 0 40px ${isEntry ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`, border: `2px solid ${themeColor}` }}>
        {useWebcam && !previewUrl && (
          <video ref={videoRef} autoPlay playsInline muted />
        )}
        
        {previewUrl && (
          <img src={previewUrl} alt="Preview" className="preview-image" />
        )}

        {!useWebcam && !previewUrl && (
          <div className="file-upload-wrapper">
            <Camera size={64} color={themeColor} style={{ opacity: 0.5 }} />
            <p style={{ fontSize: '1.2rem' }}>Webcam Not Detected</p>
            <label className={`btn ${isEntry ? 'btn-success' : 'btn-danger'}`} style={{ marginTop: '1rem', cursor: 'pointer' }}>
              <Upload size={20} /> Upload Photo for {type}
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} disabled={loading} />
            </label>
          </div>
        )}
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {useWebcam && !previewUrl && (
        <div style={{ marginTop: '1.5rem' }}>
          <button 
            className={`btn ${isEntry ? 'btn-success' : 'btn-danger'}`}
            style={{ fontSize: '1.5rem', padding: '1rem 3rem', borderRadius: '12px' }}
            onClick={handleWebcamCapture}
            disabled={loading}
          >
            {loading ? 'Scanning...' : (
              <>
                <ThemeIcon size={28} />
                MARK {type}
              </>
            )}
          </button>
        </div>
      )}
      
      {!useWebcam && previewUrl && (
         <button className="btn" style={{ marginTop: '2rem', backgroundColor: 'var(--surface)' }} onClick={() => {
           setImageFile(null);
           setPreviewUrl('');
           setStatus({ type: '', message: '' });
         }} disabled={loading}>
           Cancel / Reset
         </button>
      )}
      
    </div>
  );
}
