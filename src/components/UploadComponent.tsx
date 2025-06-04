/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/UploadComponent.tsx

import React, { useState, useRef } from 'react'; // Adicionado useRef
import { uploadAvaliacoesExcel, uploadGanttExcel, uploadRncExcel } from '../services/dayShopService';

interface UploadProps {
  projectId: number;
  onUploadSuccess: () => void; // Função para recarregar os dados após o upload
  currentViewType: string;
}

const UploadComponent: React.FC<UploadProps> = ({ projectId, onUploadSuccess, currentViewType }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref para o input

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor, selecione um arquivo .xlsx primeiro.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let response: any;
      console.log(`UploadComponent: Iniciando upload para view: ${currentViewType}`);

      // *** LÓGICA SWITCH PARA ESCOLHER A FUNÇÃO DE UPLOAD ***
      switch (currentViewType) {
        case 'rnc':
        case 'rnc_mes': // Se RNC Mês usa o mesmo upload de RNC
          response = await uploadRncExcel(projectId, selectedFile);
          break;

        case 'avaliacoes':
          response = await uploadAvaliacoesExcel(projectId, selectedFile);
          break;

        case 'producao':
          // Você precisará criar uploadProducaoExcel e o endpoint no backend
          console.error("Upload para 'producao' ainda não implementado.");
          setError("Funcionalidade de upload para Produção não disponível.");
          setUploading(false);
          return; // Sai da função

        case 'dayshop':
        default: // Se for 'dayshop' ou qualquer outra não listada, usa o padrão
          response = await uploadGanttExcel(projectId, selectedFile);
          break;
      }

      setSuccessMessage(response.message || 'Upload bem-sucedido!');
      onUploadSuccess(); // Chama a função para recarregar o Gantt

    } catch (err: any) {
        // Pega a mensagem de erro do serviço ou usa uma padrão
      setError(typeof err === 'string' ? err : (err.message || 'Ocorreu um erro desconhecido durante o upload.'));
    } finally {
      setUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Função para simular o clique no input de arquivo escondido
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    // Este wrapper ajuda a organizar os controles de upload
    <div className="upload-controls-wrapper">
      {/* Input de arquivo real, mas escondido */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden-file-input" // Será escondido via CSS
      />

      {/* Botão customizado para selecionar o arquivo */}
      <button
        type="button"
        onClick={triggerFileSelect}
        disabled={uploading}
        className="custom-select-file-button"
        title={selectedFile ? selectedFile.name : "Selecionar arquivo .xlsx"} // Mostra nome completo no hover
      >
        {/* Pode adicionar um ícone aqui, ex: <i className="fas fa-file-excel"></i> */}
        <span className="upload-icon">&#x1F4E4;</span> {/* Exemplo com emoji */}
        <span className="file-name-display">
          {selectedFile ? selectedFile.name : `Upload (${currentViewType})`}
        </span>
      </button>

      {/* Botão de "Enviar" que só aparece se um arquivo estiver selecionado */}
      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="custom-submit-upload-button"
        >
          {uploading ? 'Enviando...' : 'Enviar'}
        </button>
      )}

      {/* As mensagens podem ser melhoradas com um sistema de notificação/toast no futuro */}
      {error && <span className="upload-message upload-error-text">Erro!</span>}
      {successMessage && <span className="upload-message upload-success-text">Sucesso!</span>}
    </div>
  );
};

export default UploadComponent;