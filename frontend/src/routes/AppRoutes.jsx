import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import HomePage from "../pages/HomePage.jsx";
import ItemsPage from "../pages/ItemsPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import MovementsPage from "../pages/MovementsPage.jsx";
import StockDashboardPage from "../pages/StockDashboardPage.jsx";
import ReportsPage from "../pages/ReportsPage.jsx";
import UsersPage from "../pages/UsersPage.jsx";
import CadastrosPage from "../pages/CadastrosPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/itens" element={<ItemsPage />} />
          <Route path="/movimentacoes" element={<MovementsPage />} />
          <Route path="/painel" element={<StockDashboardPage />} />
          <Route path="/relatorios" element={<ReportsPage />} />
          <Route path="/usuarios" element={<UsersPage />} />
          <Route path="/cadastros" element={<CadastrosPage />} />
        </Route>

        <Route path="/inicio" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
