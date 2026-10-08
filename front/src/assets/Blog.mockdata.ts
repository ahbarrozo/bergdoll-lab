import { type BlogPostProps } from "../types/BlogPost.types";

export const blogPosts: BlogPostProps[] = [
    {
        id: 0,
        date: '2025-01-02T14:00:00.000Z',
        title: "Minha postagem mais recente",
        subtitle: "Um teste com várias fotos",
        text: `Este teste traz múltiplas fotos, e o objetivo é testar como functiona o modo carrossel. 
Um texto um pouco mais longo pra ver como a nova janela se comporta: <br>

<p>Nonada. Tiros que o senhor ouviu foram de briga de homem não, Deus esteja. Alvejei mira 
em árvore, no quintal, no baixo do córrego. Por meu acerto. Todo dia isso faço, gosto; 
desde mal em minha mocidade. Daí, vieram me chamar. Causa dum bezerro: um bezerro branco, 
erroso, os olhos de nem ser se viu; e com máscara de cachorro. Me disseram; eu não quis 
avistar. Mesmo que, por defeito como nasceu, arrebitado de beiços, essa figurava rindo 
feito pessoa. Cara de gente, carão de cão: determinaram era o demo. Povo prascóvio. 
Mataram. Dono dele nem sei quem for. Vieram emprestar minhas armas, cedi. Não tenho abusões. 
O senhor ri certas risadas... Olhe: quando é tiro de verdade, primeiro a cachorrada pega a 
latir, instantaneamente depois, então, se vai ver se deu mortos. O senhor tolere, isto é o 
sertão. Uns querem que não seja: que situado sertão é por os campos-gerais a fora a dentro, 
eles dizem, fim de rumo, terras altas, demais do Urucaia. Toleima. Para os de Corinto e do 
Curvelo, então o aqui não é dito sertão? Ah, que tem maior! Lugar sertão se divulga: é onde 
os pastos carecem de fechos; onde um pode torar dez, quinze léguas, sem topar com casa de 
morador; e onde criminoso vive seu cristo-jesus, arredado do arrocho de autoridade. O 
Urucuia vem dos montões oestes. Mas, hoje, que na beira dele, tudo dá fazendões de fazendas, 
almargem de vargens de bom render, as vazantes; culturas que vão de mata em mata, madeiras 
de grossura, até ainda virgens dessas lá há. O gerais corre em volta. Esses gerais são sem 
tamanho. Enfim, cada um o que quer aprova, o senhor sabe: pão ou pães, é questão de 
opiniães... O sertão está em toda a parte. </p>

<p>Do demo? Na gloso. Senhor pergunte aos moradores. Em falso receio, desfalam no nome dele 
dizem só: o Que-Diga. Vôte! não... Quem muito se evita, se convive. Sentença num Aristides 
o que existe no buritizal primeiro desta minha mão direita, chamado a Vereda-da-Vaca-Mansa-de-Santa-Rita 
todo mundo crê: ele não pode passar em três lugares, designados: porque então a gente escuta 
um chorinho, atrás, e uma vozinha que avisando: "Eu já vou! Eu já vou!..." que é o capiroto, 
o que-diga... E um Jisé Simpilício quem qualquer daqui jura ele tem um capeta em casa, miúdo, 
satanazim, preso obrigado a ajudar em toda ganância que executa; razão que o Simpilício se 
empresa em vias de completar de rico. Apre, por isso dizem também que a besta pra ele rupeia, 
nega de banda, não deixando, quando ele quer amontar... Superstição. Jisé Simpilício e Aristides, 
mesmo estão se engordando, de assim não-ouvir ou ouvir. Ainda o senhor estude: agora mesmo, nestes 
dias de época, tem gente porfalando que o Diabo próprio parou, de passagem, no Andrequicé. Um Moço 
de fora, teria aparecido, e lá se louvou que para aqui vir normal, a cavalo, dum dia-e-meio ele era 
capaz que só uns vinte minutos bastava... porque costeava o Rio do Chico pelas cabeceiras! Ou, 
também, quem sabe sem ofensas não terá sido, por um exemplo, até mesmo o senhor quem se anunciou 
assim, quando passou por lá, por prazido divertimento engraçado? Há-de, não me dê crime, sei que 
não foi. E mal eu não quis. Só que uma pergunta, em hora, às vezes, clareia razão de paz. Mas, o 
senhor entenda: o tal moço, se há, quis mangar. Pois, hem, que, despontar o Rio pelas nascentes, 
será a mesma coisa que um se redobrar nos internos deste nosso Estado nosso, custante viagem de 
uns três meses... Então? Que-Diga? Doideira. A fantasiação. E, o respeito de dar a ele assim esses 
nomes de rebuço, é que é mesmo um querer invocar que ele forme forma com as presenças! </p>`,
        images: [
            {
                title: "Thiago Brisolla 1",
                description: "Foto com uma legenda.",
                path: "/images/IMG-20241228-WA0012.jpg"
            },
            {
                title: "Thiago Brisolla, sem legenda",
                path: "/images/IMG-20241228-WA0018.jpg"
            }, 
            {
                description: 'Uma foto com legenda, mas sem título, para ver o que acontece',
                path: "/images/IMG-20241228-WA0019.jpg"
            },
            {
                path: "/images/IMG-20241228-WA0024.jpg"
            }
        ],
    },
    {
        id: 1,
        date: '2025-01-01T14:00:00.000Z',
        title: "Minha décima postagem",
        subtitle: "Testando o diário com uma foto",
        text: "Aqui vai um teste com um texto relativament simples para testar a interface com uma foto.",
        images: [
            { 
                title: "Thiago Brisolla",
                description: 'Uma legenda about a foto.',
                path: "/images/IMG-20241228-WA0011.jpg"
            }
        ],
    },
    {
        id: 2,
        date: '2025-01-01T13:00:00.000Z',
        title: "Minha nona postagem",
        subtitle: "Testando o diário com uma foto",
        text: "Aqui vai um teste com um texto relativament simples para testar a interface com uma foto.",
        images: [
            { 
                title: "Thiago Brisolla",
                description: 'Uma legenda about a foto.',
                path: "/images/IMG-20241228-WA0011.jpg"
            }
        ],
    },
   {
        id: 3,
        date: '2025-01-01T12:00:00.000Z',
        title: "Minha oitava postagem",
        subtitle: "Testando o diário com uma foto",
        text: "Aqui vai um teste com um texto relativament simples para testar a interface com uma foto.",
        images: [
            { 
                title: "Thiago Brisolla",
                description: 'Uma legenda about a foto.',
                path: "/images/IMG-20241228-WA0011.jpg"
            }
        ],
    },
    {
        id: 4,
        date: '2025-01-01T11:00:00.000Z',
        title: "Minha sétima postagem",
        subtitle: "Testando o diário com uma foto",
        text: "Aqui vai um teste com um texto relativament simples para testar a interface com uma foto.",
        images: [
            { 
                title: "Thiago Brisolla",
                description: 'Uma legenda about a foto.',
                path: "/images/IMG-20241228-WA0011.jpg"
            }
        ],
    },
    {
        id: 5,
        date: '2025-01-01T10:00:00.000Z',
        title: "Minha sexta postagem",
        subtitle: "Testando o diário com uma foto",
        text: "Aqui vai um teste com um texto relativament simples para testar a interface com uma foto.",
        images: [
            { 
                title: "Thiago Brisolla",
                description: 'Uma legenda about a foto.',
                path: "/images/IMG-20241228-WA0011.jpg"
            }
        ],
    },
    {
        id: 6,
        date: '2025-01-01T09:00:00.000Z',
        title: "Minha quinta postagem",
        subtitle: "Testando o diário com uma foto",
        text: "Aqui vai um teste com um texto relativament simples para testar a interface com uma foto.",
        images: [
            { 
                title: "Thiago Brisolla",
                description: 'Uma legenda about a foto.',
                path: "/images/IMG-20241228-WA0011.jpg"
            }
        ],
    },
    {
        id: 7,
        date: '2025-01-01T08:00:00.000Z',
        title: "Minha quarta postagem",
        subtitle: "Testando o diário com uma foto",
        text: "Aqui vai um teste com um texto relativament simples para testar a interface com uma foto.",
        images: [
            { 
                title: "Thiago Brisolla",
                description: 'Uma legenda about a foto.',
                path: "/images/IMG-20241228-WA0011.jpg"
            }
        ],
    },
    {
        id: 8,
        date: '2025-01-01T07:00:00.000Z',
        title: "Minha terceira postagem",
        subtitle: "Testando o diário com uma foto",
        text: "Aqui vai um teste com um texto relativament simples para testar a interface com uma foto.",
        images: [
            { 
                title: "Thiago Brisolla",
                description: 'Uma legenda about a foto.',
                path: "/images/IMG-20241228-WA0011.jpg"
            }
        ],
    },
    {
        id: 9,
        date: '2025-01-02T14:00:00.000Z',
        title: "Minha segundaa postagem",
        subtitle: "Testando o diário com uma foto",
        text: "Aqui vai um teste com um texto relativament simples para testar a interface com uma foto.",
        images: [
            { 
                title: "Thiago Brisolla",
                description: 'Uma legenda about a foto.',
                path: "/images/IMG-20241228-WA0011.jpg"
            }
        ],
    },
    {
        id: 10,
        date: '2024-01-01T11:00:00.000Z',
        title: "Minha primeira postagem",
        subtitle: "Testando o diário com uma foto",
        text: "Aqui vai um teste com um texto relativament simples para testar a interface com uma foto.",
        images: [
            { 
                title: "Thiago Brisolla",
                description: 'Uma legenda about a foto.',
                path: "/images/IMG-20241228-WA0011.jpg"
            }
        ],
    }
    // Add more posts as needed
];
