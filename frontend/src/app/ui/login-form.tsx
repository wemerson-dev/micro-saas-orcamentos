import { useState } from 'react';

interface LoginResponse {
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
}

interface LoginFormProps {
  onLoginSuccess: (data: LoginResponse) => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const validarEmail = (email: string) =>
    /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    if (!validarEmail(email)) {
      setErro('Email inválido.');
      return;
    }
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/Usuario/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      if (!res.ok) {
        setErro('Email ou senha inválidos.');
        return;
      }
      const data: LoginResponse = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.usuario.id);
      onLoginSuccess(data);
    } catch (err) {
      if (err instanceof Error) setErro('Erro ao conectar com o servidor: ' + err.message);
      else setErro('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="w-full border p-2 rounded"
        autoComplete="username"
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={e => setSenha(e.target.value)}
        required
        className="w-full border p-2 rounded"
        autoComplete="current-password"
      />
      {erro && <div className="text-red-600">{erro}</div>}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
} 