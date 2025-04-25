import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import CommandHistoryPage from "@/pages/CommandHistoryPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/not-found";
import { VoiceProvider } from "@/context/VoiceContext";
import { ErpProvider } from "@/context/ErpContext";

function App() {
  return (
    <ErpProvider>
      <VoiceProvider>
        <TooltipProvider>
          <Toaster />
          <Layout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/history" component={CommandHistoryPage} />
              <Route path="/settings" component={SettingsPage} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </TooltipProvider>
      </VoiceProvider>
    </ErpProvider>
  );
}

export default App;
