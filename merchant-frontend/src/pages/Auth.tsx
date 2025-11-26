import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Sparkles, Github, Chrome, MessageSquare, Twitter, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/services/api';

type AuthMode = 'signin' | 'signup' | 'magic';

type OAuthProvider = {
  id: 'google' | 'github' | 'discord' | 'twitter';
  name: string;
  icon: typeof Chrome;
  color: string;
};

const allOAuthProviders: OAuthProvider[] = [
  { id: 'google' as const, name: 'Google', icon: Chrome, color: 'bg-white hover:bg-gray-50 text-gray-900 border-gray-300' },
  { id: 'github' as const, name: 'GitHub', icon: Github, color: 'bg-gray-900 hover:bg-gray-800 text-white border-gray-900' },
  { id: 'discord' as const, name: 'Discord', icon: MessageSquare, color: 'bg-[#5865F2] hover:bg-[#4752C4] text-white border-[#5865F2]' },
  { id: 'twitter' as const, name: 'Twitter', icon: Twitter, color: 'bg-black hover:bg-gray-900 text-white border-black' },
];

export function Auth() {
  const { signInWithPassword, signUpWithPassword, signInWithMagicLink, signInWithOAuth } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [enabledProviders, setEnabledProviders] = useState<string[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      let res;
      if (mode === 'signin') {
        res = await signInWithPassword(email, password);
      } else if (mode === 'signup') {
        res = await signUpWithPassword(email, password);
        if (!(res as any)?.error) {
          setMessage('Check your inbox to confirm your email.');
        }
      } else {
        res = await signInWithMagicLink(email);
        if (!(res as any)?.error) {
          setMessage('Magic link sent! Check your inbox.');
        }
      }

      if ((res as any)?.error) {
        setError((res as any).error);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch enabled auth providers on mount
  useEffect(() => {
    async function fetchProviders() {
      try {
        const data = await api.getAuthProviders();
        console.log('Fetched auth providers:', data);
        const providers = data.enabledProviders || [];
        setEnabledProviders(providers);
      } catch (err) {
        console.error('Failed to fetch auth providers:', err);
        setEnabledProviders([]);
      } finally {
        setLoadingProviders(false);
      }
    }
    fetchProviders();
  }, []);

  async function handleOAuth(provider: 'google' | 'github' | 'discord' | 'twitter') {
    setError(null);
    await signInWithOAuth(provider);
  }

  // Filter providers to only show enabled ones
  const oauthProviders = allOAuthProviders.filter(provider =>
    enabledProviders.includes(provider.id)
  );

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold">RevrPay</h1>
            </div>
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Welcome to the future of payments
            </h2>
            <p className="text-white/90 text-lg leading-relaxed max-w-md">
              Accept cryptocurrency payments with zero transaction fees. Built for modern merchants who value speed, security, and simplicity.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Zero transaction fees</span>
            </div>
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>AI-powered fraud detection</span>
            </div>
            <div className="flex items-center space-x-3 text-white/90">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Instant settlement</span>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              RevrPay
            </h1>
          </div>

          {/* Auth Card */}
          <Card className="border border-gray-200/80 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-6 px-6 pt-6">
              <CardTitle className="text-2xl font-semibold text-center text-gray-900">
                {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Passwordless login'}
              </CardTitle>
              <CardDescription className="text-center text-base text-gray-600 mt-2">
                {mode === 'signin'
                  ? 'Sign in to your account to continue'
                  : mode === 'signup'
                    ? 'Get started with RevrPay in seconds'
                    : 'We\'ll send you a secure login link via email'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-6">
              {/* OAuth Providers */}
              {!loadingProviders && oauthProviders.length > 0 && mode !== 'magic' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {oauthProviders.map((provider) => {
                      const Icon = provider.icon;
                      return (
                        <Button
                          key={provider.id}
                          type="button"
                          variant="outline"
                          className={`${provider.color} w-full justify-center gap-2 h-11 transition-all hover:scale-[1.02] font-medium border`}
                          onClick={() => handleOAuth(provider.id)}
                          disabled={isLoading}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-sm">{provider.name}</span>
                        </Button>
                      );
                    })}
                  </div>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="bg-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-gray-500 font-medium">Or continue with email</span>
                    </div>
                  </div>
                </>
              )}

              {/* Loading state for providers */}
              {loadingProviders && mode !== 'magic' && (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-11 bg-gray-200 animate-pulse rounded-md" />
                  ))}
                </div>
              )}

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={mode === 'magic' ? "Enter your email for passwordless login" : "you@example.com"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 pl-10 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {mode !== 'magic' && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={mode === 'signup' ? "Create a strong password" : "Enter your password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required={mode === 'signup'}
                        className="h-11 pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {mode === 'signup' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Use at least 8 characters with a mix of letters and numbers
                      </p>
                    )}
                  </div>
                )}

                {/* Messages */}
                {message && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-800 text-sm">
                      {message}
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-800 text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Button */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Please wait...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      {mode === 'signin'
                        ? 'Sign in'
                        : mode === 'signup'
                          ? 'Create account'
                          : 'Send magic link'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Mode Toggle */}
              <div className="space-y-3 pt-5 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-700 flex-wrap">
                  {mode === 'signin' ? (
                    <>
                      <span>Don't have an account?</span>
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto bg-transparent text-blue-600 hover:text-blue-700 font-semibold underline-offset-4 hover:underline shadow-none"
                        onClick={() => {
                          setMode('signup');
                          setError(null);
                          setMessage(null);
                          setPassword('');
                        }}
                        disabled={isLoading}
                      >
                        Sign up
                      </Button>
                    </>
                  ) : mode === 'signup' ? (
                    <>
                      <span>Already have an account?</span>
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto bg-transparent text-blue-600 hover:text-blue-700 font-semibold underline-offset-4 hover:underline shadow-none"
                        onClick={() => {
                          setMode('signin');
                          setError(null);
                          setMessage(null);
                          setPassword('');
                        }}
                        disabled={isLoading}
                      >
                        Sign in
                      </Button>
                    </>
                  ) : null}
                </div>

                {/* Magic Link Toggle */}
                {mode !== 'magic' && (
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm bg-transparent text-blue-600 hover:text-blue-700 font-medium underline-offset-4 hover:underline shadow-none"
                      onClick={() => {
                        setMode('magic');
                        setError(null);
                        setMessage(null);
                        setPassword('');
                      }}
                      disabled={isLoading}
                    >
                      Use passwordless login instead
                    </Button>
                  </div>
                )}

                {mode === 'magic' && (
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm bg-transparent text-blue-600 hover:text-blue-700 font-medium underline-offset-4 hover:underline shadow-none"
                      onClick={() => {
                        setMode('signin');
                        setError(null);
                        setMessage(null);
                        setPassword('');
                      }}
                      disabled={isLoading}
                    >
                      Back to sign in
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-gray-500">
            By continuing, you agree to RevrPay's{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
