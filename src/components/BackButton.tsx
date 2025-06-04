// components/BackButton.tsx (ou um local apropriado)
import React from 'react';
import { useNavigate } from 'react-router-dom';
// Opcional: importe um ícone de seta para a esquerda
// import { ArrowLeftIcon } from 'lucide-react'; // Exemplo com lucide-react

const BackButton: React.FC<{ to?: string; text?: string }> = ({ to, text = 'Voltar' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to); // Navega para uma rota específica (ex: '/')
    } else {
      navigate(-1); // Navega para a página anterior no histórico
    }
  };

  return (
    <button
      onClick={handleClick}
      className="mb-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      // Estilize como preferir
    >
      {/* Opcional: Ícone
      <ArrowLeftIcon className="mr-2 h-5 w-5" aria-hidden="true" />
      */}
      {text}
    </button>
  );
};

export default BackButton;
