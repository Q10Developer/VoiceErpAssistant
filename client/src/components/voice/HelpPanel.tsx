import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School } from "lucide-react";

const HelpPanel = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-neutral-800">Voice Command Help</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="border-l-4 border-info pl-3">
            <h3 className="font-medium text-neutral-800 mb-1">Basic Commands</h3>
            <p className="text-sm text-neutral-600">Try saying: "Check inventory for [product name]", "Create invoice for [customer]", "Show open orders"</p>
          </div>
          
          <div className="border-l-4 border-accent pl-3">
            <h3 className="font-medium text-neutral-800 mb-1">Navigation</h3>
            <p className="text-sm text-neutral-600">Say "Go to [page name]" or "Open [module]" to navigate</p>
          </div>
          
          <div className="border-l-4 border-warning pl-3">
            <h3 className="font-medium text-neutral-800 mb-1">Reports</h3>
            <p className="text-sm text-neutral-600">Ask for reports using "Show me [report name]" or "Generate sales report for [period]"</p>
          </div>
          
          <div className="border-l-4 border-success pl-3">
            <h3 className="font-medium text-neutral-800 mb-1">Data Creation</h3>
            <p className="text-sm text-neutral-600">Use commands like "Create new customer named [name]" or "Add product [details]"</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" className="w-full border-info text-info hover:bg-info/5">
          <School className="h-4 w-4 mr-2" />
          Open Voice Command Tutorial
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HelpPanel;
