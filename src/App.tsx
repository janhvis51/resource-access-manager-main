
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import RequestAccess from "./pages/RequestAccess";
import ManagerDashboard from "./pages/ManagerDashboard";
import PendingRequests from "./pages/PendingRequests";
import AdminDashboard from "./pages/AdminDashboard";
import CreateSoftware from "./pages/CreateSoftware";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Employee Routes */}
            <Route path="/dashboard" element={<EmployeeDashboard />} />
            <Route path="/request-access" element={<RequestAccess />} />
            
            {/* Manager Routes */}
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/pending-requests" element={<PendingRequests />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/create-software" element={<CreateSoftware />} />
            <Route path="/users" element={<Users />} />
            
            {/* Redirect root to login */}
            <Route path="/" element={<Login />} />
            
            {/* Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
