import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCompany } from '../../context/CompanyContext';
import { useConfig } from '../../context/ConfigContext';
import { storeCompanyId } from '../../utils/storage';

const formatCNPJ = (value: string) => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 14 dígitos
  const cnpj = numbers.slice(0, 14);
  
  // Aplica a máscara XX.XXX.XXX/0001-XX
  return cnpj
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setCompanyId } = useCompany();
  const { setSetupReady } = useConfig();
  const [formData, setFormData] = useState({
    companyName: '',
    cnpj: '',
    userName: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setIsLoading(true);
      
      // 1. Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // Check if we have the user data
      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Auto-login after signup
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;
      
      // Verify sign in was successful
      if (!signInData.user) {
        throw new Error('Failed to sign in after account creation');
      }

      // 2. Criar empresa
      try {
        const { data: companyData, error: companyError } = await supabase
          .from('company')
          .insert([
            {
              name: formData.companyName,
              doc_num: formData.cnpj.replace(/\D/g, ''), // Remove formatação do CNPJ
            }
          ])
          .select()
          .single();

        if (companyError) throw companyError;

        if (companyData) {
          const userId = signInData.user.id;
          if (!userId) throw new Error('User ID not found');

          setCompanyId(companyData.id.toString());
          storeCompanyId(companyData.id.toString());
          
          // Create company settings
          const { error: settingsError } = await supabase
            .from('company_settings')
            .insert([
              {
                company_id: companyData.id,
                setup_ready: false
              }
            ]);

          if (settingsError) throw settingsError;

          // 3. Criar perfil do usuário - try with explicit UUID casting
          const { error: profileError } = await supabase
            .from('user_profile')
            .insert([
              {
                id: userId,
                name: formData.userName,
                email: formData.email,
                company_id: companyData.id,
              }
            ]);

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // If there's a UUID type error, provide a helpful message
            if (profileError.code === '22P02') {
              throw new Error('Erro de compatibilidade no banco de dados. Por favor, entre em contato com o suporte.');
            }
            throw profileError;
          }

          // 4. Atualizar o creator da empresa
          const { error: updateError } = await supabase
            .from('company')
            .update({ creator: userId })
            .eq('id', companyData.id);

          if (updateError) throw updateError;

          setSetupReady(false);
          // Always redirect to onboarding after signup since setup_ready is false
          navigate('/config/start');
        }
      } catch (dbError) {
        console.error('Database operation error:', dbError);
        throw dbError;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar conta');
      console.error('Error:', error);
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
        <div className="text-white pl-64 pr-16 py-16 z-10 flex flex-col justify-center w-full">
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
          <h2 className="text-2xl font-onest font-semibold text-center mb-8">Criar conta</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Nome da Empresa"
                className="w-full h-input px-6 border border-gray-2 rounded-md focus:outline-none focus:border-revvo-blue text-base font-onest"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>
            
            <div>
              <input
                type="text"
                maxLength={18}
                placeholder="CNPJ"
                className="w-full h-input px-6 border border-gray-2 rounded-md focus:outline-none focus:border-revvo-blue text-base font-onest"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Nome do Usuário"
                className="w-full h-input px-6 border border-gray-2 rounded-md focus:outline-none focus:border-revvo-blue text-base font-onest"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="e-mail"
                className="w-full h-input px-6 border border-gray-2 rounded-md focus:outline-none focus:border-revvo-blue text-base font-onest"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Insira sua senha"
                className="w-full h-input px-6 border border-gray-2 rounded-md focus:outline-none focus:border-revvo-blue text-base font-onest"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            </div>

            <button
              type="submit"
              className="w-full h-input bg-revvo-dark-blue text-white rounded-md hover:bg-opacity-90 transition-colors text-base font-onest font-semibold"
            >
              Criar conta
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
              Já possui uma conta?{' '}
              <Link to="/login" className="text-revvo-blue hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;