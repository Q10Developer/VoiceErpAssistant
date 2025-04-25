import React from "react";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import ErpTestTool from "@/components/erp/ErpTestTool";

const ErpTestPage: React.FC = () => {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800">
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8 text-center">QBS Connection Test</h1>
      
      <div className="mb-6">
        <p className="text-center text-gray-600 max-w-2xl mx-auto">
          Use this tool to test and update your QBS connection.
          Make sure you have the correct URL, API Key, and API Secret for your QBS instance.
        </p>
      </div>
      
      <ErpTestTool />
    </div>
  );
};

export default ErpTestPage;