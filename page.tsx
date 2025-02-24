"use client"

import { useState } from "react"
import { Plus, Trash2, Share, Link, FileText, Image, FileImage, FileIcon as FileVector } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PrintButton } from "@/components/PrintButton"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

type View = "home" | "editor"

interface Nutrient {
  id: string
  name: string
  value: string
  unit: string
}

function SortableNutrientItem({ 
  nutrient, 
  updateNutrient,
  removeNutrient 
}: {
  nutrient: Nutrient
  updateNutrient: (id: string, field: "name" | "value", value: string) => void
  removeNutrient: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: nutrient.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 bg-white p-2 rounded-lg ${isDragging ? "shadow-lg" : ""}`}
    >
      <button className="cursor-grab hover:text-primary" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </button>
      <Input
        value={nutrient.name}
        onChange={(e) => updateNutrient(nutrient.id, "name", e.target.value)}
        placeholder="Nome do nutriente"
        className="flex-grow"
      />
      <Input
        value={nutrient.value}
        onChange={(e) => updateNutrient(nutrient.id, "value", e.target.value)}
        placeholder="Valor"
        className="w-24"
      />
      <span className="text-sm text-muted-foreground w-8">{nutrient.unit}</span>
      <Button variant="ghost" size="icon" onClick={() => removeNutrient(nutrient.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface NutrientRow {
  id: string
  name: string
  value: string
  unit: string
}

function HomeView({ onSelectTable }: { onSelectTable: () => void }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Selecione uma Tabela Nutricional</h1>
      <div className="grid gap-4">
        <Button onClick={onSelectTable} className="text-left justify-start">
          Pão de Forma
        </Button>
        <Button onClick={onSelectTable} className="text-left justify-start">
          Bolo de Chocolate
        </Button>
        <Button onClick={onSelectTable} className="text-left justify-start">
          Suco de Laranja
        </Button>
      </div>
    </div>
  )
}

export default function NutritionTable() {
  const [currentView, setCurrentView] = useState<View>("home")
  const [productName, setProductName] = useState("Pão de Forma")
  const [servingSize, setServingSize] = useState("")
  const [servings, setServings] = useState("")
  const [nutrients, setNutrients] = useState<NutrientRow[]>([
    { id: "1", name: "Carboidratos", value: "", unit: "g" },
    { id: "2", name: "Proteínas", value: "", unit: "g" },
  ])
  const [columns, setColumns] = useState(3)
  const [width, setWidth] = useState(300)
  const [height, setHeight] = useState(400)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const shareOptions = [
    { name: "Enviar Link", icon: Link },
    { name: "PDF", icon: FileText },
    { name: "PNG", icon: Image },
    { name: "EPS", icon: FileImage },
    { name: "SVG", icon: FileVector },
  ]

  const addNutrient = () => {
    const newNutrient = {
      id: Date.now().toString(),
      name: "",
      value: "",
      unit: "g",
    }
    setNutrients([...nutrients, newNutrient])
  }

  const removeNutrient = (id: string) => {
    setNutrients(nutrients.filter((n) => n.id !== id))
  }

  const updateNutrient = (id: string, field: keyof NutrientRow, value: string) => {
    setNutrients(nutrients.map((n) => (n.id === id ? { ...n, [field]: value } : n)))
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      setNutrients((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over?.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleApplySettings = () => {
    setIsModalOpen(false)
    // Apply the new settings here
  }

  const handleGoBack = () => {
    setCurrentView("home")
  }

  const handleSelectTable = () => {
    setCurrentView("editor")
  }

  const handleShare = (option: string) => {
    console.log(`Sharing as ${option}`)
    setIsShareModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-blue-50/50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-semibold">Nutri</h1>
        </div>
      </div>
      <div className="container mx-auto p-4">
        {currentView === "home" ? (
          <HomeView onSelectTable={handleSelectTable} />
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Side - Form */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">{productName}</h1>
                <Button variant="outline" size="sm">
                  Options
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="productName">Nome do Produto</Label>
                  <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="servings">Porções por embalagem</Label>
                  <Input
                    id="servings"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    placeholder="000 porções"
                    className="bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="servingSize">Porções</Label>
                  <Input
                    id="servingSize"
                    value={servingSize}
                    onChange={(e) => setServingSize(e.target.value)}
                    placeholder="000g"
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={nutrients.map((n) => n.id)} strategy={verticalListSortingStrategy}>
                      {nutrients.map((nutrient) => (
                        <SortableNutrientItem
                          key={nutrient.id}
                          nutrient={nutrient}
                          updateNutrient={updateNutrient}
                          removeNutrient={removeNutrient}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                  <Button variant="outline" className="w-full" onClick={addNutrient}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={handleGoBack}>
                  Voltar
                </Button>
                <div className="flex gap-2">
                  <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Share className="w-4 h-4 mr-2" />
                        Exportar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Exportar</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {shareOptions.map((option) => (
                          <Button
                            key={option.name}
                            variant="outline"
                            onClick={() => handleShare(option.name)}
                            className="justify-start"
                          >
                            <option.icon className="w-4 h-4 mr-2" />
                            {option.name}
                          </Button>
                        ))}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsShareModalOpen(false)}>
                          Fechar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <PrintButton />
                </div>
              </div>
            </div>

            {/* Right Side - Preview */}
            <div className="bg-white p-8 rounded-lg shadow">
              <Card className="p-6 border-2">
                <h2 className="text-xl font-bold mb-4 text-center">{productName}</h2>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <div className="border-2 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <h3 className="font-bold mb-2">INFORMAÇÃO NUTRICIONAL</h3>
                      <p className="text-sm">Porções por embalagem: {servings || "000"} porções</p>
                      <p className="text-sm mb-4">Porção: {servingSize || "000"} g (medida caseira)</p>

                      <table className="w-full border-t-2 border-b-2">
                        <thead>
                          <tr className="text-sm">
                            <th className="text-left py-1"></th>
                            <th className="text-center">100 g</th>
                            <th className="text-center">{servingSize || "000"} g</th>
                            <th className="text-center">%VD*</th>
                          </tr>
                        </thead>
                        <tbody>
                          {nutrients.map((nutrient) => (
                            <tr key={nutrient.id} className="text-sm">
                              <td className="py-1">{nutrient.name}</td>
                              <td className="text-center">{nutrient.value || "-"}</td>
                              <td className="text-center">
                                {nutrient.value
                                  ? (
                                      (Number.parseFloat(nutrient.value) * Number.parseFloat(servingSize || "0")) /
                                      100
                                    ).toFixed(1)
                                  : "-"}
                              </td>
                              <td className="text-center">-</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="text-xs mt-2">*Percentual de valores diários fornecidos pela porção.</p>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Configurações da Tabela</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="columns" className="text-right">
                          Colunas
                        </Label>
                        <Select
                          value={columns.toString()}
                          onValueChange={(value) => setColumns(Number.parseInt(value))}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Selecione o número de colunas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="width" className="text-right">
                          Largura
                        </Label>
                        <Input
                          id="width"
                          type="number"
                          value={width}
                          onChange={(e) => setWidth(Number.parseInt(e.target.value))}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="height" className="text-right">
                          Altura
                        </Label>
                        <Input
                          id="height"
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(Number.parseInt(e.target.value))}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                        Descartar
                      </Button>
                      <Button onClick={handleApplySettings}>Aplicar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

