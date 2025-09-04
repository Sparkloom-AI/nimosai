import { useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

// Use your site key here - this is public and safe to include in the code
const RECAPTCHA_SITE_KEY = '6LfBa70rAAAAAFWRGQ8W-AzkLrDxfQRvaE0Kf7JS'; // Your actual Enterprise site key

interface RecaptchaWrapperProps {
  onVerify: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
}

export const RecaptchaWrapper: React.FC<RecaptchaWrapperProps> = ({
  onVerify,
  onExpired,
  onError
}) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleVerify = (token: string | null) => {
    onVerify(token);
  };

  const handleExpired = () => {
    onVerify(null);
    onExpired?.();
  };

  const handleError = () => {
    onVerify(null);
    onError?.();
  };

  // Reset reCAPTCHA when component unmounts or on explicit reset
  useEffect(() => {
    return () => {
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    };
  }, []);

  return (
    <div className="flex justify-center my-4">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={RECAPTCHA_SITE_KEY}
        onChange={handleVerify}
        onExpired={handleExpired}
        onError={handleError}
        theme="light"
        size="normal"
      />
    </div>
  );
};