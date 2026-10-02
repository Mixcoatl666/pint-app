import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const prisma = new PrismaClient()
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const uploadsDir = path.join(root, 'uploads')

// --- Generador determinista para que la siembra sea siempre igual ---
let seed = 42
function rand() {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}

const palettes = [
  ['#ff6b6b', '#feca57'],
  ['#5f27cd', '#48dbfb'],
  ['#01a3a4', '#f368e0'],
  ['#ff9f43', '#ee5253'],
  ['#10ac84', '#1dd1a1'],
  ['#341f97', '#5f27cd'],
  ['#ff6b81', '#c44569'],
  ['#3dc48d', '#6ab04c'],
  ['#22a6b3', '#7ed6df'],
  ['#e056fd', '#7158e2'],
  ['#f0932b', '#ffbe76'],
  ['#eb4d4b', '#ff7979'],
]

const ratios = [
  [800, 1200], // 2:3
  [900, 1200], // 3:4
  [1000, 1000], // 1:1
  [800, 1000], // 4:5
  [1200, 800], // 3:2
  [720, 1280], // 9:16
  [1000, 750], // 4:3
]

const titles = [
  ['Rincón de lectura junto a la ventana', 'Una estantería baja, mantas de lana y luz natural para tardar en libros.'],
  ['Cena rápida de pasta al limón', 'Listo en 15 minutos con ingredientes que ya tienes en casa.'],
  ['Terraza urbana con luces cálidas', 'Macetas de cerámica, un banco de madera y guirnaldas LED.'],
  ['Paleta de otoño para el salón', 'Tonos tierra y textiles viscose que abrigan sin saturar.'],
  ['Ruta de senderismo al amanecer', 'Cinco miradores con vistas al valle; calzado con buen agarre.'],
  ['Escritorio minimalista en casa', 'Orden, planta pequeña y una lámpara que no ocupa espacio.'],
  ['Café de especialidad en casa', 'Molienda media, 92 °C y 30 s de extracción perfecta.'],
  ['Bouquet silvestre en jarrón de vidrio', 'Flores del mercado combinadas por altura y textura.'],
  ['Receta de pan de plátano', 'Húmedo, dulce sin azúcar añadido y con nueces tostadas.'],
  ['Guardarropa cápsula de 15 piezas', 'Combinaciones infinitas con pocas prendas de calidad.'],
  ['Baño tipo spa con piedra volcánica', 'Ducha lluvia, aromaterapia y toallas de algodón egipcio.'],
  ['Bicicleta por la ciudad al atardecer', 'Ruta segura por el carril bici del paseo marítimo.'],
  ['Huerto en el balcón', 'Hierbas aromáticas en macetas etiquetadas y riego por goteo.'],
  ['Mesa de desayuno de domingo', 'Croissants caseros, fruta fresca y jugo de naranja.'],
  ['Estilo escandinavo en el dormitorio', 'Cabecero de madera clara y ropa de cama en lino.'],
  ['Postre de chocolate sin horno', 'Capas de galleta, cacao y crema ligera; nevera 4 horas.'],
  ['Kayak por aguas turquesas', 'Alquiler de media jornada incluye chaleco y pala.'],
  ['Rincón de trabajo con luz natural', 'Monitor a la altura de los ojos y planta purificadora.'],
  ['Anillos de inspiración minimalista', 'Oro mate y piedras pequeñas para uso diario.'],
  ['Silla de mimbre restaurada', 'Pintura al agua y asiento nuevo con cuerda de yute.'],
  ['Sushi casero paso a paso', 'Arroz sazonado, cuchillo afilado y paciencia con el rollo.'],
  ['Meditación matinal de 10 minutos', 'Respiración 4-7-8 y espacio libre de notificaciones.'],
  ['Farolillos de papel para el jardín', 'Ideas económicas para iluminar la cena de verano.'],
  ['Zapatillas para correr en asfalto', 'Amortiguación media y transición adecuada para zancada.'],
  ['Biblioteca de caja alta', 'Escalera de librero y cajas etiquetadas por temporada.'],
  ['Guiso de lentejas con verduras', 'Olla única, mucho sabor y proteína vegetal generosa.'],
  ['Estudio de fotografía con luz de sombra', 'Contraluz duro y fondos de papel gris medio.'],
  ['Mochila de viaje de fin de semana', 'Todo en una sola maleta de cabina, sin equipaje facturado.'],
  ['Cuadro abstracto en acuarela', 'Degradados suaves y bordes difuminados en papel de algodón.'],
  ['Tarta de manzana en espiral', 'Masa fina, canela y láminas de manzana ordenadas a mano.'],
  ['Patio andaluz con fuente de azulejos', 'Buganvillas, sombra de celosía y sonido de agua.'],
  ['Punto de cruz para principiantes', 'Seis puntadas básicas con las que empieza todo proyecto.'],
  ['Peluquería con reflejos cobrizos', 'Balayage natural que crece sin línea marcada.'],
  ['Cine en casa con proyector', 'Pantalla retráctil, sonido envolvente y luces a ras de suelo.'],
  ['Olas grandes para surf principiante', 'Tabla de 9 pies y lección en la rompiente interior.'],
  ['Jardín de piedras japonés', 'Grava raked, musgo y tres rocas colocadas en triángulo.'],
  ['Abrigo de lana tejido a dos agujas', 'Punto musgo con canesú disminuido; guía por tallas.'],
  ['Mesa de Nochebuena con velas', 'Mantel de lino crudo, vajilla blanca y centrobajo bajo.'],
  ['Ciudad nocturna desde el mirador', 'Exposición larga para estelas de coches y luces LED.'],
  ['Yoga restaurativo con bloques', 'Posturas sostenidas 3 minutos para soltar la espalda.'],
]

function makeSvg(w, h, index) {
  const [c1, c2] = palettes[index % palettes.length]
  const shapes = []
  const count = 3 + Math.floor(rand() * 4)
  for (let i = 0; i < count; i++) {
    const cx = Math.floor(rand() * w)
    const cy = Math.floor(rand() * h)
    const r = Math.floor(60 + rand() * Math.min(w, h) * 0.35)
    const opacity = (0.08 + rand() * 0.2).toFixed(2)
    const fill = rand() > 0.5 ? '#ffffff' : '#000000'
    if (rand() > 0.4) {
      shapes.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${opacity}"/>`)
    } else {
      const rw = Math.floor(r * 1.6)
      const rh = Math.floor(r)
      shapes.push(
        `<rect x="${cx}" y="${cy}" width="${rw}" height="${rh}" rx="${Math.floor(rh / 3)}" fill="${fill}" opacity="${opacity}" transform="rotate(${Math.floor(rand() * 60 - 30)} ${cx} ${cy})"/>`
      )
    }
  }
  const angle = Math.floor(rand() * 180)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  ${shapes.join('\n  ')}
</svg>`
}

async function main() {
  await mkdir(uploadsDir, { recursive: true })

  console.log('Limpiando datos previos…')
  await prisma.comment.deleteMany()
  await prisma.save.deleteMany()
  await prisma.board.deleteMany()
  await prisma.pin.deleteMany()
  await prisma.user.deleteMany()

  console.log('Creando usuarios…')
  const passwordHash = await bcrypt.hash('password123', 10)
  const demo = await prisma.user.create({
    data: { name: 'Noah', email: 'demo@pint.app', passwordHash },
  })
  const ana = await prisma.user.create({
    data: { name: 'Ana', email: 'ana@pint.app', passwordHash },
  })
  const luis = await prisma.user.create({
    data: { name: 'Luis', email: 'luis@pint.app', passwordHash },
  })

  console.log('Creando imágenes y pines…')
  const pins = []
  for (let i = 0; i < titles.length; i++) {
    const [title, description] = titles[i]
    const [w, h] = ratios[i % ratios.length]
    const filename = `seed-${String(i + 1).padStart(2, '0')}.svg`
    await writeFile(path.join(uploadsDir, filename), makeSvg(w, h, i), 'utf8')

    const owner = [demo, ana, luis][i % 3]
    // Fechas decrecientes para que el orden del feed sea estable
    const createdAt = new Date(Date.now() - i * 3600 * 1000)
    const pin = await prisma.pin.create({
      data: {
        title,
        description,
        imageUrl: `/uploads/${filename}`,
        width: w,
        height: h,
        ownerId: owner.id,
        createdAt,
      },
    })
    pins.push(pin)
  }

  console.log('Creando tableros y guardados…')
  const boards = [
    await prisma.board.create({ data: { name: 'Ideas para casa', ownerId: demo.id } }),
    await prisma.board.create({ data: { name: 'Recetas', ownerId: demo.id } }),
    await prisma.board.create({ data: { name: 'Viajes', ownerId: ana.id } }),
  ]

  const saves = [
    [pins[0], boards[0]],
    [pins[2], boards[0]],
    [pins[6], boards[0]],
    [pins[8], boards[1]],
    [pins[20], boards[1]],
    [pins[25], boards[1]],
    [pins[6], boards[2]],
    [pins[16], boards[2]],
    [pins[27], boards[2]],
  ]
  for (const [pin, board] of saves) {
    await prisma.save.create({
      data: { pinId: pin.id, boardId: board.id, userId: board.ownerId },
    })
  }

  console.log('Creando comentarios…')
  const target = pins[0]
  const root1 = await prisma.comment.create({
    data: {
      content: 'Me encanta este rincón, ¿de dónde es la estantería?',
      pinId: target.id,
      authorId: ana.id,
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
    },
  })
  await prisma.comment.create({
    data: {
      content: 'Es una estantería de madera recuperada, la encontré en un rastro.',
      pinId: target.id,
      authorId: demo.id,
      parentId: root1.id,
      createdAt: new Date(Date.now() - 4 * 60 * 1000),
    },
  })
  await prisma.comment.create({
    data: {
      content: 'Las mantas son de lana merino, súper abrigadoras.',
      pinId: target.id,
      authorId: demo.id,
      parentId: root1.id,
      createdAt: new Date(Date.now() - 3 * 60 * 1000),
    },
  })
  await prisma.comment.create({
    data: {
      content: 'La luz de esa ventana es perfecta para leer.',
      pinId: target.id,
      authorId: luis.id,
      createdAt: new Date(Date.now() - 2 * 60 * 1000),
    },
  })
  await prisma.comment.create({
    data: {
      content: '¿Pronto compartes la receta de la pasta?',
      pinId: pins[8].id,
      authorId: ana.id,
      createdAt: new Date(Date.now() - 60 * 1000),
    },
  })

  const counts = {
    users: await prisma.user.count(),
    pins: await prisma.pin.count(),
    boards: await prisma.board.count(),
    saves: await prisma.save.count(),
    comments: await prisma.comment.count(),
  }
  console.log('Siembra completada:', counts)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
