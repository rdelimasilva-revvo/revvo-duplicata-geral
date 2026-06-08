import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useCompany } from '../../context/CompanyContext';
import { useConfig } from '../../context/ConfigContext';
import { storeCompanyId } from '../../utils/storage';
import { translateSupabaseError } from '../../utils/errorTranslation';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setCompanyId } = useCompany();
  const { setSetupReady } = useConfig();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const validateEmail = (email: string) => {
    if (!email) return 'Informe seu e-mail';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Formato de e-mail invalido';
    return undefined;
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Informe sua senha';
    if (password.length < 6) return 'A senha deve ter pelo menos 6 caracteres';
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(formData.email);
    const passErr = validatePassword(formData.password);
    if (emailErr || passErr) {
      setFieldErrors({ email: emailErr, password: passErr });
      return;
    }
    setFieldErrors({});
    try {
      setError(null);
      setIsLoading(true);
      
      const { data: authData, error: authError } = await supabase.auth
        .signInWithPassword({ 
          email: formData.email, 
          password: formData.password 
        });

      if (authError) throw authError;

      if (!authData.user) throw new Error('No user data returned');

      // Get user profile and company info
      try {
        // Try to get profile using email instead of UUID to avoid type mismatch
        const { data: profile, error: profileError } = await supabase
          .from('user_profile')
          .select('company_id')
          .eq('email', authData.user.email)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile error:', profileError);
          // If profile doesn't exist, continue without company_id
        }

        if (profile?.company_id) {
          const companyIdStr = profile.company_id.toString();
          setCompanyId(companyIdStr);
          storeCompanyId(companyIdStr);
          
          // Check setup status
          const { data: settings, error: settingsError } = await supabase
            .from('company_settings')
            .select('setup_ready')
            .eq('company_id', profile.company_id)
            .maybeSingle();

          if (!settingsError && settings) {
            setSetupReady(settings.setup_ready);
            
            // Navigate based on setup status
            if (settings.setup_ready) {
              navigate('/app/home');
            } else {
              navigate('/config/start');
            }
          } else {
            navigate('/app/home');
          }
        } else {
          // No profile found, navigate to home
          navigate('/app/home');
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }
    } catch (error) {
      setError(translateSupabaseError(error instanceof Error ? error.message : 'Erro ao fazer login'));
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side with gradient background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-left relative">
        <img
          src="https://ky4ov9pv1r.ufs.sh/f/vacIC1PeQNAlDswuZB88a7yWn6wgksjifxH4eGOmQR9DLvlN"
          alt="Background Pattern"
          className="absolute left-0 bottom-0 opacity-100"
        />
        <div className="text-white pl-48 pr-16 py-16 z-10 flex flex-col justify-center w-full">
          <img
            src="https://ky4ov9pv1r.ufs.sh/f/vacIC1PeQNAlhUNzEasnBIAxdQCj9eGRJluP31YK8vSzt2Wo"
            alt="Revvo Logo"
            className="w-40 h-auto mb-8"
          />
          <h1 className="font-onest text-[64px] leading-tight mb-4 font-bold tracking-normal">
            Olá, seja<br />bem-vindo!
          </h1>
          <p className="font-onest text-[20px] font-medium">
            Cadastre-se hoje e subtítulo e etc<br />
            subtítulo e etc subtítulo
          </p>
        </div>
      </div>

      {/* Right side with form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <img
            src="https://utfs.io/f/vacIC1PeQNAlsDXzKKbIVgqwomYfjGCaLMdyBkcWtsEPlr89"
            alt="Revvo Logo"
            className="h-12 mb-8 mx-auto"
          />
          <h2 className="text-2xl font-onest font-semibold text-center mb-8">Para iniciar, faça seu login</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Insira seu E-mail"
                className={`w-full h-input px-6 border rounded-md focus:outline-none text-base font-onest ${
                  fieldErrors.email ? 'border-error focus:border-error' : 'border-gray-2 focus:border-revvo-blue'
                }`}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                }}
                onBlur={() => {
                  if (formData.email) {
                    const err = validateEmail(formData.email);
                    if (err) setFieldErrors(prev => ({ ...prev, email: err }));
                  }
                }}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-error font-onest">{fieldErrors.email}</p>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Insira sua Senha"
                className={`w-full h-input px-6 border rounded-md focus:outline-none text-base font-onest ${
                  fieldErrors.password ? 'border-error focus:border-error' : 'border-gray-2 focus:border-revvo-blue'
                }`}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                }}
                onBlur={() => {
                  if (formData.password) {
                    const err = validatePassword(formData.password);
                    if (err) setFieldErrors(prev => ({ ...prev, password: err }));
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-3" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-3" />
                )}
              </button>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-error font-onest">{fieldErrors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-sm text-gray-600 font-onest">Lembrar-me</span>
              </label>
              <button
                type="button"
                className="text-sm text-revvo-blue hover:underline font-onest"
                onClick={() => navigate('/forgot-password')}
              >
                Esqueci minha senha
              </button>
            </div>

            <button
              type="submit"
              className="w-full h-input bg-revvo-dark-blue text-white rounded-md hover:bg-opacity-90 transition-colors text-base font-onest font-semibold"
            >
              Entrar
            </button>
            {error && (
              <p className="mt-2 text-error text-sm">{error}</p>
            )}
          </form>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center">
              <div className="border-t border-gray-2 flex-grow"></div>
              <span className="px-4 text-gray-3 font-onest">ou</span>
              <div className="border-t border-gray-2 flex-grow"></div>
            </div>

            <button className="mt-4 w-full h-input border border-gray-2 rounded-md flex items-center justify-center gap-2 text-base font-onest font-light">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              Continuar com Google
            </button>

            <p className="mt-6 text-sm font-onest text-[16px]">
              Não possui uma conta?{' '}
              <Link to="/signup" className="text-revvo-blue hover:underline">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;