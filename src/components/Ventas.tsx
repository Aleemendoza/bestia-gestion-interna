import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar } from "lucide-react";

const mockVentas = [
  { id: 1, fecha: "2024-01-15", canal: "Mostrador", producto: "Sándwich Especial", cantidad: 8, total: 12000, metodoPago: "Efectivo" },
  { id: 2, fecha: "2024-01-15", canal: "WhatsApp", producto: "Combo Clásico", cantidad: 5, total: 8500, metodoPago: "MercadoPago" },
  { id: 3, fecha: "2024-01-15", canal: "Instagram", producto: "Papas Fritas", cantidad: 12, total: 6000, metodoPago: "QR" },
];

const productos = [
  { id: 1, nombre: "Sándwich Especial", precio: 1500 },
  { id: 2, nombre: "Sándwich Clásico", precio: 1200 },
  { id: 3, nombre: "Combo Clásico", precio: 1700 },
  { id: 4, nombre: "Papas Fritas", precio: 500 },
  { id: 5, nombre: "Bebida", precio: 300 },
];

export function Ventas() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevaVenta, setNuevaVenta] = useState({
    fecha: new Date().toISOString().split('T')[0],
    canal: "",
    producto: "",
    cantidad: "",
    metodoPago: ""
  });

  const calcularTotal = () => {
    const producto = productos.find(p => p.nombre === nuevaVenta.producto);
    if (producto && nuevaVenta.cantidad) {
      return producto.precio * parseInt(nuevaVenta.cantidad);
    }
    return 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Nueva venta:", nuevaVenta, "Total:", calcularTotal());
    setMostrarFormulario(false);
    setNuevaVenta({
      fecha: new Date().toISOString().split('T')[0],
      canal: "",
      producto: "",
      cantidad: "",
      metodoPago: ""
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Gestión de Ventas</h2>
          <p className="text-muted-foreground">Registra y visualiza todas las ventas del negocio</p>
        </div>
        <Button onClick={() => setMostrarFormulario(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Venta
        </Button>
      </div>

      {/* Formulario de Nueva Venta */}
      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nueva Venta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={nuevaVenta.fecha}
                    onChange={(e) => setNuevaVenta({...nuevaVenta, fecha: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canal">Canal de Venta</Label>
                  <Select value={nuevaVenta.canal} onValueChange={(value) => setNuevaVenta({...nuevaVenta, canal: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar canal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mostrador">Mostrador</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="producto">Producto</Label>
                  <Select value={nuevaVenta.producto} onValueChange={(value) => setNuevaVenta({...nuevaVenta, producto: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos.map((producto) => (
                        <SelectItem key={producto.id} value={producto.nombre}>
                          {producto.nombre} - ${producto.precio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cantidad">Cantidad</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    min="1"
                    value={nuevaVenta.cantidad}
                    onChange={(e) => setNuevaVenta({...nuevaVenta, cantidad: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metodoPago">Método de Pago</Label>
                  <Select value={nuevaVenta.metodoPago} onValueChange={(value) => setNuevaVenta({...nuevaVenta, metodoPago: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="mercadopago">MercadoPago</SelectItem>
                      <SelectItem value="qr">QR</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Total</Label>
                  <div className="text-2xl font-bold text-primary">
                    ${calcularTotal().toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Guardar Venta</Button>
                <Button type="button" variant="outline" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Ventas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Ventas Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2">Fecha</th>
                  <th className="text-left py-2">Canal</th>
                  <th className="text-left py-2">Producto</th>
                  <th className="text-left py-2">Cantidad</th>
                  <th className="text-left py-2">Total</th>
                  <th className="text-left py-2">Pago</th>
                </tr>
              </thead>
              <tbody>
                {mockVentas.map((venta) => (
                  <tr key={venta.id} className="border-b border-border/50">
                    <td className="py-2 text-sm">{venta.fecha}</td>
                    <td className="py-2 text-sm">
                      <span className="bg-secondary px-2 py-1 rounded-md text-xs">
                        {venta.canal}
                      </span>
                    </td>
                    <td className="py-2 text-sm">{venta.producto}</td>
                    <td className="py-2 text-sm">{venta.cantidad}</td>
                    <td className="py-2 text-sm font-semibold text-primary">
                      ${venta.total.toLocaleString()}
                    </td>
                    <td className="py-2 text-sm">{venta.metodoPago}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}