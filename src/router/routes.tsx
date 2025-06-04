// src/router/routes.tsx
import { Route, Routes, Navigate } from "react-router-dom";

// Páginas Públicas e de Autenticação
import LoginPage from "@/pages/LoginPage";
import PublicRoute from "@/components/PublicRoute";

// Layout de Proteção e Páginas Protegidas
import AuthLayout from "@/components/AuthLayout";
import { HomePage } from "@/pages/home/HomePage";
import GanttPage from "@/pages/DayShop/GanttPage";
import { Status } from "@/pages/StatusPage/status";
import Configuracao from "@/pages/Configurações/Configuracao";
import ProfilePage from "@/pages/Profile"; // <--- IMPORTE SUA PÁGINA DE PERFIL AQUI (Ajuste o caminho se necessário)
import RegisterPage from '@/pages/RegisterPage'; // <--- IMPORTA A PÁGINA DE REGISTRO
// Layouts Específicos (Protegidos)
import { MapasLayout } from "@/pages/MapaGeral/MapaLayout";
import { MapaComponent } from "@/pages/MapaGeral";
import {
  LayoutUsinagem,
  LayoutMontagem,
  LayoutProducao,
  LayoutDeposito
} from "@/pages/home/views";

export function AppRoutes() {
  return (
    <Routes>
      {/* ROTA DE LOGIN */}
      <Route
        path="/login"
        element={<PublicRoute element={<LoginPage />} />}
      />
      {/* ROTA DE REGISTRO */}
      <Route
        path="/register"
        element={<PublicRoute element={<RegisterPage />} />}
      />

      {/* ROTA RAIZ */}
      <Route path="/" element={<Navigate to="/home" replace />} />


      {/* ROTAS PROTEGIDAS */}
      <Route element={<AuthLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} /> {/* <--- ADICIONE A ROTA AQUI */}
        <Route path="/gantt" element={<GanttPage />} />
        <Route path="/status" element={<Status />} />

        {/* Rotas Mapas */}
        <Route path="/mapas" element={<MapasLayout />}>
          <Route index element={<Navigate to="Mapas" replace />} />
          <Route path="Mapas" element={<MapaComponent />} />
        </Route>

        {/* Rotas Layouts Específicos */}
        <Route path="/tela-usinagem" element={<LayoutUsinagem />} />
        <Route path="/tela-montagem" element={<LayoutMontagem />} />
        <Route path="/tela-producao" element={<LayoutProducao />} />
        <Route path="/tela-deposito" element={<LayoutDeposito />} />

        {/* Rota Configurações */}
        <Route path="/configuracoes" element={<Configuracao />} />
      </Route>

      {/* ROTA 404 */}
      <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-2xl font-bold">404 - Página Não Encontrada</h1>
          </div>
        }
      />
    </Routes>
  );
}