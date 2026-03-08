import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUpUser, verifyEmailOtp, resendConfirmation, authErrorMessage } from '../utils/auth';

function pwStrength(pw) {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#ef4444', '#f59e0b', '#22c55e', '#16a34a'];

export default function SignupPage() {
  const [step, setStep]         = useState('register');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [otp, setOtp]           = useState(['','','','','','']);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);
  const navigate = useNavigate();

  const strength = pwStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    const { data, error: err } = await signUpUser({ email, password, role: 'user' });
    setLoading(false);

    if (err) { setError(authErrorMessage(err)); return; }

    // If Supabase email confirmation is disabled, a session is returned immediately
    if (data.session) { navigate('/'); return; }

    // Email confirmation enabled — show OTP entry
    setStep('verify');
    startResendTimer();
  };

  const startResendTimer = () => {
    setResendTimer(30);
    const t = setInterval(() => {
      setResendTimer(v => { if (v <= 1) { clearInterval(t); return 0; } return v - 1; });
    }, 1000);
  };

  const handleOtpChange = (i, val) => {
    val = val.replace(/\D/g, '').slice(0, 1);
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setOtp([...pasted.padEnd(6, '').split('').slice(0, 6)]);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setOtpError('');
    const token = otp.join('');
    if (token.length < 6) { setOtpError('Enter the full 6-digit code.'); return; }
    setLoading(true);
    const { error: err } = await verifyEmailOtp({ email, token });
    setLoading(false);
    if (err) { setOtpError('Incorrect or expired code. Please try again.'); return; }
    navigate('/login?registered=1');
  };

  const handleResend = async () => {
    const { error: err } = await resendConfirmation(email);
    if (!err) startResendTimer();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-md overflow-hidden">

        {/* Header */}
        <div className="bg-np-dark px-8 py-7 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg className="w-6 h-6 stroke-np-lite fill-none" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V12M12 12C12 7 7 3 2 4c0 5 4 9 10 8zM12 12c0-5 5-9 10-8-1 5-5 9-10 8z"/>
            </svg>
            <span className="text-xl font-bold tracking-wide">
              <span className="text-white">NP</span>
              <em className="text-np-lite not-italic">Lawn</em>
              <span className="text-white"> LLC</span>
            </span>
          </div>
          <p className="text-white/60 text-sm">
            {step === 'register' ? 'Create your account' : 'Verify your email'}
          </p>
        </div>

        <div className="px-8 py-7">
          {step === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <Field label="Email" type="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />

              <div>
                <Field label="Password" type="password" value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" />
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all"
                          style={{ background: strength >= i ? STRENGTH_COLORS[strength] : '#e5e7eb' }} />
                      ))}
                    </div>
                    <span className="text-xs font-medium" style={{ color: STRENGTH_COLORS[strength] }}>
                      {STRENGTH_LABELS[strength]}
                    </span>
                  </div>
                )}
              </div>

              <Field label="Confirm Password" type="password" value={confirm}
                onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" />

              {error && (
                <div className="text-sm py-2 px-3 rounded-lg text-center bg-red-50 border border-red-200 text-red-600">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors duration-150 text-sm mt-1"
                style={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <p className="text-center text-sm text-gray-500 mt-1">
                Already have an account?{' '}
                <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                  Sign in
                </Link>
              </p>

              <p className="text-center text-sm text-gray-500">
                <Link to="/" className="text-green-600 hover:text-green-700 font-medium">
                  ← Back to Home
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              <p className="text-sm text-gray-600 leading-relaxed">
                A 6-digit code was sent to <strong className="text-gray-800">{email}</strong>.
                Enter it below to activate your account.
              </p>

              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otp.map((d, i) => (
                  <input key={i} type="text" inputMode="numeric" maxLength={1} value={d}
                    ref={el => otpRefs.current[i] = el}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-11 h-14 text-center text-2xl font-bold rounded-lg border border-gray-300 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-gray-800"
                  />
                ))}
              </div>

              {otpError && (
                <div className="text-sm py-2 px-3 rounded-lg text-center bg-red-50 border border-red-200 text-red-600">
                  {otpError}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors duration-150 text-sm"
                style={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Verifying…' : 'Verify & Activate'}
              </button>

              <p className="text-center text-sm text-gray-500">
                {resendTimer > 0
                  ? `Resend available in ${resendTimer}s`
                  : <button type="button" onClick={handleResend}
                      className="text-green-600 hover:text-green-700 font-medium">
                      Resend code
                    </button>}
              </p>

              <p className="text-center text-sm text-gray-500">
                <Link to="/" className="text-green-600 hover:text-green-700 font-medium">
                  ← Back to Home
                </Link>
              </p>
            </form>
          )}
        </div>

        <div className="text-center text-xs text-gray-300 pb-4">© 2026 NPLawn LLC</div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
      />
    </div>
  );
}
