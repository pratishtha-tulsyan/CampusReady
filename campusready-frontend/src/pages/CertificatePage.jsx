import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { generateCertificate, getMyCertificate, downloadCertificatePdf } from '../services/api';

function CertificatePage() {
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadCertificate = async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await getMyCertificate();
        setCertificate(data);
      } catch (err) {
        if (err.status !== 404) {
          setError(err.message || 'Unable to load certificate status.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCertificate();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      const data = await generateCertificate();
      setCertificate(data);
      setSuccess('Certificate issued successfully.');
    } catch (err) {
      setError(err.message || 'Unable to generate certificate yet.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!certificate) {
      return;
    }

    setIsDownloading(true);
    setError('');

    try {
      const blob = await downloadCertificatePdf();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CampusReady-Certificate-${certificate.certificateCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Unable to download certificate.');
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return '-';
    }
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Navbar />
      <main className="dashboard-page certificate-page">
        <section className="dashboard-header">
          <div>
            <p className="eyebrow">CampusReady</p>
            <h1>Certificate</h1>
            <p>Claim your official CampusReady certificate when your training is complete.</p>
          </div>
        </section>

        <section className="certificate-status-card">
          <div className="certificate-status-copy">
            <h2>{certificate ? 'Certificate Earned ✅' : 'Certificate Locked'}</h2>
            <p>
              {certificate
                ? 'Your CampusReady certificate is ready to download and share.'
                : 'Complete all modules or pass all required quizzes to earn your certificate.'}
            </p>
          </div>
          <div className="certificate-status-actions">
            {certificate ? (
              <button type="button" className="primary-button" onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </button>
            ) : (
              <button type="button" className="primary-button" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Certificate'}
              </button>
            )}
          </div>
        </section>

        {error && <p className="dashboard-status error">{error}</p>}
        {success && <p className="dashboard-status success">{success}</p>}

        {certificate && (
          <section className="certificate-preview-card">
            <div className="certificate-header">
              <span className="certificate-brand">CampusReady</span>
              <span className="certificate-badge">Recognized Preparedness</span>
            </div>
            <div className="certificate-content">
              <p className="certificate-awarded">This certificate is awarded to</p>
              <h2>{certificate.userName}</h2>
              <p className="certificate-description">
                for successfully completing the CampusReady disaster preparedness training program.
              </p>

              <div className="certificate-details-grid">
                <div>
                  <span>Issued</span>
                  <strong>{formatDate(certificate.issuedAt)}</strong>
                </div>
                <div>
                  <span>Completion</span>
                  <strong>{certificate.completionPercentage}%</strong>
                </div>
                <div>
                  <span>Certificate ID</span>
                  <strong>{certificate.certificateCode}</strong>
                </div>
              </div>
            </div>
          </section>
        )}

        {!certificate && !isLoading && (
          <section className="certificate-info-card">
            <h2>How to unlock your certificate</h2>
            <ul>
              <li>Complete all modules in the training program.</li>
              <li>Or pass all required CampusReady quizzes.</li>
            </ul>
          </section>
        )}
      </main>
    </>
  );
}

export default CertificatePage;
