import { Shield, Landmark, Scale, FileText, Car } from "lucide-react";
import type { CategoryDocument } from "@/types/categories";

export const LEGAL_CATEGORIES: CategoryDocument[] = [
  {
    title: "Constitución",
    icon: <Shield className="size-6 text-dominican-red" />,
    description: "Ley fundamental del Estado dominicano.",
    documents: ["Constitución de la República Dominicana"],
  },
  {
    title: "Códigos Principales",
    icon: <Landmark className="size-6 text-dominican-blue" />,
    description: "Pilares del ordenamiento jurídico civil y penal.",
    documents: [
      "Código Civil",
      "Código Penal",
      "Código de Comercio",
      "Código de Trabajo",
    ],
  },
  {
    title: "Procedimientos",
    icon: <Scale className="size-6 text-tertiary" />,
    description: "Normativa sobre la ejecución de las leyes.",
    documents: [
      "Código Procesal Penal",
      "Código de Procedimiento Civil",
    ],
  },
  {
    title: "Leyes Especializadas",
    icon: <FileText className="size-6 text-on-surface-variant" />,
    description: "Regulaciones para sectores específicos.",
    documents: [
      "Código Tributario",
      "Código Monetario y Financiero",
      "Código para la protección de Niños, Niñas y Adolescentes (NNA)",
    ],
  },
  {
    title: "Movilidad y Tránsito",
    icon: <Car className="size-6 text-primary" />,
    description: "Seguridad vial y transporte terrestre.",
    documents: [
      "Ley No. 63-17 de Movilidad, Transporte Terrestre, Tránsito y Seguridad Vial",
    ],
  },
];
