export const APP_NAME = "The MC Hub";

export const mockUsers = [
  {
    id: 1,
    name: "Trieu Vy",
    role: "Professional MC",
    specialty: "Wedding, Corporate Events",
    rating: 4.9,
    reviews: 120,
    price: "2,000,000 VND / hr",
    image: "https://res.cloudinary.com/dvwt6npcl/image/upload/v1773310648/mc_hub_mock/rkkcvu0gydd7atnahwn3.png",
    verified: true,
  },
  {
    id: 2,
    name: "Quoc Anh",
    role: "Entertainment MC",
    specialty: "Gala Dinners, Product Launches",
    rating: 4.8,
    reviews: 85,
    price: "1,500,000 VND / hr",
    image: "https://res.cloudinary.com/dvwt6npcl/image/upload/v1773310649/mc_hub_mock/omk7j0jqolc4q2dknh9q.png",
    verified: true,
  },
  {
    id: 3,
    name: "Minh Thu",
    role: "Cultural MC",
    specialty: "Festivals, Community Events",
    rating: 4.7,
    reviews: 54,
    price: "1,200,000 VND / hr",
    image: "https://res.cloudinary.com/dvwt6npcl/image/upload/v1773310650/mc_hub_mock/v653l3chkevvsvt4yibk.png",
    verified: false,
  }
];

export const scriptCategories = [
  "Wedding", "Corporate", "Gala Dinner", "Product Launch", "Grand Opening", "Anniversary"
];

export const mockScripts = [
  {
    id: 101,
    title: "Luxury Wedding Script - Classic Romance",
    category: "Wedding",
    author: "MCHub Team",
    downloads: 1420,
    rating: 4.9,
    content: `
      ## Scene 1 - Grand Entrance
      
      *Ambient music fades*
      
      "Ladies and gentlemen, distinguished guests. Welcome to this magical evening as we celebrate the union of [Groom] and [Bride]..."
    `
  },
  {
    id: 102,
    title: "Corporate Year-End Gala",
    category: "Corporate",
    author: "ProMC Academy",
    downloads: 850,
    rating: 4.8,
    content: "..."
  }
];
