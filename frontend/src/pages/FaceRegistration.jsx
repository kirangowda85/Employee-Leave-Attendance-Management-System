import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, CheckCircle, AlertCircle } from 'lucide-react';

export default function FaceRegistration() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [useWebcam, setUseWebcam] = useState(false);
  const [stream, setStream] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch employees
    const fetchEmployees = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/employees', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Assuming the API returns the list directly or inside data
          setEmployees(Array.isArray(data) ? data : (data.data || []));
        } else if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'Failed to load employees. Is Spring Boot running?' });
      }
    };

    fetchEmployees();
  }, [navigate]);

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
      setStatus({ type: 'error', message: 'Could not access webcam. Please use the file upload fallback.' });
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
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      // Flip horizontally to match the mirrored video
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
        stopWebcam();
      }, 'image/jpeg');
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      stopWebcam();
      setStatus({ type: '', message: '' });
    }
  };

  const handleSubmit = async () => {
    if (!selectedEmployee) {
      setStatus({ type: 'error', message: 'Please select an employee first.' });
      return;
    }
    if (!imageFile) {
      setStatus({ type: 'error', message: 'Please capture or upload an image.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    const formData = new FormData();
    formData.append('employeeId', selectedEmployee);
    formData.append('image', imageFile);

    try {
      const response = await fetch('http://localhost:5000/register-face', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: data.message || 'Face registered successfully!' });
        setImageFile(null);
        setPreviewUrl('');
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to register face.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to connect to Python Face Recognition Service.' });
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div className="header">
        <h1>Face Registration</h1>
        <p>Enroll your face for the automated attendance system</p>
      </div>

      {status.message && (
        <div className={`alert alert-${status.type}`}>
          {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{status.message}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div className="input-group">
            <label htmlFor="employee">Select Employee</label>
            <select
              id="employee"
              className="input-field"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">-- Choose an Employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.employeeCode || emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button className="btn btn-primary" onClick={startWebcam} disabled={useWebcam}>
              <Camera size={18} /> Use Webcam
            </button>
            <label className="btn btn-secondary" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
              <Upload size={18} /> Upload Photo
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <button 
            className="btn btn-success" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
            onClick={handleSubmit}
            disabled={loading || !imageFile || !selectedEmployee}
          >
            {loading ? 'Processing...' : 'Register Face Encoding'}
          </button>
        </div>

        <div style={{ flex: '1', minWidth: '300px' }}>
          <div className="camera-wrapper">
            {useWebcam && !previewUrl && (
              <>
                <video ref={videoRef} autoPlay playsInline muted />
                <button 
                  className="btn btn-primary" 
                  style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}
                  onClick={capturePhoto}
                >
                  Capture Photo
                </button>
              </>
            )}
            
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="preview-image" />
            )}

            {!useWebcam && !previewUrl && (
              <div className="file-upload-wrapper">
                <Camera size={48} color="var(--text-secondary)" />
                <p style={{ color: 'var(--text-secondary)' }}>No image selected</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Use webcam or upload a clear photo of the face</p>
              </div>
            )}
            
            {/* Hidden canvas for capturing frames */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
