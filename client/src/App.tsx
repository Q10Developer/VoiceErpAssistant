import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import CommandHistoryPage from "@/pages/CommandHistoryPage";
import SettingsPage from "@/pages/SettingsPage";
import QbsTestPage from "@/pages/QbsTestPage";
import NotFound from "@/pages/not-found";
import { VoiceProvider } from "@/context/VoiceContext";
import { QbsProvider } from "@/context/QbsContext";

function App() {
  return (
    <QbsProvider>
      <VoiceProvider>
        <TooltipProvider>
          <Toaster />
          <Layout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/history" component={CommandHistoryPage} />
              <Route path="/settings" component={SettingsPage} />
              <Route path="/qbs-test" component={QbsTestPage} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </TooltipProvider>
      </VoiceProvider>
    </QbsProvider>
  );
}

export default App;
