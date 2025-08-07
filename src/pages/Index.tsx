import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";
import { Ventas } from "@/components/Ventas";
import { Productos } from "@/components/Productos";
import { Gastos } from "@/components/Gastos";
import { Reportes } from "@/components/Reportes";

const Index = () => {
  const [activeModule, setActiveModule] = useState("dashboard");

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard />;
      case "ventas":
        return <Ventas />;
      case "productos":
        return <Productos />;
      case "gastos":
        return <Gastos />;
      case "reportes":
        return <Reportes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeModule={activeModule} onModuleChange={setActiveModule}>
      {renderModule()}
    </Layout>
  );
};

export default Index;
