import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Home, 
  ShoppingCart, 
  Package, 
  CreditCard, 
  BarChart3, 
  Menu,
  X
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
  { id: 'productos', label: 'Productos', icon: Package },
  { id: 'gastos', label: 'Gastos', icon: CreditCard },
  { id: 'reportes', label: 'Reportes', icon: BarChart3 },
];

export function Layout({ children, activeModule, onModuleChange }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">🥪</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">La Bestia del Bajón</h1>
                <p className="text-sm text-muted-foreground">Panel de Gestión</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <Card className={`p-4 h-fit ${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 fixed md:sticky top-20 left-4 right-4 z-40 md:z-auto`}>
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeModule === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    onModuleChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </Card>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}