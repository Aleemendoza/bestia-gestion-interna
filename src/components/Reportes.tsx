import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Download, FileText } from "lucide-react";

const reportesDisponibles = [
  {
    id: 1,
    titulo: "Resumen Mensual",
    descripcion: "Ventas, gastos y balance del mes actual",
    tipo: "mensual",
    formato: "PDF",
    ultimaActualizacion: "Hoy"
  },
  {
    id: 2,
    titulo: "Productos Más Vendidos",
    descripcion: "Ranking de productos por cantidad vendida",
    tipo: "productos",
    formato: "Excel",
    ultimaActualizacion: "Ayer"
  },
  {
    id: 3,
    titulo: "Análisis de Canales",
    descripcion: "Comparativa de ventas por canal de venta",
    tipo: "canales",
    formato: "PDF",
    ultimaActualizacion: "2 días"
  },
  {
    id: 4,
    titulo: "Gastos por Categoría",
    descripcion: "Desglose detallado de gastos por tipo",
    tipo: "gastos",
    formato: "Excel",
    ultimaActualizacion: "Hoy"
  }
];

const metricsData = [
  {
    titulo: "Mejor Día de la Semana",
    valor: "Sábado",
    detalle: "Promedio: $52,000",
    tendencia: "up"
  },
  {
    titulo: "Horario Pico",
    valor: "21:00 - 23:00",
    detalle: "40% de las ventas",
    tendencia: "up"
  },
  {
    titulo: "Canal Más Rentable",
    valor: "Mostrador",
    detalle: "60% de ingresos",
    tendencia: "stable"
  },
  {
    titulo: "Margen Promedio",
    valor: "54%",
    detalle: "Últimos 30 días",
    tendencia: "up"
  }
];

export function Reportes() {
  const generarReporte = (reporteId: number) => {
    console.log("Generando reporte:", reporteId);
    // Aquí se implementaría la generación real del reporte
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Reportes y Métricas</h2>
        <p className="text-muted-foreground">Análisis detallado del rendimiento del negocio</p>
      </div>

      {/* Métricas Clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsData.map((metric, index) => (
          <Card key={index} className="bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">{metric.titulo}</h3>
                <TrendingUp className={`h-4 w-4 ${
                  metric.tendencia === 'up' ? 'text-success' : 
                  metric.tendencia === 'down' ? 'text-destructive' : 'text-muted-foreground'
                }`} />
              </div>
              <div className="text-xl font-bold text-foreground mb-1">
                {metric.valor}
              </div>
              <div className="text-xs text-muted-foreground">
                {metric.detalle}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reportes Disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Reportes Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportesDisponibles.map((reporte) => (
              <Card key={reporte.id} className="bg-gradient-to-br from-secondary/20 to-secondary/10">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold text-foreground">{reporte.titulo}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {reporte.descripcion}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Badge variant="outline">{reporte.formato}</Badge>
                      <Badge variant="secondary" className="text-xs">
                        Act. {reporte.ultimaActualizacion}
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => generarReporte(reporte.id)}
                      className="gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Generar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumen Rápido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                <span className="text-sm font-medium">Ingresos Totales</span>
                <span className="text-lg font-bold text-success">$187,500</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg">
                <span className="text-sm font-medium">Gastos Totales</span>
                <span className="text-lg font-bold text-destructive">$85,000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                <span className="text-sm font-medium">Balance Neto</span>
                <span className="text-lg font-bold text-primary">$102,500</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Mejoras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <span>Gráficos interactivos de ventas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-info rounded-full"></div>
                <span>Comparativas período anterior</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span>Predicciones de demanda</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Reportes automáticos por email</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}