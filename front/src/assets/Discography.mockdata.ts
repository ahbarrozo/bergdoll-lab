import type { Album } from "../types/Album.types";

export const albums: Album[] = [
    {
        id: 1,
        date: "2024-01-01",
        description: "Album vencedor do Grammy de melhor samba de escritório de 2024.",
        image: "/images/IMG-20241228-WA0011.jpg",
        title: "Eu e o meu violino" 
    },
    {
        id: 2,
        date: "2025-12-25",
        description: `Uma descrição um pouco mais longa de um novo álbum previsto para
                      o fim de 2025, com convidados especiais`,
        image: "/images/IMG-20241228-WA0012.jpg",
        title: "Chora, rabeca"
    },
    // Add more albums as needed
];
