import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import AppRoutes from "./routes/AppRoutes.jsx";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontSize: 14,
            borderRadius: 10,
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
