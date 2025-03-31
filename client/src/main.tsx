import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Auth functionality may not work properly.");
}

createRoot(document.getElementById("root")!).render(<App />);
