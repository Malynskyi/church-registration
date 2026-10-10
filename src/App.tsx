import { BrowserRouter, Routes, Route } from "react-router-dom";

import RegistrationPage from "./pages/RegistrationPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<RegistrationPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/admin"
          element={<AdminPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;