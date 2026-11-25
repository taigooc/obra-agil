import { fold } from "../lib/text.ts";
import { extraProducts, extraServices } from "./more.ts";

export type CatalogKind = "product" | "service";

export type CatalogCategory = {
  id: string;
  kind: CatalogKind;
  name: string;
  aliases: string[];
  image: string | null;
  restricted: boolean;
};

export type CatalogTemplate = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  aliases: string[];
  image: string | null;
};

export function slug(value: string) {
  const clean = fold(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return (clean || "item").slice(0, 48);
}

type Row = [id: string, name: string, aliases?: string, names?: string, restricted?: boolean];

const productRows: Row[] = [
  ["concreto", "Concreto", "betoneira,argamassa,cimento", "Betoneira 400 L|Mistura concreto e argamassa.|/img/eq/betoneira.webp;Betoneira 150 L;Mangote vibrador;Régua vibratória;Carrinho de mão;Forma para laje"],
  ["andaimes", "Andaimes", "balancim,torre", "Andaime tubular 1 m|Módulo para montar a altura que precisar.|/img/eq/andaime.webp;Escada extensível 7 m|/img/eq/escada.webp;Guarda-corpo;Sapata ajustável;Plataforma de madeira;Escada de abrir"],
  ["ferramentas", "Ferramentas", "furadeira,parafusadeira,martelete", "Parafusadeira 18 V com kit|Fura alvenaria, madeira e metal.|/img/eq/furadeira.webp;Martelete rompedor 16 kg|/img/eq/martelete.webp;Serra de bancada 10 pol|/img/eq/serra.webp;Nível a laser com tripé|/img/eq/laser.webp;Esmerilhadeira;Serra circular;Serra mármore;Tupia;Lixadeira orbital"],
  ["energia", "Energia", "gerador,luz", "Gerador 8 kVA silenciado|Energia para quem está sem ligação definitiva.|/img/eq/gerador.webp;Gerador 2 kVA;Extensão industrial;Torre de iluminação;Quadro de distribuição;Transformador"],
  ["compactacao", "Compactação", "placa vibratoria,sapo", "Placa vibratória 90 kg|Compacta solo, brita e base de calçada.|/img/eq/compactador.webp;Compactador tipo sapo;Rolo compactador;Soquete;Placa vibratória reversível"],
  ["escavacao", "Escavação", "retroescavadeira,mini escavadeira", "Mini escavadeira 1,8 t|Escava valas e fundações em espaço apertado.|/img/eq/escavadeira.webp;Retroescavadeira;Bobcat;Rompedor hidráulico;Trado perfurador;Caçamba"],
  ["elevacao", "Elevação", "plataforma,guindaste", "Plataforma tesoura 8 m|Trabalho em altura para pintura e instalação.|/img/eq/plataforma.webp;Guindaste muque;Talha elétrica;Empilhadeira;Plataforma articulada;Cesta aérea"],
  ["limpeza", "Limpeza de obra", "lavadora,lava jato", "Lavadora de alta pressão|Limpa fachada, calçada e pós-obra.|/img/eq/lavadora.webp;Aspirador de pó e água;Extratora de estofados;Enceradeira;Soprador;Varredeira"],
  ["bicicletas", "Bicicletas", "bike,mtb", "Bicicleta urbana;Bicicleta mountain bike;Bicicleta infantil;Bicicleta elétrica;Capacete;Cadeirinha infantil"],
  ["veiculos", "Veículos", "carro,moto", "Carro popular;Caminhonete;Van de passageiros;Moto;Reboque;Carretinha"],
  ["vestidos", "Vestidos e trajes", "noiva,festa,terno", "Vestido de noiva;Vestido de festa;Terno completo;Smoking;Fantasia infantil;Véu e grinalda"],
  ["cameras", "Equipamentos fotográficos", "camera,lente,drone", "Câmera DSLR;Câmera mirrorless;Lente 50 mm;Drone com câmera;Flash de estúdio;Tripé profissional"],
  ["instrumentos", "Instrumentos musicais", "guitarra,violao,teclado", "Violão;Guitarra;Teclado;Bateria;Contrabaixo;Microfone"],
  ["som", "Som e iluminação", "caixa de som,projetor", "Caixa de som ativa;Mesa de som;Microfone sem fio;Projetor;Tela de projeção;Refletor LED"],
  ["games", "Games e eletrônicos", "playstation,videogame,notebook", "PlayStation;Xbox;Nintendo Switch;Notebook;Televisão;Monitor"],
  ["festas", "Festas e eventos", "tenda,inflavel,cadeira", "Mesa dobrável;Cadeira de plástico;Cadeira Tiffany;Tenda para eventos;Castelo inflável;Piscina de bolinhas;Máquina de algodão doce;Máquina de pipoca;Painel de festa;Arco de decoração"],
  ["moveis", "Móveis", "sofa,mesa,cama", "Sofá;Mesa de jantar;Cama de casal;Guarda-roupa;Cômoda;Poltrona"],
  ["camping", "Camping", "barraca,caiaque", "Barraca para 4 pessoas;Saco de dormir;Caiaque;Prancha de stand up;Cooler;Fogareiro"],
  ["esporte", "Esporte e academia", "esteira,bicicleta ergometrica", "Esteira;Bicicleta ergométrica;Kit de halteres;Elíptico;Mesa de pingue-pongue;Trave de futebol"],
  ["bebe", "Bebê e infantil", "berco,carrinho", "Berço;Carrinho de bebê;Cadeirinha para carro;Banheira;Cercadinho;Andador"],
  ["mobilidade", "Mobilidade", "cadeira de rodas,muleta", "Cadeira de rodas;Muleta axilar;Andador;Cama hospitalar;Cadeira de banho"],
  ["jardim", "Jardinagem", "rocadeira,motosserra", "Roçadeira;Motosserra;Soprador de folhas;Cortador de grama;Aparador de cerca viva;Pulverizador"],
  ["agricola", "Máquinas agrícolas", "trator", "Trator;Grade aradora;Plantadeira;Carreta agrícola;Pulverizador agrícola;Ensiladeira"],
  ["solda", "Solda e compressores", "maquina de solda", "Máquina de solda inversora;Compressor de ar;Maçarico;Serra de fita para metal;Esmeril de bancada"],
  ["climatizacao", "Climatização", "ar-condicionado,ventilador", "Ar-condicionado portátil;Ventilador industrial;Climatizador evaporativo;Aquecedor;Desumidificador"],
  ["cozinha-profissional", "Cozinha profissional", "forno,chapa,freezer", "Forno industrial;Chapa a gás;Freezer horizontal;Geladeira comercial;Máquina de café;Batedeira industrial"],
  ["barbearia", "Equipamentos de barbearia", "cadeira de barbeiro", "Cadeira de barbeiro;Espelho com luz;Máquina de corte;Navalha;Lavatório;Carrinho auxiliar"],
  ["estetica", "Equipamentos de estética", "maca,autoclave", "Maca estética;Autoclave;Vapor de ozônio;Lupa com luz;Carrinho de estética"],
  ["pintura", "Pintura", "compressor,pistola", "Compressor de pintura;Pistola de pintura;Andaime para pintura;Lixadeira de parede;Rolo e bandeja profissional"],
  ["sinalizacao", "Sinalização e segurança", "cone,EPI", "Cone de sinalização;Cavalete;Grade de isolamento;Extintor;Kit de EPI"],
  ["obra-apoio", "Apoio de obra", "container,banheiro", "Container escritório;Banheiro químico;Betoneira de mão;Serra policorte;Guincho de coluna"],
  ["informatica-equipamentos", "Informática para alugar", "computador,impressora", "Computador desktop;Impressora;Projetor de escritório;Nobreak;Roteador;Webcam"],
  ["audio", "Áudio", "microfone,interface", "Interface de áudio;Microfone condensador;Fone de monitoramento;Caixa amplificada;Pedestal de microfone"],
  ["equipamentos-filmagem", "Equipamentos de filmagem", "gimbal,iluminacao", "Câmera de cinema;Gimbal;Kit de iluminação LED;Gravador de áudio;Teleprompter;Slider"],
  ["drones", "Drones", "drone", "Drone iniciante;Drone com câmera 4K;Bateria extra;Controle reserva"],
  ["maquinas-costura", "Máquinas de costura", "maquina de costura", "Máquina de costura reta;Overloque;Máquina de bordado;Manequim;Ferro industrial"],
  ["nautico", "Náutico", "barco,jet", "Barco de alumínio;Caiaque duplo;Motor de popa;Colete salva-vidas;Stand up paddle"],
  ["motos", "Motos", "moto,scooter", "Moto urbana;Scooter;Capacete;Baú;Capa de chuva"],
  ["caminhoes", "Caminhões e frete", "caminhao,munck", "Caminhão baú;Caminhão munck;Caminhão caçamba;Empilhadeira a combustão;Paleteira"],
  ["trailers", "Trailers e food", "trailer,food truck", "Trailer de lanches;Freezer de trailer;Chapa de lanche;Barraca de feira;Toldo"],
  ["decoracao", "Decoração", "vaso,luminaria", "Luminária;Vaso grande;Tapete;Quadro;Aparador;Espelho"],
  ["eletrodomesticos", "Eletrodomésticos", "geladeira,maquina de lavar", "Geladeira;Máquina de lavar;Fogão;Micro-ondas;Air fryer;Aspirador robô"],
  ["ferramentas-jardim", "Ferramentas de jardim", "pazinha,tesoura", "Tesoura de poda;Soprador;Mangueira com carrinho;Regador;Carrinho de jardim"],
  ["brinquedos", "Brinquedos", "pula-pula,piscina", "Pula-pula;Piscina infantil;Cama elástica;Escorregador;Mesa de pebolim"],
  ["musica-evento", "Música para eventos", "dj,karaoke", "Controladora de DJ;Karaokê;Máquina de fumaça;Canhão de luz;Globo de espelhos"],
  ["foto-estudio", "Estúdio fotográfico", "fundo infinito", "Fundo infinito;Softbox;Rebatedor;Octabox;Grampo e braço"],
  ["medicao", "Medição", "trena,teodolito", "Trena a laser;Teodolito;Nível óptico;Detector de metais;Paquímetro"],
  ["hidraulica", "Equipamentos hidráulicos", "bomba,desentupidora", "Bomba d'água;Desentupidora elétrica;Lavadora de tubulação;Caixa d'água;Mangueira de nível"],
  ["eletrica", "Equipamentos elétricos", "multimetro,furadeira", "Multímetro;Furadeira de impacto;Alicate amperímetro;Extensão 20 m;Detector de tensão"],
  ["marcenaria", "Marcenaria", "serra,plaina", "Plaina elétrica;Serra esquadria;Tupia de coluna;Grampeador pneumático;Lixadeira de cinta"],
  ["serralheria", "Serralheria", "esmeril,policorte", "Policorte;Esmerilhadeira 7 pol;Dobra manual;Furadeira de bancada;Máscara de solda"],
  ["equipamentos-hospitalares", "Equipamentos Hospitalares", "uti,hospital,ventilador,home care", "Ventilador pulmonar|Locação entre clínicas, hospitais e para uso em casa.;Monitor de UTI;Bomba de infusão;Concentrador de O2;Cama de UTI;Oxímetro de pulso;Desfibrilador;Aspirador de secreção"],
];

const serviceRows: Row[] = [
  ["encanadores", "Encanadores", "encanador,hidraulica,vazamento", "Instalação de torneira;Conserto de vazamento;Desentupimento de pia;Instalação de chuveiro;Instalação de vaso sanitário;Reparo de tubulação;Troca de registro;Instalação de caixa d'água"],
  ["eletricistas", "Eletricistas", "eletricista,fiacao", "Instalação de tomada;Troca de chuveiro elétrico;Quadro de disjuntores;Instalação de ventilador de teto;Instalação de luminária;Reparo de curto-circuito"],
  ["pintores", "Pintores", "pintura", "Pintura de parede;Pintura de teto;Pintura de fachada;Textura;Pintura de portão;Envelopamento de parede"],
  ["pedreiros", "Pedreiros", "pedreiro,alvenaria", "Assentamento de piso;Reboco;Construção de muro;Contrapiso;Assentamento de azulejo;Pequena reforma"],
  ["marceneiros", "Marceneiros", "marceneiro,armario", "Armário planejado;Reparo de porta;Prateleira sob medida;Montagem de móvel;Reparo de gaveta"],
  ["serralheiros", "Serralheiros", "serralheiro,portao", "Portão de ferro;Grade de janela;Corrimão;Reparo de portão automático;Estrutura metálica"],
  ["diaristas", "Diaristas", "faxina,limpeza de casa", "Limpeza residencial;Limpeza de apartamento;Limpeza pós-obra;Passadoria;Limpeza de vidros;Organização de armários"],
  ["limpeza-profissional", "Limpeza profissional", "faxineira,limpeza comercial", "Limpeza comercial;Higienização de sofá;Limpeza de colchão;Lavagem de fachada;Limpeza de vidros em altura;Limpeza de escritório"],
  ["jardineiros", "Jardineiros", "jardineiro,paisagismo", "Corte de grama;Poda de árvores;Plantio de jardim;Manutenção de jardim;Remoção de entulho verde"],
  ["barbeiros", "Barbeiros", "barba,corte masculino,degrade", "Corte masculino;Corte infantil;Corte degradê;Barba;Corte e barba;Pigmentação de barba;Acabamento de cabelo"],
  ["cabeleireiros", "Cabeleireiros", "salao,escova", "Corte feminino;Escova;Coloração;Hidratação;Progressiva;Penteado"],
  ["manicure", "Manicure e pedicure", "unha", "Manicure;Pedicure;Esmaltação em gel;Alongamento de unha;Spa dos pés"],
  ["maquiadores", "Maquiadores", "make,maquiagem", "Maquiagem social;Maquiagem de noiva;Maquiagem artística;Curso de automaquiagem"],
  ["fotografos", "Fotógrafos", "ensaio,fotografia", "Ensaio fotográfico;Fotografia de casamento;Fotografia de aniversário;Fotografia de produtos;Fotografia imobiliária;Fotografia corporativa;Fotografia com drone"],
  ["filmagem", "Filmagem", "video,cinegrafista", "Filmagem de casamento;Vídeo institucional;Edição de vídeo;Transmissão ao vivo;Vídeo com drone"],
  ["personal", "Personal trainers", "personal,treino", "Treino personal;Treino em domicílio;Avaliação física;Treino para iniciantes;Treino funcional"],
  ["mecanicos", "Mecânicos", "oficina,carro", "Revisão automotiva;Troca de óleo;Freios;Suspensão;Diagnóstico eletrônico;Ar-condicionado automotivo"],
  ["borracheiros", "Borracharia", "pneu,borracharia", "Conserto de pneu;Troca de pneu;Alinhamento;Balanceamento;Borracharia móvel"],
  ["lava-jato", "Lava jato", "lavagem,estetica automotiva", "Lavagem simples;Lavagem completa;Polimento;Higienização interna;Cristalização"],
  ["fretes", "Fretes e carretos", "frete,carreto,mudanca", "Carreto;Frete urbano;Mudança residencial;Içamento de móveis;Frete com ajudante"],
  ["mudancas", "Mudanças", "mudanca", "Mudança residencial;Mudança comercial;Embalagem;Desmontagem de móveis;Guarda-móveis"],
  ["ar-condicionado", "Ar-condicionado", "instalacao de ar,split", "Instalação de ar-condicionado;Limpeza de ar-condicionado;Recarga de gás;Manutenção preventiva;Desinstalação"],
  ["dedetizacao", "Dedetização", "pragas,detetizacao", "Dedetização residencial;Descupinização;Controle de baratas;Controle de formigas;Sanitização"],
  ["chaveiros", "Chaveiros", "chaveiro", "Abertura de porta;Cópia de chave;Troca de segredo;Instalação de fechadura"],
  ["marido-de-aluguel", "Marido de aluguel", "pequenos reparos,faz-tudo", "Instalação de prateleira;Troca de lâmpada;Pendurar quadro;Reparo de torneira;Montagem de móvel;Ajuste de porta"],
  ["montagem", "Montagem de móveis", "montador", "Montagem de guarda-roupa;Montagem de cama;Montagem de escritório;Desmontagem para mudança"],
  ["informatica", "Informática", "tecnico,formatacao", "Formatação de computador;Remoção de vírus;Montagem de PC;Configuração de rede;Suporte remoto"],
  ["celulares", "Conserto de celulares", "tela,assistencia", "Troca de tela;Troca de bateria;Conserto de conector;Película de proteção"],
  ["desenvolvimento", "Desenvolvimento de software", "programador,site,aplicativo", "Criação de site;Aplicativo sob medida;Manutenção de sistema;Loja virtual;Automação"],
  ["design", "Design", "logo,identidade", "Identidade visual;Arte para rede social;Design de embalagem;Apresentação comercial"],
  ["aulas", "Aulas particulares", "reforco,professor", "Aula de matemática;Aula de inglês;Aula de violão;Reforço escolar;Aula de informática"],
  ["idiomas", "Idiomas", "ingles,espanhol", "Aula de inglês;Aula de espanhol;Conversação;Tradução"],
  ["buffet", "Buffet", "festa,salgadinho", "Buffet de festa;Coffee break;Bolo decorado;Salgados;Churrasco em domicílio"],
  ["confeitaria", "Confeitaria", "bolo,doce", "Bolo de aniversário;Doces finos;Cupcakes;Naked cake;Bolo de casamento"],
  ["cozinha", "Cozinheiros", "chef,marmita", "Chef em domicílio;Marmitas congeladas;Jantar para eventos;Aula de culinária"],
  ["eventos", "Eventos", "decoracao,cerimonial", "Decoração de festa;Cerimonial;Organização de aniversário;Decoração de casamento"],
  ["dj", "DJs", "dj,som", "DJ para festa;DJ para casamento;Som e iluminação;Karaokê"],
  ["musicos", "Músicos", "banda,violao", "Violonista para evento;Banda para festa;Cantor;Música ao vivo"],
  ["animacao", "Animação de festas", "recreacao,palhaco", "Recreação infantil;Personagem vivo;Oficina infantil;Mágico"],
  ["pets", "Banho e tosa", "pet,cachorro", "Banho;Tosa;Banho e tosa;Táxi dog;Passeio com cão"],
  ["adestramento", "Adestramento", "adestrador", "Adestramento básico;Correção de comportamento;Aula de socialização"],
  ["veterinarios", "Veterinários", "vet,consulta", "Consulta veterinária;Vacinação;Consulta em domicílio"],
  ["cuidadores", "Cuidadores", "babá,cuidador", "Babá;Cuidador de idosos;Acompanhante hospitalar;Babá eventual"],
  ["saude", "Saúde domiciliar", "enfermeiro,fisioterapia", "Aplicação de injeção;Curativo;Fisioterapia domiciliar;Coleta de exame"],
  ["nutricao", "Nutrição", "nutricionista", "Consulta nutricional;Plano alimentar;Acompanhamento mensal"],
  ["psicologia", "Psicologia", "psicologo,terapia", "Sessão de terapia;Terapia online;Orientação profissional"],
  ["advocacia", "Advocacia", "advogado", "Consulta jurídica;Elaboração de contrato;Assessoria trabalhista"],
  ["contabilidade", "Contabilidade", "contador,mei", "Abertura de MEI;Declaração de imposto;Contabilidade mensal;Regularização de CPF"],
  ["consultoria", "Consultoria", "consultor", "Consultoria de negócios;Consultoria de marketing;Mentoria;Planejamento financeiro"],
  ["marketing", "Marketing", "trafego,social", "Gestão de redes sociais;Tráfego pago;Criação de conteúdo;SEO"],
  ["redacao", "Redação e tradução", "tradutor,revisor", "Tradução;Revisão de texto;Legendagem;Copywriting"],
  ["costura", "Costura", "ajuste,alfaiate", "Ajuste de roupa;Barra de calça;Conserto de zíper;Costura sob medida"],
  ["sapateiros", "Sapateiros", "sapato", "Conserto de sapato;Troca de sola;Tintura de couro"],
  ["vidracaria", "Vidraçaria", "vidro,box", "Troca de vidro;Box de banheiro;Espelho sob medida;Vidro temperado"],
  ["gesso", "Gesso", "drywall,sanca", "Forro de gesso;Sanca;Drywall;Reparo de trinca"],
  ["impermeabilizacao", "Impermeabilização", "infiltracao,laje", "Impermeabilização de laje;Tratamento de infiltração;Vedação de calha"],
  ["telhados", "Telhados", "telhadista,goteira", "Reparo de telhado;Troca de telha;Calha;Limpeza de calha"],
  ["energia-solar", "Energia solar", "painel solar", "Orçamento de energia solar;Instalação de painel;Manutenção de inversor"],
  ["seguranca", "Segurança eletrônica", "camera,alarme", "Instalação de câmera;Cerca elétrica;Alarme;Portão eletrônico"],
  ["mudanca-plantas", "Paisagismo", "paisagista", "Projeto de jardim;Implantação de paisagismo;Manutenção mensal"],
  ["piscinas", "Piscinas", "piscineiro", "Limpeza de piscina;Tratamento químico;Manutenção de filtro;Reparo de vazamento"],
  ["ar-automotivo", "Ar automotivo", "higienizacao ar", "Higienização do ar;Recarga de gás automotivo;Reparo do compressor"],
  ["funilaria", "Funilaria e pintura", "funileiro", "Funilaria;Pintura automotiva;Polimento técnico;Reparo de amassado"],
  ["guincho", "Guincho", "reboque", "Guincho leve;Guincho para moto;Socorro 24 horas"],
  ["motoristas", "Motoristas", "motorista particular", "Motorista particular;Traslado aeroporto;Motorista por diária"],
  ["entregas", "Entregas", "motoboy,delivery", "Motoboy;Entrega de documento;Entrega de encomenda"],
  ["aulas-musica", "Aulas de música", "aula de violao", "Aula de violão;Aula de teclado;Aula de canto;Aula de bateria"],
  ["fotografia-produto", "Fotografia de produtos", "foto still", "Foto still;Foto com modelo;Edição de catálogo"],
  ["social-media", "Social media", "instagram", "Pacote mensal de posts;Stories;Captação de fotos do negócio"],
  ["limpeza-pos-obra", "Limpeza pós-obra", "pos obra", "Limpeza grossa;Limpeza fina;Remoção de restos;Limpeza de vidros"],
  ["controle-pragas-jardim", "Controle de pragas de jardim", "formiga,cupim", "Controle de formigas;Controle de cupins de jardim;Pulverização"],
  ["instalacao-tv", "Instalação de TV e internet", "antena,roteador", "Instalação de TV;Configuração de roteador;Ponto de internet;Suporte de televisão"],
  ["assistencia-eletro", "Assistência de eletrodomésticos", "geladeira,maquina", "Conserto de geladeira;Conserto de máquina de lavar;Conserto de micro-ondas;Conserto de fogão"],
  ["enfermagem-domicilio", "Enfermagem ao Domicílio", "enfermeiro,home care,plantao,curativo", "Visita de enfermagem|Atendimento de enfermagem na casa do paciente.;Curativo domiciliar;Medicação domiciliar;Plantão de enfermagem;Cuidados pós-operatórios;Troca de curativo"],
];

function parseNames(raw: string | undefined) {
  if (!raw) return [];
  return raw.split(";").map((part) => {
    const [name, description, image] = part.split("|");
    return { name: name!.trim(), description: description?.trim() || "", image: image?.trim() || null };
  });
}

function build(kind: CatalogKind, rows: Row[]) {
  const categories: CatalogCategory[] = [];
  const templates: CatalogTemplate[] = [];
  for (const [id, name, aliasText, names, restricted] of rows) {
    categories.push({
      id,
      kind,
      name,
      aliases: (aliasText ?? "").split(",").map((alias) => alias.trim()).filter(Boolean),
      image: null,
      restricted: Boolean(restricted),
    });
    for (const item of parseNames(names)) {
      const templateId = slug(`${id}-${item.name}`);
      templates.push({
        id: templateId,
        categoryId: id,
        name: item.name,
        description: item.description || `${item.name}. Ajuste o preço, a disponibilidade e use a foto do que você realmente oferece.`,
        aliases: [],
        image: item.image,
      });
    }
  }
  return { categories, templates };
}

const products = build("product", [...productRows, ...extraProducts]);
const services = build("service", [...serviceRows, ...extraServices]);

export const catalogCategories = [...products.categories, ...services.categories];
export const catalogTemplates = [...products.templates, ...services.templates];

const categoryImages: Record<string, string> = {
  concreto: "/img/eq/betoneira.webp",
  andaimes: "/img/eq/andaime.webp",
  ferramentas: "/img/eq/furadeira.webp",
  energia: "/img/eq/gerador.webp",
  compactacao: "/img/eq/compactador.webp",
  escavacao: "/img/eq/escavadeira.webp",
  elevacao: "/img/eq/plataforma.webp",
  limpeza: "/img/eq/lavadora.webp",
  "equipamentos-hospitalares": "/img/eq/hospitalar.webp",
  "enfermagem-domicilio": "/img/eq/enfermagem.webp",
};

for (const category of catalogCategories) {
  if (categoryImages[category.id]) category.image = categoryImages[category.id];
}
