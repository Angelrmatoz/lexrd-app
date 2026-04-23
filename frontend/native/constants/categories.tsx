import React from 'react';
import { Shield, Landmark, Scale, FileText, Car, Users, Home, Lock, HeartPulse } from "lucide-react-native";

export interface CategoryDocument {
  title: string;
  icon: React.ReactNode;
  description: string;
  documents: string[];
}

export const LEGAL_CATEGORIES: CategoryDocument[] = [
  {
    title: "Constitución y Administrativo",
    icon: <Shield size={24} color="#EF3340" />,
    description: "Ley fundamental y regulación de la administración pública.",
    documents: [
      "Constitución de la República Dominicana",
      "Ley 107-13 sobre Procedimiento Administrativo",
      "Ley 137-11 del Tribunal Constitucional",
      "Ley 200-04 de Libre Acceso a la Información",
    ],
  },
  {
    title: "Códigos Principales",
    icon: <Landmark size={24} color="#0034BB" />,
    description: "Pilares del ordenamiento jurídico civil y penal.",
    documents: [
      "Código Civil",
      "Código Penal",
      "Código de Trabajo",
      "Código de Comercio",
      "Código Tributario",
      "Código Monetario y Financiero",
    ],
  },
  {
    title: "Procedimientos",
    icon: <Scale size={24} color="#abc7ff" />,
    description: "Normativa sobre la ejecución de las leyes y juicios.",
    documents: [
      "Código Procesal Penal",
      "Código de Procedimiento Civil",
    ],
  },
  {
    title: "Comercio y Tecnología",
    icon: <FileText size={24} color="#c4c7c7" />,
    description: "Regulaciones comerciales, propiedad industrial y digital.",
    documents: [
      "Ley 479-08 de Sociedades Comerciales",
      "Ley 20-00 de Propiedad Industrial",
      "Ley 65-00 de Derecho de Autor",
      "Ley 126-02 de Comercio Electrónico",
      "Ley 358-05 de Protección al Consumidor",
    ],
  },
  {
    title: "Familia y Sucesiones",
    icon: <Users size={24} color="#ec4899" />,
    description: "Regulaciones sobre filiación, divorcio y protección de menores.",
    documents: [
      "Ley 136-03 (Código NNA)",
      "Ley 1306-bis de Divorcio",
      "Ley 189-01 sobre Filiación",
    ],
  },
  {
    title: "Inmuebles y Vivienda",
    icon: <Home size={24} color="#d97706" />,
    description: "Derecho inmobiliario, alquileres y condominios.",
    documents: [
      "Ley 108-05 de Registro Inmobiliario",
      "Ley 4314 sobre Alquileres",
      "Ley 5038 sobre Condominios",
    ],
  },
  {
    title: "Penal Especial",
    icon: <Lock size={24} color="#64748b" />,
    description: "Crímenes de alta tecnología, lavado de activos y armas.",
    documents: [
      "Ley 53-07 sobre Alta Tecnología",
      "Ley 155-17 contra el Lavado de Activos",
      "Ley 631-16 sobre Armas",
      "Ley 50-88 sobre Drogas",
    ],
  },
  {
    title: "Seguridad Social",
    icon: <HeartPulse size={24} color="#10b981" />,
    description: "Sistema Dominicano de Seguridad Social.",
    documents: [
      "Ley 87-01 de Seguridad Social",
    ],
  },
  {
    title: "Movilidad y Tránsito",
    icon: <Car size={24} color="#e5e2e1" />,
    description: "Seguridad vial y transporte terrestre.",
    documents: [
      "Ley 63-17 de Movilidad y Tránsito",
    ],
  },
];
