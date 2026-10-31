import type { CardDef, CardKind, Level } from "./types";

/**
 * Tokens disponibles en los textos:
 *  {p1} {p2} {p3}  jugadores al azar (distintos entre sí)
 *  {castigo}       lo que debe hacer quien pierde/incumple
 *                  (con alcohol: "toma 2 tragos"; sin alcohol: una penitencia)
 *  {reparte}       (con alcohol: "reparte 3 tragos"; sin alcohol: manda una penitencia)
 *  {letra}         una letra al azar
 */
const c =
  (kind: CardKind) =>
  (level: Level, text: string, duration?: number): CardDef => ({
    kind,
    level,
    text,
    ...(duration ? { duration } : {}),
    source: "fijo",
  });

const reto = c("reto");
const quien = c("quien");
const nunca = c("nunca");
const duelo = c("duelo");
const todos = c("todos");
const mini = c("minijuego");
const virus = c("virus");

export const CARDS: CardDef[] = [
  // ───────────── RETOS ─────────────
  reto(1, "{p1}, imita a otro jugador hasta que alguien adivine quién es. Si nadie acierta, {castigo}."),
  reto(1, "{p1}, di tres cosas que admiras de {p2}. Si no puedes, {castigo}."),
  reto(1, "{p1}, cuenta un chiste. Si nadie se ríe, {castigo}."),
  reto(1, "{p1}, habla con acento de otro país hasta tu próximo turno. Si se te olvida, {castigo}."),
  reto(1, "{p1}, canta el coro de la última canción que escuchaste. Si te niegas, {castigo}."),
  reto(1, "{p1}, enseña la última foto de tu galería. Si no quieres, {castigo}."),
  reto(1, "{p1}, baila 10 segundos como si nadie te viera. Si no lo haces, {castigo}."),
  reto(1, "{p1}, di un trabalenguas sin equivocarte. Si fallas, {castigo}."),
  reto(1, "{p1}, nombra 5 marcas de gaseosa en 10 segundos. Si no llegas, {castigo}."),
  reto(1, "{p1}, deja que {p2} te peine como quiera. Si te niegas, {castigo}."),
  reto(1, "{p1}, habla solo con preguntas hasta tu próximo turno. Si afirmas algo, {castigo}."),
  reto(1, "{p1}, di el nombre completo de todos los presentes. Si fallas con alguien, {castigo}."),
  reto(2, "{p1}, lee en voz alta tu último mensaje enviado. Si te niegas, {castigo}."),
  reto(2, "{p1}, cuéntanos tu mayor vergüenza en una cita. Si no lo cuentas, {castigo}."),
  reto(2, "{p1}, haz 15 sentadillas mientras {p2} cuenta. Si paras antes, {castigo}."),
  reto(2, "{p1}, convence a {p2} en 20 segundos de que eres la mejor persona del grupo. Si {p2} no se convence, {castigo}."),
  reto(2, "{p1}, di quién del grupo tiene peor gusto musical, sin rodeos. Si te niegas, {castigo}."),
  reto(2, "{p1}, haz reír a {p2} sin tocarle en 15 segundos. Si no lo logras, {castigo}."),
  reto(2, "{p1}, mira a {p2} con tu mejor cara de seductor/a durante 10 segundos. Si te ríes, {castigo}."),
  reto(2, "{p1}, enseña las últimas 3 canciones que escuchaste. Si te da pena, {castigo}."),
  reto(2, "{p1}, di el apodo más vergonzoso que has tenido. Si no lo dices, {castigo}."),
  reto(3, "{p1}, di en voz alta con quién de esta mesa tendrías una primera cita. Si te niegas, {castigo}."),
  reto(3, "{p1}, confiesa una mentira que le dijiste a alguien de aquí. Si no, {castigo}."),
  reto(3, "{p1}, dale a {p2} un masaje de hombros de 20 segundos. Si alguno se niega, {castigo}."),
  reto(3, "{p1}, cuenta un secreto que nadie en esta mesa sepa. Si te niegas, {castigo}."),
  reto(3, "{p1}, manda un audio de 5 segundos cantándole a la última persona con la que chateaste. Si te niegas, {castigo}."),
  reto(3, "{p1}, ordena a los jugadores del más al menos divertido. Si el grupo no está de acuerdo, {castigo}."),

  // ───────────── ¿QUIÉN? ─────────────
  quien(1, "¿Quién es más probable que se quede dormido en plena fiesta?"),
  quien(1, "¿Quién es más probable que llegue tarde a su propia boda?"),
  quien(1, "¿Quién es más probable que se pierda en su propia ciudad?"),
  quien(1, "¿Quién es más probable que se gaste el sueldo en antojos?"),
  quien(1, "¿Quién es más probable que sobreviva en una isla desierta?"),
  quien(1, "¿Quién es más probable que se haga famoso en TikTok?"),
  quien(1, "¿Quién es más probable que le hable a su mascota como si fuera persona?"),
  quien(1, "¿Quién es más probable que se olvide del cumpleaños de un amigo?"),
  quien(2, "¿Quién es más probable que le escriba a su ex estando de fiesta?"),
  quien(2, "¿Quién es más probable que ligue primero esta noche?"),
  quien(2, "¿Quién es más probable que mienta con cara de inocente?"),
  quien(2, "¿Quién es más probable que termine llorando en la fiesta?"),
  quien(2, "¿Quién es más probable que tenga un secreto oscuro?"),
  quien(2, "¿Quién es más probable que se case primero?"),
  quien(3, "¿Quién es más probable que haya stalkeado a alguien de esta mesa?"),
  quien(3, "¿Quién es más probable que guarde más chismes de los demás?"),
  quien(3, "¿Quién es más probable que se enamore del mejor amigo de otro?"),
  quien(3, "¿Quién es más probable que bese a alguien de esta mesa por 100 dólares?"),
  quien(3, "¿Quién es más probable que lleve una doble vida?"),

  // ───────────── YO NUNCA ─────────────
  nunca(1, "Yo nunca he comido algo que se cayó al piso."),
  nunca(1, "Yo nunca me he pasado de mi parada por quedarme dormido en el transporte."),
  nunca(1, "Yo nunca he fingido estar enfermo para no ir a trabajar o estudiar."),
  nunca(1, "Yo nunca he cantado en la ducha como si fuera un concierto."),
  nunca(1, "Yo nunca me he caído en público y he fingido que no pasó nada."),
  nunca(1, "Yo nunca he visto una serie entera en un solo día."),
  nunca(1, "Yo nunca he stalkeado a alguien en redes por más de una hora."),
  nunca(2, "Yo nunca le he enviado un mensaje a la persona equivocada."),
  nunca(2, "Yo nunca he mentido sobre mi edad."),
  nunca(2, "Yo nunca he llorado viendo una película animada."),
  nunca(2, "Yo nunca he copiado en un examen."),
  nunca(2, "Yo nunca me he quedado con un vuelto que no me correspondía."),
  nunca(2, "Yo nunca he bloqueado a alguien de esta mesa en redes."),
  nunca(2, "Yo nunca he fingido que me gustó un regalo."),
  nunca(3, "Yo nunca he besado a alguien de esta mesa."),
  nunca(3, "Yo nunca he soñado algo raro con alguien de aquí."),
  nunca(3, "Yo nunca he tenido dos citas el mismo día."),
  nunca(3, "Yo nunca he mandado un mensaje de madrugada del que me arrepentí."),
  nunca(3, "Yo nunca he cancelado una cita para irme de fiesta."),

  // ───────────── DUELOS ─────────────
  duelo(1, "{p1} vs {p2}: piedra, papel o tijera. Quien pierda, {castigo}."),
  duelo(1, "{p1} vs {p2}: duelo de miradas. El primero en reír o parpadear, {castigo}."),
  duelo(1, "{p1} vs {p2}: pulso. Quien pierda, {castigo}."),
  duelo(1, "{p1} vs {p2}: por turnos, nombren frutas. Quien repita o se quede en blanco, {castigo}."),
  duelo(1, "{p1} vs {p2}: baile de 15 segundos. El grupo aplaude y quien tenga menos aplausos, {castigo}."),
  duelo(2, "{p1} vs {p2}: duelo de piropos. El grupo decide al ganador; quien pierda, {castigo}."),
  duelo(2, "{p1} y {p2}: el grupo vota quién de los dos es más simpático. El menos votado, {castigo}."),
  duelo(2, "{p1} vs {p2}: cada uno confiesa su mayor miedo y el grupo vota el más ridículo. Ese jugador: {castigo}."),
  duelo(2, "{p1} y {p2}: se miran a los ojos y dicen a la vez un número del 1 al 5. Si no coinciden, castigo para ambos: {castigo}."),
  duelo(3, "{p1} vs {p2}: el grupo vota quién de los dos ligaría primero esta noche. El menos votado: {castigo}."),

  // ───────────── TODOS ─────────────
  todos(1, "Todos: el último en tocarse la nariz, {castigo}."),
  todos(1, "Todos: el último en ponerse de pie, {castigo}."),
  todos(1, "Todos: quien tenga menos batería en el celular, {castigo}."),
  todos(1, "Todos los que lleven puesto algo negro: {castigo}."),
  todos(1, "Ronda de halagos: cada uno le dice un halago al jugador de su izquierda. Quien repita o no pueda, {castigo}."),
  todos(1, "El jugador más joven del grupo: {reparte}."),
  todos(1, "El jugador más alto del grupo: {reparte}."),
  todos(1, "Todos: pongan un dedo en la frente a la cuenta de tres. El último en hacerlo, {castigo}."),
  todos(2, "Todos: cuenten en orden una mentira piadosa que dijeron hoy. Quien no tenga ninguna, {castigo}."),
  todos(2, "Todos: a la cuenta de tres, griten el nombre de la persona más chismosa. La más gritada: {castigo}."),
  todos(2, "Todos: voten con el pulgar si {p1} es buena onda. Si hay más pulgares abajo, {p1} {castigo}."),
  todos(2, "El jugador con el cumpleaños más cercano: {reparte}."),
  todos(3, "Todos: cada uno dice en voz alta quién le cae peor del grupo, sin dar explicaciones. Quien no se atreva, {castigo}."),

  // ───────────── MINIJUEGOS ─────────────
  mini(1, "Categoría: marcas de ropa. {p1} empieza y siguen en orden. Quien repita o se tarde más de 5 segundos, {castigo}."),
  mini(1, "Palabras que empiecen con la letra {letra}. {p1} empieza. Quien repita o se tarde más de 5 segundos, {castigo}."),
  mini(1, "Categoría: cosas que hay en una cocina. {p1} empieza. Quien repita o se tarde, {castigo}."),
  mini(1, "Cadena de palabras: {p1} dice una palabra y el siguiente dice otra que empiece con la última sílaba. Quien falle, {castigo}."),
  mini(1, "Rimas: {p1} dice una palabra y los demás riman en orden. Quien no encuentre rima, {castigo}."),
  mini(1, "Categoría: películas de terror. {p1} empieza. Quien repita o se quede en blanco, {castigo}."),
  mini(1, "Mímica: {p1} actúa una película sin hablar. Si nadie la adivina en 30 segundos, {p1} {castigo}."),
  mini(2, "Verdad o reto: {p1} elige a {p2} y este debe escoger entre verdad o reto. Si se niega a cumplirlo, {castigo}."),
  mini(2, "Categoría: personajes que hayan sido tu crush. {p1} empieza. Quien no tenga más, {castigo}."),
  mini(3, "Verdad: {p1} puede hacerle a {p2} la pregunta que quiera. Si {p2} no responde, {castigo}."),

  // ───────────── VIRUS (duran varias cartas) ─────────────
  virus(1, "{p1} no puede decir ningún nombre propio. Si lo dice, {castigo}.", 5),
  virus(1, "Prohibido señalar con el dedo. Quien lo haga, {castigo}.", 5),
  virus(1, "Prohibido tocarse la cara. Quien lo haga, {castigo}.", 5),
  virus(1, "Todos deben terminar cada frase con «¿o no?». Quien se olvide, {castigo}.", 6),
  virus(1, "{p1} es la realeza: todos deben decirle «Su Majestad». Quien se olvide, {castigo}.", 5),
  virus(1, "{p1} no puede reírse. Cada vez que lo haga, {castigo}.", 5),
  virus(2, "Solo se puede hablar en susurros. Quien grite, {castigo}.", 4),
  virus(2, "Nadie puede decir «sí» ni «no». Quien lo diga, {castigo}.", 5),
  virus(2, "{p1} y {p2} son pareja: cada vez que uno de los dos habla, el otro debe suspirar. Si se olvida, {castigo}.", 5),
  virus(2, "Prohibido mirar a {p1} a los ojos. Quien lo haga, {castigo}.", 5),
  virus(3, "Nadie puede decir el nombre de {p1}. Quien lo haga, {castigo}.", 5),
];
