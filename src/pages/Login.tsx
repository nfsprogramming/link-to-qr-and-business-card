import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { LogIn, UserPlus } from 'lucide-react';

interface LoginProps {
    onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            onLoginSuccess();
        } catch (err: any) {
            // Map Firebase errors to user-friendly messages
            let errorMessage = 'An error occurred. Please try again.';

            switch (err.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Invalid email or password.';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'Invalid email or password.';
                    break;
                case 'auth/email-already-in-use':
                    errorMessage = 'An account with this email already exists.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password should be at least 6 characters.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your connection.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many attempts. Please try again later.';
                    break;
                default:
                    errorMessage = err.message || 'Authentication failed.';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 py-8 sm:py-12 overflow-y-auto">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-purple-600 mb-4">
                        <LogIn className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">SmartShare</h1>
                    <p className="text-slate-400">Digital Business Cards</p>
                </div>

                {/* Login Form */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                    <h2 className="text-xl font-semibold text-white mb-6">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                'Loading...'
                            ) : (
                                <>
                                    {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
                                    {isSignUp ? 'Sign Up' : 'Sign In'}
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                            }}
                            className="text-sm text-slate-400 hover:text-sky-400 transition-colors"
                        >
                            {isSignUp
                                ? 'Already have an account? Sign In'
                                : "Don't have an account? Sign Up"}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-sm mt-6">
                    By continuing, you agree to our Terms of Service
                </p>
            </div>
        </div>
    );
}
