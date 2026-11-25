export type CategoryId =
  | "concreto"
  | "andaimes"
  | "energia"
  | "compactacao"
  | "escavacao"
  | "elevacao"
  | "ferramentas"
  | "limpeza"
  | "equipamentos-hospitalares"
  | "enfermagem-domicilio";

export type EquipmentKey =
  | "betoneira"
  | "andaime"
  | "compactador"
  | "gerador"
  | "serra"
  | "martelete"
  | "escavadeira"
  | "plataforma"
  | "lavadora"
  | "furadeira"
  | "escada"
  | "laser";

type Equipment = {
  name: string;
  category: CategoryId;
  price: number;
  deposit: number;
  specs: string[];
  description: string;
  image: string;
};

const img = (key: EquipmentKey) => `/img/eq/${key}.webp`;

export const equipment: Record<EquipmentKey, Equipment> = {
  betoneira: {
    name: "Betoneira 400 L",
    category: "concreto",
    price: 89,
    deposit: 300,
    specs: ["Motor 2 cv", "220 V", "Rodas para reboque"],
    description: "Mistura concreto e argamassa para obra de qualquer porte.",
    image: img("betoneira"),
  },
  andaime: {
    name: "Andaime tubular 1 m",
    category: "andaimes",
    price: 42,
    deposit: 150,
    specs: ["Módulo 1 × 1,5 m", "Piso de madeira", "Rodízios com trava"],
    description: "Monte a altura que precisar, módulo por módulo.",
    image: img("andaime"),
  },
  compactador: {
    name: "Placa vibratória 90 kg",
    category: "compactacao",
    price: 120,
    deposit: 400,
    specs: ["Motor a gasolina", "Placa 50 × 60 cm", "Alça dobrável"],
    description: "Compacta solo, brita e base de calçada.",
    image: img("compactador"),
  },
  gerador: {
    name: "Gerador 8 kVA silenciado",
    category: "energia",
    price: 150,
    deposit: 600,
    specs: ["Diesel", "Partida elétrica", "Autonomia de 10 h"],
    description: "Energia estável para obra sem ligação definitiva.",
    image: img("gerador"),
  },
  serra: {
    name: "Serra de bancada 10\"",
    category: "ferramentas",
    price: 59,
    deposit: 200,
    specs: ["Disco de 10\"", "Guia paralela", "Mesa de alumínio"],
    description: "Cortes retos e precisos em madeira e compensado.",
    image: img("serra"),
  },
  martelete: {
    name: "Martelete rompedor 16 kg",
    category: "ferramentas",
    price: 79,
    deposit: 300,
    specs: ["1.500 W", "Ponteiro e talhadeira", "220 V"],
    description: "Quebra piso, parede e concreto sem esforço.",
    image: img("martelete"),
  },
  escavadeira: {
    name: "Mini escavadeira 1,8 t",
    category: "escavacao",
    price: 690,
    deposit: 2500,
    specs: ["Com operador", "Concha de 30 cm", "Esteira de borracha"],
    description: "Escava valas e fundações em espaços apertados.",
    image: img("escavadeira"),
  },
  plataforma: {
    name: "Plataforma tesoura 8 m",
    category: "elevacao",
    price: 380,
    deposit: 1500,
    specs: ["Elétrica", "Carga de 230 kg", "Uso interno e externo"],
    description: "Trabalho seguro em altura para pintura e instalações.",
    image: img("plataforma"),
  },
  lavadora: {
    name: "Lavadora de alta pressão",
    category: "limpeza",
    price: 60,
    deposit: 200,
    specs: ["2.200 psi", "Mangueira de 8 m", "Bicos variados"],
    description: "Limpa fachada, calçada e pós-obra em minutos.",
    image: img("lavadora"),
  },
  furadeira: {
    name: "Parafusadeira 18 V com kit",
    category: "ferramentas",
    price: 35,
    deposit: 150,
    specs: ["2 baterias", "Carregador rápido", "Maleta"],
    description: "Fura alvenaria, madeira e metal com o kit completo.",
    image: img("furadeira"),
  },
  escada: {
    name: "Escada extensível 7 m",
    category: "andaimes",
    price: 30,
    deposit: 100,
    specs: ["Alumínio", "Sapatas antiderrapantes", "Trava de segurança"],
    description: "Leve, firme e fácil de transportar.",
    image: img("escada"),
  },
  laser: {
    name: "Nível a laser com tripé",
    category: "ferramentas",
    price: 55,
    deposit: 250,
    specs: ["Autonivelante", "Linha verde", "Alcance de 30 m"],
    description: "Marca nível e prumo com precisão em qualquer cômodo.",
    image: img("laser"),
  },
};

export const categories: { id: CategoryId; label: string; image: string }[] = [
  // Cama de UCi, Pablo Jarrín, CC BY-SA 4.0. https://commons.wikimedia.org/wiki/File:Cama_de_UCi.jpg
  { id: "equipamentos-hospitalares", label: "Equipamentos Hospitalares", image: "/img/eq/hospitalar.webp" },
  // Blood pressure monitoring, rawpixel.com, CC0. https://commons.wikimedia.org/wiki/File:Blood_pressure_monitoring.jpg
  { id: "enfermagem-domicilio", label: "Enfermagem ao Domicílio", image: "/img/eq/enfermagem.webp" },
  { id: "concreto", label: "Concreto", image: img("betoneira") },
  { id: "andaimes", label: "Andaimes", image: img("andaime") },
  { id: "ferramentas", label: "Ferramentas", image: img("furadeira") },
  { id: "energia", label: "Energia", image: img("gerador") },
  { id: "compactacao", label: "Compactação", image: img("compactador") },
  { id: "escavacao", label: "Escavação", image: img("escavadeira") },
  { id: "elevacao", label: "Elevação", image: img("plataforma") },
  { id: "limpeza", label: "Limpeza", image: img("lavadora") },
];

export function categoryLabel(id: CategoryId) {
  return categories.find((c) => c.id === id)?.label ?? "Equipamentos";
}

export const coverFor: Record<CategoryId, string> = {
  concreto: "/img/biz/obra.webp",
  andaimes: "/img/biz/andaimes.webp",
  ferramentas: "/img/biz/loja.webp",
  energia: "/img/biz/galpao.webp",
  compactacao: "/img/biz/patio.webp",
  escavacao: "/img/biz/patio.webp",
  elevacao: "/img/biz/galpao.webp",
  limpeza: "/img/biz/loja.webp",
  "equipamentos-hospitalares": "/img/biz/hospitalar.webp",
  "enfermagem-domicilio": "/img/biz/enfermagem.webp",
};

export const library = (Object.keys(equipment) as EquipmentKey[]).map((key) => ({
  src: equipment[key].image,
  label: equipment[key].name,
}));

export const coverLibrary = [
  { src: "/img/biz/loja.webp", label: "Loja de ferramentas" },
  { src: "/img/biz/patio.webp", label: "Pátio de máquinas" },
  { src: "/img/biz/andaimes.webp", label: "Depósito de andaimes" },
  { src: "/img/biz/galpao.webp", label: "Galpão de geradores" },
  { src: "/img/biz/obra.webp", label: "Obra em andamento" },
];
