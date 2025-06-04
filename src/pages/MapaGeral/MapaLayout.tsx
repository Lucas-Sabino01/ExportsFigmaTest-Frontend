// Arquivo MapaLayout.tsx correto para servir como layout compartilhado para as telas do mapa
import { JSX } from "react";
import { Outlet } from "react-router-dom";

export const MapasLayout = (): JSX.Element => {
  // Este componente serve como um wrapper para as telas do mapa
  // O componente Outlet renderiza a rota filha ativa
  return (
    <div className="mapa-layout-container">
      <Outlet />
    </div>
  );
};
