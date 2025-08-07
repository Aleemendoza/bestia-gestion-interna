import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard, Calendar } from "lucide-react";

const tiposGasto = [
  { value: "insumos", label: "Insumos", color: "bg-warning" },
  { value: "fijo", label: "Gastos Fijos", color: "bg-info" },
  { value: "personal", label: "Personal", color: "bg-success" },
  { value: "otros", label: "Otros", color: "bg-secondary" },
];

export function Gastos() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevoGasto, setNuevoGasto] = useState({
    fecha: new Date().toISOString().split("T")[0],
    tipo: "",
    descripcion: "",
    monto: ""
  });

  useEffect(() => {
    const fetchGastos = async () => {
      try {
        const res = await fetch(`${API_URL}/gastos`);
        const data = await res.json();
        if (data.success) {
          setGastos(data.data);
        }
      } catch (error) {
        console.error("Error al cargar gastos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGastos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/gastos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...nuevoGasto,
          tipo_gasto_id: tiposGasto.find((t) => t.value === nuevoGasto.tipo)?.value || "otros",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGastos([{ ...nuevoGasto, id: data.data.id }, ...gastos]);
        setMostrarFormulario(false);
        setNuevoGasto({
          fecha: new Date().toISOString().split("T")[0],
          tipo: "",
          descripcion: "",
          monto: ""
        });
      }
    } catch (error) {
      console.error("Error al guardar gasto:", error);
    }
  };

  const totalGastos = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
  const gastosPorTipo = tiposGasto.map(tipo => ({
    ...tipo,
    total: gastos.filter(gasto => gasto.tipo === tipo.value).reduce((sum, gasto) => sum + gasto.monto, 0)
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Gestión de Gastos</h2>
          <p className="text-muted-foreground">Registra y controla todos los gastos del negocio</p>
        </div>
        <Button onClick={() => setMostrarFormulario(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Gasto
        </Button>
      </div>

      {/* Resumen de Gastos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-card to-card/80">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Total del Mes</div>
            <div className="text-2xl font-bold text-destructive">
              ${totalGastos.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {gastosPorTipo.slice(0, 3).map((tipo) => (
          <Card key={tipo.value} className="bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">{tipo.label}</div>
              <div className="text-xl font-bold text-foreground">
                ${tipo.total.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formulario de Nuevo Gasto */}
      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nuevo Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={nuevoGasto.fecha}
                    onChange={(e) => setNuevoGasto({ ...nuevoGasto, fecha: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Gasto</Label>
                  <Select value={nuevoGasto.tipo} onValueChange={(value) => setNuevoGasto({ ...nuevoGasto, tipo: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposGasto.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={nuevoGasto.descripcion}
                    onChange={(e) => setNuevoGasto({ ...nuevoGasto, descripcion: e.target.value })}
                    placeholder="Detalle del gasto (ej: Compra de carne para la semana)"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monto">Monto</Label>
                  <Input
                    id="monto"
                    type="number"
                    min="0"
                    step="100"
                    value={nuevoGasto.monto}
                    onChange={(e) => setNuevoGasto({ ...nuevoGasto, monto: e.target.value })}
                    placeholder="15000"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Guardar Gasto</Button>
                <Button type="button" variant="outline" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Gastos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Gastos Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Cargando gastos...</p>
          ) : gastos.length === 0 ? (
            <p className="text-muted-foreground">No hay gastos registrados aún.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Fecha</th>
                    <th className="text-left py-2">Tipo</th>
                    <th className="text-left py-2">Descripción</th>
                    <th className="text-left py-2">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {gastos.map((gasto) => {
                    const tipoInfo = tiposGasto.find(t => t.value === gasto.tipo || gasto.tipoGasto);
                    return (
                      <tr key={gasto.id} className="border-b border-border/50">
                        <td className="py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {gasto.fecha}
                          </div>
                        </td>
                        <td className="py-3 text-sm">
                          <Badge variant="secondary">
                            {tipoInfo?.label || gasto.tipoGasto}
                          </Badge>
                        </td>
                        <td className="py-3 text-sm">{gasto.descripcion}</td>
                        <td className="py-3 text-sm font-semibold text-destructive">
                          -${parseFloat(gasto.monto).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}