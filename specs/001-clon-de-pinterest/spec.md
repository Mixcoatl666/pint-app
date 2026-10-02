# Spec 001 — Clon de Pinterest (experiencia completa)

## Metadatos

- ID: `SPEC-001`
- Estado: `Aprobada`
- Propietario:
- Aprobada por: Noah (usuario)
- Fecha de aprobación: 2026-09-30
- Requerimientos fuente: Decisiones del usuario en la conversación del 2026-09-30 (alcance "núcleo completo", sin likes, con comentarios, límites de subida, tableros, búsqueda).
- Specs relacionadas:

## Contexto y objetivo

Pint-app debe ofrecer una experiencia equivalente a Pinterest: descubrir imágenes en un feed, subir las propias, organizarlas en tableros y una página dedicada por cada imagen. Sin autenticación no hay interacción (subir, guardar, comentar), y sin comentarios no hay ningún canal de interacción entre usuarios. Esta spec fija el contrato funcional completo de la primera versión para que la implementación no asuma comportamientos no acordados.

## Usuarios / actores

- **Visitante**: sin sesión. Ve el feed, páginas de pin, perfiles, tableros, busca y lee comentarios.
- **Usuario registrado**: todo lo del visitante más registrarse, iniciar/cerrar sesión, subir pines, guardar en tableros, comentar y responder, borrar sus comentarios.
- **Autor del pin**: rol derivado (creó el pin). Puede borrar su pin y cualquier comentario de su pin.

## Historias de usuario

- H1: Como visitante, quiero explorar un feed de imágenes en masonry para descubrir contenido sin registrarme.
- H2: Como visitante, quiero crear una cuenta para empezar a interactuar.
- H3: Como usuario, quiero subir imágenes con arrastrar y soltar para publicar un pin.
- H4: Como usuario, quiero guardar pines en tableros para organizar lo que me interesa.
- H5: Como usuario, quiero abrir una página dedicada por cada imagen con sus detalles y comentarios.
- H6: Como usuario, quiero comentar y responder para interactuar con otros usuarios.
- H7: Como usuario, quiero buscar pines por texto para encontrar contenido concreto.
- H8: Como autor de un pin, quiero moderar sus comentarios para eliminar contenido no deseado.

## Requisitos funcionales

### Registro y sesión

- RF-1: CUANDO un visitante envía el registro con nombre, email y contraseña válidos, EL SISTEMA crea la cuenta y establece una sesión iniciada.
- RF-2: SI la contraseña tiene menos de 8 caracteres o el email no tiene formato válido, ENTONCES EL SISTEMA muestra el error junto al campo y no crea la cuenta.
- RF-3: SI el email ya está registrado, ENTONCES EL SISTEMA muestra «Ese email ya está registrado» y no crea la cuenta.
- RF-4: CUANDO un usuario envía email y contraseña correctos, EL SISTEMA inicia su sesión y le devuelve al feed.
- RF-5: SI el email o la contraseña son incorrectos, ENTONCES EL SISTEMA muestra «Email o contraseña incorrectos» sin iniciar sesión.
- RF-6: EL SISTEMA mantiene la sesión mientras el usuario navega, recarga o vuelve a abrir el navegador dentro de su vigencia.
- RF-7: CUANDO un usuario autenticado pulsa «Cerrar sesión», EL SISTEMA termina la sesión y le devuelve al feed como visitante.
- RF-8: MIENTRAS no exista sesión, EL SISTEMA deniega `/create` y toda acción de escritura, redirigiendo al inicio de sesión.

### Subida de imágenes

- RF-9: CUANDO un usuario autenticado envía una imagen JPEG, PNG, WebP o GIF de hasta 10 MB con un título, EL SISTEMA publica el pin.
- RF-10: SI el archivo supera 10 MB, su formato no está permitido, está vacío o no es una imagen legible, ENTONCES EL SISTEMA muestra un error y no publica el pin.
- RF-11: CUANDO un usuario autenticado arrastra un archivo válido sobre el área de subida, EL SISTEMA lo acepta igual que con el selector de archivos.
- RF-12: EL SISTEMA muestra vista previa de la imagen elegida antes de enviar el formulario.
- RF-13: CUANDO la publicación se completa, EL SISTEMA lleva al usuario a la página del pin recién creado.
- RF-14: EL SISTEMA conserva la proporción original de la imagen en feed, página del pin y perfil, sin deformarla.

### Feed

- RF-15: EL SISTEMA muestra un feed público en masonry con los pines ordenados del más reciente al más antiguo.
- RF-16: CUANDO el visitante llega al final del feed, EL SISTEMA carga el siguiente lote de 20 pines; sin pines restantes deja de solicitar.
- RF-17: SI no existe ningún pin, ENTONCES EL SISTEMA muestra «Aún no hay pines».

### Página dedicada por imagen

- RF-18: EL SISTEMA muestra cada pin en `/pin/[id]` con imagen completa, título, descripción, autor, fecha, hilo de comentarios y otros pines del mismo autor.
- RF-19: CUANDO el visitante pulsa un pin en el feed, EL SISTEMA navega a su página dedicada.
- RF-20: SI `/pin/[id]` no corresponde a un pin existente, ENTONCES EL SISTEMA responde 404.

### Guardar en tableros

- RF-21: EL SISTEMA permite a un usuario autenticado crear un tablero con un nombre.
- RF-22: SI un usuario intenta guardar sin sesión, ENTONCES EL SISTEMA redirige al inicio de sesión sin registrar el guardado.
- RF-23: CUANDO un usuario autenticado guarda un pin en un tablero, EL SISTEMA registra la asociación y el pin queda visible en ese tablero.
- RF-24: SI un usuario guarda el mismo pin dos veces en el mismo tablero, ENTONCES EL SISTEMA no crea duplicado y lo indica como ya guardado.
- RF-25: EL SISTEMA permite guardar el mismo pin en tableros distintos.
- RF-26: CUANDO el diálogo de guardado no tiene tableros, EL SISTEMA ofrece crear uno en ese mismo diálogo.
- RF-27: CUANDO un usuario autenticado elimina un pin propio, EL SISTEMA lo retira del feed, del perfil y de todos los tableros, y elimina sus comentarios.

### Perfil y tableros

- RF-28: EL SISTEMA muestra un perfil con avatar, nombre, pines y tableros del usuario.
- RF-29: CUANDO se abre un tablero, EL SISTEMA muestra su nombre y sus pines del más reciente al más antiguo.
- RF-30: SI la URL de perfil o tablero no corresponde a un existente, ENTONCES EL SISTEMA responde 404.

### Búsqueda

- RF-31: CUANDO un visitante envía texto en el buscador, EL SISTEMA muestra los pines cuyo título o descripción contiene el texto, sin distinguir mayúsculas.
- RF-32: SI ningún pin coincide, ENTONCES EL SISTEMA muestra «Sin resultados para esa búsqueda».

### Comentarios

- RF-33: MIENTRAS no haya sesión, EL SISTEMA muestra el hilo en solo lectura con enlace a iniciar sesión.
- RF-34: CUANDO un usuario autenticado envía un comentario de 1–500 caracteres, EL SISTEMA lo publica en el hilo.
- RF-35: SI el comentario está vacío o supera 500 caracteres, ENTONCES EL SISTEMA muestra un error y no lo publica.
- RF-36: CUANDO un usuario autenticado responde a un comentario raíz, EL SISTEMA publica la respuesta dentro de ese hilo.
- RF-37: CUANDO un usuario responde a una respuesta, EL SISTEMA asocia la nueva respuesta al comentario raíz: profundidad máxima de dos niveles.
- RF-38: EL SISTEMA presenta las raíces de más antigua a más reciente, con cada respuesta inmediatamente después de su raíz.
- RF-39: CUANDO el autor del comentario o el autor del pin pulsa «Eliminar», EL SISTEMA borra el comentario de inmediato.
- RF-40: SI un usuario sin relación con el comentario intenta eliminarlo por acción directa, ENTONCES EL SISTEMA rechaza la operación y el comentario permanece.
- RF-41: CUANDO se elimina una raíz, EL SISTEMA elimina también todas sus respuestas.

## Requisitos no funcionales

- RNF-1: El sistema presenta toda la interfaz, los estados vacíos y los mensajes de error en español.
- RNF-2: El sistema se muestra sin solapamientos ni texto cortado en anchos de 320 px a 1440 px.
- RNF-3: El sistema almacena las contraseñas en forma no reversible; ninguna contraseña se guarda ni se registra en texto plano.
- RNF-4: El sistema valida en el servidor todos los datos enviados desde el cliente, de modo que un cliente manipulado no pueda crear pines, comentarios o sesiones que violen los límites de esta spec.
- RNF-5: El sistema carga el feed de 20 en 20 y difiere la carga de las imágenes fuera de pantalla, de modo que el primer lote se pinta sin esperar a todos los pines siguientes.
- RNF-6: El sistema asocia en el formulario cada mensaje de error al campo que lo origina y etiqueta todos los campos de entrada.

## Casos límite

- **Email con mayúsculas distintas**: `Ana@x.com` y `ana@x.com` se tratan como la misma cuenta (RF-3 aplica).
- **Archivo de 0 bytes o dañado**: rechazado con el mensaje de formato no válido (RF-10).
- **Mismo archivo subido dos veces**: crea dos pines independientes; no se deduplican imágenes.
- **Doble clic en «Guardar»**: solo se registra un guardado (RF-24).
- **Pin eliminado mientras un usuario lo tiene abierto**: al enviar comentario o guardado, el sistema rechaza la operación con un mensaje y actualiza la vista sin el pin.
- **Sesión expirada al enviar un formulario**: el sistema redirige al inicio de sesión sin ejecutar la acción.
- **Búsqueda de un solo carácter o con solo espacios**: los espacios se ignoran en los extremos; un término no vacío busca por coincidencia de subcadena.
- **Tablero con el mismo nombre que otro del mismo usuario**: se permite; la identidad del tablero es su ID.
- **Dos usuarios guardando o comentando a la vez**: ambas operaciones quedan registradas.
- **Respuestas simultáneas en el mismo hilo**: se muestran ordenadas por fecha de publicación dentro de la raíz.

## Fuera de alcance

- Likes, favoritos o cualquier forma de «me gusta».
- Seguir usuarios y feed de seguidores.
- Notificaciones de ningún tipo.
- Edición de perfil (nombre, avatar, biografía); el avatar se muestra con iniciales del nombre.
- Inicio de sesión con proveedores sociales (OAuth).
- Edición de pines ya publicados (sí se permite eliminarlos, RF-27).
- Roles de administrador, panel de moderación y denuncias de contenido.
- Ordenación por relevancia, recomendaciones o filtros por categoría.
- Multiidioma, aplicación móvil y funcionamiento offline.
- Estadísticas de pines o de perfil.

## Criterios de finalización

1. Registro con datos válidos inicia sesión; registro con contraseña de 7 caracteres o email duplicado muestra el error y no crea la cuenta.
2. Login con credenciales incorrectas muestra «Email o contraseña incorrectos»; la sesión sobrevive a una recarga de página y desaparece al cerrar sesión.
3. Sin sesión, acceder a `/create` redirige al inicio de sesión.
4. Publicar con drag & drop una imagen válida redirige a `/pin/[id]` y el pin aparece en el feed y en el perfil; una imagen de 11 MB o un archivo `.txt` se rechaza con mensaje.
5. El feed muestra pines en masonry ordenados a la inversa de su fecha y, con más de 40 pines, carga lotes de 20 hasta agotarlos sin repetir pines.
6. `/pin/[id]` con un ID inexistente devuelve 404; con un ID válido muestra imagen, autor, fecha, comentarios y pines relacionados del autor.
7. Guardar un pin en un tablero lo hace visible en su página; repetir el guardado en el mismo tablero no duplica; guardar en dos tableros distintos sí registra ambos.
8. Un usuario autenticado publica un comentario de 1–500 caracteres; vacío o de 501 caracteres se rechaza; sin sesión el hilo aparece en solo lectura.
9. Responder a una raíz crea la respuesta bajo ella; responder a una respuesta queda anclada a la raíz; ningún hilo supera dos niveles.
10. El autor de un comentario y el autor del pin pueden borrarlo (y la raíz borrada arrastra sus respuestas); cualquier otro usuario no consigue borrarlo.
11. Búsqueda de un título parcial devuelve los pines coincidentes ignorando mayúsculas; término sin coincidencias muestra el estado vacío.
12. Un pin eliminado desaparece de feed, perfil, tableros y sus comentarios dejan de existir.

## Dudas abiertas

- — (decisiones materiales resueltas con el usuario el 2026-09-30)

## Historial

| Fecha | Cambio | Responsable |
|---|---|---|
| 2026-09-30 | Creación del borrador a partir de los requerimientos acordados | — |
| 2026-09-30 | Aprobación humana explícita: pasa a `Aprobada` | Noah (usuario) |
