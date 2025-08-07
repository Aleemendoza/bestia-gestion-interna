import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Package, Users } from "lucide-react";

const mockData = {
  ventasHoy: 45600,
  ventasSemana: 187500,
  gastosDelMes: 85000,
  productoMasVendido: "Sándwich Especial",
  equipoTrabajando: 3
};

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Vista general del negocio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-card to-card/80 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${mockData.ventasHoy.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% vs ayer
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/80 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Semana</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${mockData.ventasSemana.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% vs semana anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/80 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos del Mes</CardTitle>
            <Package className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${mockData.gastosDelMes.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Insumos y fijos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/80 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipo Activo</CardTitle>
            <Users className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {mockData.equipoTrabajando}
            </div>
            <p className="text-xs text-muted-foreground">
              Personas trabajando hoy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Producto Más Vendido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-primary mb-2">
              {mockData.productoMasVendido}
            </div>
            <p className="text-sm text-muted-foreground">
              35 unidades vendidas esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Margen estimado:</span>
                <span className="font-medium text-success">54%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mejor día:</span>
                <span className="font-medium">Sábado</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Canal principal:</span>
                <span className="font-medium">Mostrador</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}