import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Package } from "lucide-react";

const mockProductos = [
  { id: 1, nombre: "Sándwich Especial", precio: 1500, categoria: "sandwich", activo: true },
  { id: 2, nombre: "Sándwich Clásico", precio: 1200, categoria: "sandwich", activo: true },
  { id: 3, nombre: "Combo Clásico", precio: 1700, categoria: "combo", activo: true },
  { id: 4, nombre: "Papas Fritas", precio: 500, categoria: "papas", activo: true },
  { id: 5, nombre: "Bebida Cola", precio: 300, categoria: "bebida", activo: true },
  { id: 6, nombre: "Sándwich Vegetariano", precio: 1300, categoria: "sandwich", activo: false },
];

const categorias = [
  { value: "sandwich", label: "Sándwich" },
  { value: "combo", label: "Combo" },
  { value: "papas", label: "Papas" },
  { value: "bebida", label: "Bebida" },
];

export function Productos() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditando, setProductoEditando] = useState<number | null>(null);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: "",
    categoria: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Producto:", nuevoProducto);
    setMostrarFormulario(false);
    setProductoEditando(null);
    setNuevoProducto({ nombre: "", precio: "", categoria: "" });
  };

  const editarProducto = (producto: any) => {
    setNuevoProducto({
      nombre: producto.nombre,
      precio: producto.precio.toString(),
      categoria: producto.categoria
    });
    setProductoEditando(producto.id);
    setMostrarFormulario(true);
  };

  const toggleActivo = (id: number) => {
    console.log("Toggle activo para producto:", id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Gestión de Productos</h2>
          <p className="text-muted-foreground">Administra el catálogo de productos del negocio</p>
        </div>
        <Button onClick={() => setMostrarFormulario(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>
              {productoEditando ? "Editar Producto" : "Nuevo Producto"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Producto</Label>
                  <Input
                    id="nombre"
                    value={nuevoProducto.nombre}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
                    placeholder="Ej: Sándwich Especial"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="precio">Precio</Label>
                  <Input
                    id="precio"
                    type="number"
                    min="0"
                    step="50"
                    value={nuevoProducto.precio}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, precio: e.target.value})}
                    placeholder="1500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select 
                    value={nuevoProducto.categoria} 
                    onValueChange={(value) => setNuevoProducto({...nuevoProducto, categoria: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {productoEditando ? "Actualizar" : "Crear"} Producto
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setMostrarFormulario(false);
                    setProductoEditando(null);
                    setNuevoProducto({ nombre: "", precio: "", categoria: "" });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Productos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Catálogo de Productos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockProductos.map((producto) => (
              <Card key={producto.id} className="bg-gradient-to-br from-card to-card/80">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-foreground">{producto.nombre}</h3>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editarProducto(producto)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActivo(producto.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">
                      ${producto.precio.toLocaleString()}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Badge variant={producto.activo ? "default" : "secondary"}>
                        {categorias.find(c => c.value === producto.categoria)?.label}
                      </Badge>
                      
                      <Badge variant={producto.activo ? "default" : "secondary"}>
                        {producto.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}