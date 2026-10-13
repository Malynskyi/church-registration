import { BrowserRouter, Routes, Route } from "react-router-dom";

import RegistrationPage from "./pages/RegistrationPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import { LanguageProvider, LanguageSwitcher } from "./i18n/LanguageProvider";

function App() {
  return (
    <LanguageProvider>
    <BrowserRouter>
      <LanguageSwitcher />
      <Routes>
        <Route
          path="/"
          element={<RegistrationPage />}
        />

        <Route
          path="/family-admin-2026"
          element={<LoginPage />}
        />

        <Route
          path="/admin"
          element={<AdminPage />}
        />
      </Routes>
    </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;