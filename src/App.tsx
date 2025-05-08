
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ExpenseProvider } from "./contexts/ExpenseContext";
import RootLayout from "./components/layout/RootLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import ExpensesPage from "./pages/ExpensesPage";
import ExpenseFormPage from "./pages/ExpenseFormPage";
import ExpenseDetailPage from "./pages/ExpenseDetailPage";
import PendingExpensesPage from "./pages/PendingExpensesPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ExpenseProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <RootLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="expenses/new" element={<ExpenseFormPage />} />
                <Route path="expenses/:id" element={<ExpenseDetailPage />} />
                <Route 
                  path="pending" 
                  element={
                    <ProtectedRoute allowedRoles={["manager"]}>
                      <PendingExpensesPage />
                    </ProtectedRoute>
                  } 
                />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ExpenseProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
